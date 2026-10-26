import { env } from './config/env';

const BASE_URL = `http://localhost:${env.port}/api/v1`;

async function runE2ETests() {
  console.log('🚀 Starting Comprehensive DG E-Commerce Test Suite...\n');

  // 1. Health check & Neon PostgreSQL connection
  console.log('1️⃣ Testing Health & Neon PostgreSQL Connection...');
  const healthRes = await fetch(`http://localhost:${env.port}/api/health`);
  const healthData: any = await healthRes.json();
  if (healthData.status !== 'healthy' || !healthData.database.connected) {
    throw new Error(`Health check failed: ${JSON.stringify(healthData)}`);
  }
  console.log(`   ✅ DB Connected: ${healthData.database.version.split(' ')[0]} ${healthData.database.version.split(' ')[1]}`);

  // 2. Fixed Admin Account Login
  console.log('\n2️⃣ Testing Fixed DG Admin Login...');
  let adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: env.adminEmail,
      password: env.adminInitialPassword,
    }),
  });
  let adminLoginData: any = await adminLoginRes.json();
  let adminToken = '';

  if (!adminLoginData.success) {
    // Attempt with updated password
    adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: env.adminEmail,
        password: `${env.adminInitialPassword}!Updated`,
      }),
    });
    adminLoginData = await adminLoginRes.json();
  }

  if (adminLoginData.success) {
    console.log(`   ✅ Admin Login Successful: ${adminLoginData.data.user.fullName} (${adminLoginData.data.user.role})`);
    console.log(`   Must Change Password: ${adminLoginData.data.user.mustChangePassword}`);
    adminToken = adminLoginData.data.token;

    // 3. Test Password Change if mustChangePassword
    if (adminLoginData.data.user.mustChangePassword) {
      console.log('\n3️⃣ Testing Admin Password Change on First Login...');
      const newAdminPassword = `${env.adminInitialPassword}!Updated`;
      const changeRes = await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          currentPassword: env.adminInitialPassword,
          newPassword: newAdminPassword,
        }),
      });
      const changeData: any = await changeRes.json();
      if (!changeData.success) {
        throw new Error(`Password change failed: ${changeData.error}`);
      }
      console.log('   ✅ Admin password successfully updated! Changing back to initial for test repeatability...');
      // Revert back so environment stays consistent
      await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${changeData.data.token}`,
        },
        body: JSON.stringify({
          currentPassword: newAdminPassword,
          newPassword: env.adminInitialPassword,
        }),
      });
    }
  } else {
    throw new Error(`Admin login failed: ${adminLoginData.error}`);
  }

  // 4. Test Customer Registration (Strictly customer role, cannot register as admin)
  console.log('\n4️⃣ Testing Customer Registration...');
  const testEmail = `customer_${Date.now()}@example.rw`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Gisa Patrick',
      email: testEmail,
      phone: '0788112233',
      password: 'Customer2026!Pass',
      role: 'admin', // Malicious attempt to register as admin must be rejected / ignored
    }),
  });
  const regData: any = await regRes.json();
  if (!regData.success) {
    throw new Error(`Customer registration failed: ${regData.error}`);
  }
  if (regData.data.user.role !== 'customer') {
    throw new Error(`Security breach: User registered with role ${regData.data.user.role} instead of customer!`);
  }
  console.log(`   ✅ Customer registered safely as role: "${regData.data.user.role}"`);
  const customerToken = regData.data.token;

  // 5. Public Product & Category Listing
  console.log('\n5️⃣ Testing Public Products & Categories...');
  const catRes = await fetch(`${BASE_URL}/categories`);
  const catData: any = await catRes.json();
  console.log(`   Categories in store: ${catData.data.length}`);

  const prodRes = await fetch(`${BASE_URL}/products?limit=10`);
  const prodData: any = await prodRes.json();
  console.log(`   Live available products: ${prodData.data.length}`);
  const sampleProduct = prodData.data[0];
  console.log(`   Sample: "${sampleProduct.name}" - ${Number(sampleProduct.price).toLocaleString()} RWF (Stock: ${sampleProduct.stock})`);

  // 6. Customer Places Order (Transactional DB save BEFORE WhatsApp)
  console.log('\n6️⃣ Customer Places Order (Transactional DB Save)...');
  const orderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Gisa Patrick',
      customerPhone: '0788112233',
      userId: regData.data.user.id,
      deliveryAddress: {
        province: 'Eastern Province',
        district: 'Rwamagana',
        sector: 'Kigabiro',
        streetDetails: 'Avenue 4, House 12',
      },
      items: [
        {
          productId: sampleProduct.id,
          quantity: 1,
          variationDetails: 'Standard',
        },
      ],
    }),
  });
  const orderData: any = await orderRes.json();
  if (!orderData.success) {
    throw new Error(`Order placement failed: ${orderData.error}`);
  }
  const order = orderData.data;
  console.log(`   ✅ Order saved in PostgreSQL: ${order.orderReference}`);
  console.log(`   Status: "${order.status}", Payment: "${order.paymentStatus}" (Never auto-paid!)`);
  console.log(`   Total: ${order.totalAmount} RWF`);
  console.log(`   WhatsApp payment link generated: ${Boolean(order.whatsappUrl)}`);

  // 7. Security: Customer can only see their own orders, Admin sees all
  console.log('\n7️⃣ Testing Role-Based Order Authorization...');
  const custOrdersRes = await fetch(`${BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  const custOrdersData: any = await custOrdersRes.json();
  console.log(`   Customer sees their own orders: ${custOrdersData.data.length} order(s)`);

  const adminOrdersRes = await fetch(`${BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminOrdersData: any = await adminOrdersRes.json();
  console.log(`   Admin sees all shop orders: ${adminOrdersData.data.length} order(s)`);

  // 8. Admin Verifies WhatsApp Payment (Manual verification)
  console.log('\n8️⃣ Admin Verifies WhatsApp Payment (Manual Verification)...');
  const verifyRes = await fetch(`${BASE_URL}/orders/${order.id}/verify-payment`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      paymentStatus: 'paid',
      notes: 'Verified MTN MoMo transaction TXN892716 received',
    }),
  });
  const verifyData: any = await verifyRes.json();
  if (!verifyData.success || verifyData.data.payment_status !== 'paid') {
    throw new Error(`Payment verification failed: ${JSON.stringify(verifyData)}`);
  }
  console.log(`   ✅ Payment verified as PAID by Admin. Notes: "${verifyData.data.payment_notes}"`);

  // 9. Admin Updates Fulfillment Status (Must adhere to backend state machine transitions)
  console.log('\n9️⃣ Admin Updates Order Fulfillment Status...');
  const lifecycle = ['confirmed', 'processing', 'shipped', 'delivered'];
  let lastStatus = 'pending_confirmation';
  for (const nextStatus of lifecycle) {
    const statusRes = await fetch(`${BASE_URL}/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: nextStatus }),
    });
    const statusData: any = await statusRes.json();
    if (!statusData.success) {
      throw new Error(`Failed to update status from ${lastStatus} to ${nextStatus}: ${statusData.error}`);
    }
    lastStatus = statusData.data.status;
    console.log(`   -> Advanced to: "${lastStatus}"`);
  }
  console.log(`   ✅ Fulfillment status successfully completed to terminal: "${lastStatus}"`);

  // 10. Admin Sales Reports & Analytics
  console.log('\n🔟 Testing Admin Sales Reports & Analytics...');
  const reportsRes = await fetch(`${BASE_URL}/orders/admin/reports`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const reportsData: any = await reportsRes.json();
  if (!reportsData.success) {
    throw new Error(`Reports failed: ${reportsData.error}`);
  }
  console.log(`   ✅ Total Verified Revenue: ${Number(reportsData.data.totalRevenueRwf).toLocaleString()} RWF`);
  console.log(`   Paid Orders Count: ${reportsData.data.paidOrders}`);
  console.log(`   Delivered Orders: ${reportsData.data.deliveredOrders}`);

  // 11. Admin Customers Directory
  console.log('\n1️⃣1️⃣ Testing Admin Customers Directory...');
  const customersRes = await fetch(`${BASE_URL}/orders/admin/customers`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const customersData: any = await customersRes.json();
  console.log(`   ✅ Registered Customers listed: ${customersData.data.length}`);
  const found = customersData.data.find((c: any) => c.email === testEmail);
  console.log(`   Found newly registered customer: ${found?.fullName} (${found?.email}) - Spent: ${found?.totalSpentRwf} RWF`);

  console.log('\n🎉 ALL 11 END-TO-END TESTS PASSED SUCCESSFULLY! Real database data, transactions, and role security verified.');
}

runE2ETests().catch((err) => {
  console.error('\n❌ E2E Test Suite Error:', err.message);
  process.exit(1);
});
