import bcrypt from 'bcrypt';
import { query } from './index';
import { env } from '../config/env';

const SALT_ROUNDS = 10;

/**
 * Automatically provisions the one fixed DG administrator (DG shop owner) account
 * using configured environment variables if not already initialized.
 * Sets must_change_password = true so the owner is prompted to change credentials on first login.
 */
export async function ensureAdminAccount(): Promise<void> {
  try {
    if (!env.adminEmail || !env.adminInitialPassword) {
      console.warn('⚠️ ADMIN_EMAIL or ADMIN_INITIAL_PASSWORD not configured. Skipping admin provisioning.');
      return;
    }

    const normalizedEmail = env.adminEmail.toLowerCase().trim();
    const existingAdmin = await query(
      "SELECT id, email, password_hash, must_change_password, password_changed_at FROM users WHERE role = 'admin' OR LOWER(email) = $1 LIMIT 1",
      [normalizedEmail]
    );

    const passwordHash = await bcrypt.hash(env.adminInitialPassword, SALT_ROUNDS);

    if (existingAdmin.rows.length === 0) {
      await query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, must_change_password)
         VALUES ($1, $2, $3, $4, 'admin', true)
         ON CONFLICT (email) DO UPDATE
           SET role = 'admin',
               password_hash = $4,
               must_change_password = true`,
        [env.adminFullName, normalizedEmail, env.adminPhone, passwordHash]
      );
      console.log(`✅ Fixed DG Admin account successfully created for ${normalizedEmail}.`);
    } else {
      const admin = existingAdmin.rows[0];
      const matchesInitial = await bcrypt.compare(env.adminInitialPassword, admin.password_hash || '');

      // If email has changed or password doesn't match and no custom password change recorded
      if (admin.email.toLowerCase() !== normalizedEmail || (!matchesInitial && !admin.password_changed_at)) {
        await query(
          `UPDATE users
           SET email = $1,
               full_name = $2,
               phone = $3,
               password_hash = $4,
               role = 'admin',
               must_change_password = true,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $5`,
          [normalizedEmail, env.adminFullName, env.adminPhone, passwordHash, admin.id]
        );
        console.log(`🔒 DG Admin account synced with configured environment credentials (${normalizedEmail}).`);
      } else {
        console.log(`🔒 DG Admin account verified (${admin.email}). Credentials active.`);
      }
    }
  } catch (error: any) {
    console.error('❌ Failed to ensure DG admin account:', error.message);
  }
}
