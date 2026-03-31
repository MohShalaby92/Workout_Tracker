# Train Track: complete blueprint for building a cross-platform fitness coaching app

**React Native + Expo with Supabase is the optimal stack for Train Track, offering unified iOS/Android/web deployment from one TypeScript codebase with the best AI-coding-tool compatibility available in 2026.** This combination lets a small team (or solo developer with AI assistance) ship all three platforms simultaneously at a startup-phase infrastructure cost of roughly **$50–175/month**. The functional fitness coaching market has a clear gap: no competitor excels at both coach-side and client-side UX while natively supporting CrossFit workout formats like AMRAP, EMOM, and For Time. Train Track can own this intersection.

This document covers every decision needed to go from prototype to production — technology, AI workflow, branding, features, marketing, infrastructure, and legal compliance — with specific tools, pricing, and implementation guidance.

---

## 1. Technology stack: why Expo + Supabase wins on every axis

### The framework decision is clear

**React Native + Expo (SDK 53+) with Expo Router** is the strongest choice for Train Track's three-platform requirement. The reasoning is decisive across every evaluation criterion:

**AI-coding-tool compatibility is the tiebreaker.** TypeScript/JavaScript has by far the largest training corpus for Claude Code and Cursor. React component patterns are deeply understood by AI models, directly accelerating development velocity. Flutter's Dart language works with AI tools but has measurably less training data — a critical disadvantage when AI-assisted development is the core workflow. Expo Router provides file-based routing across iOS, Android, and web from identical code, meaning AI tools reason about one navigation paradigm, not three.

**Web support is production-ready for dashboards.** React Native Web powers Twitter/X's PWA and numerous B2B dashboards. For Train Track's coach-side desktop interface (not SEO-dependent), this is well within proven use cases. Expo's DOM Components (`"use dom"` directive) allow embedding standard React DOM components within native views — a powerful escape hatch for complex web-only features like rich data tables or drag-and-drop workout builders. Platform-specific files (`.web.tsx`, `.native.tsx`) handle divergent UX gracefully.

**The ecosystem advantage is massive.** React Native has **207,000+ GitHub stars**, **4 million weekly npm downloads**, and the largest package ecosystem of any cross-platform framework. Expo is now **officially recommended by Meta** as the framework for new React Native projects. By contrast, Flutter Web carries a **1.5–2 MB baseline bundle** (vs. under 200KB for React apps), lacks semantic HTML output (hurting accessibility), and has a smaller dedicated web community.

**Flutter was the only serious alternative** considered, with excellent mobile performance and ~175K GitHub stars. However, its web bundle size, canvas-based rendering (accessibility gaps), and weaker AI-tool support for Dart make it the wrong choice for this specific project. Kotlin Multiplatform's web support remains experimental. Tauri v2 and .NET MAUI lack mature mobile support.

### Supabase outperforms Firebase for relational coaching data

A coaching app has inherently relational data: coaches have clients, clients have programs, programs have workouts, workouts have exercises, exercises have sets with weights and reps. **PostgreSQL handles this naturally with JOINs and foreign keys.** Firebase's NoSQL model would require denormalization and client-side joins — adding complexity that scales poorly.

**Row Level Security (RLS) is the killer feature** for multi-tenant coaching. SQL-based policies enforce "Coach X sees only their clients' data" and "Client Y sees only workouts assigned to them" at the database level. No API-level authorization code needed. This is dramatically more powerful than Firebase Security Rules for complex relationships.

**Pricing is predictable.** Supabase charges **$25/month** for the Pro plan with no per-read/write fees. Firebase's operation-based billing is dangerous for real-time workout tracking — a Firestore listener counts as a read for every document change. Companies report **400% cost increases** when user bases double on Firebase. Supabase's Pro plan covers most early production needs at $35–75/month total.

| Layer | Technology | Monthly Cost |
|-------|-----------|-------------|
| Framework | React Native + Expo SDK 53+ with Expo Router | — |
| Backend | Supabase Pro | $25–75 |
| Auth | Supabase Auth (100K MAU included) | Included |
| Real-time | Supabase Realtime (WebSocket subscriptions) | Included |
| Storage | Supabase Storage (100GB on Pro) | Included |
| Push | Expo Push + Supabase Edge Functions | Free |
| Styling | NativeWind v4 (Tailwind for RN) | — |
| State | Zustand | — |
| Builds | EAS Build + EAS Submit | $0–99 |

