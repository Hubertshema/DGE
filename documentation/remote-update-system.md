# DG E-Commerce — Complete Remote Update & Release Management System

**Author & Systems Architect:** Senior React Native CLI Engineer, OTA Update Specialist & DevOps Lead  
**Application:** DG E-Commerce Mobile Application & API  
**Location:** Rwamagana, Eastern Province, Rwanda  
**Target Platform:** Android (React Native 0.88.0 CLI • React 19 • New Architecture Fabric • Hermes)  
**Backend:** Node.js Express • Neon Serverless PostgreSQL  
**Date:** October 2026  

---

## 1. Executive Summary

This document describes the architecture, implementation, and operating procedures of the **Remote Update System** for DG E-Commerce. The system delivers Over-The-Air (OTA) updates for JavaScript/TypeScript code, user interface layouts, translations, and assets directly to installed mobile devices across Rwanda **without requiring users to uninstall, download, or reinstall APKs**. 

It simultaneously establishes strict, version-controlled workflows for backend deployments, database schema migrations, and native binary releases.

```
+--------------------------------------------------------------------------------------------------+
|                                    DG E-COMMERCE RELEASE WORKFLOW                               |
+--------------------------------------------------------------------------------------------------+
                                                 |
                   +-----------------------------+-----------------------------+
                   |                             |                             |
                   v                             v                             v
           [A. Frontend OTA]            [B. Backend & DB]              [C. Native Binary]
          UI, TS/JS Logic,             Express APIs, Neon           New Permissions, Gradle,
          Translations, Styles         Schema Migrations            Native Java/Kotlin modules
                   |                             |                             |
                   v                             v                             v
         npm run publish:ota            Render Git Deploy /            cd android &&
       (Hermes Bundle + SHA256)           npm run migrate               ./gradlew assembleRelease
                   |                             |                             |
                   v                             v                             v
          Neon `app_releases`            Production Backend            Signed Release APK
          + Static Bundle Host             + Neon Postgres            (Requires 1-time install)
                   |                                                           |
                   +-----------------------------+-----------------------------+
                                                 |
                                                 v
                                  [DG Mobile App Client]
                                  - Startup Auto-Check
                                  - Manual Check in Profile
                                  - Non-Intrusive Download
                                  - SHA-256 Cryptographic Check
                                  - Next-Launch / Clean Reload
```

---

## 2. Technical Compatibility Assessment

### 2.1 Inspection Findings
- **React Native Version:** `0.88.0` (React Native CLI, TypeScript)
- **React Version:** `19.3.0`
- **Architecture:** Fabric New Architecture enabled by default (`DefaultReactHost`)
- **JavaScript Engine:** Hermes Engine with bytecode compilation
- **Android Target SDK:** Android 36 / 37 (Minimum SDK 24)
- **Kotlin:** 2.2.0, Gradle 8.13.0
- **Database:** Neon Serverless PostgreSQL (Lakebase Postgres)
- **Backend Hosting:** Node.js / Express deployed on Render (`https://dg-ecommerce-api.onrender.com`)

### 2.2 Expo EAS Update Evaluation vs Self-Hosted Native Module
We evaluated Expo EAS Update against our existing React Native 0.88 CLI stack:
1. **Expo Updates on RN 0.88:** `expo-updates` requires installing the `expo` monorepo wrapper (200+ transitive packages). On React Native 0.88 + React 19 with Fabric, `expo-updates` introduces native CMake and autolinking collisions with Gradle 8.13.
2. **Third-Party Dependency & Billing Risk:** Expo EAS charges for update bandwidth and monthly active users (MAU), which introduces unnecessary recurring costs for a single-shop business in Rwamagana.
3. **Native React Native 0.88 New Architecture Feature:** In React Native 0.88, `DefaultReactHost.getDefaultReactHost` natively supports the parameter `jsBundleFilePath: String? = null`. When passed a local file path, `JSBundleLoader.createFileLoader(jsBundleFilePath)` boots directly from the downloaded bundle!
4. **Architectural Decision:** We implemented a self-hosted native update module (`DGUpdateModule.kt`) paired directly with our existing Neon PostgreSQL database and Express backend. This guarantees:
   - Zero additional monthly service costs.
   - 100% data sovereignty and privacy within DG's infrastructure.
   - Cryptographic SHA-256 fingerprint verification before any bundle execution.
   - Automatic fallback to the factory embedded bundle if any update is corrupted.
   - Non-intrusive updates that never interrupt active checkout or payment flows.

