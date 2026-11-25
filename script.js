(function () {
    'use strict';

    var toggle = document.getElementById('menu-toggle');
    var links = document.getElementById('nav-links');
    if (toggle && links) {
        var setOpen = function (open) {
            links.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        };
        toggle.addEventListener('click', function () { setOpen(!links.classList.contains('open')); });
        links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    }

    var yearEl = document.getElementById('year');
    if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

    var targets = document.querySelectorAll('.card, .step, .policy-box, .contact-card, .trusted figure');
    targets.forEach(function (el) { el.classList.add('reveal'); });
    if (!('IntersectionObserver' in window)) {
        targets.forEach(function (el) { el.classList.add('in'); });
        return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) { entry.target.classList.add('in'); obs.unobserve(entry.target); }
        });
    }, { threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
})();