### Database schema essentials

The critical design pattern is the **template vs. log distinction**. Templates represent what the coach prescribes; logs represent what the client actually performed. This separation enables coaches to reuse programming while clients accumulate independent training history.

Key entities: `users` (role-based: coach/client), `coach_client_relationships` (many-to-many with status), `programs` (multi-week training blocks), `workout_templates` (coach-designed blueprints), `workout_logs` (client completions), `exercises` (library with video references), `template_exercises` (prescribed sets with target reps/weight/%1RM/RPE), `logged_sets` (actual weight × reps with timestamps), `personal_records` (auto-detected PRs with estimated 1RM), `messages` (real-time via Supabase subscriptions), and `progress_photos`.

**PR auto-detection** should use a Postgres trigger on `logged_sets` INSERT that checks whether the new set exceeds the existing record for that exercise/client combination. Store weights in a single unit (kg) internally; convert on display per user preference. Index heavily on `(client_id, exercise_id)` for logged_sets and `(coach_id)` on programs.

---

## 2. AI-assisted development: the Claude Code + Cursor workflow

### Setting up CLAUDE.md for maximum AI effectiveness

The CLAUDE.md file is the single most impactful lever for AI code quality. Keep it under **50 lines of actionable content** — frontier models follow ~150 instructions reliably, and Claude Code's system prompt already uses ~50. Structure around three sections: **WHAT** (stack, structure), **WHY** (purpose), **HOW** (commands, conventions).

The most critical rules for a React Native project prevent AI from hallucinating web patterns:

- **NEVER use HTML tags** (`div`, `span`, `p`) — only React Native primitives (`View`, `Text`, `TouchableOpacity`)
- Use NativeWind `className` for styling, not `StyleSheet.create`
- Use Expo Router for navigation, not React Navigation directly
- Use `@expo/vector-icons`, not `lucide-react`
- Use `react-native-reanimated` for animations, not `framer-motion`

Place hierarchical CLAUDE.md files: root-level for the monorepo, plus nested ones in `apps/mobile/CLAUDE.md` with directory-specific instructions. Put domain knowledge (Supabase migration patterns, workout schemas) in `.claude/skills/` files that load on demand.

### When to use which tool

The emerging consensus from practitioners is clear: **Cursor for in-the-flow programming, Claude Code for big-picture tasks.**

| Task | Best Tool | Why |
|------|-----------|-----|
| Quick inline edits, tab completion | Cursor | Instant feedback, stays in flow |
| Multi-file refactors, migrations | Claude Code | Systematic planning, runs tests at each stage |
| UI iteration with visual feedback | Cursor | Built-in browser, inline diffs |
| Architecture planning, writing specs | Claude Code | Deep reasoning, plan mode, subagents |
| Background autonomous tasks | Claude Code | CLI-first, runs as background workers |
| Code review | Claude Code | `/code-review` launches 4 parallel review agents |

**The two-session workflow** eliminates AI shortcuts: Session A writes a spec or tests → Session B implements from clean context. For complex features, use Claude Code's plan mode (`Shift+Tab` twice) with `opusplan` for Opus-level reasoning during planning, Sonnet for implementation.

**Cost management matters.** Average spend is ~$6/developer/day. Use `/clear` between tasks, `/compact` at 70% context capacity, and Sonnet as default (switching to Opus only for architecture). The Max 5x plan ($100/month) provides predictable costs for heavy users. Combined Claude Code + Cursor budget: **~$120–220/month** for a solo developer.

### Monorepo structure optimized for AI tools

**Monorepo is superior for AI-assisted development.** As one practitioner noted: "A monorepo is perfect for working with an LLM, because it can read the schema, the API definitions, the per-screen requests, and figure out what you're trying to do."

Use **Turborepo with pnpm** (Expo SDK 53+ has first-class monorepo support):

```
train-track/
├── CLAUDE.md
├── .cursor/rules/react-native.mdc
├── turbo.json
├── apps/
│   └── mobile/          # Expo app (iOS + Android + Web)
│       ├── app/         # Expo Router pages
│       └── src/         # components, hooks, services
├── packages/
│   ├── shared/          # types, constants, utils
│   └── ui/              # shared UI components
└── supabase/
    ├── migrations/
    ├── functions/       # Edge functions
    └── seed.sql
```

