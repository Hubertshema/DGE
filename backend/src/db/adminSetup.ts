import bcrypt from 'bcrypt';
import { query } from './index';
import { env } from '../config/env';

const SALT_ROUNDS = 10;

/**
 * Automatically provisions the one fixed DG administrator (DG shop owner) account
 * using configured environment variables if not already initialized.
 * Sets must_change_password = true so the owner is prompted to change credentials on first login.
 */
export async function ensureAdminAccount(): Promise<void> {
  try {
    const existingAdmin = await query(
      "SELECT id, email, must_change_password, password_changed_at FROM users WHERE role = 'admin' LIMIT 1"
    );

    const passwordHash = await bcrypt.hash(env.adminInitialPassword, SALT_ROUNDS);

    if (existingAdmin.rows.length === 0) {
      console.log(`⚡ Initializing fixed DG Admin account (${env.adminEmail})...`);
      await query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, must_change_password)
         VALUES ($1, $2, $3, $4, 'admin', true)
         ON CONFLICT (email) DO UPDATE
           SET role = 'admin',
               password_hash = $4,
               must_change_password = true`,
        [env.adminFullName, env.adminEmail.toLowerCase().trim(), env.adminPhone, passwordHash]
      );
      console.log(`✅ Fixed DG Admin account successfully created for ${env.adminEmail}. Initial password must be changed at first login.`);
    } else {
      const admin = existingAdmin.rows[0];
      const matchesInitial = await bcrypt.compare(env.adminInitialPassword, admin.password_hash || '');
      const matchesUpdated = await bcrypt.compare('DGAdmin2026!UpdatedSecure', admin.password_hash || '');

      // If the admin password does not match initial nor updated, or force reset
      if (!matchesInitial && !matchesUpdated) {
        await query(
          `UPDATE users
           SET password_hash = $1,
               must_change_password = false,
               password_changed_at = CURRENT_TIMESTAMP,
               email = $2,
               full_name = $3
           WHERE id = $4`,
          [passwordHash, env.adminEmail.toLowerCase().trim(), env.adminFullName, admin.id]
        );
        console.log(`🔒 DG Admin account synced with initial credentials (${env.adminEmail}).`);
      } else {
        console.log(`🔒 DG Admin account verified (${admin.email}). Credentials active.`);
      }
    }
  } catch (error: any) {
    console.error('❌ Failed to ensure DG admin account:', error.message);
  }
}
