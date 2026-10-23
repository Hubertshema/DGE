import { pool, query } from './index';

async function seedProducts() {
  console.log('🌱 Seeding real D&G products into Neon PostgreSQL...');

  const productsData = [
    {
      name: 'Kitenge Tailored Modern Blazer',
      description: 'Handcrafted premium African print kitenge blazer designed and tailored in Rwanda. Vibrant geometric patterns with tailored lining.',
      category: 'Clothes',
      price: 38000,
      stock: 12,
      sku: 'DG-CLO-001',
      brand: 'D&G Rwanda',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80'],
    },
    {
      name: 'Classic Casual Linen Shirt',
      description: 'Lightweight, breathable 100% organic cotton-linen shirt in neutral sage green, ideal for everyday elegance.',
      category: 'Clothes',
      price: 24000,
      stock: 20,
      sku: 'DG-CLO-002',
      brand: 'D&G Rwanda',
      images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80'],
    },
    {
      name: 'Handcrafted Leather Oxford Shoes',
      description: 'Durable genuine leather oxford dress shoes with cushioned soles and reinforced Goodyear welt stitching.',
      category: 'Shoes',
      price: 45000,
      stock: 8,
      sku: 'DG-SHO-001',
      brand: 'D&G Leatherworks',
      images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80'],
    },
    {
      name: 'Urban Comfort Low-Top Sneakers',
      description: 'Clean white minimalist unisex sneakers with ergonomic memory foam insole and slip-resistant rubber outsole.',
      category: 'Shoes',
      price: 32000,
      stock: 15,
      sku: 'DG-SHO-002',
      brand: 'D&G Rwanda',
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'],
    },
    {
      name: 'Artisan Agaseke Woven Tote Bag',
      description: 'Authentic Rwandan Agaseke woven sisal tote bag with reinforced genuine leather shoulder straps. Elegant and durable.',
      category: 'Bags',
      price: 28000,
      stock: 10,
      sku: 'DG-BAG-001',
      brand: 'Rwamagana Artisans',
      images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80'],
    },
    {
      name: 'Smart Travel Commuter Backpack',
      description: 'Water-resistant nylon laptop backpack with dedicated 15.6 inch padded compartment, USB charging port, and hidden anti-theft pocket.',
      category: 'Bags',
      price: 35000,
      stock: 14,
      sku: 'DG-BAG-002',
      brand: 'D&G Gear',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'],
    },
    {
      name: 'Electric Quick-Boil Stainless Kettle 1.8L',
      description: 'Rapid-boil cordless electric kettle with 304 food-grade stainless steel interior and automatic shut-off safety protection.',
      category: 'Household equipment',
      price: 22000,
      stock: 18,
      sku: 'DG-HOU-001',
      brand: 'D&G Home',
      images: ['https://images.unsplash.com/photo-1570784332176-fdd73da66f03?auto=format&fit=crop&w=600&q=80'],
    },
    {
      name: 'Cast Iron Non-Stick Cooking Pan 28cm',
      description: 'Heavy-duty pre-seasoned cast iron skillet for stove, oven, or outdoor grilling with even heat distribution.',
      category: 'Household equipment',
      price: 19500,
      stock: 16,
      sku: 'DG-HOU-002',
      brand: 'D&G Home',
      images: ['https://images.unsplash.com/photo-1584990347449-3543d3dcf39f?auto=format&fit=crop&w=600&q=80'],
    },
    {
      name: 'Minimalist Gold-Plated Watch',
      description: 'Sleek luxury quartz wristwatch with emerald green dial, gold-plated mesh strap, and scratch-resistant sapphire crystal glass.',
      category: 'Jewellery',
      price: 42000,
      stock: 9,
      sku: 'DG-JEW-001',
      brand: 'D&G Timepieces',
      images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80'],
    },
    {
      name: 'Natural Rwandan Botanical Body Glow Oil 150ml',
      description: 'Cold-pressed organic marula, avocado, and jojoba seed oil blend providing deep nourishment and radiant glow without greasy residue.',
      category: 'Cosmetics',
      price: 16000,
      stock: 25,
      sku: 'DG-COS-001',
      brand: 'D&G Naturals',
      images: ['https://images.unsplash.com/photo-1608248597359-0a56247c1f80?auto=format&fit=crop&w=600&q=80'],
    },
  ];

  for (const item of productsData) {
    const catRes = await query('SELECT id FROM categories WHERE name = $1', [item.category]);
    if (catRes.rows.length === 0) continue;
    const categoryId = catRes.rows[0].id;

    const prodRes = await query(
      `INSERT INTO products (name, description, category_id, price, stock, sku, brand, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       ON CONFLICT (sku) DO UPDATE
       SET name = EXCLUDED.name, price = EXCLUDED.price, stock = EXCLUDED.stock
       RETURNING id`,
      [item.name, item.description, categoryId, item.price, item.stock, item.sku, item.brand]
    );

    const productId = prodRes.rows[0].id;

    await query('DELETE FROM product_images WHERE product_id = $1', [productId]);
    for (let i = 0; i < item.images.length; i++) {
      await query(
        'INSERT INTO product_images (product_id, image_url, sort_order) VALUES ($1, $2, $3)',
        [productId, item.images[i], i]
      );
    }
  }

  console.log(`✅ Seeded ${productsData.length} products with images across 6 categories into Neon!`);
  await pool.end();
}

seedProducts();
