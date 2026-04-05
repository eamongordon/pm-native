const { withAppBuildGradle, withAndroidManifest } = require('@expo/config-plugins');

/**
 * 16 KB Memory Page Size Support Plugin for EAS Managed Builds
 */
const withAndroid16KBSupport = (config) => {
  // 1. Force Fresco 3.2.0 and protect alignment
  config = withAppBuildGradle(config, (configWithProps) => {
    let contents = configWithProps.modResults.contents;
    if (!contents) return configWithProps;

    if (!contents.includes('16KB_ALIGNMENT_FIX_SIGNATURE')) {
      contents += `
// [16KB_ALIGNMENT_FIX_SIGNATURE] Ensure 16 KB compliance
android {
    configurations.all {
        resolutionStrategy {
            force 'com.facebook.fresco:fresco:3.2.0'
            force 'com.facebook.fresco:animated-gif:3.2.0'
            force 'com.facebook.fresco:webpsupport:3.2.0'
            force 'com.facebook.fresco:animated-webp:3.2.0'
            force 'com.facebook.fresco:imagepipeline-okhttp3:3.2.0'
            force 'com.facebook.fresco:fbcore:3.2.0'
            force 'com.facebook.fresco:imagepipeline:3.2.0'
            force 'com.facebook.fresco:imagepipeline-base:3.2.0'
            force 'com.facebook.fresco:drawee:3.2.0'
            force 'com.facebook.fresco:imagepipeline-native:3.2.0'
            // REMOVED: soloader force (caused compilation error in RN 0.79)
        }
    }
    packaging {
        jniLibs {
            useLegacyPackaging = false
            // Protect every library from being stripped of its 16KB padding
            doNotStrip "**/*.so"
        }
    }
}
`;
      configWithProps.modResults.contents = contents;
    }
    return configWithProps;
  });

  // 2. Set extractNativeLibs to false (Modern 16KB standard)
  config = withAndroidManifest(config, (configWithProps) => {
    const mainApplication = configWithProps.modResults.manifest.application[0];
    if (mainApplication && mainApplication.$) {
      // For 16 KB alignment in modern AGP, this must be "false" to avoid extraction
      mainApplication.$['android:extractNativeLibs'] = 'false';
    }
    return configWithProps;
  });

  return config;
};

module.exports = withAndroid16KBSupport;