### CI/CD pipeline

Use **EAS Workflows + GitHub Actions hybrid**. GitHub Actions handles fast checks (lint, typecheck, unit tests) on every PR. EAS Workflows handles mobile-specific tasks: native builds with managed signing, Maestro E2E tests, OTA updates, and automatic store submission.

For E2E testing, **Maestro is strongly recommended over Detox**: YAML-based flows, <1% flake rate, 12–18 second execution, first-class Expo support, and MaestroGPT for AI-assisted test writing. Meta adopted Maestro for React Native framework testing.

**ESLint as AI guardrails** prevents AI from generating problematic code: `max-lines-per-function: 50` prevents monster functions, `complexity: 10` limits cyclomatic complexity, `no-magic-numbers` forces named constants. Use Claude Code hooks to auto-format after every edit and block edits to ESLint config files (preventing AI from disabling its own guardrails).

---

## 3. Competitive landscape and brand positioning

### What the market looks like in 2026

Eight major competitors were analyzed. The landscape reveals clear gaps Train Track can exploit:

**TrueCoach** ($27–137/month, per-client tiers) is the market leader for 1-on-1 coaching with the most intuitive workout builder and professional client app. Its weaknesses: coach mobile app is communication-only (programming requires desktop), no leaderboards or community features, Android app is significantly inferior to iOS, and stock exercise videos have been criticized for poor form.

**TrainHeroic** ($10/month + $1/athlete) differentiates through its marketplace model where coaches sell programs. Strong athletic brand identity. Critical gaps: **no "rounds + reps" logging for metcon-style CrossFit workouts**, significant input lag on mobile, no AMRAP/EMOM format support.

**SugarWOD** ($29–219/month, per-athlete) has the best community engagement with leaderboards, fist bumps, and social features — but lacks 1-on-1 coaching tools. Navigation is clunky, and recent updates broke core features (users report removed 1RM estimation charts).

**Fitbod** (~$13/month) leads in AI-powered workout generation with **4.8 stars from 190K+ iOS ratings**, but replaces coaches rather than empowering them. **TeamBuildr** ($900–2,800/year) excels in institutional S&C with wellness monitoring and TV timing displays. **Volt Athletics** offers AI-powered real-time load adjustment but is expensive and prescriptive.

### The gap Train Track fills

**No competitor excels at BOTH coach-side AND client-side UX while natively supporting CrossFit workout formats.** TrueCoach does coaching well but lacks community. SugarWOD does community but lacks coaching tools. Neither properly supports AMRAP/EMOM/For Time with built-in timers and proper scoring. This intersection is Train Track's positioning.

### Brand identity recommendations

**Name assessment:** "Train Track" communicates core value (coaching + progress monitoring) and appears available as a fitness app name. Risks: "Track" has strong running/athletics associations, the "Train" prefix is crowded (TrainHeroic, Trainerize), and railroad semantic overlap may hurt SEO. The name works but consider whether a more distinctive, ownable name (like how "Wodify" is instantly recognizable as CrossFit-specific) might serve better long-term.

**Color system for the app:**

| Role | Color | Hex | Rationale |
|------|-------|-----|-----------|
| Primary dark | Deep navy | #1A2332 | Trust, professionalism |
| Surface dark | Near-black | #0D1117 | Dark mode base |
| Primary accent | Electric teal | #00E5CC | Energy + wellness hybrid |
| Secondary accent | Vibrant orange | #FF6B35 | CTAs, energy states |
| PR/Achievement | Gold | #FFD700 | Celebrations |
| Success | Green | #4CAF50 | Completed, on track |
| Error | Red | #EF5350 | Alerts, missed workouts |

**Dark mode should be the default for the client mobile app** (gym lighting, OLED efficiency, competitor standard). The coach web dashboard should use a **light theme** (office/desk use).

**Typography:** Montserrat Bold or Oswald for athletic headlines; Inter or DM Sans for body text and UI; tabular/monospaced figures for workout logs (consistent column alignment). Minimum **17pt** for iOS body text — phones are often at arm's length during training.

---

## 4. Product requirements: what to build first

### The 13 must-have features for launch

Based on analysis of user reviews, competitor gaps, and market expectations, these features are **table stakes** for competing in 2026:

