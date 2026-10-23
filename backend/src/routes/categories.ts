import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// List Categories (Public)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT c.id, c.name, c.slug, c.description, c.created_at as "createdAt",
             COUNT(p.id) FILTER (WHERE p.is_available = true) as "productsCount"
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    res.json({
      success: true,
      data: result.rows.map((row: any) => ({
        ...row,
        productsCount: Number(row.productsCount),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Add Category
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ success: false, error: 'Category name is required.' });
  }

  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const result = await query(
      `INSERT INTO categories (name, slug, description)
       VALUES ($1, $2, $3)
       RETURNING id, name, slug, description, created_at as "createdAt"`,
      [name.trim(), slug, description ? description.trim() : null]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Category created successfully.',
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'A category with this name already exists.' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Update Category
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    let slug = undefined;
    if (name) {
      slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const result = await query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description)
       WHERE id = $4
       RETURNING id, name, slug, description, created_at as "createdAt"`,
      [name ? name.trim() : null, slug || null, description !== undefined ? description : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Category updated successfully.',
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'A category with this name or slug already exists.' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Delete Category
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    // Check if category is used by any products
    const prodCountRes = await query(
      'SELECT COUNT(*)::int as count FROM products WHERE category_id = $1',
      [id]
    );

    const count = prodCountRes.rows[0]?.count || 0;
    if (count > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category: Contains ${count} product(s). Please delete or reassign those products first.`,
      });
    }

    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id, name', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }

    res.json({
      success: true,
      message: `Category "${result.rows[0].name}" deleted successfully.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
