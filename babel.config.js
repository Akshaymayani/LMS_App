module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for Expo Router
      'expo-router/babel',
      // Required for Reanimated (This MUST be listed last)
      'react-native-reanimated/plugin',
    ],
  };
};
