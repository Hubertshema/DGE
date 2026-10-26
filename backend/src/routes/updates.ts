import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { query } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Ensure bundles directory exists
const BUNDLES_DIR = path.resolve(__dirname, '..', '..', 'public', 'bundles');
if (!fs.existsSync(BUNDLES_DIR)) {
  fs.mkdirSync(BUNDLES_DIR, { recursive: true });
}

interface UpdateCheckQuery {
  platform?: string;
  version?: string;
  buildNumber?: string;
  runtimeVersion?: string;
  channel?: string;
}

// Public: Check for available updates
router.get('/check', async (req: Request<{}, {}, {}, UpdateCheckQuery>, res: Response) => {
  try {
    const platform = (req.query.platform || 'android').toLowerCase();
    const clientVersion = req.query.version || '1.0.0';
    const clientBuildNumber = parseInt(req.query.buildNumber || '1', 10);
    const clientRuntimeVersion = req.query.runtimeVersion || '1.0';
    const channel = (req.query.channel || 'production').toLowerCase();

    // Fetch latest active release for this platform and channel
    const result = await query(
      `SELECT id, version, build_number as "buildNumber", runtime_version as "runtimeVersion",
              platform, update_type as "updateType", bundle_url as "bundleUrl",
              bundle_hash as "bundleHash", bundle_size_bytes as "bundleSizeBytes",
              apk_url as "apkUrl", release_notes as "releaseNotes",
              is_mandatory as "isMandatory", min_supported_version as "minSupportedVersion",
              created_at as "createdAt"
       FROM app_releases
       WHERE platform = $1 AND channel = $2 AND is_active = true
       ORDER BY build_number DESC, created_at DESC
       LIMIT 1`,
      [platform, channel]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          updateAvailable: false,
          currentVersion: clientVersion,
          message: 'Your application is running the latest available version.',
        },
      });
    }

    const latest = result.rows[0];

    // Check if client is already at or above latest build number
    if (clientBuildNumber >= latest.buildNumber) {
      return res.json({
        success: true,
        data: {
          updateAvailable: false,
          currentVersion: clientVersion,
          latestVersion: latest.version,
          message: 'Your application is up to date.',
        },
      });
    }

    // Determine update type based on runtime version compatibility
    // If runtimeVersion matches -> OTA JS bundle update
    // If runtimeVersion differs -> Native APK update required
    const isRuntimeCompatible = clientRuntimeVersion === latest.runtimeVersion;
    const effectiveUpdateType = isRuntimeCompatible && latest.updateType === 'ota_bundle'
      ? 'ota_bundle'
      : 'native_apk';

    res.json({
      success: true,
      data: {
        updateAvailable: true,
        currentVersion: clientVersion,
        updateVersion: latest.version,
        buildNumber: latest.buildNumber,
        runtimeVersion: latest.runtimeVersion,
        updateType: effectiveUpdateType,
        isRuntimeCompatible,
        bundleUrl: effectiveUpdateType === 'ota_bundle' ? latest.bundleUrl : null,
        bundleHash: effectiveUpdateType === 'ota_bundle' ? latest.bundleHash : null,
        bundleSizeBytes: effectiveUpdateType === 'ota_bundle' ? Number(latest.bundleSizeBytes) : null,
        apkUrl: effectiveUpdateType === 'native_apk' ? latest.apkUrl : null,
        releaseNotes: latest.releaseNotes || 'General performance enhancements and bug fixes.',
        isMandatory: Boolean(latest.isMandatory),
        publishedAt: latest.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Public: Serve static OTA Hermes bundles
router.get('/bundles/:filename', (req: Request, res: Response) => {
  const filename = String(req.params.filename);
  // Sanitize filename to prevent directory traversal
  const safeFilename = path.basename(filename);
  const filePath = path.join(BUNDLES_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'Bundle file not found.' });
  }

  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(filePath);
});

// Admin: Publish new release (OTA Bundle or Native APK)
router.post('/publish', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const {
    version,
    buildNumber,
    runtimeVersion,
    platform = 'android',
    updateType = 'ota_bundle',
    bundleUrl,
    bundleHash,
    bundleSizeBytes,
    apkUrl,
    releaseNotes,
    isMandatory = false,
    channel = 'production',
    minSupportedVersion,
  } = req.body;

  if (!version || !buildNumber || !runtimeVersion) {
    return res.status(400).json({
      success: false,
      error: 'version, buildNumber, and runtimeVersion are required.',
    });
  }

  const normalizedUpdateType =
    updateType === 'ota' || updateType === 'ota_bundle' ? 'ota_bundle' : 'native_apk';

  if (normalizedUpdateType === 'ota_bundle' && (!bundleUrl || !bundleHash)) {
    return res.status(400).json({
      success: false,
      error: 'bundleUrl and bundleHash (SHA-256) are required for OTA bundle releases.',
    });
  }

  if (normalizedUpdateType === 'native_apk' && !apkUrl) {
    return res.status(400).json({
      success: false,
      error: 'apkUrl is required for native APK releases.',
    });
  }

  try {
    const result = await query(
      `INSERT INTO app_releases (
        version, build_number, runtime_version, platform, update_type,
        bundle_url, bundle_hash, bundle_size_bytes, apk_url,
        release_notes, is_mandatory, is_active, channel, min_supported_version, published_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12, $13, $14)
      RETURNING *`,
      [
        version.trim(),
        Number(buildNumber),
        runtimeVersion.trim(),
        platform.toLowerCase(),
        normalizedUpdateType,
        bundleUrl ? bundleUrl.trim() : null,
        bundleHash ? bundleHash.trim().toLowerCase() : null,
        bundleSizeBytes ? Number(bundleSizeBytes) : null,
        apkUrl ? apkUrl.trim() : null,
        releaseNotes ? releaseNotes.trim() : 'Performance improvements and bug fixes.',
        Boolean(isMandatory),
        channel.toLowerCase(),
        minSupportedVersion ? minSupportedVersion.trim() : null,
        req.user!.id,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: `Release ${version} (Build ${buildNumber}) successfully published to ${channel} channel.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Release history & rollback status
router.get('/history', authenticateToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT r.id, r.version, r.build_number as "buildNumber", r.runtime_version as "runtimeVersion",
              r.platform, r.update_type as "updateType", r.bundle_url as "bundleUrl",
              r.bundle_hash as "bundleHash", r.bundle_size_bytes as "bundleSizeBytes",
              r.apk_url as "apkUrl", r.release_notes as "releaseNotes",
              r.is_mandatory as "isMandatory", r.is_active as "isActive",
              r.channel, r.created_at as "createdAt",
              u.full_name as "publishedByName"
       FROM app_releases r
       LEFT JOIN users u ON r.published_by = u.id
       ORDER BY r.build_number DESC, r.created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Toggle release active status (Emergency Rollback)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({ success: false, error: 'isActive boolean is required.' });
  }

  try {
    const result = await query(
      `UPDATE app_releases
       SET is_active = $1
       WHERE id = $2
       RETURNING id, version, build_number as "buildNumber", is_active as "isActive"`,
      [Boolean(isActive), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Release not found.' });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: `Release status updated. Active: ${isActive}.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
