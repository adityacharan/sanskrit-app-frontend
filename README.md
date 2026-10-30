# Learn Sanskrit — संस्कृतं पठतु

*From simple letters to beautiful poems, one step at a time.*

A web app for learning Sanskrit: the Devanagari alphabet, everyday vocabulary, grammar tables, phrases and classic shlokas, with quizzes, XP and a daily streak.

An initiative by **Jaganmohini**.

> **Status:** frontend only. All content is mock data in [`lib/data.ts`](lib/data.ts), and progress is saved in the browser's `localStorage`. There is no backend yet.

## Login (placeholder)

Visitors are sent to `/login` first. Clicking **Login** sets a `sanskrit_session` cookie that lasts a year and takes you into the app, or back to the page you originally asked for. After that, you aren't redirected again until you choose **Log out** from the account menu (the XP badge in the top right). The redirect is done on the server in [`proxy.ts`](proxy.ts) (the Next.js 16 name for middleware), so the app never flashes on screen before the login page.

## Features

| Page | Path | What it does |
| --- | --- | --- |
| Login | `/login` | Placeholder sign-in screen with a single **Login** button (no credentials). Every page redirects here until you log in. |
| Home | `/` | Level/XP/streak stats, learning path, and per-category progress. |
| Alphabet | `/alphabet` | Vowels, anusvāra & visarga (अयोगवाहौ), and consonants grouped as the five vargas, the semivowels and the sibilants. Each letter is a flashcard; flip it for a word that begins with it. |
| Vocabulary | `/vocabulary` | Flashcards in 7 categories (greetings, good manners, numbers 1–100, family, nature, animals, body). Tap to flip, swipe to move on, mark words as learned. |
| Quiz | `/quiz` | Every topic is split into short tests; finishing them unlocks its Grand Tests. Words and phrases ask Sanskrit → English, English → Sanskrit or script → romanization. Verbs, pronouns and nouns show only the word, with Sanskrit options and no repeated question. The 100 everyday sentences are translated both ways by tapping word tiles. Keys `1`–`4` answer, `Enter` continues. |
| Grammar | `/grammar` | Noun declensions (राम, फल, लता), 113 nouns grouped by gender and ending with full tables, 32 verbs in five lakaras (लट्, लृट्, लङ्, लोट्, विधिलिङ्) shown person by person with example sentences, and every pronoun (सर्वनाम) declined in all seven cases, with a practice mode that hides forms until you tap them. |
| Advanced Grammar | `/advanced` | The other five lakaras (लिट्, लुट्, आशीर्लिङ्, लुङ्, लृङ्), large numbers (महासङ्ख्याः) with Bhāskarācārya's shloka, and ordinal numbers 1st–100th and 1000th. |
| Phrases | `/phrases` | Everyday sentences and five shlokas. Romanization and meaning can be switched on and off. |

Pronunciation uses the browser's built-in speech synthesis with a Hindi voice, because Sanskrit voices are rare. If your system has no Hindi voice, the speaker buttons do nothing.

## Interaction design

The UI follows Apple's fluid-interface principles:

- **Instant feedback.** Buttons react on press, not on release, and the 300 ms tap delay is removed.
- **Interruptible springs.** Animations use critically damped springs from [Motion](https://motion.dev), so they can be interrupted and reversed mid-flight.
- **Cursor tracking.** Cards light up under the pointer, and hover pills glide between options. Buttons stay still: no drift, tilt or shake.
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
- Fonts via `next/font`: Inter (UI), Tiro Devanagari Sanskrit (Devanagari)

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
  ui.tsx              Shared UI: Tabs, Dropdown, Switch, ProgressBar, springs
proxy.ts              Redirects to /login until the session cookie is set
lib/
  data.ts             All learning content (mock data)
  session.ts          Dummy session cookie: logIn / logOut / safeNext
  progress.ts         XP / learned words / streak store (localStorage)
  speak.ts            Text-to-speech and shuffle helpers
```

## Adding content

Everything lives in [`lib/data.ts`](lib/data.ts):

- **Words:** add a row to a category in `categories` as `[devanagari, romanization, meaning]`, or add a whole new category with `cat(...)`. Quizzes and progress pick it up automatically.
- **Numbers:** `numberRows` holds 1–100 in order (the row index is the number). `largeNumbers` (powers of ten) and `ordinals` (`lib/ordinals.ts`) are shown in Advanced Grammar.
- **Pronouns:** `lib/pronouns.ts`, one table of seven cases per gender. A cell with two forms is written "माम् / मा".
- **Nouns by ending:** add a row to a class in `lib/nouns.ts`; an irregular word passes its own ending table.
- **Everyday sentences:** `lib/spoken.ts`, as `[sanskrit, english]`. Each word becomes a tile in the quiz.
- **Quizzes:** `lib/quizzes.ts` builds every topic's parts and Grand Test from the data, so new content is quizzed automatically.
- **Every learning section** uses `components/deck.tsx`: a flashcard (`Deck`) and a one-line preview with a See all toggle (`PreviewList`).
- **Letters:** add to `vowels` or `consonants`.
- **Grammar:** add to `declensions` (8 cases × 3 numbers). Verbs are in [`lib/verbs.ts`](lib/verbs.ts): give `verb(...)` the stems and it builds all ten lakaras (3 persons × 3 numbers each); irregular tables are written out in full.
- **Phrases and verses:** add to `phrases` or `shlokas`.

Romanization uses IAST (ā, ī, ū, ṛ, ṃ, ḥ, ś, ṣ, ṭ, ḍ, ṇ, ñ, ṅ).
