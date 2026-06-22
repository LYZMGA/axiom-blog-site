'use strict';

const SESSION_KEY = 'blog_unlock_pw';

// ── State ──────────────────────────────────────────────────────────────────
let derivedKey = null;

// ── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const cryptoConfig = readCryptoConfig();
  if (!cryptoConfig) return; // No locked blocks on this page

  setupUI(cryptoConfig);

  // Auto-unlock if password was saved this session
  const saved = sessionStorage.getItem(SESSION_KEY);
  if (saved) {
    try {
      derivedKey = await BlogCrypto.unlockWithPassword(saved, cryptoConfig);
      await revealAllBlocks();
      setFabUnlocked();
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }
});

// ── Config reader ──────────────────────────────────────────────────────────
function readCryptoConfig() {
  const el = document.getElementById('crypto-config');
  if (!el) return null;
  try { return JSON.parse(el.textContent); } catch { return null; }
}

// ── UI wiring ──────────────────────────────────────────────────────────────
function setupUI(cryptoConfig) {
  const fab       = document.getElementById('keyFab');
  const backdrop  = document.getElementById('keyModalBackdrop');
  const modal     = document.getElementById('keyModal');
  const input     = document.getElementById('keyInput');
  const unlockBtn = document.getElementById('modalUnlock');
  const cancelBtn = document.getElementById('modalCancel');
  const toggleBtn = document.getElementById('keyToggleBtn');
  const errEl     = document.getElementById('modalError');

  if (!fab) return;

  function openModal() {
    backdrop.hidden = false;
    input.value = '';
    errEl.hidden = true;
    input.focus();
  }
  function closeModal() {
    backdrop.hidden = true;
    input.value = '';
    errEl.hidden = true;
    setUnlockBtnState(false);
  }

  fab.addEventListener('click', openModal);
  cancelBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !backdrop.hidden) closeModal();
  });

  // Show/hide password
  toggleBtn.addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password';
    input.focus();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') unlockBtn.click();
    errEl.hidden = true;
  });

  unlockBtn.addEventListener('click', async () => {
    const pw = input.value.trim();
    if (!pw) { input.focus(); return; }

    setUnlockBtnState(true);
    errEl.hidden = true;

    try {
      derivedKey = await BlogCrypto.unlockWithPassword(pw, cryptoConfig);
      sessionStorage.setItem(SESSION_KEY, pw);
      closeModal();
      await revealAllBlocks();
      setFabUnlocked();
    } catch {
      derivedKey = null;
      errEl.hidden = false;
      modal.classList.add('shake');
      modal.addEventListener('animationend', () => modal.classList.remove('shake'), { once: true });
      setUnlockBtnState(false);
      input.select();
    }
  });

  // Locked blocks pulse the FAB to hint at the unlock button — don't auto-open the modal
  document.querySelectorAll('.locked-block').forEach(el => {
    el.addEventListener('click', () => {
      const fab = document.getElementById('keyFab');
      if (!fab) return;
      fab.classList.remove('fab-pulse');
      void fab.offsetWidth; // reflow to restart animation
      fab.classList.add('fab-pulse');
    });
  });
}

function setUnlockBtnState(loading) {
  const btn = document.getElementById('modalUnlock');
  if (!btn) return;
  btn.disabled = loading;
  btn.querySelector('.btn-text').hidden = loading;
  btn.querySelector('.btn-spinner').hidden = !loading;
}

function setFabUnlocked() {
  const fab = document.getElementById('keyFab');
  if (!fab) return;
  fab.classList.add('unlocked');
  fab.querySelector('.key-fab-label').textContent = 'Unlocked';
  fab.title = 'Content unlocked';
  // Replace key icon with unlocked lock
  fab.querySelector('svg').innerHTML = `
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 9.9-1" stroke="currentColor" stroke-width="2" fill="none"/>
  `;
}

