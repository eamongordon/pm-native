const { withAppBuildGradle, withAndroidManifest } = require('@expo/config-plugins');

/**
 * 16 KB Memory Page Size Support Plugin for EAS Managed Builds
 * - Forces Fresco 3.2.0 (16 KB aligned)
 * - Adds doNotStrip for core Expo and Fresco modules
 * - Sets extractNativeLibs="true" in AndroidManifest
 */
const withAndroid16KBSupport = (config) => {
  // 1. Update build.gradle (Fresco version and doNotStrip)
  config = withAppBuildGradle(config, (config) => {
    const content = config.modResults.contents;

    if (!content.includes('fresco:3.2.0')) {
      config.modResults.contents += `
// [Added by withAndroid16KBSupport] Force Fresco 3.2.0 for 16 KB alignment
android {
    configurations.all {
        resolutionStrategy {
            force 'com.facebook.fresco:fresco:3.2.0'
            force 'com.facebook.fresco:animated-gif:3.2.0'
            force 'com.facebook.fresco:webpsupport:3.2.0'
            force 'com.facebook.fresco:animated-webp:3.2.0'
            force 'com.facebook.fresco:imagepipeline-okhttp3:3.2.0'
        }
    }
    packagingOptions {
        doNotStrip "**/libexpo-modules-core.so"
        doNotStrip "**/libanimation-decoder-gif.so"
        doNotStrip "**/libavif_android.so"
    }
}
      `;
    }
    return config;
  });

  // 2. Update AndroidManifest (extractNativeLibs)
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application[0];
    mainApplication.$['android:extractNativeLibs'] = 'true';
    return config;
  });

  return config;
};

module.exports = withAndroid16KBSupport;
