module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo", "nativewind/babel"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@shared": "../../packages/shared/src",
            "@ui": "../../packages/ui/src",
            "@": "./src",
          },
        },
      ],
    ],
  };
};
