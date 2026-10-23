import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();
const SALT_ROUNDS = 10;

// Customer Registration (Strictly customer role only)
router.post('/register', async (req: Request, res: Response) => {
  const { fullName, email, password, phone } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Full name, email, and password are required.',
    });
  }

  const trimmedEmail = String(email).toLowerCase().trim();
  const trimmedName = String(fullName).trim();
  const trimmedPhone = phone ? String(phone).trim() : null;

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long.',
    });
  }

  try {
    const existing = await query('SELECT id FROM users WHERE email = $1', [trimmedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Strictly enforce role = 'customer'
    const result = await query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, must_change_password)
       VALUES ($1, $2, $3, $4, 'customer', false)
       RETURNING id, full_name, email, phone, role, must_change_password, created_at`,
      [trimmedName, trimmedEmail, trimmedPhone, passwordHash]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
      env.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          mustChangePassword: user.must_change_password,
          createdAt: user.created_at,
        },
        token,
      },
      message: 'Customer account created successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login (Both Admin and Customer)
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required.',
    });
  }

  try {
    const result = await query(
      `SELECT id, full_name, email, phone, password_hash, role, must_change_password, created_at
       FROM users WHERE email = $1`,
      [String(email).toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
      env.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          mustChangePassword: Boolean(user.must_change_password),
          createdAt: user.created_at,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Change Password (Used for first-time Admin login requirement and profile password updates)
router.post('/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Current password and new password are required.',
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 8 characters long.',
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      error: 'New password must be different from current password.',
    });
  }

  try {
    const userRes = await query(
      'SELECT id, password_hash, role, full_name, email, phone FROM users WHERE id = $1',
      [req.user!.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const user = userRes.rows[0];
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect.',
      });
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await query(
      `UPDATE users
       SET password_hash = $1,
           must_change_password = false,
           password_changed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newHash, user.id]
    );

    // Issue updated token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
      env.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Password updated successfully.',
      data: {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          mustChangePassword: false,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, full_name, email, phone, role, must_change_password, created_at
       FROM users WHERE id = $1`,
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        mustChangePassword: Boolean(user.must_change_password),
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
