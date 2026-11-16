# Climate Habits

A small website about two everyday habits that affect climate change: **food** (green) and **transportation** (blue).

The **Food game** section now contains three interactive 3D sample cards. Open `food.html`, or use the preview server below. Move the mouse over a card for spring-based tilt and reflections; click/tap or press Enter/Space to flip it. Artwork and back text are deliberately placeholders. Both former game sections were empty placeholders, so there is no score/progression system yet.

### Preview the card version

No install or build step is needed: open `food.html` directly. For a server preview when this repository is inside the original `CODEX VER` workspace, run this from the repository folder:

```powershell
node ../server.mjs
```

When this repository is inside the original `CODEX VER` workspace, open [the Food cards preview](http://127.0.0.1:4173/climate-habits/food.html#food-game). Alternatively, open `food.html` directly, or serve this repository with any static server.

The card files are `css/climate-cards.css`, `js/climate-cards.js`, and the static card markup in `food.html`. Their GPL-3.0 attribution, exact upstream revision, adapted techniques, and intentional differences are recorded in [CARD-CREDITS.md](CARD-CREDITS.md). There are no new runtime dependencies. See [HOW-TO-EDIT.md](HOW-TO-EDIT.md) to replace the sample content using the existing editor.

### Card verification

Verified with Playwright 1.62.1 and installed Microsoft Edge on November 15, 2026 (Browser plugin unavailable). Checked desktop 1440 × 1000, phone emulation 390 × 844, and layout boundaries from 320–1440px, including the tablet column transitions. Checks covered mouse-driven tilt/glare, composed tilt and 180-degree flip, rapid reversals, independent cards, idle animation shutdown, keyboard Enter/Space, reduced motion, tap both ways, touch swipes that scroll without flipping, mobile navigation, the existing checklist's saving/reset, direct `file://` opening, no-JavaScript content, and image/back-text editing with actual HTML download saving. JavaScript syntax and `git diff --check` pass.

Compared the rendered live original with the adaptation at cursor position 85% / 20%: both produced the same rotation matrix, rotations −10° / −8.571°, glare position 85% / 20%, foil position 59.1% / 39.8%, and 600px perspective. The animation uses the original interaction and return spring parameters, with a separate flip spring and deliberately softer foil. Sample front/back text fits at tested widths.

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