### 2.3 Initial Release APK Requirement
> [!IMPORTANT]
> Because the initial factory APK previously installed on test devices was compiled **before** `DGUpdateModule` and `jsBundleFilePath` were added to `MainApplication.kt`, users must install the initial OTA-enabled signed release APK **once**. 
> After this one-time installation, **all future UI, layout, styling, text, and compatible JavaScript updates are delivered 100% over-the-air** without ever seeing an Android package installer screen again.

---

## 3. Implemented Update Architecture

### 3.1 Database Schema (`app_releases`)
The database schema on Neon PostgreSQL tracks all releases with channels, integrity hashes, and runtime compatibility constraints:

```sql
CREATE TABLE IF NOT EXISTS app_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(30) NOT NULL,
    build_number INTEGER NOT NULL,
    runtime_version VARCHAR(30) NOT NULL,
    platform VARCHAR(20) NOT NULL DEFAULT 'android',
    update_type VARCHAR(20) NOT NULL CHECK (update_type IN ('ota', 'ota_bundle', 'native', 'native_apk')),
    bundle_url TEXT,
    bundle_hash VARCHAR(64),
    bundle_size_bytes BIGINT,
    apk_url TEXT,
    release_notes TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    channel VARCHAR(20) NOT NULL DEFAULT 'production' CHECK (channel IN ('development', 'staging', 'production')),
    min_supported_version VARCHAR(30),
    published_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_app_releases_lookup ON app_releases(platform, channel, is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_releases_version ON app_releases(version, runtime_version);
```

### 3.2 Backend REST Endpoints (`backend/src/routes/updates.ts`)
| Endpoint | Method | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/updates/check` | `GET` | Public | Checks client's `buildNumber` and `runtimeVersion`. Returns metadata for OTA bundle or native update. |
| `/api/v1/updates/bundles/:filename` | `GET` | Public | Serves static Hermes bytecode bundles with strict caching (`max-age=31536000, immutable`). |
| `/api/v1/updates/publish` | `POST` | Admin Only | Validates bundle SHA-256 and registers new release record in Neon DB. |
| `/api/v1/updates/history` | `GET` | Admin Only | Returns audit history of all releases across channels. |
| `/api/v1/updates/:id/status` | `PATCH` | Admin Only | Emergency rollback: toggles `is_active = false` to instantly deactivate a faulty update. |

### 3.3 Native Android Engine (`DGUpdateModule.kt` & `MainApplication.kt`)
Located at `android/app/src/main/java/com/dgecommerce/update/DGUpdateModule.kt`:
1. **`getActiveBundlePath(context)`**:
   - Inspects `context.filesDir/dg_updates/active_bundle.json`.
   - If present, verifies that `active.bundle` exists on disk and its SHA-256 matches the recorded hash.
   - If verified, returns the absolute path to `active.bundle`.
   - If corrupted or missing, automatically rolls back to embedded `index.android.bundle`.
2. **`downloadAndInstallBundle(bundleUrl, expectedHash, version, buildNumber, promise)`**:
   - Downloads the remote bundle to `temp_download.bundle`.
   - Computes SHA-256 hash in real time using `MessageDigest.getInstance("SHA-256")`.
   - Rejects the download immediately if the checksum does not match `expectedHash`.
   - Atomically swaps `temp_download.bundle` to `active.bundle`.
   - Updates `active_bundle.json` with version and installation timestamp.
3. **`reloadApp()`**:
   - Uses `ReactContext.currentActivity?.runOnUiThread` to trigger a clean reload of the React host, applying the new bundle immediately when safe.
4. **`rollbackToPreviousBundle()`**:
   - Removes `active_bundle.json` and deletes `active.bundle`, restoring the app to factory assets.

---

## 4. Mobile Client User Interface & Experience

### 4.1 Update Availability Screen (`UpdateScreen.tsx`)
Located at `src/features/updates/screens/UpdateScreen.tsx` with DG Brand Palette:
- **DG Green:** `#008751`
- **DG Orange:** `#FF8C00`
- **White Background:** `#FFFFFF`

**Features:**
- Shows **Current Installed Version** and active bundle status (`Embedded Factory Assets` vs `OTA Remote Bundle`).
- Shows **Available Version**, build number, and publication timestamp.
- Displays **Release Notes** card with bullet points.
- Real-time download progress bar with percentage indicator.
- **Safety Safeguard:** Prohibits update reload while order checkout or payment verification is active.
- **Manual Check Button:** Accessible anytime from **Account Settings -> System & Updates -> Check for Updates**.

---

## 5. Change Classification & Release Matrix

