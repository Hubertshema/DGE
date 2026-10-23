import { Router, Request, Response } from 'express';
import { pool, query } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// List Products (Public with search & category filter; Admin can view all including unavailable)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, includeUnavailable, limit = 100, offset = 0 } = req.query;

    let sql = `
      SELECT p.id, p.name, p.description, c.name as category, c.id as "categoryId",
             p.price, p.stock, p.is_available as "isAvailable", p.sku, p.brand,
             p.created_at as "createdAt", p.updated_at as "updatedAt",
             COALESCE(
               json_agg(pi.image_url ORDER BY pi.sort_order) FILTER (WHERE pi.id IS NOT NULL),
               '[]'
             ) as images
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Unless explicitly requested by admin to include unavailable products, show only available
    if (includeUnavailable !== 'true') {
      sql += ' AND p.is_available = true';
    }

    if (category && category !== 'All') {
      params.push(category);
      sql += ` AND (c.name = $${params.length} OR c.slug = $${params.length})`;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      sql += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length} OR p.brand ILIKE $${params.length})`;
    }

    sql += ' GROUP BY p.id, c.name, c.id ORDER BY p.created_at DESC';

    params.push(Number(limit));
    sql += ` LIMIT $${params.length}`;

    params.push(Number(offset));
    sql += ` OFFSET $${params.length}`;

    const result = await query(sql, params);
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Single Product Details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT p.id, p.name, p.description, c.name as category, c.id as "categoryId",
              p.price, p.stock, p.is_available as "isAvailable", p.sku, p.brand,
              p.created_at as "createdAt", p.updated_at as "updatedAt",
              COALESCE(
                json_agg(pi.image_url ORDER BY pi.sort_order) FILTER (WHERE pi.id IS NOT NULL),
                '[]'
              ) as images
       FROM products p
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_images pi ON p.id = pi.product_id
       WHERE p.id = $1
       GROUP BY p.id, c.name, c.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Create Product (with transaction for product + images)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, description, categoryName, categoryId, price, stock, isAvailable, images, sku, brand } = req.body;

  if (!name || (!categoryName && !categoryId) || price === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Product name, category, and price are required.',
    });
  }

  const numPrice = Number(price);
  const numStock = stock !== undefined ? Number(stock) : 0;

  if (isNaN(numPrice) || numPrice < 0) {
    return res.status(400).json({ success: false, error: 'Price must be a positive number in RWF.' });
  }
  if (isNaN(numStock) || numStock < 0) {
    return res.status(400).json({ success: false, error: 'Stock must be a non-negative integer.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const availableBool = isAvailable !== undefined ? Boolean(isAvailable) : numStock > 0;

    // Resolve category id robustly
    let targetCategoryId = categoryId;
    if (targetCategoryId) {
      const catCheck = await client.query('SELECT id FROM categories WHERE id = $1', [targetCategoryId]);
      if (catCheck.rows.length === 0) targetCategoryId = null;
    }
    if (!targetCategoryId && categoryName) {
      const catRes = await client.query(
        'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) OR LOWER(slug) = LOWER($1) OR id::text = $1',
        [String(categoryName).trim()]
      );
      if (catRes.rows.length > 0) {
        targetCategoryId = catRes.rows[0].id;
      }
    }
    if (!targetCategoryId) {
      throw new Error(`Invalid or unknown category: ${categoryName || categoryId}`);
    }

    const productRes = await client.query(
      `INSERT INTO products (name, description, category_id, price, stock, sku, brand, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name.trim(), description ? description.trim() : '', targetCategoryId, numPrice, numStock, sku || null, brand || null, availableBool]
    );

    const product = productRes.rows[0];

    // Insert images if provided
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imageUrl = String(images[i]).trim();
        if (imageUrl) {
          await client.query(
            'INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1, $2, $3)',
            [product.id, imageUrl, i]
          );
        }
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product added successfully to DG inventory.',
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// Admin: Update Product
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, categoryName, categoryId, price, stock, isAvailable, images, sku, brand } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let targetCategoryId = categoryId;
    if (targetCategoryId) {
      const catCheck = await client.query('SELECT id FROM categories WHERE id = $1', [targetCategoryId]);
      if (catCheck.rows.length === 0) targetCategoryId = null;
    }
    if (categoryName && !targetCategoryId) {
      const catRes = await client.query(
        'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) OR LOWER(slug) = LOWER($1) OR id::text = $1',
        [String(categoryName).trim()]
      );
      if (catRes.rows.length > 0) {
        targetCategoryId = catRes.rows[0].id;
      }
    }

    const updateRes = await client.query(
      `UPDATE products
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           category_id = COALESCE($3, category_id),
           price = COALESCE($4, price),
           stock = COALESCE($5, stock),
           is_available = COALESCE($6, is_available),
           sku = COALESCE($7, sku),
           brand = COALESCE($8, brand),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        name !== undefined ? name.trim() : null,
        description !== undefined ? description.trim() : null,
        targetCategoryId || null,
        price !== undefined ? Number(price) : null,
        stock !== undefined ? Number(stock) : null,
        isAvailable !== undefined ? Boolean(isAvailable) : null,
        sku !== undefined ? sku : null,
        brand !== undefined ? brand : null,
        id,
      ]
    );

    if (updateRes.rows.length === 0) {
      throw new Error('Product not found.');
    }

    // If new images array is supplied, replace product images
    if (Array.isArray(images)) {
      await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);
      for (let i = 0; i < images.length; i++) {
        const imageUrl = String(images[i]).trim();
        if (imageUrl) {
          await client.query(
            'INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1, $2, $3)',
            [id, imageUrl, i]
          );
        }
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      data: updateRes.rows[0],
      message: 'Product updated successfully.',
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// Admin: Delete Product
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product removed from catalog.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
