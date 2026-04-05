const { withAppBuildGradle, withAndroidManifest } = require('@expo/config-plugins');

/**
 * 16 KB Memory Page Size Support Plugin for EAS Managed Builds
 */
const withAndroid16KBSupport = (config) => {
  // 1. Force 16 KB compliance for all native modules
  config = withAppBuildGradle(config, (configWithProps) => {
    const contents = configWithProps.modResults.contents;
    if (!contents) {
      return configWithProps;
    }

    if (!contents.includes('16KB_ALIGNMENT_FIX_SIGNATURE')) {
      configWithProps.modResults.contents += `
// [16KB_ALIGNMENT_FIX_SIGNATURE] Ensure 16 KB compliance for core and third-party natives
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
            force 'com.facebook.soloader:soloader:0.11.0'
        }
    }
    packaging {
        jniLibs {
            useLegacyPackaging = false
            doNotStrip "**/*.so"
        }
    }
}
`;
    }
    return configWithProps;
  });

  // 2. Update AndroidManifest (extractNativeLibs)
  config = withAndroidManifest(config, (configWithProps) => {
    const mainApplication = configWithProps.modResults.manifest.application[0];
    if (mainApplication && mainApplication.$) {
      mainApplication.$['android:extractNativeLibs'] = 'true';
    }
    return configWithProps;
  });

  return config;
};

module.exports = withAndroid16KBSupport;
