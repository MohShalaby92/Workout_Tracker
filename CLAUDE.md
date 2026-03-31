# Train Track — Claude Code Instructions

## WHAT
Cross-platform fitness coaching app. Turborepo monorepo with pnpm.

**Stack:** Expo SDK 55 · React 19 · React Native 0.83 · Expo Router (file-based) · NativeWind v4 · Zustand v5 · Supabase (Postgres + Auth + RLS + Realtime) · TypeScript strict mode

**Structure:**
```
apps/mobile/
├── app/              ← Expo Router routes only (no logic here)
│   ├── (auth)/       ← login, signup
│   ├── (coach)/      ← drawer nav: dashboard, programs, clients, library, pr-tracker, injuries, profile
│   └── (client)/     ← tab nav: train, track, profile
└── src/
    ├── components/   ← shared RN components
    ├── hooks/        ← custom hooks
    ├── store/        ← Zustand stores
    └── services/     ← Supabase API calls
packages/
├── shared/src/       ← TypeScript types, Zod schemas, constants (@shared/*)
└── ui/src/           ← RN component library with NativeWind (@ui/*)
supabase/
├── migrations/       ← SQL schema files
├── functions/        ← Edge functions
└── seed.sql
```

## WHY
Dual-interface coaching app: coach desktop/web (sidebar nav) + client mobile (bottom tabs).
Coaches create programs → assign to clients → clients log workouts → PRs auto-detected.
CrossFit-native workout formats: AMRAP, EMOM, For Time, Tabata, Straight Sets, Supersets.
Template vs Log pattern: templates = coach prescriptions, logs = client actual performance.

## HOW

### Commands
- `pnpm dev` — start all packages
- `cd apps/mobile && pnpm dev` — start Expo only
- `pnpm typecheck` — typecheck all packages via turbo
- `pnpm build` — build all packages

### Critical rules — NEVER break these
1. **NO HTML tags** — `div`, `span`, `p`, `button`, `input` are forbidden. Use `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`, `FlatList`
2. **NativeWind `className` only** — never `StyleSheet.create`, never inline `style={{}}`
3. **Expo Router** for navigation — never `@react-navigation/*` directly in route files
4. **`@expo/vector-icons`** for icons — never `lucide-react`, never raw SVG
5. **`react-native-reanimated`** for animations — never `framer-motion`, never `react-native`'s `Animated`
6. **Types from `@shared/*`** — never redefine DB types locally
7. **UI components from `@ui/*`** — use shared Button/Card/Input/Badge before creating new ones
8. **`@/`** aliases to `apps/mobile/src/` — use `@/store/auth`, `@/components/Foo`, `@/hooks/useBar`
9. **`Pressable`** over `TouchableOpacity` — always prefer Pressable for touch targets

### Patterns
- All route screens are thin: fetch data via Zustand stores, render with RN primitives + NativeWind
- Supabase queries live in `src/services/`, never inline in screens
- Validation with Zod schemas from `@shared/schemas/`
- Dark mode is the default; use `dark:` prefix for light overrides
- Store weights in kg internally; display in user-preferred unit
