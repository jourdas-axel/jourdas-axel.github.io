/* Portfolio Axel Jourdas — scripts communs
   - en-tête / pied de page (écrits une seule fois ici)
   - thème clair/sombre, menu mobile, animations
   - composants : filtres, copie de code, galerie, sommaire,
     schéma réseau cliquable, terminal animé, avant/après, matrice */
(function () {
  'use strict';
  var root = document.body.getAttribute('data-root') || '';
  var page = document.body.getAttribute('data-page') || '';

  var ICONS = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  var NAV = [
    ['index.html', 'Accueil', 'accueil'],
    ['about.html', 'À propos', 'about'],
    ['bts_sio.html', 'Parcours', 'parcours'],
    ['competences.html', 'Compétences', 'competences'],
    ['projects.html', 'Projets', 'projets'],
    ['veille.html', 'Veille', 'veille'],
    ['documentation.html', 'Ressources', 'ressources'],
    ['synthese.html', 'Synthèse BTS', 'synthese'],
    ['contact.html', 'Contact', 'contact']
  ];

  /* ---------- Thème ---------- */
  var html = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem('theme'); } catch (e) {}
  html.setAttribute('data-theme', stored === 'light' ? 'light' : 'dark'); /* baie noire par défaut */

  /* ---------- En-tête : panneau de brassage ---------- */
  var header = document.createElement('header');
  header.className = 'site-header';
  var links = NAV.map(function (n, i) {
    var cur = (n[2] === page) ? ' aria-current="page"' : '';
    var num = (i + 1 < 10 ? '0' : '') + (i + 1);
    return '<li><a class="port" href="' + root + n[0] + '"' + cur + '>' +
      '<span class="port-top" aria-hidden="true"><i class="led"></i>' + num + '</span>' +
      '<span class="port-jack" aria-hidden="true"></span>' +
      '<span class="port-label">' + n[1] + '</span></a></li>';
  }).join('');
  header.innerHTML =
    '<div class="container">' +
      '<a class="brand" href="' + root + 'index.html" aria-label="Accueil"><span class="brand-mark">AJ</span><span class="brand-txt"><b>Axel Jourdas</b><small>RACK-01 · BTS SIO SISR</small></span></a>' +
      '<nav class="main-nav" id="main-nav" aria-label="Navigation principale"><ul>' + links + '</ul></nav>' +
      '<div class="header-actions">' +
        '<button class="icon-btn theme-toggle" type="button" aria-label="Changer de thème" title="Baie noire / baie grise"><span class="moon">' + ICONS.moon + '</span><span class="sun">' + ICONS.sun + '</span></button>' +
        '<button class="icon-btn menu-toggle" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="main-nav">' + ICONS.menu + '</button>' +
      '</div>' +
    '</div>';
  var skip = document.createElement('a');
  skip.className = 'skip-link'; skip.href = '#contenu'; skip.textContent = 'Aller au contenu';
  document.body.insertBefore(header, document.body.firstChild);
  document.body.insertBefore(skip, header);

  /* ---------- Pied de page ---------- */
  var footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML =
    '<div class="container">' +
      '<div class="pdu"><i class="led led--on"></i><span>PDU · alim OK</span><i class="led led--act"></i><span>© ' + new Date().getFullYear() + ' Axel Jourdas</span></div>' +
      '<nav aria-label="Liens utiles">' +
        '<a href="' + root + 'CV%20DIGITAL%20SCHOOL.pdf" target="_blank" rel="noopener">CV (PDF)</a>' +
        '<a href="mailto:axel.jourdas@gmail.com">E-mail</a>' +
        '<a href="https://www.linkedin.com/in/axel-jourdas/" target="_blank" rel="noopener">LinkedIn</a>' +
        '<a href="https://github.com/jourdas-axel" target="_blank" rel="noopener">GitHub</a>' +
        '<a href="' + root + 'contact.html">Contact</a>' +
      '</nav>' +
    '</div>';
  document.body.appendChild(footer);

  /* ---------- Interactions en-tête ---------- */
  var themeBtn = header.querySelector('.theme-toggle');
  themeBtn.addEventListener('click', function () {
    var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
  var nav = header.querySelector('.main-nav');
  var menuBtn = header.querySelector('.menu-toggle');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.innerHTML = open ? ICONS.close : ICONS.menu;
    menuBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Écran LCD : messages qui défilent ---------- */
  document.querySelectorAll('.lcd[data-lines]').forEach(function (lcd) {
    var lines; try { lines = JSON.parse(lcd.getAttribute('data-lines')); } catch (e) { return; }
    var out = lcd.querySelector('.lcd-text'); if (!out || !lines.length) return;
    var li = 0;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function typeLine() {
      var txt = lines[li % lines.length], i = 0; li++;
      if (reduce) { out.textContent = txt; setTimeout(typeLine, 3500); return; }
      (function step() { out.textContent = txt.slice(0, i++); if (i <= txt.length) setTimeout(step, 38); else setTimeout(typeLine, 2600); })();
    }
    typeLine();
  });

  /* ---------- Apparition au défilement ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('visible'); }); }

  /* ---------- Filtres projets ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) { b.classList.toggle('active', b === btn); b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      document.querySelectorAll('.project-card[data-cat]').forEach(function (card) {
        var cats = card.getAttribute('data-cat').split(' ');
        card.classList.toggle('is-hidden', f !== 'tous' && cats.indexOf(f) === -1);
      });
    });
  });

  /* ---------- Copier le code ---------- */
  document.querySelectorAll('.code').forEach(function (block) {
    var btn = block.querySelector('.copy-btn');
    var pre = block.querySelector('pre');
    if (!btn || !pre) return;
    btn.addEventListener('click', function () {
      var clone = pre.cloneNode(true);
      clone.querySelectorAll('.pr').forEach(function (p) { p.remove(); });
      var text = clone.textContent.replace(/\n$/, '');
      var done = function () { btn.textContent = 'Copié ✓'; setTimeout(function () { btn.textContent = 'Copier'; }, 1600); };
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, function () {}); }
      else { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} ta.remove(); }
    });
  });

  /* ---------- Galerie (lightbox) ---------- */
  var shots = Array.prototype.slice.call(document.querySelectorAll('.gallery figure, figure.shot'));
  if (shots.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Capture agrandie');
    lb.innerHTML = '<button class="lb-close" type="button" aria-label="Fermer">×</button><button class="lb-prev" type="button" aria-label="Précédente">‹</button><img alt=""><p></p><button class="lb-next" type="button" aria-label="Suivante">›</button>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img'), lbTxt = lb.querySelector('p'), idx = 0;
    var show = function (i) {
      idx = (i + shots.length) % shots.length;
      var img = shots[idx].querySelector('img'), cap = shots[idx].querySelector('figcaption');
      lbImg.src = img.getAttribute('src'); lbImg.alt = img.alt; lbTxt.textContent = cap ? cap.textContent : img.alt;
      lb.classList.add('open'); document.body.style.overflow = 'hidden';
    };
    var hide = function () { lb.classList.remove('open'); document.body.style.overflow = ''; };
    shots.forEach(function (f, i) {
      f.setAttribute('tabindex', '0');
      f.addEventListener('click', function () { show(i); });
      f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); } });
    });
    lb.querySelector('.lb-close').addEventListener('click', hide);
    lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) hide(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') hide(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------- Sommaire actif ---------- */
  var tocLinks = document.querySelectorAll('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          tocLinks.forEach(function (a) { a.classList.remove('active'); });
          map[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) tio.observe(s); });
  }

  /* ---------- Schéma cliquable ---------- */
  document.querySelectorAll('.diagram[data-interactive]').forEach(function (d) {
    var panel = d.querySelector('.diagram-panel');
    var nodes = d.querySelectorAll('.node[data-key]');
    function select(key) {
      nodes.forEach(function (n) { n.classList.toggle('active', n.getAttribute('data-key') === key); });
      var tpl = d.querySelector('template[data-for="' + key + '"]');
      if (tpl && panel) panel.innerHTML = tpl.innerHTML;
    }
    nodes.forEach(function (n) {
      n.setAttribute('tabindex', '0'); n.setAttribute('role', 'button');
      n.addEventListener('click', function () { select(n.getAttribute('data-key')); });
      n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n.getAttribute('data-key')); } });
    });
    var first = d.getAttribute('data-default'); if (first) select(first);
  });

  /* ---------- Terminal animé ---------- */
  document.querySelectorAll('.terminal[data-replay]').forEach(function (t) {
    var data; try { data = JSON.parse(document.getElementById(t.getAttribute('data-replay')).textContent); } catch (e) { return; }
    var body = t.querySelector('.terminal-body');
    var playBtn = t.querySelector('[data-act="play"]'), skipBtn = t.querySelector('[data-act="skip"]'), resetBtn = t.querySelector('[data-act="reset"]');
    var prompt = t.getAttribute('data-prompt') || '$ ';
    var step = 0, timer = null, running = false;
    var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    function line(cls, txt) { var s = document.createElement('span'); s.className = cls; s.innerHTML = txt; body.appendChild(s); body.appendChild(document.createTextNode('\n')); body.scrollTop = body.scrollHeight; return s; }
    function cursor() { var c = body.querySelector('.cursor'); if (c) c.remove(); var n = document.createElement('span'); n.className = 'cursor'; body.appendChild(n); }
    function finishStep(s) {
      (s.out || []).forEach(function (o) { line('out', esc(o)); });
      if (s.note) line('note', '# ' + esc(s.note));
    }
    function typeStep() {
      if (step >= data.length) { running = false; playBtn.textContent = 'Rejouer'; cursor(); return; }
      var s = data[step];
      var c = body.querySelector('.cursor'); if (c) c.remove();
      var el = line('cmd', '<span class="pr">' + esc(prompt) + '</span>');
      var i = 0;
      (function typeChar() {
        if (!running) return;
        if (i <= s.cmd.length) {
          el.innerHTML = '<span class="pr">' + esc(prompt) + '</span>' + esc(s.cmd.slice(0, i)) + '<span class="cursor"></span>';
          i++; timer = setTimeout(typeChar, 28 + Math.random() * 40);
        } else {
          el.innerHTML = '<span class="pr">' + esc(prompt) + '</span>' + esc(s.cmd);
          finishStep(s); step++; timer = setTimeout(typeStep, 650);
        }
      })();
    }
    function play() {
      if (step >= data.length) reset();
      running = !running;
      playBtn.textContent = running ? 'Pause' : 'Lecture';
      if (running) typeStep(); else clearTimeout(timer);
    }
    function reset() { clearTimeout(timer); running = false; step = 0; body.innerHTML = ''; cursor(); playBtn.textContent = 'Lecture'; }
    function skipAll() {
      clearTimeout(timer); running = false; body.innerHTML = '';
      data.forEach(function (s) { line('cmd', '<span class="pr">' + esc(prompt) + '</span>' + esc(s.cmd)); finishStep(s); });
      step = data.length; cursor(); playBtn.textContent = 'Rejouer';
    }
    playBtn.addEventListener('click', play); skipBtn.addEventListener('click', skipAll); resetBtn.addEventListener('click', reset);
    reset();
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var started = false;
      var tio2 = new IntersectionObserver(function (en) { if (en[0].isIntersecting && !started) { started = true; play(); tio2.disconnect(); } }, { threshold: 0.5 });
      tio2.observe(t);
    }
  });

  /* ---------- Avant / après ---------- */
  document.querySelectorAll('.switch[data-target]').forEach(function (sw) {
    var target = document.getElementById(sw.getAttribute('data-target'));
    sw.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        sw.querySelectorAll('button').forEach(function (x) { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        target.setAttribute('data-state', b.getAttribute('data-state'));
      });
    });
  });

  /* ---------- Matrice de priorité GLPI ---------- */
  document.querySelectorAll('.matrix').forEach(function (m) {
    var out = document.getElementById(m.getAttribute('data-output'));
    var names = { 1: 'Très basse', 2: 'Basse', 3: 'Moyenne', 4: 'Haute', 5: 'Très haute' };
    m.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        m.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        if (out) out.innerHTML = 'Urgence <strong>' + b.getAttribute('data-u') + '</strong> × impact <strong>' + b.getAttribute('data-i') + '</strong> → priorité <strong>' + names[b.getAttribute('data-p')] + '</strong>. ' + (b.getAttribute('data-ex') || '');
      });
    });
  });
})();
