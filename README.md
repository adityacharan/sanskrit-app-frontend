# Learn Sanskrit — संस्कृतं पठतु

*From simple letters to beautiful poems, one step at a time.*

A web app for learning Sanskrit: the Devanagari alphabet, everyday vocabulary, grammar tables, phrases and classic shlokas, with quizzes, XP and a daily streak.

An initiative by **Jaganmohini**.

> **Status:** frontend only. All content is mock data in [`lib/data.ts`](lib/data.ts), and progress is saved in the browser's `localStorage`. There is no backend yet.

## Features

| Page | Path | What it does |
| --- | --- | --- |
| Login | `/login` | Placeholder sign-in screen with a single **Login** button (no credentials). |
| Home | `/` | Word of the day, level/XP/streak stats, learning path, and per-category progress. |
| Alphabet | `/alphabet` | Vowels, consonants grouped by where they're pronounced, and conjuncts. Tap a letter to hear it and see an example word. |
| Vocabulary | `/vocabulary` | Flashcards in 7 categories (greetings, numbers, family, nature, animals, body, verbs). Tap to flip, swipe to move on, mark words as learned. |
| Quiz | `/quiz` | 10-question multiple choice: Sanskrit → English, English → Sanskrit, or script → romanization. Keys `1`–`4` answer, `Enter` continues. |
| Grammar | `/grammar` | Noun declensions (राम, फल, लता), verb conjugations (पठ्, गम्) and pronouns, with a practice mode that hides forms until you tap them. |
| Phrases | `/phrases` | Everyday sentences and five shlokas. Romanization and meaning can be switched on and off. |

Pronunciation uses the browser's built-in speech synthesis with a Hindi voice, because Sanskrit voices are rare. If your system has no Hindi voice, the speaker buttons do nothing.

## Interaction design

The UI follows Apple's fluid-interface principles:

- **Instant feedback.** Buttons react on press, not on release, and the 300 ms tap delay is removed.
- **Interruptible springs.** Animations use critically damped springs from [Motion](https://motion.dev), so they can be interrupted and reversed mid-flight.
- **Cursor tracking.** Cards light up under the pointer, hover pills glide between options, cards tilt toward the cursor, and primary buttons are gently magnetic.
- **Flashcards.** Swipes use momentum projection, so a quick flick counts even if the drag was short.
- **Dropdowns.** Menus open on press, grow out of their trigger, and support press-drag-release selection and full keyboard control.
- **Accessibility.** The app respects `prefers-reduced-motion`, `prefers-reduced-transparency` and `prefers-contrast`, and supports light and dark mode.

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # TypeScript check
```

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) and React 19
- TypeScript 5
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) for springs, gestures and layout animation
- Fonts via `next/font`: Inter (UI), Tiro Devanagari Sanskrit (Devanagari), Great Vibes (signature)

## Project structure

```
app/
  layout.tsx          Root layout: fonts, nav, providers
  globals.css         Theme tokens (light/dark), press feedback, spotlight, materials
  page.tsx            Home
  login/  alphabet/  vocabulary/  quiz/  grammar/  phrases/
components/
  Nav.tsx             Top bar and mobile tab bar, account menu
  Providers.tsx       MotionConfig (reduced motion) and the pointer-spotlight listener
  ui.tsx              Shared UI: Tabs, Dropdown, Switch, ProgressBar, Tilt, Magnetic, springs
lib/
  data.ts             All learning content (mock data)
  progress.ts         XP / learned words / streak store (localStorage)
  speak.ts            Text-to-speech and shuffle helpers
```

## Adding content

Everything lives in [`lib/data.ts`](lib/data.ts):

- **Words:** add a row to a category in `categories` as `[devanagari, romanization, meaning]`, or add a whole new category with `cat(...)`. Quizzes and progress pick it up automatically.
- **Letters:** add to `vowels`, `consonants` or `conjuncts`.
- **Grammar:** add to `declensions` (8 cases × 3 numbers) or `conjugations` (3 persons × 3 numbers).
- **Phrases and verses:** add to `phrases` or `shlokas`.

Romanization uses IAST (ā, ī, ū, ṛ, ṃ, ḥ, ś, ṣ, ṭ, ḍ, ṇ, ñ, ṅ).
