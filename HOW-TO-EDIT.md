# How to edit the website (no coding)

Live site: https://aquawarrior7764.github.io/climate-habits/
(After the move to Emma's GitHub it becomes `https://HER-USERNAME.github.io/climate-habits/`.)

## Working at the same time

You can both edit at the same time, even the same page. GitHub combines your changes automatically as long as you didn't change **the same sentence**. Three habits keep it smooth:

1. **Get the latest version before you start** (step 1 below).
2. **Publish when you finish**, and don't leave edits sitting unpublished for hours.
3. **Text each other before rewriting the same section** ("I'm doing the Food facts").

If you did both change the same sentence, nothing breaks and nothing is lost: publishing stops and tells you. Jake can sort it out.

## Change words or pictures

1. **Get the latest version:**
   - **Jake:** double-click **EDIT-SITE.bat**. It gets the latest version, then opens the site in Edge.
   - **Emma:** in GitHub Desktop click **Fetch origin**, then **Pull origin** if it appears. Then click **Repository → Show in Explorer** (Mac: **Show in Finder**) and open `index.html` in **Chrome or Edge**.
2. Click the yellow **✎ Edit this page** button in the bottom-right corner.
3. **Words:** click any text and type. Everything you can edit gets a dotted yellow outline.
   - **Ctrl + B** (Mac: Cmd + B) is bold, **Ctrl + I** is italic.
   - **Shift + Enter** starts a new line. Plain Enter does nothing, so it can't break the layout.
   - Pasting from Google Docs keeps the words and drops the formatting.
   - Blank-looking lines are empty spots waiting for text: click them and type.
4. **Pictures:** click a picture, then **Choose new picture…**.
5. **Button links:** click inside a button. A "Link goes to" box appears at the bottom.
6. Click **Save** (or Ctrl + S / Cmd + S).
   - **The first time**, the browser asks which folder the website is in. Choose the folder with `index.html` in it, then click **Edit files** / **Allow**.
   - New pictures are copied into the `images` folder automatically.
7. Click **Done**. For the Food or Transportation page, go there with the menu and click **✎ Edit this page** there. Each page saves separately.

## Put your changes online

- **Jake:** double-click **PUBLISH.bat**. When it says **Done**, the live site updates in about a minute.
- **Emma:** in GitHub Desktop, type a short note in the **Summary** box at the bottom left (like "food facts"), click **Commit to main**, then **Push origin**. If it says to pull first, click **Pull origin**, then **Push origin**.

## One-time setup: moving the site to Emma's GitHub

**Emma:**
1. Make a free account at github.com and send Jake your username.
2. Install **GitHub Desktop** (desktop.github.com) and sign in with that account.

**Jake:**
3. On https://github.com/Aquawarrior7764/climate-habits go to **Settings**, scroll to the bottom (**Danger Zone**), click **Transfer ownership**, and type Emma's username.

**Emma:**
4. Accept the transfer email.
5. In the repo on github.com: **Settings → Collaborators → Add people → Jake's username**, so Jake can still publish. Jake accepts the invite email.
6. In the repo on github.com: **Settings → Pages**. Check that it says "Deploy from a branch", branch **main**, folder **/ (root)**. Click **Save** if it doesn't. The new site address appears at the top of that page within a few minutes.
7. In GitHub Desktop: **File → Clone repository**, pick **climate-habits**, choose where to put it, and click **Clone**.

**Jake:**
8. Tell Claude her username, so it can point your copy and this guide at the new address.

The old address (`aquawarrior7764.github.io/...`) stops working after the move. Share the new one.

## Good to know

- The **✎ Edit this page** button only appears when the file is opened from a computer. Visitors to the live site never see it.
- If you close the tab before saving, the browser warns you.
- **Made a mistake?** Every published version is kept on GitHub, so an older one can be brought back.
- **Can't do here:** add or remove whole sections, add new bullet points, or change colors. Those need the code (see README.md).
- **Firefox or Safari:** Save downloads the page instead of saving it. Move the downloaded file into the website folder, replacing the old one. Chrome or Edge is easier.
