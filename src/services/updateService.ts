import { NativeModules, Platform } from 'react-native';
import { getApiBaseUrl } from '../api/client';

const { DGUpdateModule } = NativeModules;

export interface UpdateInfo {
  updateAvailable: boolean;
  currentVersion: string;
  updateVersion?: string;
  buildNumber?: number;
  runtimeVersion?: string;
  updateType?: 'ota_bundle' | 'native_apk';
  isRuntimeCompatible?: boolean;
  bundleUrl?: string | null;
  bundleHash?: string | null;
  bundleSizeBytes?: number | null;
  apkUrl?: string | null;
  releaseNotes?: string;
  isMandatory?: boolean;
  publishedAt?: string;
  message?: string;
}

export interface NativeBundleInfo {
  bundleSource: 'ota' | 'embedded';
  version: string;
  hash: string;
  installedAt?: string;
  bundlePath?: string | null;
  bundleSizeBytes?: number;
}

export const APP_CONFIG = {
  version: '1.0.0',
  buildNumber: 1,
  runtimeVersion: '1.0',
  channel: 'production',
};

export const updateService = {
  /**
   * Checks the remote backend for available updates
   */
  checkForUpdate: async (
    version = APP_CONFIG.version,
    buildNumber = APP_CONFIG.buildNumber,
    runtimeVersion = APP_CONFIG.runtimeVersion,
    channel = APP_CONFIG.channel
  ): Promise<UpdateInfo> => {
    const baseUrl = getApiBaseUrl();
    const query = new URLSearchParams({
      platform: Platform.OS,
      version,
      buildNumber: String(buildNumber),
      runtimeVersion,
      channel,
    }).toString();

    try {
      const response = await fetch(`${baseUrl}/updates/check?${query}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Update check returned HTTP ${response.status}`);
      }

      const json = (await response.json()) as any;
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Invalid response from update server.');
      }

      return json.data as UpdateInfo;
    } catch (err: any) {
      console.warn('[UpdateService] Update check failed:', err.message);
      throw err;
    }
  },

  /**
   * Fetches the current native running bundle source and version
   */
  getNativeBundleInfo: async (): Promise<NativeBundleInfo> => {
    if (!DGUpdateModule?.getCurrentBundleInfo) {
      return {
        bundleSource: 'embedded',
        version: APP_CONFIG.version,
        hash: 'embedded_asset',
      };
    }
    return await DGUpdateModule.getCurrentBundleInfo();
  },

  /**
   * Downloads Hermes bundle over HTTPS, validates SHA-256 integrity, and stages it
   */
  downloadAndInstallBundle: async (
    bundleUrl: string,
    expectedHash: string,
    version: string
  ): Promise<{ success: boolean; version: string; hash: string }> => {
    if (!DGUpdateModule?.downloadAndInstallBundle) {
      throw new Error('Native OTA Update module is not linked in this runtime.');
    }
    return await DGUpdateModule.downloadAndInstallBundle(bundleUrl, expectedHash, version);
  },

  /**
   * Restarts the application cleanly to load the verified OTA bundle
   */
  reloadApp: async (): Promise<void> => {
    if (!DGUpdateModule?.reloadApp) {
      throw new Error('Native reload is not supported in this runtime.');
    }
    await DGUpdateModule.reloadApp();
  },

  /**
   * Emergency rollback: reverts to embedded APK factory assets
   */
  rollback: async (): Promise<{ success: boolean; message: string }> => {
    if (!DGUpdateModule?.rollbackToPreviousBundle) {
      throw new Error('Native rollback is not supported in this runtime.');
    }
    return await DGUpdateModule.rollbackToPreviousBundle();
  },
};