// ── Block decryption & rendering ───────────────────────────────────────────
async function revealAllBlocks() {
  const blocks = document.querySelectorAll('.locked-block');
  const jobs = Array.from(blocks).map(el => revealBlock(el));
  await Promise.allSettled(jobs);
}

async function revealBlock(el) {
  const type       = el.dataset.blockType;
  const iv         = el.dataset.iv;
  const ciphertext = el.dataset.ciphertext;
  const language   = el.dataset.language || '';
  const caption    = el.dataset.caption || '';

  let plaintext;
  try {
    plaintext = await BlogCrypto.decrypt(derivedKey, iv, ciphertext);
  } catch {
    return; // Wrong key or corrupt block — leave locked
  }

  let rendered;
  switch (type) {
    case 'code':  rendered = renderCode(plaintext, language, caption); break;
    case 'image': rendered = renderImage(plaintext, caption); break;
    case 'note':  rendered = renderNote(plaintext, caption); break;
    default:      rendered = renderGeneric(plaintext, caption); break;
  }

  el.classList.remove('locked-block');
  el.classList.add('unlocked-block');
  el.innerHTML = '';
  el.appendChild(rendered);
}

// ── Block renderers ────────────────────────────────────────────────────────
function renderCode(code, language, caption) {
  const wrap = document.createElement('div');
  wrap.className = 'unlocked-code unlocked-block';

  const header = document.createElement('div');
  header.className = 'code-header';
  const langBadge = document.createElement('span');
  langBadge.className = 'lang-badge';
  langBadge.textContent = language || 'code';
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.setAttribute('aria-label', 'Copy code');
  copyBtn.innerHTML = '<svg class="icon-copy" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><svg class="icon-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(code);
    copyBtn.classList.add('copied');
    wrap.classList.add('code-copied');
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      void wrap.offsetWidth;
      wrap.classList.remove('code-copied');
    }, 1800);
  });
  header.appendChild(langBadge);
  if (caption) {
    const capSpan = document.createElement('span');
    capSpan.style.cssText = 'font-size:11px;color:var(--text-3);font-style:italic;margin-right:auto;margin-left:10px;';
    capSpan.textContent = caption;
    header.appendChild(capSpan);
  }
  header.appendChild(copyBtn);

  const pre = document.createElement('pre');
  const codeEl = document.createElement('code');
  if (language) codeEl.className = `language-${language}`;
  codeEl.textContent = code;
  pre.appendChild(codeEl);

  wrap.appendChild(header);
  wrap.appendChild(pre);

  // Syntax highlight if hljs is loaded
  if (typeof hljs !== 'undefined') {
    try { hljs.highlightElement(codeEl); } catch {}
  }

  return wrap;
}

function renderImage(dataUri, caption) {
  const fig = document.createElement('figure');
  fig.className = 'unlocked-image unlocked-block';

  const img = document.createElement('img');
  img.src = dataUri;
  img.alt = caption || 'Image';
  img.loading = 'lazy';
  fig.appendChild(img);

  if (caption) {
    const cap = document.createElement('figcaption');
    cap.textContent = caption;
    fig.appendChild(cap);
  }
  return fig;
}

function renderNote(text, caption) {
  const div = document.createElement('div');
  div.className = 'unlocked-note unlocked-block';
  if (caption) {
    const label = document.createElement('div');
    label.className = 'note-label';
    label.textContent = caption || 'Note';
    div.appendChild(label);
  }
  const p = document.createElement('p');
  p.style.whiteSpace = 'pre-wrap';
  p.textContent = text;
  div.appendChild(p);
  return div;
}

function renderGeneric(text, caption) {
  const div = document.createElement('div');
  div.className = 'unlocked-note unlocked-block';
  const p = document.createElement('pre');
  p.style.cssText = 'white-space:pre-wrap;font-family:var(--font-mono);font-size:12px;';
  p.textContent = text;
  div.appendChild(p);
  return div;
}
