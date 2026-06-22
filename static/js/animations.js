(function () {
  'use strict';

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof IntersectionObserver === 'undefined') return;

  var targets = document.querySelectorAll('.post-card, .block');
  if (!targets.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var i = Array.prototype.indexOf.call(targets, entry.target);
      entry.target.style.transitionDelay = Math.min(i, 4) * 60 + 'ms';
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.01, rootMargin: '0px 0px 200px 0px' });

  targets.forEach(function (el) { observer.observe(el); });
})();
