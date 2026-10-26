@AGENTS.md

# Learn Sanskrit — frontend

Next.js 16 web app for learning Sanskrit (alphabet, vocabulary, grammar, phrases and shlokas, quizzes). Owner's GitHub: `adityacharan`. Repo: `adityacharan/sanskrit-app-frontend`, branch `main`.

## Scope and product decisions

- **Frontend only, mock data.** The owner explicitly said no backend for now. All content is in `lib/data.ts`. Progress (XP, learned words, quiz best scores, streak) is in `localStorage` via `lib/progress.ts`. Don't add API routes, databases or auth providers unless asked.
- **The login is a placeholder, but it gates the app** (the owner asked for this). `proxy.ts` (Next 16's renamed middleware) redirects every page to `/login?next=…` until the `sanskrit_session` cookie exists, and redirects `/login` to `/` once it does. The Login button calls `logIn()` from `lib/session.ts` (a one-year cookie) and then `router.replace(safeNext(next))`. Account menu → Log out calls `logOut()` and does a full reload to `/login`. It's a cookie, not localStorage, so the redirect happens on the server with no flash of the app. `safeNext` only allows same-site paths, which blocks open redirects through `?next=//evil`.
- **Branding on the login page:** the logo is the owner's Chandravidya (चन्द्रविद्या) Saraswati emblem, `public/logo.png`, with the quote **श्रद्धावान् लभते ज्ञानम्** under it. The same emblem sits next to the संस्कृतम् wordmark in the nav bar. The heading says "Learn Sanskrit". The Sanskrit line is **संस्कृतं पठतु** (saṃskṛtaṃ paṭhatu) — the owner corrected this from पठामः, so don't change it back. The tagline is "From simple letters to beautiful poems, one step at a time." The owner asked for the "An initiative by Jaganmohini" footer to be removed, so the login content is centred with no footer.
- The owner cares about Sanskrit accuracy. Use IAST romanization and double-check forms before adding content.
- **Verb content comes from two owner documents**, `Sanskrit_20_Dhatus_All_Persons.docx` and `P_2-Verbs.docx` (parent folder, outside the repo; the second is in romanized Telugu). The owner asked for exactly the changes in them and nothing more, so follow them closely when they're updated. Verbs live in `lib/verbs.ts` (re-exported from `lib/data.ts`):
  - **The 20 dhatus of the first doc, in its order, then 11 more** (वस् … पूज्) because the second doc said to add any other commonly used verbs. Every verb has **all ten lakaras** (लट्, लिट्, लुट्, लृट्, लोट्, लङ्, विधिलिङ्, आशीर्लिङ्, लुङ्, लृङ्, in the doc's order) with nine forms each. `verb(...)` builds them from stems (present stem, augmented stem, future stem, लुट् 3rd sg, लिट् strong/weak/2nd-sg, the aorist type, the आशीर्लिङ् stem); कृ, श्रु, दा, अस् and the awkward लिट्/लुङ् tables are written out. The generated लट् forms were checked equal to the first doc's tables. Where grammar allows two forms (अपठीत्/अपाठीत्, जगमिथ/जगन्थ, अद्राक्षीत्/अदर्शत्, कथयामास/कथयाञ्चकार) one textbook form was chosen.
  - **अस् has forms only in लट्, लङ्, लोट्, विधिलिङ्** (Pāṇini 2.4.52: भू replaces it elsewhere). The Grammar page shows a note and भू's forms for the other lakaras. अस् is labelled "to be / to become" because the first doc says so; strictly it's just "to be", undecided.
  - **The Grammar → Verbs tab** has the verb chips, a lakara dropdown, then **three separate blocks, 1st, 2nd, 3rd person** (the second doc asked for the persons "separately"; the data still stores forms as [3rd, 2nd, 1st] like the first doc). Each block lists sg/du/pl and, for लट्, लृट्, लङ्, लोट्, विधिलिङ्, that person's example sentences from `sentence()` with the doc's 15 subjects. The note on persons and numbers sits under the blocks, for every verb.
  - **Examples / sentences:** `sentence(verb, lakara, subject)` builds "अहं पठामि। I read." style lines; subjects switch to अहम्, त्वम् before a vowel (अहम् अस्मि). English per lakara: present uses the `english` triple, लृट् "will", लङ् "was/were + -ing" (`ing`), लोट् "Let … / (You) …!", विधिलिङ् "should". अस् has `base: "be"` and `past`.
  - **Quiz:** one source per lakara ("Verbs · लट् …", all forms of all verbs; meaning is "to read · 3rd person · singular") and a "Sentences" source (nouns and pronouns × the five lakaras above, as the doc asked). Wrong answers come from the item's `group` first (same verb, or same subject + verb across lakaras), so a sentence question tests the lakara. The sentence quiz uses only masculine pronouns, सा, and nouns, because "They" would otherwise match ते/ताः/तानि.
  - **The Verbs vocabulary category was removed** by the second doc ("Remove Verbs Section and button in Words"). Don't bring it back.
- **A second owner document, `Changes P-1.docx`** (also in the parent folder), made these changes. Don't bring back what it removed:
  - **Logo and quote:** see the branding bullet above.
  - **No Word of the Day on the home page.** The hero card is full width.
  - **Alphabet page:** the subtitle no longer says letters are arranged by where in the mouth they're pronounced. The inherent-"a" tip and the Conjuncts tab are gone, and conjuncts were removed from `lib/data.ts` and the alphabet quiz.
  - **Consonants** are grouped as the five vargas (कवर्गः … पवर्गः, five letters each), then the four semivowels, then the four sibilants (श ष स ह). The consonants tab opens with the owner's halanta note (क् … ङ् are written क … ङ) and ends with the 48-letter count: 13 vowels, 2 अयोगवाहौ, 33 consonants. The vowels tab still lists अं and अः, because the doc only asked for the note.
  - **Greetings vocabulary is exactly the doc's table**, with धन्यवादः corrected to धन्यवादाः. नमस्काराः / नमस्ते / प्रणामाः is a single card, so the English → Sanskrit quiz never offers one of them as a wrong answer for another.
  - **A new "Good Manners · शिष्टाचारः" category** holds the doc's second table plus the four words listed after it. क्षम्यताम् and पुनर्मिलामः moved there from Greetings.
  - **The doc's 17 greeting sentences** (`greetingSentences`) are a quiz source, "Greeting sentences". The doc asked for them "as Quiz", so they aren't shown on the Phrases page. The stray "।," in सुप्रभातम्, मान्ये। was fixed. Long quiz prompts use a smaller font so sentences fit on a phone.
- **A third owner document, `P-2_Numbers .docx`** (parent folder; its instructions are in romanized Telugu), replaced the Numbers vocabulary:
  - **Numbers 1–100** are `numberRows` in `lib/data.ts`, in the doc's order and spelling (it writes षड् विंशतिः, षट् त्रिंशत् with a space; keep that). Word IDs are `numbers:<n>`, not slug:translit, because 1–4 have three forms. Each word carries `numeral` ("१ (1)"), shown on the card and in the list.
  - **1–4 have masculine / feminine / neuter forms** (एकः / एका / एकम्) and only those four carry the doc's gender `note`, as it asked ("1 nundi 4 varaku"). It shows on the card back and in the word list.
  - Corrections made to the doc: 54's romanization catuḥpañcāśat → catuṣpañcāśat to match चतुष्पञ्चाशत्; the alternate forms for 19, 29, … 99 (एकोनविंशतिः etc.) were given romanizations the doc lacked and written as one word (the doc had एकोन विंशतिः but एकोनाशीतिः); two typos in the shloka (शंत → शत, लक्श → लक्ष). Every romanization was checked against `toIAST()`.
  - **The quiz** needs no new code: the Numbers category is already a source. "All words" now contains 100 numbers out of about 170 words, so it leans heavily on numbers; the owner hasn't said whether to exclude them.
  - **`largeNumbers`** (the shloka from the Līlāvatī, the "Based on this shloka … Bhaskaracharya" line and the 10¹–10¹⁷ table) renders in `LargeNumbers` at the bottom of the Numbers vocabulary page, under the word list, as the doc asked ("numbers ki krindi"). The table's English keeps the doc's crore/lakh and million/billion pairs.

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
