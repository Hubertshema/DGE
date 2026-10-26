import { env } from './config/env';

const BASE_URL = `http://localhost:${env.port}/api/v1`;

interface TestReport {
  total: number;
  passed: number;
  failed: number;
  failures: string[];
}

const report: TestReport = {
  total: 0,
  passed: 0,
  failed: 0,
  failures: [],
};

async function assertTest(name: string, fn: () => Promise<void>) {
  report.total++;
  try {
    await fn();
    report.passed++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err: any) {
    report.failed++;
    report.failures.push(`${name}: ${err.message}`);
    console.error(`  ❌ [FAIL] ${name} -> ${err.message}`);
  }
}

function expectEqual(actual: any, expected: any, msg?: string) {
  if (actual !== expected) {
    throw new Error(msg || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
  }
}

function expectTrue(val: boolean, msg?: string) {
  if (!val) {
    throw new Error(msg || `Expected truthy value`);
  }
}

async function runComprehensiveQASuite() {
  console.log('================================================================');
  console.log('🧪 DG E-COMMERCE COMPREHENSIVE CLIENT & ADMIN QA TEST SUITE');
  console.log('   Target: Real Express.js API & Live Neon PostgreSQL Database');
  console.log('================================================================\n');

  // Shared test variables
  let adminToken = '';
  let customerAToken = '';
  let customerAId = '';
  let customerAEmail = `cust_a_${Date.now()}@test.rw`;

  let customerBToken = '';
  let customerBId = '';
  let customerBEmail = `cust_b_${Date.now()}@test.rw`;

  let testCategoryId = '';
  let testProductId = '';
  let testOrderAId = '';
  let testOrderARef = '';
  let sampleCatalogProduct: any = null;

  // ----------------------------------------------------------------
  // 1. SYSTEM HEALTH & NEON POSTGRESQL CONNECTIVITY
  // ----------------------------------------------------------------
  console.log('\n--- SUITE 1: System Health & Neon PostgreSQL Connectivity ---');
  await assertTest('1.1 Backend health check returns healthy status & live DB connection', async () => {
    const res = await fetch(`http://localhost:${env.port}/api/health`);
    const data: any = await res.json();
    expectEqual(res.status, 200, 'Health endpoint status code');
    expectEqual(data.status, 'healthy', 'Health check payload status');
    expectTrue(data.database.connected, 'Database must be reported connected');
    expectTrue(data.database.version.includes('PostgreSQL'), 'Database engine must be PostgreSQL');
  });

  // ----------------------------------------------------------------
  // 2. AUTHENTICATION, VALIDATION & ROLE ASSIGNMENT
  // ----------------------------------------------------------------
  console.log('\n--- SUITE 2: Client & Admin Authentication, Validation & Security ---');
  await assertTest('2.1 Registration rejects missing fields (400 Bad Request)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Missing Email' }),
    });
    expectEqual(res.status, 400);
    const data: any = await res.json();
    expectEqual(data.success, false);
  });

  await assertTest('2.2 Registration rejects password < 6 characters (400 Bad Request)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Short Pass User',
        email: `shortpass_${Date.now()}@test.rw`,
        password: '123',
      }),
    });
    expectEqual(res.status, 400);
  });

  await assertTest('2.3 Customer registration strictly forces role="customer" (ignores malicious role="admin")', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Customer Alpha',
        email: customerAEmail,
        phone: '0788100100',
        password: 'ValidPassword123!',
        role: 'admin', // Malicious attempt to self-promote to admin
      }),
    });
    expectEqual(res.status, 201);
    const data: any = await res.json();
    expectEqual(data.data.user.role, 'customer', 'User role must strictly be customer');
    customerAToken = data.data.token;
    customerAId = data.data.user.id;
  });

  await assertTest('2.4 Registration rejects duplicate email (409 Conflict)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Duplicate User',
        email: customerAEmail,
        password: 'ValidPassword123!',
      }),
    });
    expectEqual(res.status, 409);
  });

  await assertTest('2.5 Register Customer B for isolation testing', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Customer Bravo',
        email: customerBEmail,
        phone: '0788200200',
        password: 'ValidPassword123!',
      }),
    });
    expectEqual(res.status, 201);
    const data: any = await res.json();
    customerBToken = data.data.token;
    customerBId = data.data.user.id;
  });

  await assertTest('2.6 Login rejects invalid password (401 Unauthorized)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerAEmail,
        password: 'WrongPassword999!',
      }),
    });
    expectEqual(res.status, 401);
  });

  await assertTest('2.7 Login succeeds with valid credentials and returns JWT', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerAEmail,
        password: 'ValidPassword123!',
      }),
    });
    expectEqual(res.status, 200);
    const data: any = await res.json();
    expectTrue(Boolean(data.data.token), 'Must return JWT token');
    expectEqual(data.data.user.email, customerAEmail);
  });

  await assertTest('2.8 Customer Profile GET /auth/me returns authenticated customer data', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    expectEqual(res.status, 200);
    const data: any = await res.json();
    expectEqual(data.data.id, customerAId);
    expectEqual(data.data.role, 'customer');
  });

  await assertTest('2.9 Customer Password Change validation & update flow', async () => {
    // Rejects wrong current password
    const failRes = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'IncorrectPassword!',
        newPassword: 'BrandNewPass2026!',
      }),
    });
    expectEqual(failRes.status, 400);

    // Rejects short new password (< 8 chars)
    const shortRes = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'ValidPassword123!',
        newPassword: 'short',
      }),
    });
    expectEqual(shortRes.status, 400);

    // Rejects identical new password
    const sameRes = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'ValidPassword123!',
        newPassword: 'ValidPassword123!',
      }),
    });
    expectEqual(sameRes.status, 400);

    // Valid change succeeds
    const successRes = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'ValidPassword123!',
        newPassword: 'BrandNewPass2026!',
      }),
    });
    expectEqual(successRes.status, 200);
    const passData: any = await successRes.json();
    customerAToken = passData.data.token; // Update token
  });

  await assertTest('2.10 Admin login succeeds with preconfigured DG owner account', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: env.adminEmail,
        password: env.adminInitialPassword,
      }),
    });
    expectEqual(res.status, 200);
    const data: any = await res.json();
    expectEqual(data.data.user.role, 'admin');
    expectEqual(data.data.user.email, env.adminEmail);
    adminToken = data.data.token;
  });

  // ----------------------------------------------------------------
  // 3. CATALOG, CATEGORIES, SEARCH & PRODUCT DETAILS
  // ----------------------------------------------------------------
  console.log('\n--- SUITE 3: Catalog, Categories, Search & Filters ---');
  await assertTest('3.1 Public categories list returns categories with productsCount', async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    expectEqual(res.status, 200);
    const data: any = await res.json();
    expectTrue(Array.isArray(data.data), 'Categories should be an array');
    expectTrue(data.data.length > 0, 'Categories should not be empty');
    expectTrue(typeof data.data[0].productsCount === 'number', 'productsCount should be a number');
  });

  await assertTest('3.2 Public products list returns available products with RWF prices and stock', async () => {
    const res = await fetch(`${BASE_URL}/products?limit=20`);
    expectEqual(res.status, 200);
    const data: any = await res.json();
    expectTrue(Array.isArray(data.data), 'Products should be an array');
    expectTrue(data.data.length > 0, 'Catalog should contain products');
    sampleCatalogProduct = data.data[0];
    expectTrue(sampleCatalogProduct.isAvailable, 'Public catalog must only include available products');
    expectTrue(Number(sampleCatalogProduct.price) >= 0, 'Price must be non-negative in RWF');
    expectTrue(typeof sampleCatalogProduct.stock === 'number', 'Stock must be a number');
    expectTrue(Array.isArray(sampleCatalogProduct.images), 'Images must be an array');
  });

  await assertTest('3.3 Category filter restricts products to chosen category', async () => {
    const categoryName = sampleCatalogProduct.category;
    const res = await fetch(`${BASE_URL}/products?category=${encodeURIComponent(categoryName)}`);
    expectEqual(res.status, 200);
    const data: any = await res.json();
    for (const p of data.data) {
      expectEqual(p.category, categoryName, 'All filtered products must match the category');
    }
  });

  await assertTest('3.4 Search filter finds products by name or description', async () => {
    const searchTerm = sampleCatalogProduct.name.split(' ')[0];
    const res = await fetch(`${BASE_URL}/products?search=${encodeURIComponent(searchTerm)}`);
    expectEqual(res.status, 200);
    const data: any = await res.json();
    expectTrue(data.data.length > 0, `Search for "${searchTerm}" should return results`);
  });

  await assertTest('3.5 Product Details GET /products/:id returns single product and 404 for unknown ID', async () => {
    const res = await fetch(`${BASE_URL}/products/${sampleCatalogProduct.id}`);
    expectEqual(res.status, 200);
    const data: any = await res.json();
    expectEqual(data.data.id, sampleCatalogProduct.id);

    const failRes = await fetch(`${BASE_URL}/products/00000000-0000-0000-0000-000000000000`);
    expectEqual(failRes.status, 404);
  });

  // ----------------------------------------------------------------
  // 4. CART, CHECKOUT, STOCK MANAGEMENT & PRICING SECURITY
  // ----------------------------------------------------------------
  console.log('\n--- SUITE 4: Checkout, Authoritative Pricing & Stock Rules ---');
  await assertTest('4.1 Checkout validates missing or invalid items', async () => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Test Customer',
        customerPhone: '0788100100',
        deliveryAddress: { district: 'Rwamagana' },
        items: [], // Empty items
      }),
    });
    expectEqual(res.status, 400);
  });

  await assertTest('4.2 Checkout rejects order when requested quantity exceeds available stock', async () => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Customer Alpha',
        customerPhone: '0788100100',
        deliveryAddress: { district: 'Rwamagana', sector: 'Kigabiro' },
        items: [
          {
            productId: sampleCatalogProduct.id,
            quantity: sampleCatalogProduct.stock + 999999, // Exceeds stock
          },
        ],
      }),
    });
    expectEqual(res.status, 400);
    const data: any = await res.json();
    expectTrue(data.error.includes('Insufficient stock'), 'Error message must state insufficient stock');
  });

  await assertTest('4.3 Order creation calculates price strictly on backend, saves in DB as awaiting_payment', async () => {
    const initialStock = sampleCatalogProduct.stock;
    const orderQty = 1;

    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Customer Alpha',
        customerPhone: '0788100100',
        userId: customerAId,
        deliveryAddress: {
          province: 'Eastern Province',
          district: 'Rwamagana',
          sector: 'Kigabiro',
          streetDetails: 'Market Road 15',
        },
        items: [
          {
            productId: sampleCatalogProduct.id,
            quantity: orderQty,
            variationDetails: 'Standard',
            // Malicious attempt to spoof price to 1 RWF:
            price: 1,
            subtotal: 1,
          },
        ],
      }),
    });

    expectEqual(res.status, 201);
    const data: any = await res.json();
    const order = data.data;
    testOrderAId = order.id;
    testOrderARef = order.orderReference;

    // Verify backend calculated actual authoritative price, not spoofed 1 RWF
    const expectedSubtotal = Number(sampleCatalogProduct.price) * orderQty;
    const expectedTotal = expectedSubtotal + env.deliveryFeeRwf;
    expectEqual(order.subtotal, expectedSubtotal, 'Subtotal must match database product price');
    expectEqual(order.totalAmount, expectedTotal, 'Total must include backend delivery fee');
    expectEqual(order.paymentStatus, 'awaiting_payment', 'Payment must NEVER be auto-paid upon checkout');
    expectEqual(order.status, 'pending_confirmation', 'Status must initially be pending_confirmation');
    expectTrue(Boolean(order.whatsappUrl), 'Must generate WhatsApp payment link');
    expectTrue(order.whatsappUrl.includes(encodeURIComponent(testOrderARef)), 'WhatsApp URL must contain order reference');

    // Verify stock was deducted by orderQty
    const checkProdRes = await fetch(`${BASE_URL}/products/${sampleCatalogProduct.id}`);
    const checkProdData: any = await checkProdRes.json();
    expectEqual(checkProdData.data.stock, initialStock - orderQty, 'Stock must be decremented in database');
  });

  // ----------------------------------------------------------------
  // 5. SECURITY & ROLE ISOLATION (ZERO CROSS-CUSTOMER LEAKS)
  // ----------------------------------------------------------------
  console.log('\n--- SUITE 5: Role Security, Customer Isolation & Admin Protection ---');
  await assertTest('5.1 Customer A can view their own order details (200 OK)', async () => {
    const res = await fetch(`${BASE_URL}/orders/${testOrderAId}`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    expectEqual(res.status, 200);
    const data: any = await res.json();
    expectEqual(data.data.id, testOrderAId);
  });

  await assertTest('5.2 Customer B CANNOT view Customer A order details (403 Forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/orders/${testOrderAId}`, {
      headers: { Authorization: `Bearer ${customerBToken}` },
    });
    expectEqual(res.status, 403, 'Customer B must be rejected with 403 Forbidden');
    const data: any = await res.json();
    expectEqual(data.success, false);
  });

  await assertTest('5.3 Unauthenticated request CANNOT view registered customer order (401 Unauthorized)', async () => {
    const res = await fetch(`${BASE_URL}/orders/${testOrderAId}`);
    expectEqual(res.status, 401, 'Anonymous request must be rejected with 401 Unauthorized');
  });

  await assertTest('5.4 Admin CAN view Customer A order details (200 OK)', async () => {
    const res = await fetch(`${BASE_URL}/orders/${testOrderAId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expectEqual(res.status, 200);
    const data: any = await res.json();
    expectEqual(data.data.id, testOrderAId);
  });

  await assertTest('5.5 Customer list orders GET /orders only shows own orders, never other customers', async () => {
    const resA = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    const dataA: any = await resA.json();
    for (const ord of dataA.data) {
      expectEqual(ord.userId, customerAId, 'Customer A must only see orders where userId matches Customer A');
    }

    const resB = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${customerBToken}` },
    });
    const dataB: any = await resB.json();
    for (const ord of dataB.data) {
      expectEqual(ord.userId, customerBId, 'Customer B must only see orders where userId matches Customer B');
    }
  });

  await assertTest('5.6 Customer is FORBIDDEN (403) from accessing all protected Admin endpoints', async () => {
    // 1. POST /products
    const pCreate = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ name: 'Hacked Product', price: 1000 }),
    });
    expectEqual(pCreate.status, 403, 'POST /products must be forbidden for customers');

    // 2. PUT /products/:id
    const pUpdate = await fetch(`${BASE_URL}/products/${sampleCatalogProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ name: 'Hacked' }),
    });
    expectEqual(pUpdate.status, 403, 'PUT /products/:id must be forbidden for customers');

    // 3. DELETE /products/:id
    const pDelete = await fetch(`${BASE_URL}/products/${sampleCatalogProduct.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    expectEqual(pDelete.status, 403, 'DELETE /products/:id must be forbidden for customers');

    // 4. POST /categories
    const cCreate = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ name: 'Hacked Category' }),
    });
    expectEqual(cCreate.status, 403, 'POST /categories must be forbidden for customers');

    // 5. PATCH /orders/:id/status
    const oStatus = await fetch(`${BASE_URL}/orders/${testOrderAId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ status: 'delivered' }),
    });
    expectEqual(oStatus.status, 403, 'PATCH /orders/:id/status must be forbidden for customers');

    // 6. PATCH /orders/:id/verify-payment
    const oPay = await fetch(`${BASE_URL}/orders/${testOrderAId}/verify-payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ paymentStatus: 'paid' }),
    });
    expectEqual(oPay.status, 403, 'PATCH /orders/:id/verify-payment must be forbidden for customers');

    // 7. GET /orders/admin/reports
    const oReports = await fetch(`${BASE_URL}/orders/admin/reports`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    expectEqual(oReports.status, 403, 'GET /orders/admin/reports must be forbidden for customers');

    // 8. GET /orders/admin/customers
    const oCustomers = await fetch(`${BASE_URL}/orders/admin/customers`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    expectEqual(oCustomers.status, 403, 'GET /orders/admin/customers must be forbidden for customers');
  });

  // ----------------------------------------------------------------
  // 6. ADMIN CATEGORY MANAGEMENT (CRUD & INTEGRITY)
  // ----------------------------------------------------------------
  console.log('\n--- SUITE 6: Admin Category Management ---');
  await assertTest('6.1 Admin creates a new category (201 Created)', async () => {
    const catName = `QA Category ${Date.now()}`;
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: catName,
        description: 'Temporary category for QA testing',
      }),
    });
    expectEqual(res.status, 201);
    const data: any = await res.json();
    testCategoryId = data.data.id;
    expectEqual(data.data.name, catName);
  });

  await assertTest('6.2 Duplicate category creation rejected (409 Conflict)', async () => {
    const catRes = await fetch(`${BASE_URL}/categories`);
    const catData: any = await catRes.json();
    const existingName = catData.data[0].name;

    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: existingName }),
    });
    expectEqual(res.status, 409);
  });

  await assertTest('6.3 Admin updates category name and description', async () => {
    const updatedName = `QA Updated Category ${Date.now()}`;
    const res = await fetch(`${BASE_URL}/categories/${testCategoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: updatedName,
        description: 'Updated QA description',
      }),
    });
    expectEqual(res.status, 200);
    const data: any = await res.json();
    expectEqual(data.data.name, updatedName);
  });

  // ----------------------------------------------------------------
  // 7. ADMIN PRODUCT MANAGEMENT (CRUD, AVAILABILITY, IMAGES)
  // ----------------------------------------------------------------
  console.log('\n--- SUITE 7: Admin Product Management ---');
  await assertTest('7.1 Admin creates product with price, stock, and images', async () => {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'QA Test Wireless Headset',
        description: 'High fidelity audio for testing',
        categoryId: testCategoryId,
        price: 45000,
        stock: 10,
        sku: `QA-SKU-${Date.now()}`,
        brand: 'DG Audio',
        isAvailable: true,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
        ],
      }),
    });
    expectEqual(res.status, 201);
    const data: any = await res.json();
    testProductId = data.data.id;
    expectEqual(Number(data.data.price), 45000);
    expectEqual(data.data.stock, 10);
  });

  await assertTest('7.2 Deleting category containing products is BLOCKED (400 Bad Request)', async () => {
    const res = await fetch(`${BASE_URL}/categories/${testCategoryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expectEqual(res.status, 400, 'Must block deleting category with active products');
    const data: any = await res.json();
    expectTrue(data.error.includes('Contains 1 product(s)'));
  });

  await assertTest('7.3 Admin updates product price, stock, and deactivates availability', async () => {
    const res = await fetch(`${BASE_URL}/products/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        price: 49000,
        stock: 8,
        isAvailable: false, // Deactivate
      }),
    });
    expectEqual(res.status, 200);
    const data: any = await res.json();
    expectEqual(Number(data.data.price), 49000);
    expectEqual(data.data.stock, 8);
    expectEqual(data.data.is_available, false);
  });

  await assertTest('7.4 Deactivated product is hidden from public catalog, visible to Admin', async () => {
    // Public search should not find it
    const publicRes = await fetch(`${BASE_URL}/products?search=QA%20Test%20Wireless%20Headset`);
    const publicData: any = await publicRes.json();
    const foundInPublic = publicData.data.find((p: any) => p.id === testProductId);
    expectTrue(!foundInPublic, 'Deactivated product must not appear in public catalog');

    // Admin view with includeUnavailable=true finds it
    const adminRes = await fetch(`${BASE_URL}/products?search=QA%20Test%20Wireless%20Headset&includeUnavailable=true`);
    const adminData: any = await adminRes.json();
    const foundInAdmin = adminData.data.find((p: any) => p.id === testProductId);
    expectTrue(Boolean(foundInAdmin), 'Admin must be able to view unavailable products');
  });

  await assertTest('7.5 Admin reactivates and then deletes the test product', async () => {
    const delRes = await fetch(`${BASE_URL}/products/${testProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expectEqual(delRes.status, 200);

    // Verify category is now empty and can be deleted
    const delCatRes = await fetch(`${BASE_URL}/categories/${testCategoryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expectEqual(delCatRes.status, 200);
  });

  // ----------------------------------------------------------------
  // 8. ADMIN ORDER FULFILLMENT, STATUS TRANSITIONS & CANCELLATION RESTORATION
  // ----------------------------------------------------------------
  console.log('\n--- SUITE 8: Admin Order Management, State Transitions & Stock Restoration ---');
  await assertTest('8.1 Admin rejects invalid order-status transition', async () => {
    // Current status is 'pending_confirmation'; attempting to jump directly to 'delivered' is invalid
    const res = await fetch(`${BASE_URL}/orders/${testOrderAId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'delivered' }),
    });
    expectEqual(res.status, 400);
    const data: any = await res.json();
    expectTrue(data.error.includes('Invalid status transition'));
  });

  await assertTest('8.2 Admin progresses order through valid lifecycle: confirmed -> processing -> shipped', async () => {
    // 1. confirmed
    const res1 = await fetch(`${BASE_URL}/orders/${testOrderAId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'confirmed' }),
    });
    expectEqual(res1.status, 200);

    // 2. processing
    const res2 = await fetch(`${BASE_URL}/orders/${testOrderAId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'processing' }),
    });
    expectEqual(res2.status, 200);

    // 3. shipped
    const res3 = await fetch(`${BASE_URL}/orders/${testOrderAId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'shipped' }),
    });
    expectEqual(res3.status, 200);
  });

  await assertTest('8.3 Admin verifies manual WhatsApp MoMo payment (paid + audit notes)', async () => {
    const res = await fetch(`${BASE_URL}/orders/${testOrderAId}/verify-payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        paymentStatus: 'paid',
        notes: 'Verified MTN MoMo transaction reference RW202688192',
      }),
    });
    expectEqual(res.status, 200);
    const data: any = await res.json();
    expectEqual(data.data.payment_status, 'paid');
    expectTrue(Boolean(data.data.verified_at));

    // Verify payments audit trail
    const orderDetailsRes = await fetch(`${BASE_URL}/orders/${testOrderAId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const orderDetails: any = await orderDetailsRes.json();
    expectTrue(orderDetails.data.payments.length >= 2, 'Must contain initial + verification payment records');
    const verifiedRecord = orderDetails.data.payments.find((p: any) => p.status === 'paid');
    expectTrue(Boolean(verifiedRecord), 'Must have paid audit entry');
    expectTrue(
      verifiedRecord.verified_by_name === env.adminFullName || verifiedRecord.verified_by_name === 'Shema Hubert' || verifiedRecord.verified_by_name === 'DG Shop Owner' || verifiedRecord.verified_by_name === 'DG Administrator',
      'Verified by name must match admin user'
    );
  });

  await assertTest('8.4 Admin completes delivery (delivered state is terminal)', async () => {
    const res = await fetch(`${BASE_URL}/orders/${testOrderAId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'delivered' }),
    });
    expectEqual(res.status, 200);

    // Attempting to cancel a delivered order must be rejected
    const cancelRes = await fetch(`${BASE_URL}/orders/${testOrderAId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    expectEqual(cancelRes.status, 400, 'Delivered order must not be cancellable');
  });

  await assertTest('8.5 Cancellation automatically restores inventory stock (tested on new order)', async () => {
    // 1. Get current stock
    const prodRes1 = await fetch(`${BASE_URL}/products/${sampleCatalogProduct.id}`);
    const prodData1: any = await prodRes1.json();
    const stockBeforeOrder = prodData1.data.stock;

    // 2. Place order for 2 units
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Stock Test Customer',
        customerPhone: '0788334455',
        deliveryAddress: { district: 'Rwamagana' },
        items: [{ productId: sampleCatalogProduct.id, quantity: 2 }],
      }),
    });
    const orderData: any = await orderRes.json();
    const cancelOrderId = orderData.data.id;

    // 3. Verify stock was decremented
    const prodRes2 = await fetch(`${BASE_URL}/products/${sampleCatalogProduct.id}`);
    const prodData2: any = await prodRes2.json();
    expectEqual(prodData2.data.stock, stockBeforeOrder - 2);

    // 4. Admin cancels the order
    const cancelRes = await fetch(`${BASE_URL}/orders/${cancelOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    expectEqual(cancelRes.status, 200);

    // 5. Verify stock was restored to original level!
    const prodRes3 = await fetch(`${BASE_URL}/products/${sampleCatalogProduct.id}`);
    const prodData3: any = await prodRes3.json();
    expectEqual(prodData3.data.stock, stockBeforeOrder, 'Stock must be fully restored upon cancellation');
  });

  // ----------------------------------------------------------------
  // 9. ADMIN REPORTS, DASHBOARD METRICS & CUSTOMER DIRECTORY
  // ----------------------------------------------------------------
  console.log('\n--- SUITE 9: Admin Sales Reports & Customer Directory ---');
  await assertTest('9.1 Admin Reports GET /orders/admin/reports returns comprehensive analytics', async () => {
    const res = await fetch(`${BASE_URL}/orders/admin/reports`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expectEqual(res.status, 200);
    const data: any = await res.json();
    const r = data.data;

    expectTrue(typeof r.totalRevenueRwf === 'number', 'totalRevenueRwf must be a number');
    expectTrue(typeof r.totalOrders === 'number', 'totalOrders must be a number');
    expectTrue(typeof r.paidOrders === 'number', 'paidOrders must be a number');
    expectTrue(typeof r.awaitingPayment === 'number', 'awaitingPayment must be a number');
    expectTrue(Array.isArray(r.revenueByCategory), 'revenueByCategory must be an array');
    expectTrue(Array.isArray(r.topProducts), 'topProducts must be an array');
    expectTrue(Array.isArray(r.lowStockAlerts), 'lowStockAlerts must be an array');
  });

  await assertTest('9.2 Admin Customers Directory GET /orders/admin/customers lists customers with spend', async () => {
    const res = await fetch(`${BASE_URL}/orders/admin/customers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expectEqual(res.status, 200);
    const data: any = await res.json();
    expectTrue(Array.isArray(data.data), 'Customer directory must be an array');

    const foundA = data.data.find((c: any) => c.email === customerAEmail);
    expectTrue(Boolean(foundA), 'Newly created Customer A must appear in customer directory');
    expectEqual(foundA.fullName, 'Customer Alpha');
    expectTrue(foundA.ordersCount >= 1, 'Customer A orders count must be at least 1');
    expectTrue(foundA.totalSpentRwf > 0, 'Customer A verified spend must be reflected');
  });

  // ----------------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 QA EXECUTION SUMMARY:`);
  console.log(`   Total Tests:  ${report.total}`);
  console.log(`   Passed:       ${report.passed}`);
  console.log(`   Failed:       ${report.failed}`);
  console.log(`   Success Rate: ${Math.round((report.passed / report.total) * 100)}%`);
  console.log('================================================================');

  if (report.failed > 0) {
    console.error('\n❌ Failures list:');
    report.failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL CLIENT & ADMIN TEST CASES PASSED WITH 100% SUCCESS ON REAL NEON POSTGRESQL!\n');
    process.exit(0);
  }
}

runComprehensiveQASuite().catch((err) => {
  console.error('\n💥 Unexpected suite crash:', err);
  process.exit(1);
});
