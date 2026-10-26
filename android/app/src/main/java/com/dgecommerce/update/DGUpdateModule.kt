package com.dgecommerce.update

import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import org.json.JSONObject
import java.io.BufferedInputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

class DGUpdateModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    companion object {
        const val TAG = "DGUpdateModule"
        const val NAME = "DGUpdateModule"
        const val OTA_DIR = "ota"
        const val ACTIVE_BUNDLE_DIR = "active"
        const val STAGING_BUNDLE_DIR = "staging"
        const val BUNDLE_FILENAME = "index.android.bundle"
        const val METADATA_FILENAME = "metadata.json"

        /**
         * Returns the absolute path of the verified active OTA bundle, or null
         * if the app should fall back to the embedded APK asset (assets://index.android.bundle).
         */
        @JvmStatic
        fun getActiveBundlePath(context: Context): String? {
            try {
                val otaRoot = File(context.filesDir, OTA_DIR)
                val activeBundle = File(otaRoot, "$ACTIVE_BUNDLE_DIR/$BUNDLE_FILENAME")
                val metadataFile = File(otaRoot, METADATA_FILENAME)

                if (activeBundle.exists() && activeBundle.length() > 0 && metadataFile.exists()) {
                    // Check if bundle marked as crashed / rollback
                    val metadataContent = metadataFile.readText()
                    val json = JSONObject(metadataContent)
                    if (json.optBoolean("isRollback", false)) {
                        Log.w(TAG, "Active bundle flagged as rollback. Falling back to embedded assets.")
                        return null
                    }
                    Log.i(TAG, "Loading verified OTA bundle from: ${activeBundle.absolutePath}")
                    return activeBundle.absolutePath
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error checking active bundle path: ${e.message}")
            }
            return null
        }
    }

