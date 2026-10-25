@AGENTS.md

# Learn Sanskrit — frontend

Next.js 16 web app for learning Sanskrit (alphabet, vocabulary, grammar, phrases and shlokas, quizzes). Owner's GitHub: `adityacharan`. Repo: `adityacharan/sanskrit-app-frontend`, branch `main`.

## Scope and product decisions

- **Frontend only, mock data.** The owner explicitly said no backend for now. All content is in `lib/data.ts`. Progress (XP, learned words, quiz best scores, streak) is in `localStorage` via `lib/progress.ts`. Don't add API routes, databases or auth providers unless asked.
- **The login is a placeholder, but it gates the app** (the owner asked for this). `proxy.ts` (Next 16's renamed middleware) redirects every page to `/login?next=…` until the `sanskrit_session` cookie exists, and redirects `/login` to `/` once it does. The Login button calls `logIn()` from `lib/session.ts` (a one-year cookie) and then `router.replace(safeNext(next))`. Account menu → Log out calls `logOut()` and does a full reload to `/login`. It's a cookie, not localStorage, so the redirect happens on the server with no flash of the app. `safeNext` only allows same-site paths, which blocks open redirects through `?next=//evil`.
- **Branding on the login page:** the logo is the owner's Chandravidya (चन्द्रविद्या) Saraswati emblem, `public/logo.png`, with the quote **श्रद्धावान् लभते ज्ञानम्** under it. The same emblem sits next to the संस्कृतम् wordmark in the nav bar. The heading says "Learn Sanskrit". The Sanskrit line is **संस्कृतं पठतु** (saṃskṛtaṃ paṭhatu) — the owner corrected this from पठामः, so don't change it back. The tagline is "From simple letters to beautiful poems, one step at a time." The owner asked for the "An initiative by Jaganmohini" footer to be removed, so the login content is centred with no footer.
- The owner cares about Sanskrit accuracy. Use IAST romanization and double-check forms before adding content.
- **Verb content comes from the owner's document**, `Sanskrit_20_Dhatus_All_Persons.docx`, which sits in the parent folder outside the repo. The owner asked for exactly the changes in it and nothing more, so follow it closely when it's updated. It gave:
  - **20 dhatus in the present tense (लट्), nine forms each, in the doc's order.** They're built with the `present()` helper in `lib/data.ts`. The doc doesn't mention पठ्'s past (लङ्) and future (लृट्) tables, so they were kept; ask before removing them.
  - **Examples for every person, number and gender, for every verb.** The doc's red text "(This should be for all verbs)" means the examples, not just the note. An earlier version showed one fixed list (पठ्, गम्, चल्) whatever verb was selected, and the owner reported it as "not updated". `verbExamples(verb)` in `lib/data.ts` builds 15 sentences from the selected verb's forms and its `english` triple (after "I" / "we, you, they" / "he, she, it"). It reproduces the doc's 15 lines exactly. Subjects switch to अहम्, त्वम् etc. before a vowel (अहम् अस्मि, त्वम् आगच्छसि). Other subjects stay unsandhied, like the doc's सः गच्छति. पठ्'s past and future tables have no `english`, so they show no examples. Romanization comes from `toIAST()` in `lib/iast.ts`, which reproduces every hand-written romanization in the data; re-check it against them if you change it.
  - **The note on persons and numbers** under the verb table, shown for every verb.
  - अस् is labelled "to be / to become" because the doc says so, the same as भू. Strictly, अस् is just "to be"; the owner hasn't decided yet whether to change it.
- **A second owner document, `Changes P-1.docx`** (also in the parent folder), made these changes. Don't bring back what it removed:
  - **Logo and quote:** see the branding bullet above.
  - **No Word of the Day on the home page.** The hero card is full width.
  - **Alphabet page:** the subtitle no longer says letters are arranged by where in the mouth they're pronounced. The inherent-"a" tip and the Conjuncts tab are gone, and conjuncts were removed from `lib/data.ts` and the alphabet quiz.
  - **Consonants** are grouped as the five vargas (कवर्गः … पवर्गः, five letters each), then the four semivowels, then the four sibilants (श ष स ह). The consonants tab opens with the owner's halanta note (क् … ङ् are written क … ङ) and ends with the 48-letter count: 13 vowels, 2 अयोगवाहौ, 33 consonants. The vowels tab still lists अं and अः, because the doc only asked for the note.
  - **Greetings vocabulary is exactly the doc's table**, with धन्यवादः corrected to धन्यवादाः. नमस्काराः / नमस्ते / प्रणामाः is a single card, so the English → Sanskrit quiz never offers one of them as a wrong answer for another.
  - **A new "Good Manners · शिष्टाचारः" category** holds the doc's second table plus the four words listed after it. क्षम्यताम् and पुनर्मिलामः moved there from Greetings.
  - **The doc's 17 greeting sentences** (`greetingSentences`) are a quiz source, "Greeting sentences". The doc asked for them "as Quiz", so they aren't shown on the Phrases page. The stray "।," in सुप्रभातम्, मान्ये। was fixed. Long quiz prompts use a smaller font so sentences fit on a phone.

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

- **Word IDs are `${slug}:${translit}`**, and learned progress stores those IDs in `localStorage`. Renaming or moving a word leaves its old ID behind, so count learned words against `allWords` (as Home and the account menu do), never `progress.learned.length`.

- **Dropdown selection must fire once.** A mouse release on an item selects it (`pointerup`), and the `click` that follows must not select again. `isOpen` is a ref, updated synchronously, that guards `choose()`. Item `onClick` must stay unconditional, because programmatic and assistive-tech clicks arrive without a preceding `pointerdown`.
- **Press vs tap:** commit on `pointerdown` only for `pointerType === "mouse"`. Touch must wait for `click`, or starting a scroll selects things. `Tabs` and `Dropdown` track the last pointer type in a ref, so a mouse press and its click don't toggle twice.
- **Never define components inside a component body** (e.g. a `Cell` in grammar). They remount on every render and kill animations. Grammar uses the module-level `FormCell` for this reason.
- **`AnimatePresence mode="popLayout"`** needs children that forward refs. The flashcards use the default mode with absolutely positioned cards instead.
- **Selection layers using `-z-10`** inside a tile need `relative isolate` on the tile, or they vanish behind its background on touch devices (where `[data-spotlight]` doesn't set `isolation`).

## Verifying UI changes

Typecheck and build, then drive the app with headless Chrome (`/usr/bin/google-chrome`) using `puppeteer-core` installed in a scratch directory, not in this project. Click through the flows: dropdown press-drag-release and keyboard, flashcard swipe, quiz, grammar reveal, account menu, mobile width (390px) with no horizontal overflow. Also test the login gate in a fresh browser context. Set the `sanskrit_session` cookie first for the other flows, or every page redirects to `/login`. Take screenshots and look at them. The expected baseline is no console errors apart from the favicon 404.