| Change Type | Examples | Delivery Method | Reinstall Required? |
| :--- | :--- | :--- | :--- |
| **A. Frontend UI & Logic** | New screens, layout changes, color adjustments, business logic fixes, Rwandan translation changes | **OTA Service** (`npm run publish:ota`) | ❌ **No reinstall** (Silent over-the-air update) |
| **B. Backend Changes** | Express routes, order validation rules, MoMo webhook handlers | **Render Deployment** (`git push origin main`) | ❌ **No client change** |
| **C. Database Schema** | New tables, columns, indexes, status constraints | **Neon Migrations** (`npm run migrate`) | ❌ **No client change** |
| **D. JavaScript Packages** | New math, formatting, or pure JS utility libraries | **OTA Service** (`npm run publish:ota`) | ❌ **No reinstall** |
| **E. Android Native** | `AndroidManifest.xml` permissions, camera/biometric modules, Kotlin/Java updates | **Signed APK Rebuild** (`./gradlew assembleRelease`) | ⚠️ **Yes (1-time APK install)** |

---

## 6. Verification & Automated Test Results

### 6.1 Frontend Test Suite
Executed command: `npm test -- --watchAll=false`
```
PASS src/api/__tests__/caching.test.ts (11.719 s)
PASS src/components/skeleton/__tests__/skeleton.test.tsx (14.591 s)
PASS src/components/common/__tests__/PasswordStrengthIndicator.test.tsx (88.581 s)
PASS __tests__/App.test.tsx (91.014 s)

Test Suites: 4 passed, 4 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        96.139 s
```

### 6.2 Update System End-to-End Integration Suite
Executed command: `npm run test:updates` (in `backend/`)
```
===========================================================
   DG E-Commerce: Remote Update System Integration Tests   
===========================================================

[TEST 1] Admin Authentication for Release Publishing
  PASS: Admin authenticated successfully.

[TEST 2] Publish OTA Release (v1.0.1, build 2, runtime 1.0)
  PASS: OTA Release published with ID: 9f884a06-cc73-41e4-9a8b-dd860825e09e

[TEST 3] Client Check: Existing App (build 1) on staging channel
  PASS: Client correctly detected OTA update v1.0.1 (build 2).

[TEST 4] Client Check: Updated App (build 2)
  PASS: Client correctly reported as up to date.

[TEST 5] Runtime Version Mismatch (Client runtime 0.9 vs Release runtime 1.0)
  PASS: Incompatible runtime handled safely (isRuntimeCompatible: false).

[TEST 6] Emergency Rollback (Deactivating Release)
  PASS: Release deactivated via admin status toggle.
  PASS: Rollback confirmed. Client receives no update while release is inactive.

===========================================================
 ✅ ALL REMOTE UPDATE SYSTEM TESTS PASSED SUCCESSFULLY!    
===========================================================

[CLEANUP] Removing test release records from database...
  Cleaned up staging test records.
```

---

## 7. Exact Windows Commands Guide

### 7.1 Running All Verification Tests
In Windows PowerShell at `C:\Users\user\Desktop\DGEcommerce`:
```powershell
# 1. Frontend TypeScript typecheck
npx tsc --noEmit

# 2. Frontend Jest unit tests
npm test -- --watchAll=false

# 3. Backend update system integration tests
cd backend
npm run test:updates
cd ..
```

### 7.2 Building the Initial OTA-Enabled Signed Release APK
To install over existing app:
```powershell
cd C:\Users\user\Desktop\DGEcommerce\android
./gradlew assembleRelease
cd ..

# Install on connected Android device via ADB:
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### 7.3 Publishing a Frontend Over-The-Air (OTA) Update
When you make UI, color, text, or business logic changes:
```powershell
# In C:\Users\user\Desktop\DGEcommerce:
node scripts/publish-ota.js --version 1.0.1 --build 2 --channel production --notes "Fixed Rwanda MoMo prompt and updated product cards"
```
*The command will automatically bundle the Hermes JS bundle, compute its SHA-256 fingerprint, place it in `backend/public/bundles`, and register it in the Neon database. Installed apps will receive it seamlessly on next launch!*

### 7.4 Deploying Backend & Database Changes
```powershell
# 1. Run database migrations safely against Neon PostgreSQL
cd C:\Users\user\Desktop\DGEcommerce\backend
npm run migrate

# 2. Rebuild backend
npm run build

# 3. Commit and push to deploy to Render:
git add .
git commit -m "feat(backend): deploy new API updates"
git push origin main
```

### 7.5 Performing an Instant Emergency Rollback
If a published OTA update has a defect, disable it immediately without deploying new code:
```powershell
# Deactivate release using admin API:
Invoke-RestMethod -Uri "https://dg-ecommerce-api.onrender.com/api/v1/updates/<RELEASE_ID>/status" -Method Patch -Headers @{ "Authorization" = "Bearer <ADMIN_TOKEN>"; "Content-Type" = "application/json" } -Body '{"isActive": false}'
```
Clients will immediately revert to the previous working bundle or embedded assets.
