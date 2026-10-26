const https = require('https');

function check(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data.substring(0, 200) });
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing live Render endpoints...');
  
  // Test 1: Check update for client on v0.0.1
  const res1 = await check('https://dge-ak8u.onrender.com/api/v1/updates/check?platform=android&version=0.0.1&buildNumber=1&runtimeVersion=1.0&channel=production');
  console.log('\n[Client v0.0.1 (Build 1) Check Result]:', JSON.stringify(res1, null, 2));

  // Test 2: Check update for client on v0.0.3
  const res2 = await check('https://dge-ak8u.onrender.com/api/v1/updates/check?platform=android&version=0.0.3&buildNumber=3&runtimeVersion=1.0&channel=production');
  console.log('\n[Client v0.0.3 (Build 3) Check Result]:', JSON.stringify(res2, null, 2));

  // Test 3: Check bundle head/get
  if (res1.body?.data?.bundleUrl) {
    const bundleUrl = res1.body.data.bundleUrl;
    console.log('\nVerifying bundle URL accessibility:', bundleUrl);
    https.get(bundleUrl, (res) => {
      console.log('Bundle HTTP Status:', res.statusCode);
      console.log('Bundle Content-Type:', res.headers['content-type']);
      console.log('Bundle Content-Length:', res.headers['content-length']);
      res.destroy();
    });
  }
}

run().catch(console.error);