1. **Workout builder** supporting straight sets, supersets/circuits, EMOM, AMRAP, For Time, and Tabata — with built-in timers and proper scoring (the #1 differentiator vs. TrueCoach/Trainerize)
2. **Exercise demo video library** (800+ exercises) plus custom coach video upload
3. **Client mobile app** (iOS/Android) with workout viewing and set-by-set logging
4. **Coach web dashboard** with client management, compliance tracking, and calendar view
5. **In-app messaging** (1:1 coach↔client plus workout-specific comments)
6. **Program/template library** with copy, paste, and reuse across clients
7. **PR tracking** with auto-detection, estimated 1RM calculation (Epley/Brzycki), and celebration animations
8. **Percentage-based training** auto-calculating weights from each client's recorded 1RM
9. **Push notifications** for new workouts, messages, and completed workouts
10. **Progress charts** (1RM trends, volume over time, compliance rates)
11. **Body metrics logging** (weight, measurements, progress photos)
12. **Stripe payment integration** for recurring coach billing
13. **Apple Health / Google Fit** basic sync

### Key UX principles from competitor analysis

**Coach-side (desktop web):** Design should be **information-dense** — multi-panel layouts, data tables, calendars. TrueCoach's "Needs Attention" and "Due Soon" dashboard sections are the gold standard. The workout builder must be **freeform** (coaches hate rigid templates) with copy-paste across sessions and clients.

**Client-side (mobile):** Design should be **focused** — one workout at a time, large touch targets, minimal cognitive load. **3 taps maximum** to log a workout result. Auto-populate previous performance as defaults. Auto-start rest timers after set completion. Dark mode. **Offline capability is essential** (poor gym WiFi is universal).

**Critical mobile interactions:** Percentage calculator showing plates to load on the bar (Wodify's most-loved feature), confetti/haptic celebration for new PRs, inline exercise demo videos that don't navigate away from the workout screen, and a timer that persists when the app is backgrounded with audio/haptic alerts.

### High-value differentiators for V1.1–V2

Group leaderboards with reactions/fist bumps (CrossFit community essential), RPE/RIR logging, pre-workout wellness check-ins, multiple programming tracks per gym (Competitors/Fitness/Foundations), nutrition tracking via MyFitnessPal integration, and injury/limitation flags with exercise substitution suggestions. The **injury management space is a significant white space** — no coaching platform handles it well for functional fitness.

### Future features worth architecting for

AI workout generation (text → structured program), Apple Watch companion app, voice logging during workouts, real-time coach monitoring of client's active workout, form-check video submission with coach annotation tools, and a program marketplace.

---

## 5. Go-to-market: pricing, channels, and launch strategy

### Pricing that undercuts the market leader

The recommended model is **per-client tiered pricing**, positioned 20–30% below TrueCoach with more clients per tier:

| Tier | Clients | Monthly | Annual (save ~20%) |
|------|---------|---------|-------------------|
| Starter | Up to 10 | $19/mo | $15/mo billed annually |
| Growth | Up to 30 | $39/mo | $32/mo billed annually |
| Pro | Up to 75 | $79/mo | $65/mo billed annually |
| Unlimited | 75+ | $119/mo | $99/mo billed annually |

Client apps are **free** (industry standard). All features included at all tiers (avoiding Wodify's criticized feature-gating). Launch with **"Founders Pricing"** that locks the discounted rate for life — this creates urgency and rewards early adopters. Offer a **14–30 day free trial** without requiring a credit card (longer trials show 45.7% conversion rates).

### Channel priority for a new entrant

**App Store Optimization + Apple Search Ads** is the highest-ROI channel. **69% of App Store installs come from search.** Optimize the title ("Train Track: Fitness Coaching"), subtitle ("Program Builder for Coaches"), and first three screenshots (coach desktop experience, client mobile logging, PR tracking). Target keywords: "coaching app," "workout programming," "CrossFit app," "personal trainer software." Start with $1,000–3,000/month in Apple Search Ads.

**Content marketing and SEO** builds a long-term moat. Target topics coaches search for: "How to program a 12-week CrossFit cycle," "How to price online coaching services," "Best app for CrossFit coaches," and competitor comparison posts ("Train Track vs. TrueCoach"). Free lead magnets — downloadable programming templates, 1RM calculators, and a "How to Start Online Coaching" guide — capture email addresses.

**A micro-influencer coach ambassador program** delivers the highest authenticity. Recruit 20–50 respected CrossFit/functional fitness coaches. Offer free lifetime Pro accounts plus 10–20% recurring commission on referrals. Micro-influencers (10K–100K followers) deliver **4–7% engagement rates** versus 1–2% for macro-influencers, at **$150–500 per Instagram post**.

**CrossFit affiliate partnerships** are a direct pipeline to ~14,000 gyms worldwide. Offer free 30-day trials to box owners and their coaching staff, with bulk pricing for multi-coach accounts.

### Pre-launch sequence (3–6 months before launch)

**Months 1–3:** Landing page with waitlist (tools: GetWaitlist or KickoffLabs with viral referral mechanics). Target 500–2,000 signups. Build social presence with coach workflow content on Instagram/TikTok. Budget: $2,000–5,000.

**Months 3–5:** Beta testing with 20–50 target coaches via TestFlight and Google Play beta. Structured feedback via dedicated Discord/Slack channel and weekly surveys. Collect 10–20 testimonials.

**Months 5–6:** Ambassador outreach, Product Hunt preparation, press kit. Launch day: coordinate email blast, social media, Product Hunt, and press simultaneously. Aim for Apple's "Apps We Love" feature — it drives more downloads than a six-figure ad spend.

---

## 6. Infrastructure costs from startup to scale

### Startup phase (~1,000 users): $32–67/month

| Service | Tool | Cost |
|---------|------|------|
| Web hosting | Vercel Pro or Cloudflare Pages | $0–20 |
| Backend/DB | Supabase Pro | $25 |
| Mobile builds | Expo EAS Starter | $19 |
| Push notifications | Expo Push (built-in) | $0 |
| Video hosting | Bunny.net Stream | $5–15 |
| Analytics | PostHog free tier | $0 |
| Crash reporting | Sentry free + Firebase Crashlytics | $0 |
| Subscription management | RevenueCat (free under $2.5K MTR) | $0 |
| Transactional email | Resend free tier | $0 |
| Monitoring | UptimeRobot free | $0 |
| Apple Developer | Annual | ~$8 |
| Google Play | One-time $25 | — |

**Nearly every service offers generous free tiers.** The most expensive line items at launch are Supabase ($25) and EAS Build ($19).

### Growth phase (~10,000 users): $250–1,100/month

The range depends heavily on video streaming volume and push notification usage. Major cost drivers: **Cloudflare Stream or Bunny.net** ($75–300 for exercise video delivery), **OneSignal** ($31–139 for segmented push notifications), and **Supabase Pro with compute add-ons** ($25–75). PostHog starts charging above 1M events/month. RevenueCat takes 1% of monthly tracked revenue above $2,500.

### Key infrastructure decisions

**For video hosting**, start with **Bunny.net Stream** (~$5–15/month for ~750 exercise demo videos averaging 45 seconds each). It's roughly half the cost of Cloudflare Stream and includes DRM support. Migrate to Mux or Cloudflare Stream only when analytics or adaptive bitrate demands it.

**For analytics**, **PostHog** replaces 3–4 separate tools: product analytics, session replay, feature flags, and A/B testing — all with a generous free tier (1M events/month). Startup-friendly with $50K free credits for qualifying startups.

**For subscription management**, **RevenueCat** is essential. It eliminates the need to build subscription backend logic, handles iOS/Android/web receipt validation, and is free until $2,500 monthly tracked revenue.

**For OTA updates**, EAS Update pushes JavaScript/asset changes without App Store review. Only native code changes (new modules, SDK version updates, new permissions) require full rebuilds. Use Expo Fingerprint to detect when native rebuilds are truly needed, minimizing build costs.

---

## 7. Legal compliance: what's mandatory before launch

### Health data privacy is the primary regulatory concern

**HIPAA generally does NOT apply** to fitness coaching apps. It only covers "covered entities" (hospitals, insurers) and their business associates. A fitness coaching app where users self-enter workout data falls outside HIPAA scope. The exception: if coaches are licensed healthcare professionals providing clinical services through the app, HIPAA compliance would be triggered. **Keep fitness coaching distinct from clinical care.**

**The Washington My Health My Data Act (MHMDA) IS the primary concern.** Effective March 2024, it broadly applies to fitness apps collecting health-related data (weight, body measurements, fitness activities) with **no minimum revenue threshold**. It applies to any business targeting Washington consumers regardless of location. Requirements: opt-in consent before collecting health data, a **separate standalone Consumer Health Data Privacy Policy** (cannot be combined with the general privacy policy), a 45-day response window for data requests, and a private right of action (consumers can sue directly).

**The FTC Health Breach Notification Rule** covers fitness apps collecting health information outside HIPAA. Breaches require consumer and FTC notification within 60 days. Penalties: **$43,792 per violation per day**. Recent enforcement actions against BetterHelp ($7.8M), Flo Health, and GoodRx demonstrate active enforcement.

**Illinois BIPA applies** if Train Track uses facial geometry for progress photos or any biometric identifiers. Requires written informed consent before collection, a public retention/destruction policy, and prohibits sale of biometric data. Penalties: $1,000–5,000 per violation with a private right of action. The fitness wearable company Whoop faced a BIPA class action — this is actively litigated.

### App Store requirements specific to fitness apps

**Apple requires:** health/fitness data cannot be used for advertising or data mining (only health improvement, with permission), no storing health data in iCloud, Privacy Nutrition Labels completed in App Store Connect, App Tracking Transparency framework if any cross-app tracking, account deletion functionality, and clear auto-renewal subscription disclosures. Starting Spring 2026, Health & Fitness apps can indicate regulatory status as medical devices.

**Google Play requires:** completion of the Health Apps declaration form (mandatory for ALL apps as of August 2025), encryption at rest and in transit for health data, Data Safety section disclosure, and privacy policy accessible both in Play Console and within the app.

### Mandatory pre-launch legal actions

- Form an **LLC** (convert to Delaware C-Corp if pursuing VC funding)
- Draft a comprehensive **Privacy Policy** plus a **separate Consumer Health Data Privacy Policy** (MHMDA requirement)
- Draft **Terms of Service** with medical disclaimer ("consult your physician before beginning any exercise program"), assumption of risk clause, liability cap ($100–500 or fees paid in prior 12 months), and mandatory arbitration with class action waiver
- Implement **data encryption** (AES-256 at rest, TLS 1.3 in transit)
- Implement **granular consent management** with opt-in for health data
- Obtain **general liability** (~$500–1,000/year), **professional liability/E&O** (~$2,000–4,000/year), and **cyber liability** (~$2,000–4,000/year) insurance
- Complete Apple Privacy Nutrition Labels and Google Data Safety section
- Implement account and data deletion functionality
- Ensure **no health data is used for advertising** (Apple and Google both prohibit this)

For international expansion, a Data Protection Impact Assessment becomes mandatory under GDPR, Standard Contractual Clauses are needed for EU data transfers, and a Data Protection Officer appointment may be required.

---

## Conclusion: the strategic advantage is in execution speed

Train Track's competitive advantage isn't a single feature — it's the combination of **CrossFit-native workout format support, dual-excellent UX for both coaches and clients, and community features within a coaching platform**. No competitor currently delivers all three.

The recommended stack — **Expo + Supabase + TypeScript end-to-end** — is optimized for AI-assisted development velocity. A solo developer using Claude Code and Cursor on this stack can realistically ship MVP in 8–12 weeks, at a total monthly cost under $300 including all tooling (AI subscriptions, infrastructure, and app store fees).

Three strategic insights should guide prioritization. First, **build the workout builder for CrossFit formats first** — native AMRAP/EMOM/For Time support with built-in timers is the clearest gap in the market and the feature most likely to generate word-of-mouth in the target community. Second, **invest in the logging UX obsessively** — users who regularly view progress data have **2.3× higher retention rates**, and every tap saved during a sweaty gym session compounds into loyalty. Third, **architect for AI from day one** — pgvector in PostgreSQL enables future exercise recommendations and smart programming, and the fitness app market is rapidly moving from "AI features are nice" to "AI features are expected."

The total first-year cost for a solo-developer operation (infrastructure + tools + legal + insurance + app store fees) is approximately **$8,000–15,000** — remarkably low for a three-platform production application serving thousands of users. The biggest investment isn't money; it's the focused effort to nail the coach-side workout builder and client-side logging experience before anything else.