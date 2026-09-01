module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for Reanimated / Drawer animations
      'react-native-reanimated/plugin',
    ],
  };
};