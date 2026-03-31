const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch all workspace packages
config.watchFolders = [workspaceRoot];

// Resolve modules from workspace root first, then project root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Handle workspace package aliases
config.resolver.alias = {
  "@shared": path.resolve(workspaceRoot, "packages/shared/src"),
  "@ui": path.resolve(workspaceRoot, "packages/ui/src"),
  "@": path.resolve(projectRoot, "src"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
