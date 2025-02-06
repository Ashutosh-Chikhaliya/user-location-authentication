module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "module:react-native-dotenv",
      {
        moduleName: "@env", // Make sure this is the module you are using
        path: ".env", // Path to your .env file
        safe: false, // Change to true to enable safe environment variables
        allowUndefined: true, // Allow undefined variables
      },
    ],
  ],
};
