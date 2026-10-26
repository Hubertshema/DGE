import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { updateService, UpdateInfo, NativeBundleInfo, APP_CONFIG } from '../services/updateService';

export type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'ready_to_reload' | 'up_to_date' | 'error';

interface UpdateContextType {
  currentVersion: string;
  nativeBundleInfo: NativeBundleInfo | null;
  updateInfo: UpdateInfo | null;
  status: UpdateStatus;
  errorMessage: string | null;
  downloadProgress: number;
  isMandatory: boolean;
  checkForUpdates: (silent?: boolean) => Promise<UpdateInfo | null>;
  downloadAndApplyUpdate: () => Promise<void>;
  applyAndRestart: () => Promise<void>;
  rollback: () => Promise<void>;
}

const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

export const UpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentVersion, setCurrentVersion] = useState<string>(APP_CONFIG.version);
  const [nativeBundleInfo, setNativeBundleInfo] = useState<NativeBundleInfo | null>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  // Initialize bundle information and perform background update check on app launch
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const info = await updateService.getNativeBundleInfo();
        if (isMounted) {
          setNativeBundleInfo(info);
          if (info.version) {
            setCurrentVersion(info.version);
          }
        }
      } catch (err) {
        console.warn('[UpdateContext] Failed to retrieve native bundle info:', err);
      }

      // Check for updates in background after startup
      try {
        await checkForUpdates(true);
      } catch {
        // Silent failure on startup
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const checkForUpdates = useCallback(async (silent = false): Promise<UpdateInfo | null> => {
    if (status === 'checking' || status === 'downloading') return null;

    setStatus('checking');
    setErrorMessage(null);

    try {
      const activeVersion = nativeBundleInfo?.version || currentVersion;
      const data = await updateService.checkForUpdate(activeVersion);

      setUpdateInfo(data);

      if (data.updateAvailable) {
        setStatus('idle');
      } else {
        setStatus('up_to_date');
      }
      return data;
    } catch (err: any) {
      const message = err.message || 'Unable to connect to update server.';
      setErrorMessage(message);
      setStatus('error');
      if (!silent) {
        Alert.alert('Update Check Notice', message);
      }
      return null;
    }
  }, [status, nativeBundleInfo, currentVersion]);

  const downloadAndApplyUpdate = useCallback(async () => {
    if (!updateInfo || !updateInfo.updateAvailable) {
      Alert.alert('No Update', 'No update is currently available.');
      return;
    }

    if (updateInfo.updateType === 'native_apk') {
      if (updateInfo.apkUrl) {
        Alert.alert(
          'Native APK Update Required',
          `Version ${updateInfo.updateVersion} requires an updated application package. Would you like to open the download link?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Download APK',
              onPress: () => {
                Linking.openURL(updateInfo.apkUrl!);
              },
            },
          ]
        );
      } else {
        Alert.alert('Update Notice', 'Native update required, but no APK URL is configured.');
      }
      return;
    }

    if (!updateInfo.bundleUrl || !updateInfo.bundleHash) {
      Alert.alert('Update Error', 'Remote update bundle information is incomplete.');
      return;
    }

    setStatus('downloading');
    setDownloadProgress(0.2);

    try {
      setDownloadProgress(0.5);
      await updateService.downloadAndInstallBundle(
        updateInfo.bundleUrl,
        updateInfo.bundleHash,
        updateInfo.updateVersion || '1.0.1'
      );

      setDownloadProgress(1.0);
      setStatus('ready_to_reload');

      Alert.alert(
        'Update Ready',
        `Update to version ${updateInfo.updateVersion} downloaded and verified! Would you like to restart the app now to apply it?`,
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Restart Now',
            onPress: async () => {
              await applyAndRestart();
            },
          },
        ]
      );
    } catch (err: any) {
      const message = err.message || 'Failed to download and verify update.';
      setErrorMessage(message);
      setStatus('error');
      Alert.alert('Update Error', message);
    }
  }, [updateInfo]);

  const applyAndRestart = useCallback(async () => {
    try {
      await updateService.reloadApp();
    } catch (err: any) {
      Alert.alert('Restart Error', 'Could not restart automatically. Please close and reopen the app to apply the update.');
    }
  }, []);

  const rollback = useCallback(async () => {
    try {
      await updateService.rollback();
      Alert.alert(
        'Rollback Complete',
        'Reverted to embedded factory assets. Restart the app to finish rollback.',
        [
          {
            text: 'Restart',
            onPress: async () => {
              await applyAndRestart();
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Rollback Error', err.message || 'Failed to execute rollback.');
    }
  }, [applyAndRestart]);

  return (
    <UpdateContext.Provider
      value={{
        currentVersion,
        nativeBundleInfo,
        updateInfo,
        status,
        errorMessage,
        downloadProgress,
        isMandatory: Boolean(updateInfo?.isMandatory),
        checkForUpdates,
        downloadAndApplyUpdate,
        applyAndRestart,
        rollback,
      }}
    >
      {children}
    </UpdateContext.Provider>
  );
};

export const useUpdate = (): UpdateContextType => {
  const context = useContext(UpdateContext);
  if (!context) {
    throw new Error('useUpdate must be used within an UpdateProvider');
  }
  return context;
};
