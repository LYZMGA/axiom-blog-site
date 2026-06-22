'use strict';
(function () {
  const el = document.getElementById('heroCmd');
  if (!el) return;

  const commands = [
    'ls /topics',
    'cat README.md',
    'grep -r "CVE-" --include=*.md',
    'find . -name "*.vuln"',
    'whoami',
  ];

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = commands[0];
    return;
  }

  const TYPE_DELAY   = 50;
  const ERASE_DELAY  = 25;
  const HOLD_DELAY   = 1500;
  const SWAP_DELAY   = 400;

  let cmdIndex   = 0;
  let charIndex  = 0;
  let deleting   = false;

  function tick() {
    const cmd = commands[cmdIndex];
    if (!deleting) {
      charIndex++;
      el.textContent = cmd.slice(0, charIndex);
      if (charIndex === cmd.length) {
        setTimeout(() => { deleting = true; tick(); }, HOLD_DELAY);
        return;
      }
      setTimeout(tick, TYPE_DELAY);
    } else {
      charIndex--;
      el.textContent = cmd.slice(0, charIndex);
      if (charIndex === 0) {
        deleting  = false;
        cmdIndex  = (cmdIndex + 1) % commands.length;
        setTimeout(tick, SWAP_DELAY);
        return;
      }
      setTimeout(tick, ERASE_DELAY);
    }
  }

  setTimeout(tick, 600);
})();
