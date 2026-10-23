import fs from 'fs';
import path from 'path';
import { pool } from './index';
import { ensureAdminAccount } from './adminSetup';

async function runMigration() {
  console.log('🚀 Running D&G E-Commerce Neon Database Migrations...');
  const client = await pool.connect();

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📦 Executing schema.sql on Neon...');
    await client.query('BEGIN');
    await client.query(schemaSql);

    // Seed the 6 official D&G Categories if not present
    const categories = [
      { name: 'Clothes', slug: 'clothes', desc: 'Men, women, and children fashion & apparel' },
      { name: 'Shoes', slug: 'shoes', desc: 'Casual, formal, athletic footwear and boots' },
      { name: 'Bags', slug: 'bags', desc: 'Handbags, backpacks, clutches, and travel gear' },
      { name: 'Household equipment', slug: 'household-equipment', desc: 'Home appliances, kitchenware, and living essentials' },
      { name: 'Jewellery', slug: 'jewellery', desc: 'Watches, necklaces, rings, bracelets, and accessories' },
      { name: 'Cosmetics', slug: 'cosmetics', desc: 'Skincare, beauty products, perfumes, and care' },
    ];

    for (const cat of categories) {
      await client.query(
        `INSERT INTO categories (name, slug, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO NOTHING`,
        [cat.name, cat.slug, cat.desc]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Migrations and initial categories successfully applied to Neon PostgreSQL!');

    // Ensure fixed DG admin account is provisioned
    await ensureAdminAccount();
  } catch (error) {


    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
