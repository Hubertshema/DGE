import { pool } from './index';

async function cleanupTestDepts() {
  console.log('🧹 Starting cleanup of test departments and test products...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Identify target test categories
    const catRes = await client.query(
      `SELECT id, name FROM categories WHERE name IN ('Dept 3080', 'Dept 6358', 'Dept 7761')`
    );

    if (catRes.rows.length === 0) {
      console.log('ℹ️ No test departments found matching Dept 3080, Dept 6358, or Dept 7761.');
      await client.query('ROLLBACK');
      return;
    }

    const catIds = catRes.rows.map((c) => c.id);
    const catNames = catRes.rows.map((c) => c.name);
    console.log(`Found target categories: ${catNames.join(', ')}`);

    // 2. Identify products belonging to these categories
    const prodRes = await client.query(
      `SELECT id, name FROM products WHERE category_id = ANY($1::uuid[])`,
      [catIds]
    );

    if (prodRes.rows.length > 0) {
      const prodIds = prodRes.rows.map((p) => p.id);
      const prodNames = prodRes.rows.map((p) => p.name);
      console.log(`Found products to remove: ${prodNames.join(', ')}`);

      // Delete products (cascades to product_images, sets order_items.product_id = null)
      const delProdRes = await client.query(
        `DELETE FROM products WHERE id = ANY($1::uuid[]) RETURNING id, name`,
        [prodIds]
      );
      console.log(`✅ Deleted ${delProdRes.rowCount} test product(s).`);
    } else {
      console.log('ℹ️ No products associated with these categories.');
    }

    // 3. Delete the categories
    const delCatRes = await client.query(
      `DELETE FROM categories WHERE id = ANY($1::uuid[]) RETURNING id, name`,
      [catIds]
    );
    console.log(`✅ Deleted ${delCatRes.rowCount} test category/categories: ${delCatRes.rows.map((c) => c.name).join(', ')}`);

    await client.query('COMMIT');
    console.log('🎉 Clean removal completed successfully in Neon PostgreSQL!');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('❌ Cleanup failed, transaction rolled back:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupTestDepts();
