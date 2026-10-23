import { Pool } from 'pg';
import { env } from '../config/env';

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});


pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const res = await pool.query('SELECT NOW() as current_time');
    console.log('Connected to Neon PostgreSQL at:', res.rows[0].current_time);
    return true;
  } catch (err: any) {
    console.error('Neon PostgreSQL connection failed:', err.message);
    if (err.code === 'ENOTFOUND') {
      console.error(
        'DNS Resolution Error (ENOTFOUND): The database hostname could not be resolved.\n' +
        'Possible causes:\n' +
        '1. Check your internet connection or DNS resolver.\n' +
        '2. Verify DATABASE_URL has no newline, space, or typo in .env.\n' +
        '3. Try using the direct Neon host or pooled host.'
      );
    }
    return false;
  }
};
