/*
 * Drop-in replacement for static/js/search.js used ONLY in the static
 * export (see tools/build_static.py). The dynamic site's search.js calls
 * GET /search?q=... against the Flask backend; a static export has no
 * backend, so this version fetches a pre-built /search-index.json once and
 * filters it client-side instead. Everything else (DOM ids/classes, sanitise,
 * keyboard shortcuts, result rendering) is identical to the dynamic version
 * so the existing CSS/markup work unchanged.
 */
(function () {
  'use strict';

  const overlay  = document.getElementById('searchOverlay');
  const backdrop = document.getElementById('searchBackdrop');
  const input    = document.getElementById('searchInput');
  const results  = document.getElementById('searchResults');
  const trigger  = document.getElementById('searchTrigger');
  const closeBtn = document.getElementById('searchClose');
  if (!overlay) return;

  let debounce, lastQ = '';
  let indexPromise = null;

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch('/axiom-blog-site/search-index.json')
        .then(function (res) {
          if (!res.ok) throw new Error('bad response');
          return res.json();
        })
        .catch(function () {
          indexPromise = null; // allow retry on next search
          return [];
        });
    }
    return indexPromise;
  }

  function open() {
    overlay.classList.add('search-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    input.value = '';
    results.innerHTML = '';
    lastQ = '';
    loadIndex(); // warm the cache while the user is still typing
    setTimeout(function () { input.focus(); }, 60);
  }

  function close() {
    overlay.classList.remove('search-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    clearTimeout(debounce);
  }

  trigger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  var mobileSearchBtn = document.getElementById('mobileBottomSearch');
  if (mobileSearchBtn) mobileSearchBtn.addEventListener('click', open);

  /* ── Keyboard shortcuts modal (A-8) ───────────────────────────────────── */
  var shortcutsBackdrop = document.getElementById('shortcutsModalBackdrop');
  var shortcutsClose    = document.getElementById('shortcutsClose');

  function openShortcuts()  { if (shortcutsBackdrop) shortcutsBackdrop.hidden = false; }
  function closeShortcuts() { if (shortcutsBackdrop) shortcutsBackdrop.hidden = true; }

  if (shortcutsClose) shortcutsClose.addEventListener('click', closeShortcuts);
  if (shortcutsBackdrop) {
    shortcutsBackdrop.addEventListener('click', function (e) {
      if (e.target === shortcutsBackdrop) closeShortcuts();
    });
  }

  var gPending = false, gTimer = null;

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { close(); closeShortcuts(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); open(); return; }

    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (e.key === '/' || e.key === 's') { e.preventDefault(); open(); return; }
    if (e.key === '?') { e.preventDefault(); openShortcuts(); return; }

    if (e.key === 'g') {
      gPending = true;
      clearTimeout(gTimer);
      gTimer = setTimeout(function () { gPending = false; }, 1000);
      return;
    }
    if (e.key === 'h' && gPending) {
      gPending = false;
      clearTimeout(gTimer);
      location.href = '/axiom-blog-site/';
      return;
    }
    gPending = false;
  });

  /* Strip < > " ' ` and control chars; collapse whitespace; cap length */
  function sanitise(s) {
    return s
      .replace(/[\x00-\x1f\x7f<>"'`\\]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);
  }

  function setState(msg) {
    var d = document.createElement('div');
    d.className = 'search-state';
    d.textContent = msg;
    results.replaceChildren(d);
  }

  function setHint() {
    var d = document.createElement('div');
    d.className = 'search-hint';
    d.textContent = 'Type at least 2 characters…';
    results.replaceChildren(d);
  }

  function catClass(cat) {
    return cat ? cat.toLowerCase().replace(/\s+/g, '-') : 'default';
  }

  function renderResults(list, q) {
    if (!list.length) { setState('No results for “' + q + '”'); return; }
    var frag = document.createDocumentFragment();
    list.forEach(function (post) {
      var a = document.createElement('a');
      a.className = 'search-result';
      a.href = '/axiom-blog-site/post/' + encodeURIComponent(post.slug);
      a.setAttribute('role', 'option');

      var top = document.createElement('div');
      top.className = 'sr-top';

      if (post.category) {
        var badge = document.createElement('span');
        badge.className = 'cat-badge cat-' + catClass(post.category);
        badge.textContent = post.category;
        top.appendChild(badge);
      }

      var date = document.createElement('span');
      date.className = 'sr-date';
      date.textContent = post.date;
      top.appendChild(date);

      var title = document.createElement('div');
      title.className = 'sr-title';
      title.textContent = post.title;

      a.appendChild(top);
      a.appendChild(title);

      if (post.summary) {
        var sum = document.createElement('div');
        sum.className = 'sr-summary';
        sum.textContent = post.summary;
        a.appendChild(sum);
      }

      if (post.tags && post.tags.length) {
        var tags = document.createElement('div');
        tags.className = 'sr-tags';
        post.tags.slice(0, 4).forEach(function (t) {
          var span = document.createElement('span');
          span.className = 'tag';
          span.textContent = t;
          tags.appendChild(span);
        });
        a.appendChild(tags);
      }

      a.addEventListener('click', close);
      frag.appendChild(a);
    });
    results.replaceChildren(frag);
  }

  function doSearch(q) {
    setState('Searching…');
    var needle = q.toLowerCase();
    loadIndex().then(function (index) {
      if (q !== lastQ) return; // a newer keystroke already superseded this search
      var matches = index.filter(function (post) {
        return post.body && post.body.indexOf(needle) !== -1;
      }).slice(0, 20);
      renderResults(matches, q);
    });
  }

  input.addEventListener('input', function () {
    var q = sanitise(input.value);
    if (q === lastQ) return;
    lastQ = q;
    clearTimeout(debounce);
    if (q.length < 2) { setHint(); return; }
    debounce = setTimeout(function () { doSearch(q); }, 280);
  });
})();
