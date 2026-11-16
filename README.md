# Climate Habits

A small website about two everyday habits that affect climate change: **food** (green) and **transportation** (blue).

The **Food game** section contains three interactive 3D sample cards with image-only fronts and short backs. Open `food.html`, or use the preview server below. Move the mouse over a card for spring-based tilt and reflections. Click/tap or press Enter/Space to spin it into the center, enlarge it, and reveal its back. Click the card again, click outside, use the close button, or press Escape to return it to the deck. Artwork and back text are deliberately placeholders. Both former game sections were empty placeholders, so there is no score/progression system yet.

### Preview the card version

No install or build step is needed: open `food.html` directly. For a server preview when this repository is inside the original `CODEX VER` workspace, run this from the repository folder:

```powershell
node ../server.mjs
```

When this repository is inside the original `CODEX VER` workspace, open [the Food cards preview](http://127.0.0.1:4173/climate-habits/food.html#food-game). Alternatively, open `food.html` directly, or serve this repository with any static server.

The card files are `css/climate-cards.css`, `js/climate-cards.js`, and the static card markup in `food.html`. Their GPL-3.0 attribution, exact upstream revision, adapted techniques, and intentional differences are recorded in [CARD-CREDITS.md](CARD-CREDITS.md). [CREDITS-FOR-PAGE.txt](CREDITS-FOR-PAGE.txt) contains the separate attribution/licensing copy for a future credits page; it is currently absent from the game UI. Source copyright and license notices remain included. There are no new runtime dependencies. See [HOW-TO-EDIT.md](HOW-TO-EDIT.md) to replace the sample content using the existing editor.

### Card verification

Initial verification used Playwright 1.62.1 and installed Microsoft Edge on November 15, 2026 (Browser plugin unavailable). It covered mouse-driven tilt/glare, composed tilt and flip, rapid reversals, independent cards, idle animation shutdown, keyboard Enter/Space, reduced motion, mobile tapping and scrolling, navigation, the existing checklist's saving/reset, direct `file://` opening, no-JavaScript content, and image/back-text editing with actual HTML download saving. The November 16 revision replaces the in-place flip with the original-style spin, centering and enlargement. Its verification covers desktop 1440 × 1000, phone emulation 390 × 844, 320–1440px layout boundaries, modal focus, Escape/outside/card/close-button dismissal, responsive repositioning, rapid animation reversal, reduced-motion instant reveal, short back editing/saving, and removal of visible credits. JavaScript syntax and `git diff --check` pass.

Compared the rendered live original with the adaptation at cursor position 85% / 20%: both produced the same rotation matrix, rotations −10° / −8.571°, glare position 85% / 20%, foil position 59.1% / 39.8%, and 600px perspective. The animation uses the original interaction/return springs and `.033 / .45` popover springs, with a 1.75x scale cap and deliberately softer foil. It spins 540° to finish on the back; the source's 360° spin finishes on the front. Reduced-motion users get immediate centering and reveal. The native dialog contains focus and locks background scrolling until dismissed; page scrolling remains normal in the deck.

Fixed the editor's existing download fallback: its temporary download link now lives inside the editor, so edit mode's page-link blocker does not cancel Save. The card script is deferred from the HTML head so it is included in the editor's original-page snapshot and survives saving. Also exercised the normal folder-save path with in-memory file handles: image copying, saving text, preserving another editor's on-disk text, excluding runtime styles, and reloading/flipping the saved page all passed. The native folder picker itself was not automated. No JavaScript errors or relevant console warnings occurred; the pre-existing homepage's missing `favicon.ico` request was excluded. This is Chromium/Edge emulation, not physical-device or Safari/Firefox validation. Screenshots and temporary QA scripts are outside the repository.

**To change words or pictures without coding, see [HOW-TO-EDIT.md](HOW-TO-EDIT.md).**

## What's in here

```
index.html            Home page
food.html             Food page
transportation.html   Transportation page
css/styles.css        Colors, fonts and layout for every page
js/main.js            Phone menu and the checklist
js/editor.js          The "✎ Edit this page" tool (only shows up on your own computer)
images/               Pictures
EDIT-SITE.bat         Opens the site for editing (Windows)
PUBLISH.bat           Puts your saved changes online (Windows, needs Git)
```

## Changing things by hand

- **Text:** open an `.html` file in Notepad or VS Code and change the words between the tags. Leave the `<tags>` alone.
- **Colors:** change the hex codes in the `:root` block at the top of `css/styles.css`. `--food-deep` is the main green and `--move-deep` the main blue; everything green or blue on the site follows them.
- **Section colors:** `class="theme-food"` makes a section green, `theme-move` blue, `theme-mix` plain.
- **Checklist:** each item in `index.html` is one `<label>…</label>` line with its own `id` (like `food-1`). Copy a line, change the words and give it a new id. The counter adjusts by itself. Ticks are remembered in the visitor's own browser only.
