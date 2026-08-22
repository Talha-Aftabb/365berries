/* ==========================================================================
   365 BERRIES — Redesign Concept · interaction layer
   Vanilla JS, no dependencies. All motion respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Every scroll-linked effect registers here; one rAF loop (§17) drives them all.
  var scrollHandlers = [];

  /* ---------------------------------------------------------------- 0. I18N */
  // Active languages. The Spanish translation and the ES legal-page blocks are
  // written and kept in sync — add 'es' here to switch the whole thing back on.
  // With a single language the switcher is removed, browser-language detection
  // is skipped, and nothing is written to localStorage.
  var LANGUAGES = ['en'];

  var DICT = window.I18N || { en: {} };
  var lang = LANGUAGES[0];

  function t(key) {
    var d = DICT[lang] || {};
    if (d[key] != null) return d[key];
    return (DICT.en && DICT.en[key] != null) ? DICT.en[key] : null;
  }

  function applyLang(next) {
    lang = DICT[next] ? next : LANGUAGES[0];
    document.documentElement.lang = lang;
    // Only remember a choice when there is a choice to remember — with one
    // language this would store a pointless key and make the cookie policy wrong.
    if (LANGUAGES.length > 1) {
      try { localStorage.setItem('lang', lang); } catch (e) { /* private mode */ }
    }

    $$('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (typeof v === 'string') el.textContent = v;
    });

    $$('[data-i18n-html]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-html'));
      if (typeof v === 'string') el.innerHTML = v;
    });

    // "attr:key" pairs, comma separated — e.g. "placeholder:f.phName"
    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var bits = pair.split(':');
        if (bits.length !== 2) return;
        var v = t(bits[1].trim());
        if (typeof v === 'string') el.setAttribute(bits[0].trim(), v);
      });
    });

    // Legal pages keep both languages as prose in the markup, so a lawyer can
    // edit them without touching i18n.js. Show whichever matches.
    $$('[data-lang-block]').forEach(function (el) {
      el.classList.toggle('is-shown', el.getAttribute('data-lang-block') === lang);
    });

    // Legal pages declare their own title/description keys on <body>.
    var title = t(document.body.dataset.titleKey || 'meta.title');
    if (title) document.title = title;
    var meta = $('meta[name="description"]'), desc = t(document.body.dataset.descKey || 'meta.desc');
    if (meta && desc) meta.setAttribute('content', desc);

    // Headings were replaced wholesale above, so re-run the word splitter.
    if (!reduce) {
      $$('[data-split]').forEach(function (el) {
        delete el.dataset.splitDone;
        splitWords(el);
      });
    }

    buildCalendar();
    updateSeasonChip();

    $$('#lang .lang__btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });

    $$('.qdot').forEach(function (d) {
      d.setAttribute('aria-label', (t('a11y.dot') || 'Quote') + ' ' + d.getAttribute('data-dot'));
    });

    // Burger label depends on current state, not just language.
    var burger = $('#burger');
    if (burger) {
      var open = document.body.classList.contains('menu-open');
      burger.setAttribute('aria-label', t(open ? 'a11y.menuClose' : 'a11y.menuOpen'));
    }
  }

  function initLang() {
    var switcher = $('#lang');

    if (LANGUAGES.length < 2) {
      if (switcher) switcher.remove();
      // Clear a key left behind by a bilingual build, so "we store nothing in
      // your browser" in the cookie policy is true for returning visitors too.
      try { localStorage.removeItem('lang'); } catch (e) {}
      applyLang(LANGUAGES[0]);
      return;
    }

    var saved = null;
    try { saved = localStorage.getItem('lang'); } catch (e) {}
    if (!saved || LANGUAGES.indexOf(saved) === -1) {
      var nav = (navigator.language || '').toLowerCase();
      saved = LANGUAGES.filter(function (l) { return nav.indexOf(l) === 0; })[0] || LANGUAGES[0];
    }
    $$('#lang .lang__btn').forEach(function (b) {
      var code = b.getAttribute('data-lang');
      if (LANGUAGES.indexOf(code) === -1) { b.remove(); return; }
      b.addEventListener('click', function () { applyLang(code); });
    });
    applyLang(saved);
  }

  /* ---------------------------------------------------------------- 1. PRELOADER */
  (function preloader() {
    var fill = $('#loaderFill'), pct = $('#loaderPct');
    var p = 0, done = false;

    function finish() {
      if (done) return;
      done = true;
      p = 100;
      if (fill) fill.style.width = '100%';
      if (pct) pct.textContent = '100%';
      setTimeout(function () { document.body.classList.add('loaded'); }, reduce ? 0 : 320);
    }

    var tick = setInterval(function () {
      p = Math.min(p + Math.random() * 16 + 6, 96);
      if (fill) fill.style.width = p + '%';
      if (pct) pct.textContent = Math.round(p) + '%';
      if (p >= 96) clearInterval(tick);
    }, 150);

    window.addEventListener('load', function () {
      clearInterval(tick);
      setTimeout(finish, 260);
    });
    setTimeout(function () { clearInterval(tick); finish(); }, 3200); // hard safety net
  })();

  /* ---------------------------------------------------------------- 2. SPLIT TEXT */
  // Wraps every word in a masked span so headings can rise into place.
  function splitWords(el) {
    if (el.dataset.splitDone) return;
    var i = 0;

    function walk(node) {
      var kids = Array.prototype.slice.call(node.childNodes);
      kids.forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var outer = document.createElement('span');
            outer.className = 'w';
            var inner = document.createElement('span');
            inner.className = 'wi';
            inner.style.transitionDelay = (i++ * 0.045) + 's';
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    }

    walk(el);
    el.dataset.splitDone = '1';
  }

  // Splitting is driven by applyLang (§0), which runs on init and on every switch.

  /* ---------------------------------------------------------------- 3. REVEAL */
  (function reveal() {
    var targets = $$('[data-reveal], [data-stagger], [data-split], [data-step], #cal');

    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------------- 4. HEADER */
  (function header() {
    var header = $('#header');
    var last = 0;

    function onScroll(y) {
      if (!header) return;
      header.classList.toggle('is-stuck', y > 40);
      // Hide on scroll-down past the hero, show on scroll-up.
      var hidden = y > 600 && y > last && !document.body.classList.contains('menu-open');
      header.classList.toggle('is-hidden', hidden);
      last = y;
    }
    scrollHandlers.push(onScroll);
  })();

  /* ---------------------------------------------------------------- 5. DRAWER */
  (function drawer() {
    var burger = $('#burger'), drawerEl = $('#drawer');
    if (!burger || !drawerEl) return;

    function setOpen(open) {
      document.body.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', t(open ? 'a11y.menuClose' : 'a11y.menuOpen'));
    }

    burger.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('menu-open'));
    });
    $$('a', drawerEl).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setOpen(false);
    });
  })();

  /* ---------------------------------------------------------------- 6. PARALLAX */
  var parallax = [];
  (function initParallax() {
    if (reduce) return;
    parallax = $$('[data-speed]').map(function (el) {
      return { el: el, speed: parseFloat(el.dataset.speed) || 0, top: 0 };
    });
    function measure() {
      parallax.forEach(function (p) {
        var r = p.el.getBoundingClientRect();
        p.top = r.top + window.pageYOffset;
      });
    }
    measure();
    window.addEventListener('resize', measure);

    scrollHandlers.push(function (y) {
      parallax.forEach(function (p) {
        var d = (y - p.top) * p.speed;
        p.el.style.transform = 'translate3d(0,' + d.toFixed(1) + 'px,0)';
      });
    });
  })();

  /* ---------------------------------------------------------------- 7. PROGRESS + TO TOP */
  (function progress() {
    var bar = $('#progressBar'), toTop = $('#toTop');

    scrollHandlers.push(function (y) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var r = max > 0 ? y / max : 0;
      if (bar) bar.style.transform = 'scaleX(' + r.toFixed(4) + ')';
      if (toTop) toTop.classList.toggle('show', y > 900);
    });

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      });
    }
  })();

  /* ---------------------------------------------------------------- 8. PROCESS LINE */
  (function processLine() {
    var proc = $('#proc'), fill = $('#procFill');
    if (!proc || !fill) return;
    if (reduce) { fill.style.transform = 'scaleY(1)'; return; }

    scrollHandlers.push(function () {
      var r = proc.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.75 - r.top) / (r.height * 0.85);
      p = Math.max(0, Math.min(1, p));
      fill.style.transform = 'scaleY(' + p.toFixed(3) + ')';
    });
  })();

  /* ---------------------------------------------------------------- 9. COUNTERS */
  (function counters() {
    var nodes = $$('[data-count]');
    if (!nodes.length) return;

    function run(el) {
      var target = parseFloat(el.dataset.count) || 0;
      var suffix = el.dataset.suffix || '';
      if (reduce) { el.textContent = target + suffix; return; }
      var start = performance.now(), dur = 1500;
      function frame(now) {
        var t = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    nodes.forEach(function (n) { io.observe(n); });
  })();

  /* ---------------------------------------------------------------- 10. SEASON CALENDAR */
  var NOW = new Date().getMonth();

  var CROPS = [
    // level: 2 = peak, 1 = shoulder/limited, 0 = out of window
    { key: 'blueberries',  color: '#3E3D78', levels: [2,2,2,2,2,2,1,1,2,2,2,2] },
    { key: 'strawberries', color: '#C6224E', levels: [2,2,2,2,2,2,1,0,1,1,2,2] },
    { key: 'raspberries',  color: '#E23A63', levels: [1,2,2,2,2,2,1,1,2,2,2,2] },
    { key: 'blackberries', color: '#5C1A45', levels: [1,1,2,2,2,2,1,1,1,2,2,2] }
  ];

  function buildCalendar() {
    var head = $('#calHead'), body = $('#calBody');
    if (!head || !body) return;

    var months = t('months') || [];

    // Wipe everything except the row-header column, then rebuild in the active language.
    while (head.children.length > 1) head.removeChild(head.lastChild);
    body.innerHTML = '';

    months.forEach(function (m, i) {
      var th = document.createElement('th');
      th.scope = 'col';
      th.textContent = m;
      if (i === NOW) th.className = 'is-now';
      head.appendChild(th);
    });

    var d = 0;
    CROPS.forEach(function (crop) {
      var name = t('crop.' + crop.key) || crop.key;
      var tr = document.createElement('tr');

      var th = document.createElement('th');
      th.scope = 'row';
      th.className = 'cal__row-h';
      var wrap = document.createElement('span');
      var dot = document.createElement('span');
      dot.className = 'cal__dot';
      dot.style.background = crop.color;
      wrap.appendChild(dot);
      wrap.appendChild(document.createTextNode(name));
      th.appendChild(wrap);
      tr.appendChild(th);

      crop.levels.forEach(function (lvl, i) {
        var td = document.createElement('td');
        if (i === NOW) td.className = 'cal__col-now';
        var cell = document.createElement('span');
        cell.className = 'cal__cell';
        cell.setAttribute('data-level', lvl);
        cell.style.setProperty('--d', d++);
        if (lvl > 0) cell.style.setProperty('--cell-bg', crop.color);
        cell.title = name + ' · ' + months[i] + ' — ' +
          t(lvl === 2 ? 'av.peak' : lvl === 1 ? 'av.mid' : 'av.none');
        td.appendChild(cell);
        tr.appendChild(td);
      });

      body.appendChild(tr);
    });
  }

  /* ---------------------------------------------------------------- 11. "IN SEASON NOW" CHIP */
  function updateSeasonChip() {
    var el = $('#seasonNow');
    if (!el) return;

    function named(level) {
      return CROPS.filter(function (c) { return c.levels[NOW] === level; })
                  .map(function (c) { return (t('crop.' + c.key) || '').toLowerCase(); });
    }
    // Prefer peak lines; in shoulder months fall back to whatever is still loadable.
    var list = named(2);
    var suffix = '';
    if (!list.length) { list = named(1); suffix = t('season.limited') || ''; }

    var joiner = (lang === 'es') ? ' y$1' : ' &$1';
    el.textContent = list.length
      ? list.slice(0, 3).join(', ').replace(/,([^,]*)$/, joiner) + suffix
      : t('season.ask');
  }

  /* ---------------------------------------------------------------- 12. MARQUEE LOOP */
  (function marquee() {
    var track = $('#marqueeTrack');
    if (!track) return;
    var group = track.firstElementChild;
    if (!group) return;
    var clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone); // duplicate so the -50% translate loops seamlessly
  })();

  /* ---------------------------------------------------------------- 13. QUOTES SLIDER */
  (function quotes() {
    var track = $('#quotesTrack'), dots = $('#qDots');
    if (!track) return;
    var slides = $$('.quote', track);
    var idx = 0, timer = null;

    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.className = 'qdot' + (i === 0 ? ' is-active' : '');
      b.type = 'button';
      b.setAttribute('data-dot', i + 1);
      b.setAttribute('aria-label', (t('a11y.dot') || 'Quote') + ' ' + (i + 1));
      b.addEventListener('click', function () { go(i); });
      if (dots) dots.appendChild(b);
    });

    function go(n) {
      idx = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      $$('.qdot', dots).forEach(function (d, i) {
        d.classList.toggle('is-active', i === idx);
      });
      restart();
    }
    function restart() {
      if (reduce) return;
      clearInterval(timer);
      timer = setInterval(function () { go(idx + 1); }, 6500);
    }

    var prev = $('#qPrev'), next = $('#qNext');
    if (prev) prev.addEventListener('click', function () { go(idx - 1); });
    if (next) next.addEventListener('click', function () { go(idx + 1); });

    // Swipe on touch
    var x0 = null;
    track.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 48) go(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });

    restart();
  })();

  /* ---------------------------------------------------------------- 14. ACTIVE NAV */
  (function activeNav() {
    var links = $$('#nav a');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href');
      if (id && id.charAt(0) === '#') {
        var sec = document.querySelector(id);
        if (sec) map[id.slice(1)] = a;
      }
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = map[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('is-active'); });
          a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  })();

  /* ---------------------------------------------------------------- 15. FORM */
  (function form() {
    var f = $('#quoteForm');
    if (!f) return;

    function fieldOf(input) { return input.closest('.field'); }

    function validate(input) {
      var valid = input.checkValidity();
      var wrap = fieldOf(input);
      if (wrap) wrap.classList.toggle('has-err', !valid);
      return valid;
    }

    $$('input, select, textarea', f).forEach(function (input) {
      input.addEventListener('blur', function () {
        if (input.value || input.required) validate(input);
      });
      input.addEventListener('input', function () {
        var wrap = fieldOf(input);
        if (wrap && wrap.classList.contains('has-err')) validate(input);
      });
    });

    // There is no backend. Instead of posting anywhere, the form composes the
    // enquiry and hands it to WhatsApp (or the clipboard), so the qualifying
    // questions still get answered and nothing is stored on this site.
    var WHATSAPP = '34612584209';

    function val(id) {
      var el = document.getElementById(id);
      return el && el.value ? el.value.trim() : '';
    }

    function buildMessage() {
      var lines = [t('msg.title') || '365 Berries enquiry', ''];
      function add(labelKey, value) {
        if (value) lines.push((t(labelKey) || labelKey) + ': ' + value);
      }
      add('msg.name', val('f-name'));
      add('msg.company', val('f-company'));
      add('msg.email', val('f-email'));
      add('msg.country', val('f-country'));
      add('msg.product', val('f-product'));
      add('msg.type', val('f-type'));
      var req = val('f-msg');
      if (req) lines.push('', (t('msg.req') || 'Requirement') + ':', req);
      return lines.join('\n');
    }

    function validateAll() {
      var firstBad = null;
      $$('input, select, textarea', f).forEach(function (input) {
        if (!validate(input) && !firstBad) firstBad = input;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateAll()) return;
      // Opened synchronously inside the click so it isn't treated as a popup.
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(buildMessage()),
                  '_blank', 'noopener');
    });

    var copyBtn = $('#copyEnquiry');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!validateAll()) return;
        var msg = buildMessage();
        toastShow(t('f.copied') || 'Enquiry copied', false);
        copyText(msg).then(function () {
          toastShow(t('f.copied') || 'Enquiry copied', false);
        }, function () {});
      });
    }
  })();

  /* ---------------------------------------------------------------- 16. MISC */
  (function misc() {
    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();

  })();

  /* ---------------------------------------------------------------- 16b. CONTACT LINKS */
  // mailto:/tel: do nothing at all when the OS has no handler registered — common
  // on desktops without a mail client, and inside in-app browsers. The link is left
  // intact (it still works where a handler exists), but we always copy the address
  // and confirm it, so the click never appears to do nothing.
  var toastEl = null, toastTimer = null;

  function toastShow(value, copied) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="m5 13 4 4L19 7"/></svg><span></span>';
      document.body.appendChild(toastEl);
    }
    var label = toastEl.querySelector('span');
    label.innerHTML = '';
    if (copied) label.appendChild(document.createTextNode((t('toast.copied') || 'Copied') + ' — '));
    var b = document.createElement('b');
    b.textContent = value;
    label.appendChild(b);
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 4500);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for non-secure contexts (e.g. opening the file directly)
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject();
    });
  }

  (function contactLinks() {
    $$('a[href^="mailto:"], a[href^="tel:"]').forEach(function (a) {
      a.addEventListener('click', function () {
        // Never preventDefault — let the mail/phone client open if there is one.
        var value = a.getAttribute('href').replace(/^(mailto:|tel:)/i, '').split('?')[0];
        // Show the address straight away. The clipboard API can reject *or hang*
        // when the document isn't focused, so feedback must not depend on it.
        toastShow(value, false);
        copyText(value).then(function () { toastShow(value, true); }, function () {});
      });
    });
  })();

  /* ---------------------------------------------------------------- 16c. FILM */
  // Click-to-load. The Vimeo player is only injected on press, so no third-party
  // request is made and no cookie is set unless the visitor asks for the video.
  // dnt=1 tells Vimeo not to track the session even then.
  (function film() {
    var trigger = $('#filmPlay');
    if (!trigger) return;

    var VIDEO = '828990290', HASH = 'cc37213bba';
    var ORIGIN = 'https://player.vimeo.com';

    var ICON = {
      play:  'M8 5.14v13.72a1 1 0 0 0 1.54.84l10.8-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z',
      pause: 'M7 4h3.5v16H7zM13.5 4H17v16h-3.5z',
      muted: 'M11 5 6.5 9H3v6h3.5L11 19zM16 9.5l5 5m0-5-5 5',
      loud:  'M11 5 6.5 9H3v6h3.5L11 19zM15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12',
      close: 'M18 6 6 18M6 6l12 12'
    };

    function icon(d, filled) {
      return '<svg viewBox="0 0 24 24" fill="' + (filled ? 'currentColor' : 'none') +
             '" stroke="' + (filled ? 'none' : 'currentColor') +
             '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
             '<path d="' + d + '"/></svg>';
    }

    function button(cls, html, labelKey) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'film__ctrl ' + cls;
      b.innerHTML = html;
      b.setAttribute('aria-label', t(labelKey) || '');
      b.dataset.labelKey = labelKey;
      return b;
    }

    trigger.addEventListener('click', function () {
      var frame = document.createElement('div');
      frame.className = 'film__frame';

      var iframe = document.createElement('iframe');
      // Native chrome is hidden (controls=0) because the frame is scale-cropped
      // to remove the white border baked into the source video — Vimeo's own
      // control bar would sit outside the visible area. Our controls below drive
      // the player over postMessage instead, so nothing is lost.
      // muted=1 is required for autoplay to be allowed; the user can unmute.
      iframe.src = ORIGIN + '/video/' + VIDEO + '?h=' + HASH +
                   '&dnt=1&autoplay=1&muted=1&controls=0&playsinline=1' +
                   '&title=0&byline=0&portrait=0';
      iframe.title = '365 Berries';
      iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

      function send(method, value) {
        if (!iframe.contentWindow) return;
        var msg = (value === undefined) ? { method: method } : { method: method, value: value };
        try { iframe.contentWindow.postMessage(JSON.stringify(msg), ORIGIN); } catch (e) {}
      }

      var playing = true, muted = true;

      var bPlay  = button('film__ctrl--play', icon(ICON.pause, true), 'fl.pause');
      var bMute  = button('film__ctrl--mute', icon(ICON.muted), 'fl.unmute');
      var bClose = button('film__ctrl--close', icon(ICON.close), 'fl.close');

      function setPlaying(next) {
        playing = next;
        bPlay.innerHTML = icon(playing ? ICON.pause : ICON.play, true);
        bPlay.dataset.labelKey = playing ? 'fl.pause' : 'fl.play';
        bPlay.setAttribute('aria-label', t(bPlay.dataset.labelKey) || '');
      }
      function setMuted(next) {
        muted = next;
        bMute.innerHTML = icon(muted ? ICON.muted : ICON.loud);
        bMute.dataset.labelKey = muted ? 'fl.unmute' : 'fl.mute';
        bMute.setAttribute('aria-label', t(bMute.dataset.labelKey) || '');
      }

      bPlay.addEventListener('click', function () {
        send(playing ? 'pause' : 'play');
        setPlaying(!playing);
      });
      bMute.addEventListener('click', function () {
        if (muted) { send('setMuted', false); send('setVolume', 1); }
        else { send('setMuted', true); send('setVolume', 0); }
        setMuted(!muted);
      });
      bClose.addEventListener('click', function () {
        window.removeEventListener('message', onMessage);
        frame.replaceWith(trigger);       // back to the poster; Vimeo is unloaded
        trigger.focus();
      });

      function onMessage(e) {
        if (e.origin !== ORIGIN) return;   // only trust the player
        var d;
        try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (err) { return; }
        if (!d) return;
        if (d.event === 'ready') {
          ['play', 'pause', 'ended'].forEach(function (ev) { send('addEventListener', ev); });
        } else if (d.event === 'play') { setPlaying(true); }
        else if (d.event === 'pause' || d.event === 'ended') { setPlaying(false); }
      }
      window.addEventListener('message', onMessage);

      var bar = document.createElement('div');
      bar.className = 'film__controls';
      bar.appendChild(bPlay);
      bar.appendChild(bMute);
      bar.appendChild(bClose);

      frame.appendChild(iframe);
      frame.appendChild(bar);
      trigger.replaceWith(frame);

      var note = $('.film__note');
      if (note) note.remove();
      bPlay.focus();
    });
  })();

  /* ---------------------------------------------------------------- 17. LANGUAGE INIT */
  // Last, so the calendar, quote dots and split headings all exist to translate.
  initLang();

  /* ---------------------------------------------------------------- 18. SCROLL LOOP */
  // One rAF-throttled listener drives every scroll-linked effect.
  function onScrollRaf() {
    var ticking = false;
    function run() {
      var y = window.pageYOffset;
      for (var i = 0; i < scrollHandlers.length; i++) scrollHandlers[i](y);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(run); }
    }, { passive: true });
    run();
  }
  onScrollRaf();

})();
