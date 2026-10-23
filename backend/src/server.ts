import app from './app';
import { testConnection } from './db';
import { ensureAdminAccount } from './db/adminSetup';
import { env } from './config/env';

async function startServer() {
  console.log('🔄 Checking Neon PostgreSQL connection...');
  const isConnected = await testConnection();

  if (!isConnected) {
    console.error('⚠️ Warning: Neon PostgreSQL is unreachable with the current credentials.');
  } else {
    // Automatically ensure fixed DG admin account is provisioned
    await ensureAdminAccount();
  }

  app.listen(env.port, () => {
    console.log(`🚀 DG E-Commerce API running on port ${env.port}`);
    console.log(`📡 Health Check URL: http://localhost:${env.port}/api/health`);
  });
}

startServer();

