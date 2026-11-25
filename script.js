(function () {
    'use strict';

    var EMAIL = 'validleadsh@gmail.com';
    var ENDPOINT = 'https://formsubmit.co/ajax/' + EMAIL;

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

    // Order form: sends straight to the inbox (no email app needed)
    var form = document.getElementById('order-form');
    if (form) {
        var service = document.getElementById('service');
        var apolloFields = document.getElementById('apollo-fields');
        var notes = document.getElementById('notes');
        var urlField = document.getElementById('search-url');
        var submitBtn = document.getElementById('form-submit');
        var status = document.getElementById('form-status');

        var syncFields = function () {
            var isApollo = /apollo/i.test(service.value);
            apolloFields.hidden = !isApollo;
        };
        service.addEventListener('change', syncFields);
        syncFields();

        // Any "Order" button pre-selects its service in the form
        document.querySelectorAll('.js-order').forEach(function (a) {
            a.addEventListener('click', function () {
                var wanted = a.getAttribute('data-service');
                if (wanted) {
                    for (var i = 0; i < service.options.length; i++) {
                        if (service.options[i].value === wanted) { service.selectedIndex = i; break; }
                    }
                    syncFields();
                    var m = /^(\d+)K\b/.exec(wanted);
                    var leadsSel = document.getElementById('leads');
                    if (m && leadsSel) { leadsSel.value = (m[1] + ',000'); }
                }
            });
        });

        [urlField, notes].forEach(function (el) {
            el.addEventListener('input', function () { notes.setCustomValidity(''); });
        });

        var showStatus = function (kind, nodes) {
            status.className = 'form-status show ' + kind;
            status.textContent = '';
            nodes.forEach(function (n) { status.appendChild(typeof n === 'string' ? document.createTextNode(n) : n); });
        };

        var link = function (text, href) {
            var a = document.createElement('a');
            a.href = href; a.textContent = text; a.target = '_blank'; a.rel = 'noopener noreferrer';
            return a;
        };


        // Send the same order as a pre-filled WhatsApp message
        var waBtn = document.getElementById('wa-submit');
        if (waBtn) {
            waBtn.addEventListener('click', function () {
                var hasUrl = !apolloFields.hidden && urlField.value.trim();
                notes.setCustomValidity(!hasUrl && !notes.value.trim() ? 'Please add a few details or your Apollo search URL.' : '');
                if (!notes.checkValidity()) { notes.reportValidity(); return; }
                var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
                var lines = ['Hello, I would like to place an order.', '', 'Service: ' + service.value];
                if (!apolloFields.hidden) {
                    if (v('search-url')) lines.push('Apollo search URL: ' + v('search-url'));
                    lines.push('Number of leads: ' + v('leads'));
                    if (document.getElementById('mobiles').checked) lines.push('Mobile numbers: Yes');
                }
                if (v('notes')) lines.push('Details: ' + v('notes'));
                if (v('name')) lines.push('Name: ' + v('name'));
                if (v('email')) lines.push('Email: ' + v('email'));
                var url = 'https://wa.me/8801728471484?text=' + encodeURIComponent(lines.join('\n'));
                var w = window.open(url, '_blank', 'noopener');
                if (!w) { window.location.href = url; }
                showStatus('ok', ['WhatsApp is opening with your message ready. Please press Send there to complete your order.']);
            });
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var hasUrl = !apolloFields.hidden && urlField.value.trim();
            notes.setCustomValidity(!hasUrl && !notes.value.trim() ? 'Please add a few details or your Apollo search URL.' : '');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            var data = new FormData(form);
            if (apolloFields.hidden) {
                data.delete('apollo_search_url');
                data.delete('number_of_leads');
                data.delete('mobile_numbers');
            }
            data.set('_subject', 'New order: ' + service.value);
            var payload = {};
            data.forEach(function (v, k) { payload[k] = v; });

            var label = submitBtn.querySelector('span');
            var original = label.textContent;
            submitBtn.disabled = true;
            label.textContent = 'Sending...';
            status.className = 'form-status';

            fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
            .then(function (res) {
                if (res.ok && (res.data.success === true || res.data.success === 'true')) {
                    showStatus('ok', ['Thank you! Your order was sent. We will reply to ' + payload.email + ' by email shortly.']);
                    form.reset();
                    syncFields();
                } else {
                    throw new Error('not sent');
                }
            })
            .catch(function () {
                var body = Object.keys(payload).filter(function (k) { return k.charAt(0) !== '_'; })
                    .map(function (k) { return k + ': ' + payload[k]; }).join('\n');
                var subject = encodeURIComponent(payload._subject || 'Order');
                var gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + EMAIL + '&su=' + subject + '&body=' + encodeURIComponent(body);
                var mailto = 'mailto:' + EMAIL + '?subject=' + subject + '&body=' + encodeURIComponent(body);
                showStatus('error', [
                    'Sorry, the email could not be sent automatically. Please use ',
                    link('Send on WhatsApp', 'https://wa.me/8801728471484?text=' + encodeURIComponent(body)), ', ',
                    link('open in Gmail', gmail), ' or ', link('open in your email app', mailto), ' instead.'
                ]);
            })
            .then(function () {
                submitBtn.disabled = false;
                label.textContent = original;
            });
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
