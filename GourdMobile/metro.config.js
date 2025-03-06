// const { getDefaultConfig } = require('expo/metro-config');

// // Extend the default Metro configuration
// const config = getDefaultConfig(__dirname);

// // Add support for `.bin` file extensions
// config.resolver.assetExts.push('bin', 'json');

// module.exports = config;
const { getDefaultConfig } = require("expo/metro-config");

module.exports = (async () => {
    const config = await getDefaultConfig(__dirname);
    config.resolver.assetExts.push("tflite"); // Add support for TFLite
    return config;
})();
