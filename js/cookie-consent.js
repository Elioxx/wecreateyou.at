/* ============================================================
   Cookie Consent
   Aktuell werden keine Analytics-/Marketing-Cookies gesetzt.
   Sobald hier eine GA_MEASUREMENT_ID eingetragen wird, lädt
   dieses Skript Google Analytics NUR nach Einwilligung ("Alle
   akzeptieren"). Die Zustimmung selbst wird in localStorage
   gespeichert (technisch notwendig, kein Consent-Cookie nötig).
   ============================================================ */
(function () {
  var GA_MEASUREMENT_ID = ''; // z.B. 'G-XXXXXXXXXX' sobald vorhanden

  var STORAGE_KEY = 'wcy_cookie_consent';

  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setConsent(status) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: status, date: new Date().toISOString() }));
    } catch (e) { /* localStorage nicht verfügbar - Banner erscheint dann erneut */ }
  }

  function loadAnalytics() {
    if (!GA_MEASUREMENT_ID) return;
    if (document.getElementById('ga-script')) return;

    var script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  function buildBanner() {
    var banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie-Einstellungen');
    banner.innerHTML =
      '<div class="cookie-banner__inner">' +
      '<p class="cookie-banner__text">Wir verwenden nur technisch notwendige Daten. Optionale Statistik-Cookies (z. B. Google Analytics) setzen wir ausschließlich mit deiner Zustimmung. ' +
      '<a href="/datenschutz.html#cookies" class="cookie-banner__link">Mehr erfahren</a></p>' +
      '<div class="cookie-banner__actions">' +
      '<button type="button" class="btn btn--secondary cookie-banner__btn" id="cookie-necessary">Nur notwendige</button>' +
      '<button type="button" class="btn btn--primary cookie-banner__btn" id="cookie-accept">Alle akzeptieren</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(banner);

    document.getElementById('cookie-accept').addEventListener('click', function () {
      setConsent('all');
      loadAnalytics();
      banner.remove();
    });
    document.getElementById('cookie-necessary').addEventListener('click', function () {
      setConsent('necessary');
      banner.remove();
    });
  }

  function init() {
    var consent = getConsent();
    if (!consent) {
      buildBanner();
      return;
    }
    if (consent.status === 'all') {
      loadAnalytics();
    }
  }

  function openSettings() {
    var existing = document.getElementById('cookie-banner');
    if (existing) existing.remove();
    buildBanner();
  }

  window.wcyCookieSettings = openSettings;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
