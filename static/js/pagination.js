(function () {
  const grid  = document.querySelector('.posts-grid');
  const pager = document.getElementById('postsPagination');
  if (!grid) return;

  const PER_PAGE    = 9;
  const isPaginated = grid.dataset.paginated === 'true';
  const cards       = Array.from(grid.querySelectorAll('.post-card'));
  const total       = cards.length;
  let   curPage     = 1;

  if (!isPaginated) return;

  function nPages() { return Math.max(1, Math.ceil(total / PER_PAGE)); }

  function showPage(page, animate) {
    const start = (page - 1) * PER_PAGE;
    const end   = start + PER_PAGE;
    curPage = Math.max(1, Math.min(page, nPages()));
    if (animate) {
      grid.style.transition = 'opacity .13s ease';
      grid.style.opacity = '0';
      setTimeout(() => {
        cards.forEach((c, i) => { c.style.display = (i >= start && i < end) ? '' : 'none'; });
        buildPager();
        grid.style.opacity = '1';
      }, 140);
    } else {
      cards.forEach((c, i) => { c.style.display = (i >= start && i < end) ? '' : 'none'; });
      buildPager();
    }
    try { localStorage.setItem('axiom-page', curPage); } catch {}
  }

  function pageList(cur, max) {
    if (max <= 7) return Array.from({length: max}, (_, i) => i + 1);
    const list = [1];
    if (cur > 3) list.push('…');
    for (let i = Math.max(2, cur - 1); i <= Math.min(max - 1, cur + 1); i++) list.push(i);
    if (cur < max - 2) list.push('…');
    list.push(max);
    return list;
  }

  function buildPager() {
    if (!pager) return;
    const np = nPages();
    if (np <= 1) { pager.innerHTML = ''; return; }
    const from = (curPage - 1) * PER_PAGE + 1;
    const to   = Math.min(curPage * PER_PAGE, total);
    let nums = '';
    for (const p of pageList(curPage, np)) {
      nums += p === '…'
        ? `<span class="pg-ellipsis">…</span>`
        : `<button class="pg-btn${p === curPage ? ' pg-active' : ''}" data-p="${p}">${p}</button>`;
    }
    pager.innerHTML = `
      <div class="pg-bar">
        <span class="pg-info">${from}–${to} <span class="pg-of">of ${total}</span></span>
        <div class="pg-pages">
          <button class="pg-btn pg-arrow" data-p="${curPage - 1}" ${curPage === 1 ? 'disabled' : ''}>←</button>
          ${nums}
          <button class="pg-btn pg-arrow" data-p="${curPage + 1}" ${curPage === np ? 'disabled' : ''}>→</button>
        </div>
        <span class="pg-info pg-right">${PER_PAGE}&thinsp;per&thinsp;page</span>
      </div>`;
    pager.querySelectorAll('[data-p]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.p, 10);
        if (!isNaN(p) && p >= 1 && p <= nPages()) showPage(p, true);
      });
    });
  }

  let saved = 1;
  try { saved = parseInt(localStorage.getItem('axiom-page'), 10) || 1; } catch {}
  showPage(saved, false);
})();
