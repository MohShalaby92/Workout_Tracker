# Train Track Mobile — Claude Code Instructions

## Expo Router Patterns
- Routes live in `app/` — thin screens only, no business logic
- Three route groups: `(auth)/`, `(coach)/`, `(client)/`
- Layouts (`_layout.tsx`) handle navigation chrome (Stack, Drawer, Tabs)
- Use `router.push()` / `router.replace()` / `<Link>` from `expo-router`
- Never import from `@react-navigation/*` in route files (only in layout internals like DrawerContent)
- Typed routes enabled — use `href` types from `expo-router`

## NativeWind Usage
- Every RN primitive supports `className` — use it for ALL styling
- Dark mode is default — use `dark:` prefix for light mode overrides
- Brand tokens in tailwind.config.js: `navy`, `teal`, `ember`, `gold`, `success`, `red`
- Never use `StyleSheet.create()` or inline `style={{}}`

## File Organization
- `src/components/` — reusable RN components (not screens)
- `src/store/` — Zustand stores (auth, workout, etc.)
- `src/services/` — Supabase API calls, never inline queries in screens
- `src/hooks/` — custom React hooks
- Import alias: `@/` → `src/` (e.g., `import { useAuthStore } from "@/store/auth"`)

## Component Rules
- Use `Pressable` instead of `TouchableOpacity`
- Use `@expo/vector-icons` (Ionicons) for all icons
- Use `react-native-reanimated` for animations
- Prefer `@ui/*` shared components (Button, Card, Input, Badge) before creating new ones
- Use `FlatList` / `SectionList` for lists, never `.map()` inside `ScrollView` for large datasets
