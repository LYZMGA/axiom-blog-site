(function () {
  'use strict';

  /* ── Syntax highlighting ──────────────────────────────────────────────── */
  if (typeof hljs !== 'undefined') {
    document.querySelectorAll(
      '.text-block pre code, .api-code-block pre code, .unlocked-code pre code'
    ).forEach(function (el) {
      try { hljs.highlightElement(el); } catch (e) {}
    });
  }

  /* ── Copy button for plaintext code blocks (A-2) ────────────────────────── */
  document.querySelectorAll('.api-code-block').forEach(function (block) {
    var header = block.querySelector('.code-header');
    var codeEl = block.querySelector('pre code');
    if (!header || !codeEl) return;

    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'copy-btn';
    copyBtn.setAttribute('aria-label', 'Copy code');
    copyBtn.innerHTML = '<svg class="icon-copy" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><svg class="icon-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(codeEl.textContent).then(function () {
        copyBtn.classList.add('copied');
        block.classList.add('code-copied');
        setTimeout(function () {
          copyBtn.classList.remove('copied');
          void block.offsetWidth;
          block.classList.remove('code-copied');
        }, 1800);
      });
    });
    header.appendChild(copyBtn);
  });

  /* ── Code line numbers (C-8) ─────────────────────────────────────────────── */
  document.querySelectorAll(
    '.api-code-block pre code, .unlocked-code pre code, .text-block pre code'
  ).forEach(function (el) {
    var html = el.innerHTML;
    if (!html) return;
    var lines = html.split('\n');
    if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
    el.innerHTML = lines.map(function (line) {
      return '<span class="line">' + line + '</span>';
    }).join('\n');
  });

  /* ── Reading progress bar + back-to-top (A-3 / C-2 / A-5) ────────────────── */
  var progress  = document.getElementById('readingProgress');
  var backToTop = document.getElementById('backToTop');
  var btRing    = backToTop ? backToTop.querySelector('.bt-ring-fg') : null;
  var btCircumference = 106.8;
  var footer    = document.querySelector('.site-footer');

  if (progress || backToTop) {
    var updateScrollUI = function () {
      var scrollY = window.scrollY;
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docH > 0 ? Math.min(100, (scrollY / docH) * 100) : 0;

      if (progress) {
        progress.style.width = pct + '%';
        progress.hidden = scrollY < 80;
      }
      if (backToTop) {
        backToTop.hidden = scrollY < 400;

        /* Slide the button up above the footer instead of letting it
           overlap (or hiding it just when it's most useful). */
        var overlap = footer ? Math.max(0, window.innerHeight - footer.getBoundingClientRect().top) : 0;
        backToTop.style.bottom = overlap > 0 ? 'calc(var(--bt-offset) + ' + overlap + 'px)' : '';

        if (btRing) {
          btRing.style.strokeDashoffset = (btCircumference * (1 - pct / 100)).toFixed(2);
        }
      }
    };

    window.addEventListener('scroll', updateScrollUI, { passive: true });
    updateScrollUI();

    if (backToTop) {
      backToTop.addEventListener('click', function () {
        window.scrollTo({
          top: 0,
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
      });
    }
  }

  /* ── Rich table sort & filter (B-5) ──────────────────────────────────────── */
  document.querySelectorAll('.table-wrap').forEach(function (wrap) {
    var table = wrap.querySelector('.table-block');
    if (!table) return;

    var tbody = table.querySelector('tbody');
    var ths = table.querySelectorAll('thead th');

    ths.forEach(function (th, colIdx) {
      th.addEventListener('click', function () {
        var asc = !th.classList.contains('sort-asc');
        ths.forEach(function (other) { other.classList.remove('sort-asc', 'sort-desc'); });
        th.classList.add(asc ? 'sort-asc' : 'sort-desc');

        var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
        rows.sort(function (a, b) {
          var av = a.children[colIdx] ? a.children[colIdx].textContent.trim() : '';
          var bv = b.children[colIdx] ? b.children[colIdx].textContent.trim() : '';
          var an = parseFloat(av), bn = parseFloat(bv);
          var cmp = (!isNaN(an) && !isNaN(bn)) ? (an - bn) : av.localeCompare(bv);
          return asc ? cmp : -cmp;
        });
        rows.forEach(function (row) { tbody.appendChild(row); });
      });
    });

  });

  /* ── Animated terminal typewriter (B-6) ──────────────────────────────────── */
  document.querySelectorAll('.terminal-block').forEach(function (block) {
    var body = block.querySelector('.terminal-body');
    var dataEl = block.querySelector('.terminal-data');
    var replayBtn = block.querySelector('.terminal-replay');
    if (!body || !dataEl) return;

    var lines = [];
    try { lines = JSON.parse(dataEl.textContent || '[]'); } catch (e) {}
    if (!lines.length) return;

    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function renderStatic() {
      body.innerHTML = '';
      lines.forEach(function (line) {
        var p = document.createElement('div');
        p.className = 'term-line' + (line.type === 'cmd' ? ' term-line-cmd' : '');
        p.textContent = (line.type === 'cmd' ? '$ ' : '') + (line.text || '');
        body.appendChild(p);
      });
    }

    function playTypewriter() {
      body.innerHTML = '';
      if (replayBtn) replayBtn.disabled = true;

      var i = 0;
      function nextLine() {
        if (i >= lines.length) {
          if (replayBtn) replayBtn.disabled = false;
          return;
        }
        var line = lines[i];
        var p = document.createElement('div');
        p.className = 'term-line' + (line.type === 'cmd' ? ' term-line-cmd' : '');
        body.appendChild(p);

        if (line.type !== 'cmd') {
          p.textContent = line.text || '';
          i++;
          setTimeout(nextLine, Math.max(line.delay || 0, 0));
          return;
        }

        var text = '$ ' + (line.text || '');
        var cursor = document.createElement('span');
        cursor.className = 'term-cursor';
        var charIdx = 0;

        (function typeChar() {
          p.textContent = text.slice(0, charIdx);
          p.appendChild(cursor);
          if (charIdx < text.length) {
            charIdx++;
            setTimeout(typeChar, 30);
          } else {
            cursor.remove();
            i++;
            setTimeout(nextLine, Math.max(line.delay || 0, 0));
          }
        })();
      }

      nextLine();
    }

    if (reduced) {
      renderStatic();
    } else {
      playTypewriter();
      if (replayBtn) {
        replayBtn.hidden = false;
        replayBtn.addEventListener('click', playTypewriter);
      }
    }
  });

  /* ── Image gallery lightbox (B-8) ─────────────────────────────────────────── */
  var galleryModal = document.querySelector('.gallery-modal');
  if (galleryModal) {
    var modalImg = galleryModal.querySelector('.gallery-modal-img');
    var modalCaption = galleryModal.querySelector('.gallery-modal-caption');
    var prevBtn = galleryModal.querySelector('.gallery-prev');
    var nextBtn = galleryModal.querySelector('.gallery-next');
    var closeBtn = galleryModal.querySelector('.gallery-close');

    var currentItems = [];
    var currentIndex = -1;

    var showItem = function (i) {
      if (!currentItems.length) return;
      currentIndex = (i + currentItems.length) % currentItems.length;
      var item = currentItems[currentIndex];
      modalImg.src = item.dataset.full;
      modalImg.alt = item.dataset.caption || '';
      if (modalCaption) modalCaption.textContent = item.dataset.caption || '';
    };

    var openModal = function (items, index) {
      currentItems = items;
      showItem(index);
      galleryModal.hidden = false;
    };

    var closeModal = function () {
      galleryModal.hidden = true;
      modalImg.src = '';
    };

    document.querySelectorAll('.gallery-block').forEach(function (block) {
      var items = Array.prototype.slice.call(block.querySelectorAll('.gallery-item'));
      items.forEach(function (item, i) {
        item.addEventListener('click', function () { openModal(items, i); });
      });
    });

    if (prevBtn) prevBtn.addEventListener('click', function () { showItem(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { showItem(currentIndex + 1); });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    galleryModal.addEventListener('click', function (e) {
      if (e.target === galleryModal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (galleryModal.hidden) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') showItem(currentIndex - 1);
      if (e.key === 'ArrowRight') showItem(currentIndex + 1);
    });
  }
})();
