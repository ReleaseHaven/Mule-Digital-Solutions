/* Privacy page: language + consent withdrawal */
(function () {
  'use strict';
  var TITLES = {
    da: 'Privatlivspolitik og cookies | Mule Digital Solutions',
    en: 'Privacy policy and cookies | Mule Digital Solutions',
    es: 'Política de privacidad y cookies | Mule Digital Solutions'
  };
  var BACK = { da: '← Til forsiden', en: '← Back to home', es: '← Volver al inicio' };
  var DONE = {
    da: 'Samtykket er trukket tilbage, og Google Analytics-cookies er slettet.',
    en: 'Consent withdrawn and Google Analytics cookies deleted.',
    es: 'Retiraste el consentimiento y borramos las cookies de Google Analytics.'
  };
  var HTML_LANG = { da: 'da', en: 'en', es: 'es-AR' };

  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }
  function detect() {
    var saved = store('mds_lang');
    if (saved && TITLES[saved]) return saved;
    var l = String((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase();
    if (l.indexOf('es') === 0) return 'es';
    if (l.indexOf('da') === 0) return 'da';
    return 'en';
  }
  var lang;
  function apply(l) {
    lang = l;
    document.documentElement.lang = HTML_LANG[l];
    document.title = TITLES[l];
    document.querySelectorAll('[data-lang-block]').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-lang-block') === l);
    });
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === l;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    document.getElementById('backLink').textContent = BACK[l];
  }
  apply(detect());
  document.documentElement.classList.remove('i18n-pending');
  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.addEventListener('click', function () { store('mds_lang', b.getAttribute('data-lang')); apply(b.getAttribute('data-lang')); });
  });

  document.querySelectorAll('.js-withdraw').forEach(function (btn) {
    btn.addEventListener('click', function () {
      store('mds_consent', 'denied');
      document.cookie.split(';').forEach(function (c) {
        var name = c.split('=')[0].trim();
        if (name.indexOf('_ga') === 0) {
          var host = location.hostname.replace(/^www\./, '');
          ['', '; domain=.' + host, '; domain=' + location.hostname].forEach(function (d) {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
          });
        }
      });
      document.querySelectorAll('.js-status').forEach(function (s) { s.textContent = DONE[lang]; });
    });
  });
})();
