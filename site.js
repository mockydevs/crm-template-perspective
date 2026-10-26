/* global window, document */
(() => {
  'use strict';
  const config = window.siteConfig || {};
  const brand =
    typeof config.brandName === 'string' ? config.brandName.slice(0, 120) : 'Your studio';
  for (const element of document.querySelectorAll('[data-brand]')) element.textContent = brand;
  for (const element of document.querySelectorAll('[data-service]'))
    element.textContent =
      typeof config.serviceName === 'string' ? config.serviceName.slice(0, 180) : 'Your service';
  for (const element of document.querySelectorAll('[data-year]'))
    element.textContent = String(new Date().getFullYear());
  for (const element of document.querySelectorAll('[data-privacy-notice]'))
    if (typeof config.privacyNotice === 'string' && config.privacyNotice.trim())
      element.textContent = config.privacyNotice;
  const attribution = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'utm_keyword',
    'utm_matchtype',
    'matchtype',
    'campaign_id',
    'utm_id',
    'ad_group_id',
    'adgroup_id',
    'adset_id',
    'ad_id',
    'gclid',
    'gbraid',
    'wbraid',
    'fbclid',
    'msclkid',
    'ctwa_clid',
    'ttclid',
    'li_fat_id',
    'source',
  ];
  let arrival;
  if (navigator.globalPrivacyControl !== true) {
    const here = new URL(window.location.href);
    const clean = new URL(here.origin + here.pathname);
    for (const key of attribution)
      if (here.searchParams.has(key))
        clean.searchParams.set(key, (here.searchParams.get(key) || '').slice(0, 300));
    let referrer = '';
    try {
      const ref = new URL(document.referrer);
      if (['https:', 'http:'].includes(ref.protocol) && ref.origin !== here.origin)
        referrer = ref.origin;
    } catch {
      referrer = '';
    }
    const current = { pageUrl: clean.href.slice(0, 2000), referrer, at: Date.now() };
    const storageKey = 'coded-funnel-arrival:' + here.origin;
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      const savedUrl = saved && new URL(saved.pageUrl);
      const valid =
        savedUrl &&
        savedUrl.origin === here.origin &&
        typeof saved.referrer === 'string' &&
        Number.isSafeInteger(saved.at) &&
        saved.at > 0 &&
        saved.at <= Date.now() &&
        saved.pageUrl.length <= 2000;
      const labelled = attribution.some((key) => here.searchParams.has(key));
      const sameLabels =
        valid &&
        attribution.every((key) => here.searchParams.get(key) === savedUrl.searchParams.get(key));
      arrival = valid && (!labelled || sameLabels) ? saved : current;
      sessionStorage.setItem(storageKey, JSON.stringify(arrival));
    } catch {
      arrival = current;
    }
    for (const link of document.querySelectorAll('a[data-next-step]')) {
      const target = new URL(link.getAttribute('href'), here);
      if (target.origin !== here.origin) continue;
      for (const key of attribution)
        if (here.searchParams.has(key))
          target.searchParams.set(key, (here.searchParams.get(key) || '').slice(0, 300));
      link.href = target.href;
    }
  }
  let origin;
  try {
    const value = new URL(config.crmOrigin || '');
    if (
      value.protocol === 'https:' &&
      !value.username &&
      !value.password &&
      value.pathname === '/' &&
      !value.search &&
      !value.hash
    )
      origin = value.origin;
  } catch {
    origin = undefined;
  }
  const setup = document.querySelector('[data-setup]');
  const mount = document.querySelector('[data-crm-mount]');
  if (!origin || !mount) return;
  const attributes = (element) => {
    if (!arrival) return;
    element.setAttribute('data-arr', arrival.pageUrl);
    if (arrival.referrer) element.setAttribute('data-arr-ref', arrival.referrer);
    element.setAttribute('data-arr-at', String(arrival.at));
  };
  if (
    mount.getAttribute('data-crm-mount') === 'form' &&
    typeof config.formPublicKey === 'string' &&
    /^[A-Za-z0-9_-]{16,64}$/.test(config.formPublicKey)
  ) {
    mount.setAttribute('data-crm-form', config.formPublicKey);
    const script = document.createElement('script');
    script.async = true;
    script.src = origin + '/forms/embed.js';
    script.setAttribute('data-form-key', config.formPublicKey);
    attributes(script);
    script.addEventListener('error', () => {
      if (setup) {
        setup.hidden = false;
        setup.querySelector('h3').textContent = 'The enquiry form could not load';
        setup.querySelector('p').textContent =
          'Please refresh this page and try again. Your enquiry has not been sent.';
      }
    });
    mount.append(script);
    if (setup) setup.hidden = true;
  }
  if (
    mount.getAttribute('data-crm-mount') === 'booking' &&
    typeof config.bookingPath === 'string' &&
    /^\/book\/[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*\/?$/.test(
      config.bookingPath,
    )
  ) {
    const url = new URL(config.bookingPath, origin);
    if (arrival) {
      url.searchParams.set('arr', arrival.pageUrl);
      if (arrival.referrer) url.searchParams.set('arr_ref', arrival.referrer);
      url.searchParams.set('arr_at', String(arrival.at));
    }
    const frame = document.createElement('iframe');
    frame.src = url.href;
    frame.title = 'Choose an appointment with ' + brand;
    frame.className = 'booking-frame';
    frame.setAttribute('data-crm-booking', '');
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    mount.append(frame);
    const script = document.createElement('script');
    script.async = true;
    script.src = origin + '/calendars/embed.js';
    mount.append(script);
    const direct = document.querySelector('[data-open-booking]');
    if (direct) {
      direct.href = url.href;
      direct.hidden = false;
    }
    if (setup) setup.hidden = true;
  }
})();
