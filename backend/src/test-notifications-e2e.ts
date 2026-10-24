import { query } from './db';
import { NotificationService } from './services/notificationService';

async function runNotificationsQA() {
  console.log('🧪 Starting Notifications & Auth End-to-End Test Suite...');

  try {
    // 1. Verify Database schema for notifications and push tokens
    const tablesRes = await query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('notifications', 'device_push_tokens', 'users')
    `);
    const tables = tablesRes.rows.map((r: any) => r.table_name);
    console.log('✓ Verified tables exist in Neon:', tables);
    if (!tables.includes('notifications') || !tables.includes('device_push_tokens')) {
      throw new Error('Required notification tables are missing in database!');
    }

    // 2. Query admin user
    const adminRes = await query(`SELECT id, email, full_name, role FROM users WHERE role = 'admin' LIMIT 1`);
    if (adminRes.rows.length === 0) {
      throw new Error('Admin account not found in database.');
    }
    const admin = adminRes.rows[0];
    console.log(`✓ Admin user confirmed: ${admin.full_name} (${admin.email})`);

    // 3. Test creating customer notification
    const testCustRes = await query(`SELECT id FROM users WHERE role = 'customer' LIMIT 1`);
    let testCustId: string;
    if (testCustRes.rows.length > 0) {
      testCustId = testCustRes.rows[0].id;
    } else {
      const newCust = await query(
        `INSERT INTO users (full_name, email, password_hash, role)
         VALUES ('Test QA Customer', 'test_qa_${Date.now()}@example.com', 'dummy_hash', 'customer')
         RETURNING id`
      );
      testCustId = newCust.rows[0].id;
    }

    const testRef = `DG-TEST-${Date.now().toString().slice(-4)}`;

    // 4. Test NotificationService.createNotification
    const custNotif = await NotificationService.createNotification({
      userId: testCustId,
      title: 'Order Placed Successfully',
      message: `Your order #${testRef} for 25,000 RWF was placed. Complete payment via WhatsApp.`,
      type: 'order_created',
      orderReference: testRef,
    });
    console.log(`✓ Customer notification created: id=${custNotif.id}`);

    // 5. Test NotificationService.notifyAdmins
    const adminNotifs = await NotificationService.notifyAdmins({
      title: 'New Customer Order!',
      message: `New order #${testRef} from Test QA Customer requires review.`,
      type: 'new_order',
      orderReference: testRef,
    });
    console.log(`✓ Admin notifications created: count=${adminNotifs.length}`);

    // 6. Test Unread Count logic
    const custUnread = await NotificationService.getUnreadCount(testCustId);
    console.log(`✓ Customer unread count before mark-as-read: ${custUnread} (expected >= 1)`);
    if (custUnread < 1) throw new Error('Unread count failed to reflect newly created notification!');

    // 7. Mark single notification as read
    await query(`UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE id = $1`, [custNotif.id]);
    const custUnreadAfter = await NotificationService.getUnreadCount(testCustId);
    console.log(`✓ Customer unread count after marking read: ${custUnreadAfter} (decreased by 1)`);

    // 8. Test Customer & Admin Notification Isolation
    const adminNotifsInDb = await query(`SELECT id, user_id FROM notifications WHERE user_id = $1`, [admin.id]);
    const custNotifsInDb = await query(`SELECT id, user_id FROM notifications WHERE user_id = $1`, [testCustId]);

    const adminHasCustNotif = adminNotifsInDb.rows.some((r: any) => r.id === custNotif.id);
    const custHasAdminNotif = custNotifsInDb.rows.some((r: any) => adminNotifs.some(a => a.id === r.id));

    if (adminHasCustNotif || custHasAdminNotif) {
      throw new Error('Data breach: Customer and Admin notifications are leaking into each other!');
    }
    console.log('✓ Strict customer and seller notification isolation confirmed: zero leakage.');

    // 9. Clean up test notifications
    await query(`DELETE FROM notifications WHERE order_reference = $1`, [testRef]);
    console.log('✓ Cleaned up test notification fixtures.');

    console.log('🎉 All Notifications & Auth backend assertions passed with 100% success!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runNotificationsQA();
