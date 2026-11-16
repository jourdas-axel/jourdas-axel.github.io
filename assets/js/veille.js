/* Veille informatique automatique
   - lit les flux RSS de sites d'actualité tech grand public
   - passe par le service rss2json (les sites ne permettent pas la lecture
     directe depuis un navigateur)
   - si le relais ne répond pas, la dernière synchro gardée en cache s'affiche
   - écarte les « bons plans », alterne les sources
   - si une source est indisponible, les autres s'affichent quand même
   - trie par date, met en cache 30 min, se rafraîchit tout seul */
(function () {
  'use strict';
  var SOURCES = [
    { id: '01net', name: '01net', url: 'https://www.01net.com/actualites/feed/', site: 'https://www.01net.com/', color: '#3d8bff' },
    { id: 'frandroid', name: 'Frandroid', url: 'https://www.frandroid.com/feed', site: 'https://www.frandroid.com/', color: '#2fd47a' },
    { id: 'lesnum', name: 'Les Numériques', url: 'https://www.lesnumeriques.com/rss.xml', site: 'https://www.lesnumeriques.com/', color: '#ffb43a' },
    { id: 'pressecitron', name: 'Presse-citron', url: 'https://www.presse-citron.net/feed/', site: 'https://www.presse-citron.net/', color: '#d8c63a' },
    { id: 'numerama', name: 'Numerama', url: 'https://www.numerama.com/feed/', site: 'https://www.numerama.com/', color: '#b98cff' },
    { id: 'cyber', name: 'Cybermalveillance', url: 'https://www.cybermalveillance.gouv.fr/feed/atom-flux-actualites', site: 'https://www.cybermalveillance.gouv.fr/', color: '#ff4f5e' }
  ];
  var CACHE_KEY = 'veille-cache-v1';
  var TTL = 30 * 60 * 1000;        // 30 minutes
  var MAX_ITEMS = 36;

  var grid = document.getElementById('feed');
  var filtersEl = document.getElementById('feed-filters');
  var statusEl = document.getElementById('feed-status');
  var refreshBtn = document.getElementById('feed-refresh');
  if (!grid) return;

  var allItems = [], current = 'tous', loading = false;
  var rtf = window.Intl && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }) : null;

  /* ---------- Outils ---------- */
  function safeUrl(u) { try { var x = new URL(u); return (x.protocol === 'https:' || x.protocol === 'http:') ? x.href : ''; } catch (e) { return ''; } }
  function textOf(html) { var d = new DOMParser().parseFromString('<body>' + (html || '') + '</body>', 'text/html'); return (d.body.textContent || '').replace(/\s+/g, ' ').trim(); }
  function firstImg(html) { var m = /<img[^>]+src=["']([^"']+)["']/i.exec(html || ''); return m ? m[1] : ''; }
  function parseDate(s) {
    if (!s) return 0;
    var t = Date.parse(s);
    if (isNaN(t)) t = Date.parse(String(s).replace(' ', 'T') + 'Z'); /* format rss2json : "AAAA-MM-JJ hh:mm:ss" (UTC) */
    return isNaN(t) ? 0 : t;
  }
  function ago(t) {
    var diff = (t - Date.now()) / 1000, abs = Math.abs(diff);
    if (!rtf) return new Date(t).toLocaleString('fr-FR');
    if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    return rtf.format(Math.round(diff / 86400), 'day');
  }
  function hhmm(t) { return new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
  function setStatus(txt) { if (statusEl) statusEl.textContent = txt; }

  /* Les « bons plans » et promos ne sont pas de la veille : on les écarte */
  var DEAL_RE = /(bons? plans?|black friday|cyber monday|french days|prime day|soldes|code promo|\bpromo\b|-\d+\s?%|à moins de \d+|meilleur prix|prix cass)/i;
  /* Alterne les sources (tour par tour) pour qu'aucune ne monopolise la page */
  function interleave(items) {
    var groups = {}, order = [];
    items.forEach(function (it) { if (!groups[it.src]) { groups[it.src] = []; order.push(it.src); } groups[it.src].push(it); });
    order.forEach(function (k) { groups[k].sort(function (a, b) { return b.date - a.date; }); });
    var out = [], round = 0, added = true;
    while (added) {
      added = false; var batch = [];
      order.forEach(function (k) { if (groups[k][round]) { batch.push(groups[k][round]); added = true; } });
      batch.sort(function (a, b) { return b.date - a.date; });
      out = out.concat(batch); round++;
    }
    return out;
  }
  function withTimeout(ms) { var c = new AbortController(); setTimeout(function () { c.abort(); }, ms); return c.signal; }

  /* ---------- Récupération d'un flux ---------- */
  function viaRss2json(src) {
    return fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(src.url), { signal: withTimeout(10000) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        if (j.status !== 'ok' || !j.items) throw new Error(j.message || 'flux invalide');
        return j.items.map(function (it) {
          var html = it.description || it.content || '';
          return {
            src: src.id, title: textOf(it.title), link: safeUrl(it.link),
            date: parseDate(it.pubDate), excerpt: textOf(html).slice(0, 220),
            img: safeUrl(it.thumbnail || (it.enclosure && it.enclosure.link) || firstImg(html) || firstImg(it.content))
          };
        });
      });
  }
  function fetchSource(src) {
    return viaRss2json(src).catch(function () { return []; });
  }

  /* ---------- Affichage ---------- */
  function sourceById(id) { for (var i = 0; i < SOURCES.length; i++) if (SOURCES[i].id === id) return SOURCES[i]; return null; }
  function render() {
    var items = allItems.filter(function (it) { return current === 'tous' || it.src === current; }).slice(0, MAX_ITEMS);
    grid.innerHTML = '';
    if (!items.length) {
      var p = document.createElement('p'); p.className = 'feed-status';
      p.textContent = 'Aucun article disponible pour le moment. Les sources restent accessibles ci-dessous.';
      grid.appendChild(p); return;
    }
    var frag = document.createDocumentFragment();
    items.forEach(function (it) {
      var src = sourceById(it.src) || { name: it.src, color: '' };
      var a = document.createElement('a');
      a.className = 'news' + (Date.now() - it.date < 6 * 3600 * 1000 ? ' is-new' : '');
      a.href = it.link || src.site; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.style.setProperty('--src', src.color);
      if (it.img) { var im = document.createElement('div'); im.className = 'n-img'; im.style.backgroundImage = 'url("' + it.img.replace(/"/g, '%22') + '")'; a.appendChild(im); }
      var body = document.createElement('div'); body.className = 'n-body';
      var meta = document.createElement('div'); meta.className = 'n-meta';
      var s = document.createElement('span'); s.className = 'n-src'; s.textContent = src.name;
      var tm = document.createElement('time'); if (it.date) { tm.dateTime = new Date(it.date).toISOString(); tm.textContent = ago(it.date); tm.title = new Date(it.date).toLocaleString('fr-FR'); }
      meta.appendChild(s); meta.appendChild(tm);
      var h = document.createElement('h3'); h.textContent = it.title;
      body.appendChild(meta); body.appendChild(h);
      if (it.excerpt) { var p2 = document.createElement('p'); p2.textContent = it.excerpt; body.appendChild(p2); }
      a.appendChild(body); frag.appendChild(a);
    });
    grid.appendChild(frag);
  }
  function buildFilters() {
    if (!filtersEl) return;
    var counts = {}; allItems.forEach(function (it) { counts[it.src] = (counts[it.src] || 0) + 1; });
    filtersEl.innerHTML = '';
    [{ id: 'tous', name: 'Tout' }].concat(SOURCES).forEach(function (src) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'filter-btn' + (src.id === current ? ' active' : '');
      b.setAttribute('aria-pressed', src.id === current ? 'true' : 'false');
      b.textContent = src.name + (src.id === 'tous' ? ' (' + allItems.length + ')' : ' (' + (counts[src.id] || 0) + ')');
      b.addEventListener('click', function () { current = src.id; buildFilters(); render(); });
      filtersEl.appendChild(b);
    });
  }
  function skeletons() { grid.innerHTML = ''; for (var i = 0; i < 6; i++) { var d = document.createElement('div'); d.className = 'skeleton'; grid.appendChild(d); } }

  /* ---------- Cache ---------- */
  function readCache() { try { var c = JSON.parse(localStorage.getItem(CACHE_KEY)); return c && c.items ? c : null; } catch (e) { return null; } }
  function writeCache(items) { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), items: items })); } catch (e) {} }

  /* ---------- Synchronisation ---------- */
  function sync(force) {
    if (loading) return;
    var cache = readCache();
    if (!force && cache && Date.now() - cache.time < TTL) {
      allItems = cache.items; buildFilters(); render();
      setStatus('SYNCHRO ' + hhmm(cache.time) + ' · ' + allItems.length + ' ARTICLES · PROCHAINE DANS ' + Math.max(1, Math.round((TTL - (Date.now() - cache.time)) / 60000)) + ' MIN');
      return;
    }
    loading = true;
    if (refreshBtn) refreshBtn.disabled = true;
    if (!allItems.length) { if (cache) { allItems = cache.items; buildFilters(); render(); } else skeletons(); }
    setStatus('SYNCHRONISATION EN COURS…');
    Promise.all(SOURCES.map(fetchSource)).then(function (lists) {
      var merged = [].concat.apply([], lists).filter(function (it) { return it.title && it.link && !DEAL_RE.test(it.title); });
      var seen = {}; merged = merged.filter(function (it) { if (seen[it.link]) return false; seen[it.link] = 1; return true; });
      merged = interleave(merged);
      var ok = lists.filter(function (l) { return l.length; }).length;
      if (merged.length) { allItems = merged; writeCache(merged); }
      buildFilters(); render();
      setStatus(merged.length
        ? 'SYNCHRO ' + hhmm(Date.now()) + ' · ' + merged.length + ' ARTICLES · ' + ok + '/' + SOURCES.length + ' SOURCES EN LIGNE'
        : 'LIAISON IMPOSSIBLE · RÉESSAYEZ PLUS TARD');
    }).then(function () { loading = false; if (refreshBtn) refreshBtn.disabled = false; });
  }

  if (refreshBtn) refreshBtn.addEventListener('click', function () { sync(true); });
  sync(false);
  setInterval(function () { if (!document.hidden) sync(true); }, TTL);
  document.addEventListener('visibilitychange', function () { var c = readCache(); if (!document.hidden && (!c || Date.now() - c.time > TTL)) sync(true); });
})();
