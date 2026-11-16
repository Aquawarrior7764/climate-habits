/* =====================================================================
   CLIMATE HABITS — page editor
   ---------------------------------------------------------------------
   Lets you change the words and pictures by clicking on them, then
   saves the changes straight back into the .html file.

   It only loads when the site is opened from your own computer
   (see the top of js/main.js). Visitors to the live site never see it.

   You should not need to change anything in this file.
   ===================================================================== */
(function () {
  'use strict';

  // Which parts of the page can be edited
  var EDITABLE = 'h1,h2,h3,h4,p,li,figcaption,legend,a.btn,a.brand,label > span';
  var SKIP = '#site-editor, #site-editor *, #remind-status, #checkin, #checkin *';
  // These stay on one line (Enter does nothing)
  var SINGLE_LINE = 'h1,h2,h3,h4,a,legend,label > span,figcaption';

  var pageName = decodeURIComponent(location.pathname.split('/').pop()) || 'index.html';
  var original = window.__ORIGINAL_HTML__;
  var editing = false;
  var editables = [];
  var dirtyText = new Set();     // positions of changed text blocks
  var dirtyImages = new Map();   // position -> { file, name }
  var folder = null;             // the website folder, once chosen
  var currentImg = null;
  var currentLink = null;

  /* ---------- Finding editable parts ---------- */
  function listEditables(root) {
    var all = Array.prototype.filter.call(root.querySelectorAll(EDITABLE), function (el) {
      return !el.matches(SKIP);
    });
    var set = new Set(all);
    // Skip anything sitting inside another editable block
    return all.filter(function (el) {
      for (var p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false;
      return true;
    });
  }
  function listImages(root) {
    return Array.prototype.filter.call(root.querySelectorAll('img'), function (img) {
      return !img.matches(SKIP);
    });
  }
  function editableFor(node) {
    var el = node && (node.nodeType === 1 ? node : node.parentElement);
    while (el && editables.indexOf(el) === -1) el = el.parentElement;
    return el;
  }

  /* ---------- The editor's own buttons and panels ---------- */
  var style = document.createElement('style');
  style.textContent = [
    '#se-toggle{position:fixed;right:16px;bottom:16px;z-index:9999;padding:12px 18px;border:0;border-radius:999px;background:#f2b705;color:#12201c;font:700 15px system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.3);cursor:pointer}',
    '#se-bar{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:10px 16px;background:#fff8d6;border-top:3px solid #f2b705;color:#12201c;font:15px/1.4 system-ui,sans-serif}',
    '#se-bar[hidden],#se-img[hidden],#se-link[hidden],#se-toggle[hidden]{display:none}',
    '#se-bar .se-grow{flex:1 1 260px}',
    '#se-link input{width:min(320px,60vw);font:inherit;padding:4px 6px}',
    '#site-editor button.se-btn{font:700 14px system-ui,sans-serif;padding:8px 14px;border-radius:999px;border:2px solid #12201c;background:#12201c;color:#fff;cursor:pointer}',
    '#site-editor button.se-btn.se-light{background:#fff;color:#12201c}',
    '#se-img{position:fixed;right:16px;bottom:84px;z-index:9999;width:min(340px,calc(100% - 32px));padding:16px;background:#fff;border:3px solid #f2b705;border-radius:14px;color:#12201c;font:15px/1.4 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25)}',
    '#se-img textarea{width:100%;min-height:70px;font:inherit;margin:4px 0 10px}',
    '#se-img .se-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}',
    '#se-crop label{display:block;margin-top:6px}#se-crop input[type=range]{width:100%}',
    'body.se-editing{padding-bottom:90px}',
    '.se-editing [contenteditable="true"]{outline:1px dashed #f2b705;outline-offset:2px;cursor:text}',
    '.se-editing [contenteditable="true"]:hover{outline:2px dashed #f2b705}',
    '.se-editing [contenteditable="true"]:focus{outline:3px solid #f2b705}',
    '.se-editing img{cursor:pointer}',
    '.se-editing img:hover,.se-editing img.se-picked{outline:4px solid #f2b705;outline-offset:-4px}'
  ].join('\n');
  document.head.appendChild(style);

  var ui = document.createElement('div');
  ui.id = 'site-editor';
  ui.innerHTML =
    '<button type="button" id="se-toggle">✎ Edit this page</button>' +
    '<div id="se-bar" hidden role="region" aria-label="Page editor">' +
      '<span class="se-grow"><strong>Editing.</strong> <span id="se-status">Click any text to change it. Click a picture to replace it.</span></span>' +
      '<label id="se-link" hidden>Link goes to: <input type="text" id="se-link-input" spellcheck="false"></label>' +
      '<button type="button" class="se-btn" id="se-save">Save</button>' +
      '<button type="button" class="se-btn se-light" id="se-done">Done</button>' +
    '</div>' +
    '<div id="se-img" hidden role="dialog" aria-label="Picture settings">' +
      '<strong>Picture</strong>' +
      '<div class="se-row"><button type="button" class="se-btn" id="se-img-choose">Choose new picture…</button></div>' +
      '<input type="file" id="se-img-file" accept="image/*" hidden>' +
      '<div id="se-crop" hidden>' +
        '<p style="margin:12px 0 0"><strong>Which part of the picture shows on the card</strong></p>' +
        '<label>Left ↔ Right <input type="range" id="se-crop-x" min="0" max="100" step="1"></label>' +
        '<label>Top ↔ Bottom <input type="range" id="se-crop-y" min="0" max="100" step="1"></label>' +
        '<div class="se-row"><button type="button" class="se-btn se-light" id="se-crop-reset">Back to center</button></div>' +
      '</div>' +
      '<p style="margin:10px 0 0"><label for="se-img-alt">Description for screen readers (alt text):</label></p>' +
      '<textarea id="se-img-alt"></textarea>' +
      '<div class="se-row"><button type="button" class="se-btn se-light" id="se-img-close">Close</button></div>' +
    '</div>';
  document.body.appendChild(ui);

  var $ = function (id) { return document.getElementById(id); };
  var toggleBtn = $('se-toggle'), bar = $('se-bar'), statusEl = $('se-status');
  var linkLabel = $('se-link'), linkInput = $('se-link-input');
  var imgPanel = $('se-img'), imgFile = $('se-img-file'), imgAlt = $('se-img-alt');
  var cropBox = $('se-crop'), cropX = $('se-crop-x'), cropY = $('se-crop-y');

  function setStatus(text) { statusEl.textContent = text; }
  function hasChanges() { return dirtyText.size > 0 || dirtyImages.size > 0; }
  function markText(el) {
    if (!el) return;
    dirtyText.add(editables.indexOf(el));
    setStatus('You have unsaved changes. Click Save when you are ready.');
  }

  /* ---------- Turning edit mode on and off ---------- */
  function startEditing() {
    editing = true;
    editables = listEditables(document);
    editables.forEach(function (el) { el.contentEditable = 'true'; el.spellcheck = true; });
    document.body.classList.add('se-editing');
    toggleBtn.hidden = true;
    bar.hidden = false;
  }
  function stopEditing() {
    if (hasChanges() && !confirm('You have changes that are not saved yet. Stop editing anyway?\n\n(They stay on screen until you reload, but they are not in the file.)')) return;
    editing = false;
    editables.forEach(function (el) { el.removeAttribute('contenteditable'); el.removeAttribute('spellcheck'); });
    document.body.classList.remove('se-editing');
    closeImagePanel();
    linkLabel.hidden = true;
    bar.hidden = true;
    toggleBtn.hidden = false;
  }
  toggleBtn.addEventListener('click', startEditing);
  $('se-done').addEventListener('click', stopEditing);

  /* ---------- Typing ---------- */
  document.addEventListener('input', function (e) {
    if (!editing || ui.contains(e.target)) return;
    markText(editableFor(e.target));
  });

  // Enter does not make new paragraphs (it would break the layout).
  // Shift + Enter makes a line break inside a paragraph.
  document.addEventListener('keydown', function (e) {
    if (!editing || e.key !== 'Enter' || ui.contains(e.target)) return;
    var el = editableFor(e.target);
    if (!el) return;
    e.preventDefault();
    if (e.shiftKey && !el.matches(SINGLE_LINE)) document.execCommand('insertLineBreak');
  });

  // Pasting keeps the words but drops formatting from Word / Google Docs
  document.addEventListener('paste', function (e) {
    if (!editing || ui.contains(e.target) || !editableFor(e.target)) return;
    e.preventDefault();
    var text = (e.clipboardData || window.clipboardData).getData('text/plain').replace(/\s*\n+\s*/g, ' ');
    document.execCommand('insertText', false, text);
  });

  // While editing, clicking a link or checkbox should not follow it / tick it
  document.addEventListener('click', function (e) {
    if (!editing || ui.contains(e.target)) return;
    if (e.target.closest('a, label')) e.preventDefault();
    var img = e.target.closest('img');
    if (img) openImagePanel(img);
  }, true);

  /* ---------- Links ---------- */
  document.addEventListener('selectionchange', function () {
    if (!editing) return;
    var sel = document.getSelection();
    var node = sel && sel.anchorNode;
    if (!node || ui.contains(node)) return; // typing in the link box itself
    var el = node.nodeType === 1 ? node : node.parentElement;
    var link = el && el.closest('a');
    if (link && editableFor(link)) {
      currentLink = link;
      linkInput.value = link.getAttribute('href') || '';
      linkLabel.hidden = false;
    } else {
      currentLink = null;
      linkLabel.hidden = true;
    }
  });
  linkInput.addEventListener('input', function () {
    if (!currentLink) return;
    currentLink.setAttribute('href', linkInput.value.trim());
    markText(editableFor(currentLink));
  });

  /* ---------- Pictures ---------- */
  function openImagePanel(img) {
    if (currentImg) currentImg.classList.remove('se-picked');
    currentImg = img;
    img.classList.add('se-picked');
    imgAlt.value = img.getAttribute('alt') || '';
    // Crop sliders only for card pictures, which are cut to the card's shape.
    cropBox.hidden = !img.matches(CROPPABLE);
    var pos = readCrop(img);
    cropX.value = pos[0];
    cropY.value = pos[1];
    imgPanel.hidden = false;
  }

  /* ---------- Card picture crop ----------
     Card pictures fill a tall card shape, so wide photos get cut off.
     The sliders choose which part stays visible (CSS object-position). */
  var CROPPABLE = '.climate-card__art';
  function readCrop(img) {
    var m = (img.style.objectPosition || '').match(/(-?[\d.]+)%\s+(-?[\d.]+)%/);
    return m ? [Math.round(+m[1]), Math.round(+m[2])] : [50, 50];
  }
  function setCrop(x, y) {
    if (!currentImg) return;
    if (+x === 50 && +y === 50) currentImg.style.removeProperty('object-position');
    else currentImg.style.objectPosition = x + '% ' + y + '%';
    if (!currentImg.getAttribute('style')) currentImg.removeAttribute('style');
    markImage(currentImg);
  }
  function closeImagePanel() {
    if (currentImg) currentImg.classList.remove('se-picked');
    currentImg = null;
    imgPanel.hidden = true;
  }
  function imageIndex(img) { return listImages(document).indexOf(img); }
  function markImage(img, info) {
    var i = imageIndex(img);
    var existing = dirtyImages.get(i) || {};
    dirtyImages.set(i, Object.assign(existing, info || {}));
    setStatus('You have unsaved changes. Click Save when you are ready.');
  }

  $('se-img-close').addEventListener('click', closeImagePanel);
  cropX.addEventListener('input', function () { setCrop(cropX.value, cropY.value); });
  cropY.addEventListener('input', function () { setCrop(cropX.value, cropY.value); });
  $('se-crop-reset').addEventListener('click', function () {
    cropX.value = cropY.value = 50;
    setCrop(50, 50);
  });
  $('se-img-choose').addEventListener('click', function () { imgFile.click(); });
  imgAlt.addEventListener('input', function () {
    if (!currentImg) return;
    currentImg.setAttribute('alt', imgAlt.value);
    markImage(currentImg);
  });
  imgFile.addEventListener('change', function () {
    var file = imgFile.files[0];
    if (!file || !currentImg) return;
    var img = currentImg;
    img.removeAttribute('srcset');
    img.onload = function () {
      img.setAttribute('width', img.naturalWidth);
      img.setAttribute('height', img.naturalHeight);
      img.onload = null;
    };
    img.src = URL.createObjectURL(file);
    markImage(img, { file: file, name: cleanFileName(file.name), saved: false });
    imgFile.value = '';
    imgAlt.focus();
    setStatus('New picture added. Update the description below it, then click Save.');
  });

  function cleanFileName(name) {
    var clean = name.toLowerCase().replace(/[^a-z0-9.\-]+/g, '-').replace(/-+/g, '-').replace(/^-|-(?=\.)/g, '');
    return clean || 'picture.jpg';
  }
  function toDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  /* ---------- Building the new .html file ---------- */
  // Start from the page exactly as it is in the file, then copy across
  // only the parts you changed. Everything else stays untouched.
  // baseHtml is the newest copy of the file on disk, if we could read it.
  // That way, if the other person's changes arrived (via Get latest) while
  // this page was open, saving keeps their changes instead of undoing them.
  async function buildHtml(useFolder, baseHtml) {
    var doc = new DOMParser().parseFromString(baseHtml || original, 'text/html');

    // Remove anything a browser extension may have slipped in
    Array.prototype.forEach.call(doc.querySelectorAll('*'), function (el) {
      if (el.tagName.indexOf('-') !== -1) el.remove();
    });
    Array.prototype.forEach.call(doc.querySelectorAll('script'), function (s) {
      if (!/^js\//.test(s.getAttribute('src') || '')) s.remove();
    });

    var docEditables = listEditables(doc);
    if (baseHtml && (docEditables.length !== editables.length ||
        listImages(doc).length !== listImages(document).length)) {
      return buildHtml(useFolder);   // file layout changed too much; fall back to the page as loaded
    }
    if (docEditables.length !== editables.length) {
      throw new Error('The page layout no longer matches the file. Reload the page and try again.');
    }
    dirtyText.forEach(function (i) {
      var live = editables[i], target = docEditables[i];
      target.innerHTML = live.innerHTML;
      if (live.tagName === 'A') target.setAttribute('href', live.getAttribute('href') || '');
    });

    var liveImgs = listImages(document), docImgs = listImages(doc);
    for (var entry of dirtyImages) {
      var i = entry[0], info = entry[1];
      var live = liveImgs[i], target = docImgs[i];
      target.setAttribute('alt', live.getAttribute('alt') || '');
      target.style.objectPosition = live.style.objectPosition || '';
      if (!target.getAttribute('style')) target.removeAttribute('style');
      if (info.file) {
        target.setAttribute('src', useFolder ? 'images/' + info.name : await toDataUrl(info.file));
        target.removeAttribute('srcset');
        ['width', 'height'].forEach(function (a) {
          if (live.hasAttribute(a)) target.setAttribute(a, live.getAttribute(a));
        });
      }
    }
    return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML + '\n';
  }

  /* ---------- Saving ---------- */
  async function getFolder() {
    if (folder) {
      var p = await folder.queryPermission({ mode: 'readwrite' });
      if (p === 'granted' || (await folder.requestPermission({ mode: 'readwrite' })) === 'granted') return folder;
    }
    alert('Your browser will now ask where the website is saved.\n\nChoose the website folder (the one that has index.html in it), then allow the browser to edit files.');
    var picked = await window.showDirectoryPicker({ id: 'climate-habits-site', mode: 'readwrite' });
    try {
      await picked.getFileHandle(pageName);
    } catch (err) {
      alert('That folder does not contain ' + pageName + '. Please click Save again and choose the website folder.');
      return null;
    }
    folder = picked;
    return folder;
  }

  async function uniqueName(dir, name) {
    var dot = name.lastIndexOf('.');
    var base = dot > 0 ? name.slice(0, dot) : name, ext = dot > 0 ? name.slice(dot) : '';
    var candidate = name, n = 2;
    for (;;) {
      try { await dir.getFileHandle(candidate); candidate = base + '-' + n++ + ext; }
      catch (err) { return candidate; }
    }
  }

  async function writeFile(dir, name, data) {
    var handle = await dir.getFileHandle(name, { create: true });
    var w = await handle.createWritable();
    await w.write(data);
    await w.close();
  }

  async function save() {
    if (!hasChanges()) { setStatus('Nothing to save yet. Click any text to change it.'); return; }
    try {
      if (window.showDirectoryPicker) {
        var dir = await getFolder();
        if (!dir) return;
        var imagesDir = await dir.getDirectoryHandle('images', { create: true });
        for (var info of dirtyImages.values()) {
          if (info.file && !info.saved) {
            info.name = await uniqueName(imagesDir, info.name);
            await writeFile(imagesDir, info.name, info.file);
            info.saved = true;
          }
        }
        var onDisk = null;
        try { onDisk = await (await (await dir.getFileHandle(pageName)).getFile()).text(); } catch (e) { /* use the page as loaded */ }
        var html = await buildHtml(true, onDisk);
        await writeFile(dir, pageName, html);
        setStatus('Saved to ' + pageName + ' at ' + new Date().toLocaleTimeString() + '. Double-click PUBLISH to put it online.');
      } else {
        // Browsers without folder access (Firefox, Safari): download the file instead
        var html2 = await buildHtml(false);
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([html2], { type: 'text/html' }));
        a.download = pageName;
        // Keep the download inside the editor: the capture handler deliberately
        // prevents clicks on page links while editing, including temporary ones.
        ui.appendChild(a);
        a.click();
        a.remove();
        html = html2;
        setStatus('Downloaded ' + pageName + '. Move it into the website folder and replace the old one. (Tip: use Edge or Chrome to save directly.)');
      }
      original = html;
      dirtyText.clear();
      dirtyImages.clear();
    } catch (err) {
      if (err && err.name === 'AbortError') { setStatus('Save cancelled. Your changes are still on screen.'); return; }
      console.error(err);
      setStatus('Could not save: ' + (err && err.message ? err.message : err));
    }
  }
  $('se-save').addEventListener('click', save);

  // Ctrl+S / Cmd+S saves while editing
  document.addEventListener('keydown', function (e) {
    if (editing && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
  });

  // Warn before closing the tab with unsaved changes
  window.addEventListener('beforeunload', function (e) {
    if (hasChanges()) { e.preventDefault(); e.returnValue = ''; }
  });

  // Used only for automated testing
  window.__siteEditor = { buildHtml: buildHtml, listEditables: listEditables };
})();
