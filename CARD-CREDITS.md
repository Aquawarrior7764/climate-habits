# Food cards: source, license, and implementation

The Food card experience is an adaptation of [Pokémon Cards CSS](https://github.com/simeydotme/pokemon-cards-css), copyright (C) 2022 Simon Goellner (@simeydotme). It is distributed under **GNU GPL version 3**, without warranty. You may copy, modify, and redistribute this covered work under that license. The complete upstream license, including its copyright notice, is in [licenses/pokemon-cards-css-GPL-3.0.txt](licenses/pokemon-cards-css-GPL-3.0.txt).

Changes made for Climate Habits on **November 15, 2026**: vanilla JavaScript adaptation; scoped card styles; HTML front/back content; softer foil; independent spring-driven flip; fixed hit area; shared animation scheduler; reduced-motion, keyboard, touch, editor, print, and no-JavaScript behavior.

The combined Food card experience (`food.html`, `css/climate-cards.css`, and `js/climate-cards.js`) is provided under GPL-3.0-only. Keep this notice, the source headers, the in-page credits, and the license with copies. Publish the corresponding editable source under GPL-3.0 when distributing the adaptation, including future modified or bundled versions. These files are already the complete unminified source and are served directly, without a build step. This notice does not claim ownership of third-party artwork or relicense independent, unrelated website pages. Future artwork and educational text need their own appropriate permissions.

## Files studied and adapted

Upstream commit: `acb1197633e749a1fba4412231db2f6581586d00`.

- [`src/lib/components/Card.svelte`](https://github.com/simeydotme/pokemon-cards-css/blob/acb1197633e749a1fba4412231db2f6581586d00/src/lib/components/Card.svelte): cursor percentages; rotation of `-(x - 50) / 3.5` and `(y - 50) / 3.5`; background ranges 37–63% / 33–67%; glare position, opacity, distance from center; interaction springs `.066 / .25`; 500ms exit delay followed by `.01 / .06` soft return. The new flip uses the original popover spring settings `.033 / .45` on an independent nested axis, rather than the source's click-to-expand behavior.
- [`src/lib/helpers/Math.js`](https://github.com/simeydotme/pokemon-cards-css/blob/acb1197633e749a1fba4412231db2f6581586d00/src/lib/helpers/Math.js): clamp and linear range mapping, inlined in the adaptation.
- [`public/css/cards/base.css`](https://github.com/simeydotme/pokemon-cards-css/blob/acb1197633e749a1fba4412231db2f6581586d00/public/css/cards/base.css): 600px perspective, rotation order, trading-card aspect/radius, front/back transforms, shadows, pointer-position radial glare, blend modes.
- [`public/css/cards/regular-holo.css`](https://github.com/simeydotme/pokemon-cards-css/blob/acb1197633e749a1fba4412231db2f6581586d00/public/css/cards/regular-holo.css): moving rainbow/scanline composite, background multipliers, luminosity mask; reduced opacity and saturation, confined to the artwork area. Studied `cards.css`, `basic.css`, and `reverse-holo.css` for shared variables and alternatives.

The numeric spring integrator is adapted from [Svelte 3.52.0 `src/runtime/motion/spring.ts`](https://github.com/sveltejs/svelte/blob/v3.52.0/src/runtime/motion/spring.ts), copyright (c) 2016–22 the Svelte contributors, under MIT. Its complete notice is retained in [licenses/svelte-MIT.txt](licenses/svelte-MIT.txt). No Svelte runtime or framework dependency is shipped. Fixed 60Hz spring steps accumulated inside `requestAnimationFrame` keep the physics consistent on high-refresh displays and bound long-frame catch-up; only unsettled cards run.

No Pokémon images, logos, card backs, third-party foil textures, or remote image dependencies are included. `images/card-art-placeholder.svg` is a simple local placeholder created for this integration. Names, captions, and back paragraphs are samples for replacement, not finished educational content.

## Scope and intentional differences

The supplied repository had one branch (`main`) and one commit (`80af215`); both game sections were placeholders. The user selected Food for this foundation. There was no game score or progression system to migrate. Other pages, the checklist, and the editor are preserved. Cards emit a bubbling `climatecardflip` event with `detail.flipped` for future game integration; flipping itself does not award points or persist a score.

The motion reproduces the original pointer mapping, springs, perspective, and layered lighting. Differences: stable untransformed hit area to avoid cursor feedback; separate flip instead of zoom/popover; no gyroscope or automatic showcase; lighter, texture-free foil; zero animation under reduced motion. Touch keeps normal scrolling, pinch zoom, and tap-to-flip. All faces are available without JavaScript and in print. Edit mode exposes front and back together and pauses card motion.

Keep back copy concise enough for a trading card. Inspect longer titles and text on mobile after editing. The component is reusable: copy an entire `article[data-climate-card]`, use unique face IDs, and update its button's `aria-controls`. The script reads the title from the front at initialization and after editing, so label changes stay accessible.