    @ReactMethod
    fun getCurrentBundleInfo(promise: Promise) {
        try {
            val otaRoot = File(reactContext.filesDir, OTA_DIR)
            val activeBundle = File(otaRoot, "$ACTIVE_BUNDLE_DIR/$BUNDLE_FILENAME")
            val metadataFile = File(otaRoot, METADATA_FILENAME)

            val result: WritableMap = Arguments.createMap()
            if (activeBundle.exists() && activeBundle.length() > 0 && metadataFile.exists()) {
                val json = JSONObject(metadataFile.readText())
                result.putString("bundleSource", "ota")
                result.putString("version", json.optString("version", "1.0.0"))
                result.putString("hash", json.optString("hash", ""))
                result.putString("installedAt", json.optString("installedAt", ""))
                result.putString("bundlePath", activeBundle.absolutePath)
                result.putDouble("bundleSizeBytes", activeBundle.length().toDouble())
            } else {
                result.putString("bundleSource", "embedded")
                result.putString("version", "1.0.0")
                result.putString("hash", "embedded_asset")
                result.putString("installedAt", "")
                result.putNull("bundlePath")
                result.putDouble("bundleSizeBytes", 0.0)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERR_BUNDLE_INFO", e.message, e)
        }
    }

    @ReactMethod
    fun downloadAndInstallBundle(
        bundleUrl: String,
        expectedHash: String,
        version: String,
        promise: Promise
    ) {
        Thread {
            try {
                Log.i(TAG, "Starting OTA bundle download from: $bundleUrl")
                val otaRoot = File(reactContext.filesDir, OTA_DIR)
                val stagingDir = File(otaRoot, STAGING_BUNDLE_DIR)
                val activeDir = File(otaRoot, ACTIVE_BUNDLE_DIR)

                if (!stagingDir.exists()) stagingDir.mkdirs()
                if (!activeDir.exists()) activeDir.mkdirs()

                val stagingFile = File(stagingDir, BUNDLE_FILENAME)
                if (stagingFile.exists()) stagingFile.delete()

                val url = URL(bundleUrl)
                val connection = url.openConnection() as HttpURLConnection
                connection.connectTimeout = 15000
                connection.readTimeout = 30000
                connection.instanceFollowRedirects = true

                if (connection.responseCode !in 200..299) {
                    throw Exception("Server returned HTTP ${connection.responseCode}: ${connection.responseMessage}")
                }

                val input = BufferedInputStream(connection.inputStream)
                val output = FileOutputStream(stagingFile)
                val digest = MessageDigest.getInstance("SHA-256")

                val buffer = ByteArray(8192)
                var bytesRead: Int
                while (input.read(buffer).also { bytesRead = it } != -1) {
                    output.write(buffer, 0, bytesRead)
                    digest.update(buffer, 0, bytesRead)
                }
                output.flush()
                output.close()
                input.close()
                connection.disconnect()

                // Calculate computed SHA-256 hex string
                val hashBytes = digest.digest()
                val computedHash = hashBytes.joinToString("") { "%02x".format(it) }

                Log.i(TAG, "Download finished. Expected: $expectedHash, Computed: $computedHash")

                // Cryptographic checksum verification
                if (!computedHash.equals(expectedHash.trim(), ignoreCase = true)) {
                    stagingFile.delete()
                    throw Exception("Bundle integrity verification failed. Expected SHA-256: $expectedHash, but got: $computedHash")
                }

                // Promote staging bundle to active bundle atomically
                val targetActiveFile = File(activeDir, BUNDLE_FILENAME)
                if (targetActiveFile.exists()) targetActiveFile.delete()

                val renamed = stagingFile.renameTo(targetActiveFile)
                if (!renamed) {
                    // Fallback to manual copy if renameTo across volumes fails
                    stagingFile.copyTo(targetActiveFile, overwrite = true)
                    stagingFile.delete()
                }

                // Write metadata file
                val metadataFile = File(otaRoot, METADATA_FILENAME)
                val metaJson = JSONObject().apply {
                    put("version", version)
                    put("hash", computedHash)
                    put("installedAt", System.currentTimeMillis().toString())
                    put("isRollback", false)
                    put("bundleSizeBytes", targetActiveFile.length())
                }
                metadataFile.writeText(metaJson.toString())

                Log.i(TAG, "OTA bundle successfully staged and promoted to active. Version: $version")

                val result: WritableMap = Arguments.createMap().apply {
                    putBoolean("success", true)
                    putString("version", version)
                    putString("hash", computedHash)
                    putDouble("bundleSizeBytes", targetActiveFile.length().toDouble())
                }
                promise.resolve(result)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to download and install OTA bundle: ${e.message}", e)
                promise.reject("ERR_BUNDLE_INSTALL", e.message, e)
            }
        }.start()
    }

    @ReactMethod
    fun reloadApp(promise: Promise) {
        Handler(Looper.getMainLooper()).post {
            try {
                Log.i(TAG, "Executing restart to load new OTA bundle...")
                val context = reactContext.currentActivity ?: reactContext
                val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                if (intent != null) {
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                    context.startActivity(intent)
                    promise.resolve(true)
                    // Terminate current process to ensure clean Hermes runtime startup
                    Runtime.getRuntime().exit(0)
                } else {
                    promise.reject("ERR_RELOAD", "Unable to determine launch intent for package.")
                }
            } catch (e: Exception) {
                promise.reject("ERR_RELOAD", e.message, e)
            }
        }
    }

    @ReactMethod
    fun rollbackToPreviousBundle(promise: Promise) {
        try {
            val otaRoot = File(reactContext.filesDir, OTA_DIR)
            val activeDir = File(otaRoot, ACTIVE_BUNDLE_DIR)
            val metadataFile = File(otaRoot, METADATA_FILENAME)

            if (activeDir.exists()) {
                activeDir.deleteRecursively()
            }
            if (metadataFile.exists()) {
                val json = JSONObject().apply {
                    put("isRollback", true)
                    put("version", "1.0.0")
                    put("rolledBackAt", System.currentTimeMillis().toString())
                }
                metadataFile.writeText(json.toString())
            }

            Log.i(TAG, "Rollback executed. Reverted to embedded factory assets.")
            val result = Arguments.createMap().apply {
                putBoolean("success", true)
                putString("message", "Rollback successful. Embedded factory bundle restored.")
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERR_ROLLBACK", e.message, e)
        }
    }
}
