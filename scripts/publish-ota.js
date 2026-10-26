/**
 * DG E-Commerce — Remote OTA Bundle Publisher Script
 * 
 * Usage:
 *   node scripts/publish-ota.js --version 1.0.1 --build 2 --notes "UI improvement and cart bugfix"
 * 
 * Environment variables:
 *   UPDATE_API_URL - Default: http://localhost:5000/api/v1
 *   ADMIN_EMAIL    - Default: admin@dg-store.rw
 *   ADMIN_PASSWORD - Default: Admin@12345
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const https = require('https');

// Parse CLI args
const args = process.argv.slice(2);
function getArg(flag, defaultValue) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return defaultValue;
}

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'));
const version = getArg('--version', packageJson.version || '1.0.1');
const buildNumber = parseInt(getArg('--build', '2'), 10);
const runtimeVersion = getArg('--runtime', '1.0');
const channel = getArg('--channel', 'production');
const releaseNotes = getArg('--notes', `Release v${version} (Build ${buildNumber})`);
const isMandatory = args.includes('--mandatory');
const skipBundle = args.includes('--skip-bundle');

// Parse backend/.env or backend/.env.local if present
const envFiles = [
  path.resolve(__dirname, '..', 'backend', '.env'),
  path.resolve(__dirname, '..', 'backend', '.env.local'),
];
let envConfig = {};
for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        envConfig[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
      }
    });
  }
}

const apiUrl = getArg('--api-url', process.env.UPDATE_API_URL || 'http://localhost:5000/api/v1');
const adminEmail = getArg('--email', process.env.ADMIN_EMAIL || envConfig.ADMIN_EMAIL || 'shemahubert2021@gmail.com');
const adminPassword = getArg('--password', process.env.ADMIN_PASSWORD || envConfig.ADMIN_INITIAL_PASSWORD || 'shema123');

console.log('====================================================');
console.log('   DG E-Commerce — Over-The-Air (OTA) Publisher    ');
console.log('====================================================');
console.log(` Target Version:   ${version}`);
console.log(` Build Number:     ${buildNumber}`);
console.log(` Runtime Version:  ${runtimeVersion}`);
console.log(` Channel:          ${channel}`);
console.log(` Mandatory:        ${isMandatory}`);
console.log(` Release Notes:    ${releaseNotes}`);
console.log(` Target API:       ${apiUrl}`);
console.log('----------------------------------------------------');

const outputDir = path.resolve(__dirname, '..', 'backend', 'public', 'bundles');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const bundleFilename = `index.android.${version}.${buildNumber}.bundle`;
const bundlePath = path.join(outputDir, bundleFilename);

// Helper HTTP request function
function makeRequest(urlStr, method, headers, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.request(
      parsed,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            resolve({ statusCode: res.statusCode, data: parsedData });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: data });
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

async function main() {
  try {
    // 1. Generate JS bundle using React Native CLI if not skipped
    if (!skipBundle) {
      console.log('\n[1/4] Generating React Native Android JS Bundle...');
      const assetsDest = path.resolve(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
      const cmd = `npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output "${bundlePath}" --assets-dest "${assetsDest}"`;
      console.log(`Running: ${cmd}`);
      execSync(cmd, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
      console.log(' Bundle created successfully at:\n  ' + bundlePath);
    } else {
      console.log('\n[1/4] Skipping JS bundling (--skip-bundle specified).');
      if (!fs.existsSync(bundlePath)) {
        // If file doesn't exist, create a lightweight dummy bundle for dry-run testing
        fs.writeFileSync(bundlePath, `// DG E-Commerce Bundle v${version}\nconsole.log("DG E-Commerce v${version}");`);
      }
    }

    // 2. Compute SHA-256 and file size
    console.log('\n[2/4] Calculating cryptographic SHA-256 fingerprint...');
    const fileBuffer = fs.readFileSync(bundlePath);
    const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const sizeBytes = fileBuffer.length;
    console.log(` SHA-256: ${sha256}`);
    console.log(` Size:    ${(sizeBytes / 1024).toFixed(2)} KB (${sizeBytes} bytes)`);

    // 3. Authenticate with backend
    console.log('\n[3/4] Authenticating with DG backend as Admin...');
    const loginRes = await makeRequest(`${apiUrl}/auth/login`, 'POST', { 'Content-Type': 'application/json' }, {
      email: adminEmail,
      password: adminPassword,
    });

    if (loginRes.statusCode !== 200 || !loginRes.data?.data?.token) {
      throw new Error(`Authentication failed (${loginRes.statusCode}): ${JSON.stringify(loginRes.data || loginRes.raw)}`);
    }

    const token = loginRes.data.data.token;
    console.log(' Authentication successful. Token acquired.');

    // 4. Publish release metadata
    console.log('\n[4/4] Publishing release record to backend update registry...');
    const bundleUrl = `${apiUrl}/updates/bundles/${bundleFilename}`;
    const publishPayload = {
      version,
      buildNumber,
      runtimeVersion,
      platform: 'android',
      channel,
      updateType: 'ota',
      bundleUrl,
      bundleHash: sha256,
      bundleSizeBytes: sizeBytes,
      releaseNotes,
      isMandatory,
    };

    const pubRes = await makeRequest(
      `${apiUrl}/updates/publish`,
      'POST',
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      publishPayload
    );

    if (pubRes.statusCode !== 201) {
      throw new Error(`Publish failed (${pubRes.statusCode}): ${JSON.stringify(pubRes.data || pubRes.raw)}`);
    }

    console.log('\n====================================================');
    console.log(' 🎉 OTA Update Successfully Published!');
    console.log('====================================================');
    console.log(` Release ID:     ${pubRes.data.data.id}`);
    console.log(` Version:        ${version} (Build ${buildNumber})`);
    console.log(` Channel:        ${channel}`);
    console.log(` Bundle URL:     ${bundleUrl}`);
    console.log(` SHA-256 Hash:   ${sha256}`);
    console.log(' Mobile devices querying /updates/check will now seamlessly receive this bundle.');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ Release publishing failed:', error.message);
    process.exit(1);
  }
}

main();
