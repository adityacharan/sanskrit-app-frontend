@AGENTS.md

# Learn Sanskrit — frontend

Next.js 16 web app for learning Sanskrit (alphabet, vocabulary, grammar, phrases and shlokas, quizzes). Owner's GitHub: `adityacharan`. Repo: `adityacharan/sanskrit-app-frontend`, branch `main`.

## Scope and product decisions

- **Frontend only, mock data.** The owner explicitly said no backend for now. All content is in `lib/data.ts`. Progress (XP, learned words, quiz best scores, streak) is in `localStorage` via `lib/progress.ts`. Don't add API routes, databases or auth providers unless asked.
- **The login is a placeholder.** `/login` has a single Login button and no credentials; it just routes to `/`. The app does not gate on login. Account menu → Log out goes back to `/login`.
- **Branding on the login page:** the logo says "Learn Sanskrit". The Sanskrit line is **संस्कृतं पठतु** (saṃskṛtaṃ paṭhatu) — the owner corrected this from पठामः, so don't change it back. The tagline is "From simple letters to beautiful poems, one step at a time." The footer reads "An initiative by" plus **Jaganmohini** in the Great Vibes cursive signature font.
- The owner cares about Sanskrit accuracy. Use IAST romanization and double-check forms before adding content.

## Commands

```bash
npm run dev        # localhost:3000 (Turbopack)
npm run build
npm run typecheck
```

- **TypeScript is pinned to 5.x.** npm installs TS 7 (the native compiler) by default, and Next 16 needs the TS 5 JS API. Don't upgrade it.
- **Don't run `pkill -f "next dev"` from a shell** whose command line contains that string; it kills the shell itself. Stop the dev server by its task instead.

## Architecture

- `app/*/page.tsx` — every page is a client component (`"use client"`) because they're all interactive.
- `app/layout.tsx` — sets up the fonts (Inter → `--font-inter`, Tiro Devanagari Sanskrit → `--font-tiro`) and wraps the app in `<Providers>` and `<Nav>`.
- `components/ui.tsx` — the shared design-system pieces. Reuse these rather than hand-rolling:
  - `spring` / `snappy`: critically damped spring transitions (bounce 0).
  - `project(velocity)`: Apple's momentum projection.
  - `Tabs`: segmented control with a gliding active pill and a gliding hover pill.
  - `Dropdown`: `kind="listbox"` for choosing a value, `kind="menu"` for actions.
  - `Chevron`, `Switch`, `ProgressBar`.
  - `Tilt` and `Magnetic`: pointer-following springs.
  - `PageHeader`, `SpeakButton`.
- `components/Providers.tsx` — `MotionConfig reducedMotion="user"`, plus one passive document `pointermove` listener that writes `--mx`/`--my` onto any `[data-spotlight]` element.
- `components/Nav.tsx` — translucent top bar (desktop) and bottom tab bar (mobile); hidden on `/login`.
- `lib/progress.ts` — `useSyncExternalStore` store. Server snapshot is the default, so there are no hydration mismatches. `actions.*` mutate it. `msSinceXpGain()` lets the XP badge pop only on real gains, not on page load.

## Design system (Apple fluid-interface principles — the owner asked for this)

- **Colors** are CSS tokens in `app/globals.css` (`--bg`, `--surface`, `--accent` and so on), redefined for dark mode and exposed to Tailwind via `@theme inline` (`bg-surface`, `text-accent`, …). Use tokens, never raw hex, in components.
- **Devanagari text** gets the `deva` class. The base font stack also falls back to Tiro, so Devanagari inside UI labels doesn't render as boxes; Inter has no Devanagari glyphs.
- **Press feedback** is global CSS on `button`/`a`/`[role=button]`: `scale: .97` on `:active`, 60 ms in, using the independent `scale` property so it composes with Motion transforms. Don't add `active:scale-*` utilities.
- **Spotlight:** add `data-spotlight` to a card for a cursor-tracking glow and lit border. Use `data-spotlight="light"` on accent or colored backgrounds.
- **Materials:** `.material-bar` is translucent nav chrome. `.material` is for menus and is solid on purpose — translucent menus over busy content were unreadable.
- **Springs:** bounce 0 by default. Use a little bounce only for celebratory or momentum moments (XP pop, quiz results emoji).

## Pitfalls already hit

- **Press vs tap:** commit on `pointerdown` only for `pointerType === "mouse"`. Touch must wait for `click`, or starting a scroll selects things. `Tabs` and `Dropdown` track the last pointer type in a ref, so a mouse press and its click don't toggle twice.
- **Never define components inside a component body** (e.g. a `Cell` in grammar). They remount on every render and kill animations. Grammar uses the module-level `FormCell` for this reason.
- **`AnimatePresence mode="popLayout"`** needs children that forward refs. The flashcards use the default mode with absolutely positioned cards instead.
- **Selection layers using `-z-10`** inside a tile need `relative isolate` on the tile, or they vanish behind its background on touch devices (where `[data-spotlight]` doesn't set `isolation`).

## Verifying UI changes

Typecheck and build, then drive the app with headless Chrome (`/usr/bin/google-chrome`) using `puppeteer-core` installed in a scratch directory, not in this project. Click through the flows: dropdown press-drag-release and keyboard, flashcard swipe, quiz, grammar reveal, account menu, mobile width (390px) with no horizontal overflow. Take screenshots and look at them. The expected baseline is no console errors apart from the favicon 404.
