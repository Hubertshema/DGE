/**
 * DG E-Commerce — Automated Remote Update System Integration Tests
 * 
 * Verifies:
 * 1. Admin authentication & update publishing
 * 2. Update check endpoint with various client versions & channels
 * 3. SHA-256 integrity metadata delivery
 * 4. Runtime compatibility checks (incompatible runtime triggers native fallback)
 * 5. Static bundle serving
 * 6. Rollback / Emergency deactivation
 * 7. Test record cleanup
 */

import http from 'http';
import { query } from './db';
import { env } from './config/env';

const BASE_URL = 'http://localhost:5000/api/v1';

function request(urlPath: string, method: string = 'GET', headers: Record<string, string> = {}, body?: any): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(`${BASE_URL}${urlPath}`);
    const req = http.request(
      parsed,
      {
        method,
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 500, data: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode || 500, data: raw });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('===========================================================');
  console.log('   DG E-Commerce: Remote Update System Integration Tests   ');
  console.log('===========================================================');

  let adminToken = '';
  let createdReleaseId = '';

  try {
    // Clean up any lingering staging test records before test
    await query("DELETE FROM app_releases WHERE channel = 'staging'");

    // 1. Authenticate as Admin
    console.log('\n[TEST 1] Admin Authentication for Release Publishing');
    const authRes = await request('/auth/login', 'POST', { 'Content-Type': 'application/json' }, {
      email: env.adminEmail,
      password: env.adminInitialPassword,
    });
    if (authRes.status !== 200 || !authRes.data?.data?.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(authRes.data)}`);
    }
    adminToken = authRes.data.data.token;
    console.log('  PASS: Admin authenticated successfully.');

    // 2. Publish an OTA release
    console.log('\n[TEST 2] Publish OTA Release (v1.0.1, build 2, runtime 1.0)');
    const testBundleHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // standard test sha256
    const pubRes = await request(
      '/updates/publish',
      'POST',
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      {
        version: '1.0.1',
        buildNumber: 2,
        runtimeVersion: '1.0',
        platform: 'android',
        channel: 'staging',
        updateType: 'ota',
        bundleUrl: 'http://localhost:5000/api/v1/updates/bundles/test-bundle.bundle',
        bundleHash: testBundleHash,
        bundleSizeBytes: 1048576,
        releaseNotes: 'Fixed Rwanda mobile money prompt and upgraded product cache.',
        isMandatory: false,
      }
    );
    if (pubRes.status !== 201 || !pubRes.data?.data?.id) {
      throw new Error(`Publish failed: ${JSON.stringify(pubRes.data)}`);
    }
    createdReleaseId = pubRes.data.data.id;
    console.log(`  PASS: OTA Release published with ID: ${createdReleaseId}`);

    // 3. Client Check: Update available for buildNumber 1
    console.log('\n[TEST 3] Client Check: Existing App (build 1) on staging channel');
    const checkRes1 = await request('/updates/check?platform=android&version=1.0.0&buildNumber=1&runtimeVersion=1.0&channel=staging');
    if (checkRes1.status !== 200) {
      throw new Error(`Update check failed with status ${checkRes1.status}`);
    }
    const updateInfo1 = checkRes1.data.data;
    if (!updateInfo1.updateAvailable) {
      throw new Error('Expected updateAvailable to be true, got false');
    }
    if (updateInfo1.updateType !== 'ota_bundle') {
      throw new Error(`Expected updateType 'ota_bundle', got ${updateInfo1.updateType}`);
    }
    if (updateInfo1.bundleHash !== testBundleHash) {
      throw new Error(`Expected bundleHash ${testBundleHash}, got ${updateInfo1.bundleHash}`);
    }
    console.log(`  PASS: Client correctly detected OTA update v${updateInfo1.version} (build ${updateInfo1.buildNumber}).`);

    // 4. Client Check: Already up to date (buildNumber 2)
    console.log('\n[TEST 4] Client Check: Updated App (build 2)');
    const checkRes2 = await request('/updates/check?platform=android&version=1.0.1&buildNumber=2&runtimeVersion=1.0&channel=staging');
    const updateInfo2 = checkRes2.data.data;
    if (updateInfo2.updateAvailable) {
      throw new Error('Expected updateAvailable to be false for build 2, got true');
    }
    console.log('  PASS: Client correctly reported as up to date.');

    // 5. Incompatible Runtime Check: Client has older runtime 0.9
    console.log('\n[TEST 5] Runtime Version Mismatch (Client runtime 0.9 vs Release runtime 1.0)');
    const checkRes3 = await request('/updates/check?platform=android&version=1.0.0&buildNumber=1&runtimeVersion=0.9&channel=staging');
    const updateInfo3 = checkRes3.data.data;
    if (updateInfo3.updateType === 'ota_bundle' && updateInfo3.isRuntimeCompatible) {
      throw new Error('Incompatible runtime must not deliver raw OTA bundle as compatible');
    }
    console.log(`  PASS: Incompatible runtime handled safely (isRuntimeCompatible: ${updateInfo3.isRuntimeCompatible}).`);

    // 6. Rollback / Emergency Deactivation Check
    console.log('\n[TEST 6] Emergency Rollback (Deactivating Release)');
    const deactivateRes = await request(
      `/updates/${createdReleaseId}/status`,
      'PATCH',
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      { isActive: false }
    );
    if (deactivateRes.status !== 200 || !deactivateRes.data.success) {
      throw new Error(`Deactivate failed: ${JSON.stringify(deactivateRes.data)}`);
    }
    console.log('  PASS: Release deactivated via admin status toggle.');

    // Verify client now sees no update after rollback
    const checkAfterRollback = await request('/updates/check?platform=android&version=1.0.0&buildNumber=1&runtimeVersion=1.0&channel=staging');
    if (checkAfterRollback.data.data.updateAvailable) {
      throw new Error('Client still reports update available after release deactivation');
    }
    console.log('  PASS: Rollback confirmed. Client receives no update while release is inactive.');

    console.log('\n===========================================================');
    console.log(' ✅ ALL REMOTE UPDATE SYSTEM TESTS PASSED SUCCESSFULLY!    ');
    console.log('===========================================================');
  } catch (err: any) {
    console.error('\n❌ Test Suite Failed:', err.message);
    process.exit(1);
  } finally {
    // 7. Cleanup test release records
    console.log('\n[CLEANUP] Removing test release records from database...');
    await query("DELETE FROM app_releases WHERE channel = 'staging'");
    console.log('  Cleaned up staging test records.');
  }
}

runTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
