(function () {
    'use strict';

    var EMAIL = 'validleadsh@gmail.com';

    // Mobile menu
    var toggle = document.getElementById('menu-toggle');
    var links = document.getElementById('nav-links');
    if (toggle && links) {
        var setOpen = function (open) {
            links.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            toggle.firstElementChild.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        };
        toggle.addEventListener('click', function () { setOpen(!links.classList.contains('open')); });
        links.addEventListener('click', function (e) { if (e.target.tagName === 'A') setOpen(false); });
    }

    // Footer year
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Service category filter
    var tabButtons = document.querySelectorAll('.tab-btn');
    var cards = document.querySelectorAll('#services-grid .card');
    tabButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var cat = btn.getAttribute('data-filter');
            tabButtons.forEach(function (b) {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            cards.forEach(function (card) {
                var show = cat === 'all' || card.getAttribute('data-category') === cat;
                card.style.display = show ? 'flex' : 'none';
            });
        });
    });

    // Apollo order form: opens the visitor's email app with the order pre-filled
    var form = document.getElementById('order-form');
    if (form) {
        var status = document.getElementById('form-status');
        ['search-url', 'notes'].forEach(function (id) {
            document.getElementById(id).addEventListener('input', function () {
                document.getElementById('notes').setCustomValidity('');
            });
        });
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var val = function (id) { return (document.getElementById(id).value || '').trim(); };
            var notesField = document.getElementById('notes');
            notesField.setCustomValidity(
                !val('search-url') && !val('notes')
                    ? 'Please add an Apollo search URL or describe your target filters.'
                    : ''
            );
            if (!form.checkValidity()) { form.reportValidity(); return; }
            var leads = val('leads');
            var lines = [
                'Hi ValidLeads,',
                '',
                'I would like to order an Apollo lead export.',
                '',
                'Apollo search URL: ' + val('search-url'),
                'Number of leads: ' + leads,
                'Include mobile numbers: ' + (document.getElementById('mobiles').checked ? 'Yes' : 'No'),
                'Name: ' + val('name'),
                'My email: ' + val('email')
            ];
            var notes = val('notes');
            if (notes) { lines.push('', 'Target filters / notes:', notes); }
            lines.push('', 'Please confirm the price and send the payment invoice. Thank you.');

            var href = 'mailto:' + EMAIL +
                '?subject=' + encodeURIComponent('Apollo lead order: ' + leads + ' leads') +
                '&body=' + encodeURIComponent(lines.join('\n'));

            window.location.href = href;
            if (status) { status.classList.add('show'); }
        });
    }

    // Gentle reveal on scroll
    var targets = document.querySelectorAll('.card, .benefit, .pillar, .step, .policy, .quote, .pay-panel, .cta, .table-wrap, .order-form, .trusted figure, .about-photo');
    targets.forEach(function (el) { el.classList.add('reveal'); });
    if (!('IntersectionObserver' in window)) {
        targets.forEach(function (el) { el.classList.add('in'); });
        return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
})();
