import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius, shadows } from '../../../theme';
import { Header, Button, Logo, Badge } from '../../../components/common';
import { useUpdate } from '../../../state/UpdateContext';
import {
  RefreshCw,
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Cpu,
  Layers,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const UpdateScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const {
    currentVersion,
    nativeBundleInfo,
    updateInfo,
    status,
    errorMessage,
    downloadProgress,
    checkForUpdates,
    downloadAndApplyUpdate,
    applyAndRestart,
    rollback,
  } = useUpdate();

  const isChecking = status === 'checking';
  const isDownloading = status === 'downloading';
  const isReadyToReload = status === 'ready_to_reload';
  const hasUpdate = Boolean(updateInfo?.updateAvailable);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="App Updates"
        subtitle="DG Remote Update Center"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Status Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.logoBadgeContainer}>
            <Logo size={56} />
            {hasUpdate ? (
              <View style={styles.updateAvailablePill}>
                <Sparkles size={13} color={colors.white} />
                <Text style={styles.updateAvailableText}>Update Ready</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.heroTitle}>DG E-Commerce</Text>
          <Text style={styles.heroSubtitle}>
            Rwamagana Store Edition • Android Native
          </Text>

          {/* Version Comparison Card */}
          <View style={styles.versionRow}>
            <View style={styles.versionCol}>
              <Text style={styles.versionLabel}>Installed Version</Text>
              <Text style={styles.versionValue}>v{currentVersion}</Text>
              <View style={styles.sourceTag}>
                <Cpu size={11} color={colors.primary} />
                <Text style={styles.sourceTagText}>
                  {nativeBundleInfo?.bundleSource === 'ota' ? 'Active OTA Bundle' : 'Factory Asset'}
                </Text>
              </View>
            </View>

            <View style={styles.versionDivider} />

            <View style={styles.versionCol}>
              <Text style={styles.versionLabel}>Latest on Server</Text>
              <Text
                style={[
                  styles.versionValue,
                  hasUpdate && { color: colors.accent },
                ]}
              >
                v{updateInfo?.updateVersion || currentVersion}
              </Text>
              <View style={styles.sourceTag}>
                {hasUpdate ? (
                  <Badge
                    label={updateInfo?.updateType === 'ota_bundle' ? 'OTA Instant' : 'APK Package'}
                    variant={updateInfo?.updateType === 'ota_bundle' ? 'info' : 'warning'}
                    size="small"
                  />
                ) : (
                  <Text style={[styles.sourceTagText, { color: colors.success }]}>Up to Date ✓</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* State Banner: Downloading, Ready to Reload, or Up to date */}
        {isDownloading ? (
          <View style={styles.statusBanner}>
            <ActivityIndicator size="small" color={colors.primary} />
            <View style={styles.bannerTextGroup}>
              <Text style={styles.bannerTitle}>Downloading verified bundle...</Text>
              <Text style={styles.bannerSubtitle}>
                Calculating SHA-256 cryptographic checksum ({Math.round(downloadProgress * 100)}%)
              </Text>
            </View>
          </View>
        ) : isReadyToReload ? (
          <View style={[styles.statusBanner, { backgroundColor: '#E8F5E9', borderColor: colors.success }]}>
            <CheckCircle2 size={24} color={colors.success} />
            <View style={styles.bannerTextGroup}>
              <Text style={[styles.bannerTitle, { color: colors.success }]}>Update Ready to Apply!</Text>
              <Text style={styles.bannerSubtitle}>
                New verified bundle staged. Restart the application to activate changes.
              </Text>
            </View>
          </View>
        ) : errorMessage ? (
          <View style={[styles.statusBanner, { backgroundColor: '#FFEBEE', borderColor: colors.danger }]}>
            <AlertCircle size={24} color={colors.danger} />
            <View style={styles.bannerTextGroup}>
              <Text style={[styles.bannerTitle, { color: colors.danger }]}>Update Notice</Text>
              <Text style={styles.bannerSubtitle}>{errorMessage}</Text>
            </View>
          </View>
        ) : !hasUpdate ? (
          <View style={styles.upToDateCard}>
            <CheckCircle2 size={32} color={colors.primary} />
            <Text style={styles.upToDateTitle}>You're on the latest version</Text>
            <Text style={styles.upToDateSubtitle}>
              Your DG E-Commerce application is completely up to date with the newest features and security patches.
            </Text>
          </View>
        ) : null}

        {/* Release Notes Card */}
        {hasUpdate && updateInfo?.releaseNotes ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FileText size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>What's New in v{updateInfo.updateVersion}</Text>
            </View>
            <Text style={styles.releaseNotesText}>{updateInfo.releaseNotes}</Text>
            {updateInfo.updateType === 'ota_bundle' ? (
              <View style={styles.otaAdvantageRow}>
                <Layers size={14} color={colors.primary} />
                <Text style={styles.otaAdvantageText}>
                  Instant Over-The-Air Update: No APK reinstallation or file permissions required.
                </Text>
              </View>
            ) : (
              <View style={[styles.otaAdvantageRow, { backgroundColor: '#FFF3E0' }]}>
                <Smartphone size={14} color={colors.accent} />
                <Text style={[styles.otaAdvantageText, { color: colors.textPrimary }]}>
                  Native Release: Requires downloading an updated APK package.
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Primary Action Buttons */}
        <View style={styles.actionGroup}>
          {isReadyToReload ? (
            <Button
              title="Restart & Apply Update"
              variant="accent"
              icon={<RotateCcw size={18} color={colors.white} />}
              onPress={applyAndRestart}
              style={styles.actionBtn}
            />
          ) : hasUpdate ? (
            <Button
              title={updateInfo?.updateType === 'ota_bundle' ? 'Download & Install OTA Update' : 'Download Updated APK'}
              variant="primary"
              icon={<DownloadCloud size={18} color={colors.white} />}
              onPress={downloadAndApplyUpdate}
              isLoading={isDownloading}
              style={styles.actionBtn}
            />
          ) : null}

          <Button
            title={isChecking ? 'Checking Server...' : 'Check for Updates'}
            variant="outline"
            icon={<RefreshCw size={17} color={colors.primary} />}
            onPress={() => checkForUpdates(false)}
            isLoading={isChecking}
            style={styles.actionBtn}
          />
        </View>

        {/* Technical Diagnostics & Rollback (For Shop Admin) */}
        {nativeBundleInfo?.bundleSource === 'ota' ? (
          <View style={styles.diagnosticsCard}>
            <Text style={styles.diagTitle}>OTA Diagnostics & Safe Rollback</Text>
            <Text style={styles.diagText}>
              Active Hash: {nativeBundleInfo.hash ? `${nativeBundleInfo.hash.slice(0, 16)}...` : 'N/A'}
            </Text>
            <TouchableOpacity style={styles.rollbackBtn} onPress={rollback}>
              <RotateCcw size={14} color={colors.danger} />
              <Text style={styles.rollbackText}>Revert to Factory Embedded Assets</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  logoBadgeContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  updateAvailablePill: {
    position: 'absolute',
    top: -4,
    right: -24,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  updateAvailableText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  heroSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  versionRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  versionCol: {
    flex: 1,
    alignItems: 'center',
  },
  versionDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  versionLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  versionValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 4,
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceTagText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  bannerTextGroup: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  upToDateCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  upToDateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  upToDateSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  releaseNotesText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  otaAdvantageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F0F9F4',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  otaAdvantageText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  actionGroup: {
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
  diagnosticsCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#FAFAFA',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  diagTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  diagText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  rollbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  rollbackText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
});
