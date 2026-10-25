@AGENTS.md

# Learn Sanskrit — frontend

Next.js 16 web app for learning Sanskrit (alphabet, vocabulary, grammar, phrases and shlokas, quizzes). Owner's GitHub: `adityacharan`. Repo: `adityacharan/sanskrit-app-frontend`, branch `main`.

## Scope and product decisions

- **Frontend only, mock data.** The owner explicitly said no backend for now. All content is in `lib/data.ts`. Progress (XP, learned words, quiz best scores, streak) is in `localStorage` via `lib/progress.ts`. Don't add API routes, databases or auth providers unless asked.
- **The login is a placeholder, but it gates the app** (the owner asked for this). `proxy.ts` (Next 16's renamed middleware) redirects every page to `/login?next=…` until the `sanskrit_session` cookie exists, and redirects `/login` to `/` once it does. The Login button calls `logIn()` from `lib/session.ts` (a one-year cookie) and then `router.replace(safeNext(next))`. Account menu → Log out calls `logOut()` and does a full reload to `/login`. It's a cookie, not localStorage, so the redirect happens on the server with no flash of the app. `safeNext` only allows same-site paths, which blocks open redirects through `?next=//evil`.
- **Branding on the login page:** the logo says "Learn Sanskrit". The Sanskrit line is **संस्कृतं पठतु** (saṃskṛtaṃ paṭhatu) — the owner corrected this from पठामः, so don't change it back. The tagline is "From simple letters to beautiful poems, one step at a time." The footer reads "An initiative by" plus **Jaganmohini** in the Great Vibes cursive signature font.
- The owner cares about Sanskrit accuracy. Use IAST romanization and double-check forms before adding content.
- **Verb content comes from the owner's document**, `Sanskrit_20_Dhatus_All_Persons.docx`, which sits in the parent folder outside the repo. The owner asked for exactly the changes in it and nothing more, so follow it closely when it's updated. It gave:
  - **20 dhatus in the present tense (लट्), nine forms each, in the doc's order.** They're built with the `present()` helper in `lib/data.ts`. The doc doesn't mention पठ्'s past (लङ्) and future (लृट्) tables, so they were kept; ask before removing them.
  - **Examples covering every person, number and gender** (`verbExamples`), shown under "Examples · उदाहरणानि". The doc had no English for ताः गच्छन्ति, तत् चलति, ते चलतः and तानि चलन्ति, so "They go.", "It moves.", "Those two move." and "They move." were filled in. IAST was added to every example to match the rest of the app.
  - **The note on persons and numbers** under the verb table. The doc's red text "(This should be for all verbs)" was an instruction, not content, so the note sits outside the per-verb data and shows for every verb.
  - अस् is labelled "to be / to become" because the doc says so, the same as भू. Strictly, अस् is just "to be"; the owner hasn't decided yet whether to change it.

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
  - `PageHeader`, `SpeakButton`.
- `components/Providers.tsx` — `MotionConfig reducedMotion="user"`, plus one passive document `pointermove` listener that writes `--mx`/`--my` onto any `[data-spotlight]` element.
- `components/Nav.tsx` — translucent top bar (desktop) and bottom tab bar (mobile); hidden on `/login`.
- `lib/progress.ts` — `useSyncExternalStore` store. Server snapshot is the default, so there are no hydration mismatches. `actions.*` mutate it.

## Design system (Apple fluid-interface principles — the owner asked for this)

- **Colors** are CSS tokens in `app/globals.css` (`--bg`, `--surface`, `--accent` and so on), redefined for dark mode and exposed to Tailwind via `@theme inline` (`bg-surface`, `text-accent`, …). Use tokens, never raw hex, in components.
- **Devanagari text** gets the `deva` class. The base font stack also falls back to Tiro, so Devanagari inside UI labels doesn't render as boxes; Inter has no Devanagari glyphs.
- **Press feedback** is global CSS on `button`/`a`/`[role=button]`: `scale: .97` on `:active`, 60 ms in, using the independent `scale` property so it composes with Motion transforms. Don't add `active:scale-*` utilities.
- **Spotlight:** add `data-spotlight` to a card for a cursor-tracking glow and lit border. Use `data-spotlight="light"` on accent or colored backgrounds.
- **Materials:** `.material-bar` is translucent nav chrome. `.material` is for menus and is solid on purpose — translucent menus over busy content were unreadable.
- **Springs:** bounce 0 by default. The only bounce is the quiz results emoji.
- **Buttons must be simple and steady.** The owner found magnetic buttons, tilting cards, the quiz answer shake/pop and the XP badge bounce "too shaky", so they were removed. Button feedback is the instant press scale plus hover color/border changes only. Don't add motion that moves buttons around under the cursor.

## Pitfalls already hit

- **Dropdown selection must fire once.** A mouse release on an item selects it (`pointerup`), and the `click` that follows must not select again. `isOpen` is a ref, updated synchronously, that guards `choose()`. Item `onClick` must stay unconditional, because programmatic and assistive-tech clicks arrive without a preceding `pointerdown`.
- **Press vs tap:** commit on `pointerdown` only for `pointerType === "mouse"`. Touch must wait for `click`, or starting a scroll selects things. `Tabs` and `Dropdown` track the last pointer type in a ref, so a mouse press and its click don't toggle twice.
- **Never define components inside a component body** (e.g. a `Cell` in grammar). They remount on every render and kill animations. Grammar uses the module-level `FormCell` for this reason.
- **`AnimatePresence mode="popLayout"`** needs children that forward refs. The flashcards use the default mode with absolutely positioned cards instead.
- **Selection layers using `-z-10`** inside a tile need `relative isolate` on the tile, or they vanish behind its background on touch devices (where `[data-spotlight]` doesn't set `isolation`).

## Verifying UI changes

Typecheck and build, then drive the app with headless Chrome (`/usr/bin/google-chrome`) using `puppeteer-core` installed in a scratch directory, not in this project. Click through the flows: dropdown press-drag-release and keyboard, flashcard swipe, quiz, grammar reveal, account menu, mobile width (390px) with no horizontal overflow. Also test the login gate in a fresh browser context. Set the `sanskrit_session` cookie first for the other flows, or every page redirects to `/login`. Take screenshots and look at them. The expected baseline is no console errors apart from the favicon 404.
