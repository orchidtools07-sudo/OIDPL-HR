const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable tree shaking and minification
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    compress: {
      drop_console: true, // Remove console logs in production
      drop_debugger: true,
      passes: 3,
    },
    mangle: {
      keep_fnames: false,
    },
    output: {
      comments: false,
    },
  },
};

module.exports = config;
