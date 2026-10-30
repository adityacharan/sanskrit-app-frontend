@AGENTS.md

# Learn Sanskrit — frontend

Next.js 16 web app for learning Sanskrit (alphabet, vocabulary, grammar, phrases and shlokas, quizzes). Owner's GitHub: `adityacharan`. Repo: `adityacharan/sanskrit-app-frontend`, branch `main`.

## Scope and product decisions

- **Frontend only, mock data.** The owner explicitly said no backend for now. All content is in `lib/data.ts`. Progress (XP, learned words, quiz best scores, streak) is in `localStorage` via `lib/progress.ts`. Don't add API routes, databases or auth providers unless asked.
- **The login is a placeholder, but it gates the app** (the owner asked for this). `proxy.ts` (Next 16's renamed middleware) redirects every page to `/login?next=…` until the `sanskrit_session` cookie exists, and redirects `/login` to `/` once it does. The Login button calls `logIn()` from `lib/session.ts` (a one-year cookie) and then `router.replace(safeNext(next))`. Account menu → Log out calls `logOut()` and does a full reload to `/login`. It's a cookie, not localStorage, so the redirect happens on the server with no flash of the app. `safeNext` only allows same-site paths, which blocks open redirects through `?next=//evil`.
- **Branding on the login page:** the logo is the owner's Chandravidya (चन्द्रविद्या) Saraswati emblem, `public/logo.png`, with the quote **श्रद्धावान् लभते ज्ञानम्** under it. The same emblem sits next to the संस्कृतम् wordmark in the nav bar. The heading says "Learn Sanskrit". The Sanskrit line is **संस्कृतं पठतु** (saṃskṛtaṃ paṭhatu) — the owner corrected this from पठामः, so don't change it back. The tagline is "From simple letters to beautiful poems, one step at a time." The owner asked for the "An initiative by Jaganmohini" footer to be removed, so the login content is centred with no footer.
- The owner cares about Sanskrit accuracy. Use IAST romanization and double-check forms before adding content.
- **Verb content comes from two owner documents**, `Sanskrit_20_Dhatus_All_Persons.docx` and `P_2-Verbs.docx` (parent folder, outside the repo; the second is in romanized Telugu). The owner asked for exactly the changes in them and nothing more, so follow them closely when they're updated. Verbs live in `lib/verbs.ts` (re-exported from `lib/data.ts`):
  - **The 20 dhatus of the first doc, in its order, then 12 more** (वस् … पूज्, 32 verbs in all) because the second doc said to add any other commonly used verbs. Every verb has **all ten lakaras** (लट्, लिट्, लुट्, लृट्, लोट्, लङ्, विधिलिङ्, आशीर्लिङ्, लुङ्, लृङ्, in the doc's order) with nine forms each. `verb(...)` builds them from stems (present stem, augmented stem, future stem, लुट् 3rd sg, लिट् strong/weak/2nd-sg, the aorist type, the आशीर्लिङ् stem); कृ, श्रु, दा, अस् and the awkward लिट्/लुङ् tables are written out. The generated लट् forms were checked equal to the first doc's tables. Where grammar allows two forms (अपठीत्/अपाठीत्, जगमिथ/जगन्थ, अद्राक्षीत्/अदर्शत्, कथयामास/कथयाञ्चकार) one textbook form was chosen.
  - **अस् has forms only in लट्, लङ्, लोट्, विधिलिङ्** (Pāṇini 2.4.52: भू replaces it elsewhere). The Grammar page shows a note and भू's forms for the other lakaras. अस् is labelled "to be / to become" because the first doc says so; strictly it's just "to be", undecided.
  - **Only लट्, लृट्, लङ्, लोट्, विधिलिङ् are on the Grammar page** (`basicLakaras`); लिट्, लुट्, आशीर्लिङ्, लुङ्, लृङ् are in Advanced Grammar (`advancedLakaras`), per General Update_1. Both pages use `VerbsSection` from `components/grammar.tsx`.
  - **The verbs tab** has the verb flashcard and list, a lakara dropdown, then **three separate blocks, 1st, 2nd, 3rd person** (the second doc asked for the persons "separately"; the data still stores forms as [3rd, 2nd, 1st] like the first doc). Each block lists sg/du/pl and, for लट्, लृट्, लङ्, लोट्, विधिलिङ्, that person's example sentences from `sentence()` with the doc's 15 subjects. The note on persons and numbers sits under the blocks, for every verb.
  - **Examples / sentences:** `sentence(verb, lakara, subject)` builds "अहं पठामि। I read." style lines; subjects switch to अहम्, त्वम् before a vowel (अहम् अस्मि). English per lakara: present uses the `english` triple, लृट् "will", लङ् "was/were + -ing" (`ing`), लोट् "Let … / (You) …!", विधिलिङ् "should". अस् has `base: "be"` and `past`.
  - **Quiz:** see the quiz bullet under General Update_1. The sentence quiz uses only masculine pronouns, सा, and nouns, because "They" would otherwise match ते/ताः/तानि.
  - **The Verbs vocabulary category was removed** by the second doc ("Remove Verbs Section and button in Words"). Don't bring it back.
- **A second owner document, `Changes P-1.docx`** (also in the parent folder), made these changes. Don't bring back what it removed:
  - **Logo and quote:** see the branding bullet above.
  - **No Word of the Day on the home page.** The hero card is full width.
  - **Alphabet page:** the subtitle no longer says letters are arranged by where in the mouth they're pronounced. The inherent-"a" tip and the Conjuncts tab are gone, and conjuncts were removed from `lib/data.ts` and the alphabet quiz.
  - **Consonants** are grouped as the five vargas (कवर्गः … पवर्गः, five letters each), then the four semivowels, then the four sibilants (श ष स ह). See General Update_1 and _2 below for the vowels tab and the notes.
  - **Greetings vocabulary is exactly the doc's table**, with धन्यवादः corrected to धन्यवादाः. नमस्काराः / नमस्ते / प्रणामाः is a single card, so the English → Sanskrit quiz never offers one of them as a wrong answer for another.
  - **A new "Good Manners · शिष्टाचारः" category** holds the doc's second table plus the four words listed after it. क्षम्यताम् and पुनर्मिलामः moved there from Greetings.
  - **The doc's 17 greeting sentences** (`greetingSentences`) are a quiz source, "Greeting sentences". The doc asked for them "as Quiz", so they aren't shown on the Phrases page. The stray "।," in सुप्रभातम्, मान्ये। was fixed. Long quiz prompts use a smaller font so sentences fit on a phone.
- **A third owner document, `P-2_Numbers .docx`** (parent folder; its instructions are in romanized Telugu), replaced the Numbers vocabulary:
  - **Numbers 1–100** are `numberRows` in `lib/data.ts`, in the doc's order and spelling (it writes षड् विंशतिः, षट् त्रिंशत् with a space; keep that). Word IDs are `numbers:<n>`, not slug:translit, because 1–4 have three forms. Each word carries `numeral` ("१ (1)"), shown on the card and in the list.
  - **1–4 have masculine / feminine / neuter forms** (एकः / एका / एकम्). Each card back shows only its own number's example (`example`: द्वौ बालकौ, द्वे बालिके, द्वे फले for 2). The gender note (`numberGenderNote`) shows separately under the number 1 card only, styled like the consonant note, per General Update_2.
  - The numeral (`Numeral`: the Devanagari digit in Tiro, "(n)" in Inter) is centred above the word on the card at text-2xl (the Ordinal Numbers doc asked to move it from the corner and enlarge it), and in a fixed-width badge in the full list.
  - Corrections made to the doc: 54's romanization catuḥpañcāśat → catuṣpañcāśat to match चतुष्पञ्चाशत्; the alternate forms for 19, 29, … 99 (एकोनविंशतिः etc.) were given romanizations the doc lacked and written as one word (the doc had एकोन विंशतिः but एकोनाशीतिः); two typos in the shloka (शंत → शत, लक्श → लक्ष). Every romanization was checked against `toIAST()`.
  - **The quiz** needs no new code: the Numbers category is already a source. "All words" now contains 100 numbers out of about 170 words, so it leans heavily on numbers; the owner hasn't said whether to exclude them.
  - **`largeNumbers`** (the shloka from the Līlāvatī, the "Based on this shloka … Bhaskaracharya" line and the 10¹–10¹⁷ table) was moved to Advanced Grammar → Numbers by General Update_1. The table's English keeps the doc's crore/lakh and million/billion pairs.

- **Three more owner documents (2026-10-29):** `General Upadte_1.docx`, `Sarvanam sabd.docx`, `Ordinal Numbers.docx` (parent folder):
  - **One layout for every learning section** (Alphabet, Words, Grammar nouns/verbs/pronouns, Advanced verbs/large numbers/ordinals): a flashcard at the top (`Deck`), then a one-line preview of all items with a "See all (N)" toggle (`PreviewList`, `components/deck.tsx`). The full list can be grouped (vargas, pronoun sections). Notes and tables come after.
  - **Alphabet:** अं and अः were removed from the vowels into their own tab (`ayogavahas`, अयोगवाहौ), so the 48-letter count still matches what's shown. The card front is the letter; the back is its example word (the doc asked for the word on the card instead of beside it). General Update_2 replaced the note on the ह card with the halanta note and removed it from the rest of the consonants tab, so the 48-letter count is no longer shown.
  - **The nav has seven links**, which don't fit the desktop bar below 768px, so the bottom tab bar is used up to `md` (it was `sm`). The 🔥 streak pill shows from `lg`, and the header items are `whitespace-nowrap`, or the pills wrap between 768 and ~815px.
  - **Quizzes never mix question types** within one run (prompt and option sizes would jump). Topics smaller than the quiz repeat items in the same type instead.
  - **Advanced Grammar** (`/advanced`, in the nav as "Advanced"): Verbs (the five advanced lakaras) and Numbers with two buttons, Large numbers · महासङ्ख्याः and Ordinal numbers · पूरणसङ्ख्याः. The Ordinal doc also asked for "1–100, large, ordinal" as separate sections with their own buttons; 1–100 stayed as Words → Numbers, so each of the three now has its own section. The owner hasn't confirmed this reading.
  - **Ordinals** (`lib/ordinals.ts`) are built from stems and were machine-checked against all 101 rows of the doc; they match except four doc typos that were corrected: 46th neuter (doc repeats 45th), 50th neuter (a Latin "a" inside the Devanagari), 63rd feminine and neuter (द्वि for त्रि). Spacing follows the doc (षट् षष्टः but षट्त्रिंशः). Feminine is -ā for 1–3, तुरीया/तुर्या and -तम stems, -ī otherwise.
  - **Pronouns** (`lib/pronouns.ts`): every word in the doc is declined in seven cases × three numbers per gender, in the doc's five sections with its notes. General Update_2 added every second form to the tables, as "माम् / मा" in one cell (enclitic मा, मे, नौ, नः, त्वा, ते, वाम्, वः; ablative मत्तः etc.; एनम्-series for एतद् and इदम्). Every form in the noun, pronoun and verb tables shows its IAST underneath (`FormCell`). एक is singular only and उभय has no dual (shown as "—", which practice mode and quizzes skip). उभय's feminine is उभयी, declined like नदी; worth the owner checking. The doc's "This indicate" was corrected to "These indicate".
  - **Quiz** (`lib/quizzes.ts`): each word, phrase, alphabet, number topic's items, in order, are split into parts of at most 10 (even sizes); a part asks each of its items once and tops up to 10 marks with review items from the rest of the topic, or with the same items in another question type when the topic has fewer than 10. Finishing every part (in any question type) unlocks a 20-mark Grand Test drawn evenly from all parts. Progress keys are `q/<topic>/<part>/<mode>` in `bestScores`. Verbs, pronouns and nouns work differently; see General Update_2. Wrong options never include an answer that is also right for the prompt elsewhere in the topic. Ordinals are quizzed in all three genders (33 parts: masculine, then feminine, then neuter), with the same ordinal's other genders as the first wrong options.

- **`General Upadte_2.docx` (2026-10-30, parent folder):**
  - **Grammar → "Śabda by ending"** is the doc's separate section (`lib/nouns.ts`, `SabdaSection`): gender tabs, then ending tabs (Akārānta, Ikārānta …), then the usual card, list and table. 113 words, each declined in eight cases by ending tables with a `natva` helper for ण (पुत्रेण, but ऋतुना). The old Nouns tab (राम, फल, लता) stays, but its quiz is gone. Doc typos corrected: शश्रू → श्वश्रू, Sikshakah, Gajah, "Elepahant", and the first "eekārānta Streeliṅga" heading (मतिः etc. are Ikārānta). बालः had no meaning in the doc; "Boy / Child" was supplied. रिपुः / शत्रुः and तरुणी / युवती are two entries each so each has its own table. Exceptions have their own tables: पितृ, भ्रातृ, जामातृ (short vowel) vs कर्तृ etc.; स्वसृ; भू, भ्रू; अक्षि, दधि; the adjectives शुचि, मृदु.
  - **Family** is the doc's table and list merged with no word repeated, 47 cards in order of relation, titled परिवारः. The rows are `[deva, meaning]`, with IAST from `toIAST`. Corrected: भातृजा → भ्रातृजा, भर्तṛ → भर्ता. Three quizzes (`evenParts`) and the default Grand Test.
  - **Flashcard English starts with a capital:** `capFirst` in `cat()`, numbers, letter examples and on the other card backs. Lists and quiz options for vocabulary follow, because the data itself is capitalised.
  - **Greetings and Good Manners are one quiz topic.** The Greeting sentences topic stays; the doc didn't mention it.
  - **Verb, pronoun and noun quizzes** (mode `form`) show only the word, with no question text, root, gender or lakara, and Sanskrit options. A `Part` with `marks` draws that many different words at random, taking turns between words (`draw`), so no question repeats in a test. `grands` on a topic gives named Grand Tests. Cells become questions in `formItems`: both forms of a two-form cell are asked, and a word in several cells is one question naming them all.
    - **Verbs:** 10 tests, one per lakara, 20 questions (one per `changingVerbs` entry), answered with person and number. 3 Grand Tests of 30 (one person each, so they share nothing), 3 questions per lakara, answered with the lakara. `changingVerbs` is our reading of "verbs which are changing their form differently": 20 verbs whose stem changes between lakaras; पठ्, हस्, खाद् etc. only change endings. The owner hasn't confirmed the list.
    - **Nouns:** `Noun endings` has three 20-question tests (masculine, feminine, neuter): given the word, name its ending. `Pumliṅga`, `Strīliṅga`, `Napuṃsakaliṅga Śabda` each have a test per ending (20) and a Grand Test (30). `All Śabda` is one 30-mark Grand Test, open from the start.
    - **Pronouns:** one test per pronoun (up to 20; एक has 13 distinct forms), all genders together; 3 Grand Tests of 30 that share no word.
    - Verb topics by lakara, the Nouns topic and per-section pronoun topics are gone, so don't bring them back. These tests hide the title line in the question header, because it would name the lakara, root or gender.
  - **Everyday sentences** (`lib/spoken.ts`): 100 sentences in ten situations, with sandhi kept simple so each word is a tile (नास्ति is the one joined form), shown on the Phrases page after the original 10. The quiz (`toEnglish`, `toSanskrit`) is a tile builder (`SentenceBuilder`) with four wrong tiles per question. English needs the exact order; Sanskrit accepts any order of the right words, because word order is free.

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

- **Text sizes must match across a set.** The owner noticed "the letters sizes are not equal". A flashcard deck uses one size for every card (`cardSize`: 4xl if any word in the category is over 12 characters, else 6xl), and a quiz uses one prompt size for all ten questions (`promptSize`). Never size a card or prompt by its own length. Verb chips match the noun chips (root text-xl, romanization text-sm, meaning text-xs). Example sentences are text-xl / text-sm everywhere. Grid columns of unequal content need `items-start`, or short blocks stretch into empty boxes. Check with screenshots at deviceScaleFactor 2 before committing.

- **Word IDs are `${slug}:${translit}`**, and learned progress stores those IDs in `localStorage`. Renaming or moving a word leaves its old ID behind, so count learned words against `allWords` (as Home and the account menu do), never `progress.learned.length`.

- **Dropdown selection must fire once.** A mouse release on an item selects it (`pointerup`), and the `click` that follows must not select again. `isOpen` is a ref, updated synchronously, that guards `choose()`. Item `onClick` must stay unconditional, because programmatic and assistive-tech clicks arrive without a preceding `pointerdown`.
- **Press vs tap:** commit on `pointerdown` only for `pointerType === "mouse"`. Touch must wait for `click`, or starting a scroll selects things. `Tabs` and `Dropdown` track the last pointer type in a ref, so a mouse press and its click don't toggle twice.
- **Never define components inside a component body** (e.g. a `Cell` in grammar). They remount on every render and kill animations. Grammar uses the module-level `FormCell` for this reason.
- **`AnimatePresence mode="popLayout"`** needs children that forward refs. The flashcards use the default mode with absolutely positioned cards instead.
- **Selection layers using `-z-10`** inside a tile need `relative isolate` on the tile, or they vanish behind its background on touch devices (where `[data-spotlight]` doesn't set `isolation`).

## Verifying UI changes

Typecheck and build, then drive the app with headless Chrome (`/usr/bin/google-chrome`) using `puppeteer-core` installed in a scratch directory, not in this project. Click through the flows: dropdown press-drag-release and keyboard, flashcard swipe, quiz, grammar reveal, account menu, mobile width (390px) with no horizontal overflow. Also test the login gate in a fresh browser context. Set the `sanskrit_session` cookie first for the other flows, or every page redirects to `/login`. Take screenshots and look at them. The expected baseline is no console errors apart from the favicon 404.
