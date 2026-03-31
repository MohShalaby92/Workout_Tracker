// Expo Router uses file-based routing, but these types help with typed navigation

export type AuthRoutes = {
  "/": undefined;
  "/(auth)/login": undefined;
  "/(auth)/signup": undefined;
};

export type CoachRoutes = {
  "/(coach)/dashboard": undefined;
  "/(coach)/programs": undefined;
  "/(coach)/clients": undefined;
  "/(coach)/library": undefined;
  "/(coach)/pr-tracker": undefined;
  "/(coach)/injuries": undefined;
  "/(coach)/profile": undefined;
};

export type ClientRoutes = {
  "/(client)/train": undefined;
  "/(client)/track": undefined;
  "/(client)/profile": undefined;
};

export type AppRoutes = AuthRoutes & CoachRoutes & ClientRoutes;
