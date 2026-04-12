module.exports = function(api) {
  api.cache(true);
  
  // Check if we're in production
  const isProduction = process.env.EXPO_PUBLIC_ENVIRONMENT === 'production';
  
  const plugins = [
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-nullish-coalescing-operator",
    [
      "module:react-native-dotenv",
      {
        moduleName: "@env",
        path: ".env",
        safe: false,
        allowUndefined: true,
        verbose: true
      }
    ],
    // Add this for absolute imports
    [
      "module-resolver",
      {
        root: ["./"],
        alias: {
          "@": "./src",
          "@assets": "./assets",
          "@components": "./src/components",
          "@screens": "./src/screens",
          "@navigation": "./src/navigation",
          "@utils": "./src/utils",
          "@hooks": "./src/hooks",
          "@services": "./src/services",
          "@store": "./src/store",
          "@types": "./src/types"
        }
      }
    ],
    "react-native-reanimated/plugin"
  ];
  
  // Strip console logs in production
  if (isProduction) {
    plugins.push([
      "transform-remove-console",
      {
        exclude: ["error", "warn"] // Keep errors and warnings, remove logs
      }
    ]);
  }
  
  return {
    presets: ["babel-preset-expo"],
    plugins
  };
};