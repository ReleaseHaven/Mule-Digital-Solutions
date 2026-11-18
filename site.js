/* Mule Digital Solutions - site behaviour */
(function () {
  'use strict';
  var GA_ID = 'G-RDGVVFPQ6P';
  var html = document.documentElement;

  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }

  // ─── Language ───
  // Each language has its own URL (/, /da, /es) so Google indexes all three.
  // On the front page only: a saved choice wins, otherwise the browser decides
  // (Spanish only for es-* browsers, Danish for da-*, English for everyone else).
  // (The front-page redirect for da/es browsers runs inline in <head> to avoid a flash.)
  document.querySelectorAll('.lang-btn').forEach(function (a) {
    a.addEventListener('click', function () { store('mds_lang', a.getAttribute('data-lang')); });
  });

  var heroWords = [];
  try { heroWords = JSON.parse(html.getAttribute('data-words') || '[]'); } catch (e) { heroWords = []; }
  var heroWordIdx = 0;

  // ─── Nav ───
  var nav = document.getElementById('nav');
  var hamburger = document.getElementById('hamburger');
  var navMobile = document.getElementById('navMobile');

  function closeMenu() {
    if (!navMobile) return;
    navMobile.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  hamburger.addEventListener('click', function () {
    var open = navMobile.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navMobile.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  // ─── Scroll animations ───
  var motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  var animated = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in');
  if (motionOK && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
    animated.forEach(function (el) { io.observe(el); });
  } else {
    animated.forEach(function (el) { el.classList.add('visible'); });
  }

  // ─── Hero word cycling ───
  var heroWordEl = document.getElementById('heroWord');
  if (heroWordEl && motionOK && heroWords.length > 1) {
    setInterval(function () {
      heroWordEl.classList.add('hw-out');
      setTimeout(function () {
        heroWordIdx = (heroWordIdx + 1) % heroWords.length;
        heroWordEl.textContent = heroWords[heroWordIdx];
        heroWordEl.classList.remove('hw-out');
      }, 420);
    }, 2800);
  }

  // ─── Cookie consent + Google Analytics (only loaded after "Accept") ───
  var consentBox = document.getElementById('consent');
  var gaLoaded = false;

  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;
    window['ga-disable-' + GA_ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function deleteGACookies() {
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ga') === 0) {
        var host = location.hostname.replace(/^www\./, '');
        ['', '; domain=.' + host, '; domain=' + location.hostname].forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }

  function setConsent(val) {
    store('mds_consent', val);
    consentBox.classList.remove('show');
    if (val === 'granted') {
      loadGA();
    } else {
      window['ga-disable-' + GA_ID] = true;
      deleteGACookies();
    }
  }

  var consent = store('mds_consent');
  if (consent === 'granted') loadGA();
  else if (consent !== 'denied') consentBox.classList.add('show');

  document.getElementById('consentAccept').addEventListener('click', function () { setConsent('granted'); });
  document.getElementById('consentDecline').addEventListener('click', function () { setConsent('denied'); });
  document.getElementById('cookieSettings').addEventListener('click', function () { consentBox.classList.add('show'); });
})();
