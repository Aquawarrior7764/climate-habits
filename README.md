# Climate Habits

A small website about two everyday habits that affect climate change: food (green) and transportation (blue).

To change words or pictures without coding, see [HOW-TO-EDIT.md](HOW-TO-EDIT.md).

The food page card game is in `css/climate-cards.css` and `js/climate-cards.js`. The card animation is adapted from open-source code; its credits and licenses are in [CARD-CREDITS.md](CARD-CREDITS.md) and the `licenses` folder.

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
