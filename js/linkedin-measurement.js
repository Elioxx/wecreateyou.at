/* LinkedIn measurement is restricted to this landingpage and requires opt-in.
   Account identifiers are populated only after LinkedIn setup is approved. */
(function () {
  'use strict';
  var script = document.currentScript;
  var partnerId = script && script.dataset.partnerId;
  var conversionId = script && script.dataset.conversionId;
  if (!/^\d+$/.test(partnerId || '') || !/^\d+$/.test(conversionId || '')) return;
  var key = 'wcy_linkedin_consent_v1';
  var permitted = false;
  function readConsent() {
    try {
      var value = JSON.parse(localStorage.getItem(key) || 'null');
      return value && Date.now() - value.at < 180 * 86400000 ? value.choice : null;
    } catch (_) { return null; }
  }
  function loadTag() {
    if (!permitted || document.getElementById('wcy-linkedin-tag')) return;
    window._linkedin_partner_id = partnerId;
    window._linkedin_data_partner_ids = [partnerId];
    window.lintrk = window.lintrk || function (a, b) {
      (window.lintrk.q = window.lintrk.q || []).push([a, b]);
    };
    var tag = document.createElement('script');
    tag.id = 'wcy-linkedin-tag';
    tag.async = true;
    tag.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    document.head.appendChild(tag);
  }
  function choose(choice) {
    var withdrawing = permitted && choice !== 'allow';
    permitted = choice === 'allow';
    try { localStorage.setItem(key, JSON.stringify({ choice: choice, at: Date.now() })); } catch (_) {}
    var panel = document.getElementById('wcy-linkedin-consent');
    if (panel) panel.remove();
    if (withdrawing) { window.location.reload(); return; }
    if (permitted) loadTag();
  }
  function settings() {
    var existing = document.getElementById('wcy-linkedin-consent');
    if (existing) existing.remove();
    var panel = document.createElement('section');
    panel.id = 'wcy-linkedin-consent';
    panel.setAttribute('aria-label', 'Optionale LinkedIn-Messung');
    panel.style.cssText = 'position:fixed;inset:auto 16px 76px;z-index:10000;background:#16141f;color:#fff;border:1px solid #8b5cf6;border-radius:12px;padding:20px;max-width:720px;margin:auto;box-shadow:0 8px 32px #0008;font:15px/1.5 sans-serif';
    panel.innerHTML = '<strong>Optionale LinkedIn-Messung</strong><p>Mit deiner Zustimmung laden wir den LinkedIn Insight Tag. LinkedIn erhält dabei Nutzungsdaten und kann deinen Besuch sowie eine erfolgreiche Anfrage einer Anzeige zuordnen. Das Formular funktioniert auch ohne Zustimmung. <a href="/datenschutz.html#linkedin" style="color:#c4b5fd">Details zum Datenschutz</a></p><div style="display:flex;gap:12px;flex-wrap:wrap"><button type="button" data-choice="deny">Ohne LinkedIn fortfahren</button><button type="button" data-choice="allow">LinkedIn-Messung erlauben</button></div>';
    panel.querySelectorAll('button').forEach(function (button) {
      button.style.cssText = 'padding:12px 16px;border-radius:8px;border:1px solid #c4b5fd;background:#292236;color:white;font:inherit;cursor:pointer';
      button.addEventListener('click', function () { choose(button.dataset.choice); });
    });
    document.body.appendChild(panel);
  }
  document.addEventListener('wcy:lead-success', function (event) {
    if (!permitted || !event.detail || event.detail.formName !== 'process_check') return;
    // Only a server-confirmed successful process-check form triggers conversion.
    // No email, name, phone, message or other form data is sent to LinkedIn.
    window.lintrk('track', { conversion_id: Number(conversionId) });
  });
  var button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'LinkedIn-Messung / Einwilligung ändern';
  button.style.cssText = 'background:none;color:inherit;border:0;text-decoration:underline;cursor:pointer;font:inherit';
  button.addEventListener('click', settings);
  var footer = document.querySelector('.ads-footer .container');
  if (footer) footer.appendChild(button);
  var choice = readConsent();
  permitted = choice === 'allow';
  if (permitted) loadTag();
  if (!choice) settings();
})();
