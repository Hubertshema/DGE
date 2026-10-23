import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend folder, current working directory, or project root
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
  path.resolve(__dirname, '..', '..', '..', '.env'),
];

for (const p of envPaths) {
  dotenv.config({ path: p });
}

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
}

const required = (name: string): string => {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const jwtSecret = required('JWT_ACCESS_SECRET');
if (jwtSecret.length < 32) {
  throw new Error('JWT_ACCESS_SECRET must be at least 32 characters long.');
}

// Sanitize DATABASE_URL in case of accidental newlines, tabs, quotes, or whitespace
const rawDatabaseUrl = required('DATABASE_URL');
const sanitizedDatabaseUrl = rawDatabaseUrl
  .trim()
  .replace(/^["']|["']$/g, '')
  .replace(/[\r\n\t\s]+/g, '');

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  databaseUrl: sanitizedDatabaseUrl,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  whatsappPhone: (process.env.WHATSAPP_BUSINESS_PHONE || '').replace(/\D/g, ''),
  deliveryFeeRwf: Number(process.env.DELIVERY_FEE_RWF || 1500),
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@dgecommerce.rw',
  adminInitialPassword: process.env.ADMIN_INITIAL_PASSWORD || 'DGAdmin2026!Rwamagana',
  adminFullName: process.env.ADMIN_FULL_NAME || 'DG Shop Owner',
  adminPhone: process.env.ADMIN_PHONE || '+250788000000',
};

