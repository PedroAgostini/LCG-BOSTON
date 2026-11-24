// LCG Boston: service landing page behavior (no dependencies).
// - ZIP typed in the hero carries into the estimate form
// - estimate form: two steps on every screen size, validation, single send
// - delivery: Web3Forms (email of record) + best-effort copy to the lead webhook
// - dataLayer: <page>_form_start, <page>_form_step, generate_lead (only after the
//   server confirms), phone_click. Never put name, email, phone or ZIP in event parameters.
// - gclid / gbraid / wbraid / UTM kept for the session and sent with the lead
// - [data-pick] buttons (hero chooser, service links) preselect Project Type and open the form
//   on the next unanswered question
// - gallery viewer, mobile action bar, reviews only on staging
// Per page settings live on <body>: data-lp="bathroom" | "kitchen" | "kitchen_bath" (event and
// page_type prefix); the service and lead source come from the form's hidden fields.
// Each step's required fields are read from the markup, so every LP keeps its own questions.
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const push = (o) => (window.dataLayer = window.dataLayer || []).push(o);

  const PHONE_TEXT = '(781) 732-1899';
  const LP = document.body.dataset.lp || 'service';
  const leadForm = document.querySelector('[data-lead-form]');
  const SERVICE = leadForm && leadForm.elements.service ? leadForm.elements.service.value : '';
  const LEAD_SOURCE = leadForm && leadForm.elements.lead_source ? leadForm.elements.lead_source.value : '';
  const AREA_NOTE = 'We primarily serve Greater Boston & Eastern MA. We’ll confirm availability for your area.';

  /* ---------------- Ad click IDs and UTM, kept for this session ---------------- */
  const ATTR_KEYS = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const ATTR_STORE = 'lcg-attribution';
  let attribution = {};
  try { attribution = JSON.parse(sessionStorage.getItem(ATTR_STORE)) || {}; } catch (e) { attribution = {}; }
  const params = new URLSearchParams(location.search);
  const fresh = {};
  ATTR_KEYS.forEach((k) => { const v = params.get(k); if (v) fresh[k] = v.slice(0, 200); });
  if (Object.keys(fresh).length) {
    attribution = fresh;
    try { sessionStorage.setItem(ATTR_STORE, JSON.stringify(fresh)); } catch (e) { /* storage blocked */ }
  }

  /* ---------------- Phone clicks (engagement only, not a call) ---------------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="tel:"]');
    if (a) push({ event: 'phone_click', link_location: a.dataset.phone || 'other', page_type: `${LP}_lp` });
  });

  /* ---------------- Helpers ---------------- */
  const cleanZip = (v) => v.replace(/\D/g, '').slice(0, 5);
  const isZip = (v) => /^\d{5}$/.test(v);
  const inMassachusetts = (v) => /^0(1\d|2[0-7])/.test(v); // ZIP 010xx to 027xx
  const phoneDigits = (v) => v.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');

  let started = false;
  const formStart = (where) => {
    if (started) return;
    started = true;
    push({ event: `${LP}_form_start`, form_location: where });
  };

  /* ---------------- Estimate form ---------------- */
  const f = $('[data-lead-form]');
  const section = $('#request-estimate');
  const zip = f && f.elements.zip;
  const zipNote = $('#f-zip-note');

  const setZipNote = () => {
    if (!zipNote) return;
    zipNote.textContent = isZip(zip.value) && !inMassachusetts(zip.value) ? AREA_NOTE : '';
  };

  if (f) {
    const steps = $$('[data-step]', f);
    const last = steps.length - 1;
    const back = $('[data-back]', f);
    const next = $('[data-next]', f);
    const submit = $('[data-submit]', f);
    const submitLabel = $('[data-submit-label]', f);
    const submitText = submitLabel.textContent;
    // The endpoint lives in data-endpoint (no form action) and the submit button ships disabled,
    // so nothing can post to Web3Forms without this validation running first.
    submit.disabled = false;
    const progress = $('[data-progress]', f);
    const progressText = $('[data-progress-text]', f);
    const stepperItems = $$('[data-stepper]', f);
    const status = $('[data-status]', f);
    const thanks = $('[data-thanks]');
    const phone = f.elements.phone;
    const guard = window.LCGGuard ? window.LCGGuard.watch(f) : null; // /assets/js/antispam.js
    const submissionId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    let cur = 0;
    let sending = false;

    // attribution travels with the request as hidden fields
    const attrSlot = $('[data-attribution]', f);
    Object.entries(attribution).forEach(([k, v]) => {
      const input = document.createElement('input');
      input.type = 'hidden'; input.name = k; input.value = v;
      attrSlot.appendChild(input);
    });

    const rules = {
      zip: (v) => (isZip(v) ? '' : 'Please enter a 5-digit ZIP code.'),
      timeline: (v) => (v ? '' : 'Please choose when you’d like to start.'),
      name: (v) => (v.trim().length > 1 ? '' : 'Please enter your full name.'),
      first_name: (v) => (v.trim() ? '' : 'Please enter your first name.'),
      last_name: (v) => (v.trim() ? '' : 'Please enter your last name.'),
      phone: (v) => (/^[2-9]\d{2}[2-9]\d{6}$/.test(phoneDigits(v)) ? '' : 'Please enter a valid 10-digit US phone number.'),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.'),
      contact: (v) => (v ? '' : 'Please choose how you’d like us to contact you.'),
      project_type: (v) => (v ? '' : 'Please choose the type of project.'),
      budget: (v) => (v ? '' : 'Please choose an investment range.'),
      start: (v) => (v ? '' : 'Please choose when you’d like to start.'),
      plans: (v) => (v ? '' : 'Please let us know where your design plans stand.'),
    };
    const groups = [...new Set($$('input[type="radio"]', f).map((r) => r.name))];
    // Required fields per step, in page order, straight from the markup.
    const stepFields = steps.map((s) => [...new Set($$('[required]', s).map((el) => el.name))]);
    const ruleFor = (n) => rules[n] || ((v) => (String(v).trim() ? '' : (groups.includes(n) ? 'Please choose an option.' : 'Please fill in this field.')));
    const value = (n) => (groups.includes(n) ? (f.querySelector(`input[name="${n}"]:checked`) || {}).value || '' : f.elements[n].value);
    const focusTarget = (n) => (groups.includes(n) ? f.querySelector(`input[name="${n}"]`) : f.elements[n]);
    // The first question of a step still waiting for an answer (or its first question when all are answered).
    const nextOpen = (i) => {
      const names = stepFields[i];
      return focusTarget(names.find((n) => !value(n)) || names[0]);
    };

    function check(n) {
      const msg = ruleFor(n)(value(n));
      $(`#f-${n}-err`).textContent = msg;
      if (groups.includes(n)) {
        f.querySelector(`[data-group="${n}"]`).classList.toggle('has-error', !!msg);
        $$(`input[name="${n}"]`, f).forEach((r) => r.setAttribute('aria-invalid', msg ? 'true' : 'false'));
      } else {
        f.elements[n].closest('.field').classList.toggle('has-error', !!msg);
        f.elements[n].setAttribute('aria-invalid', msg ? 'true' : 'false');
      }
      return !msg;
    }
    function validStep(i) {
      const names = stepFields[i];
      const results = names.map(check);
      const bad = names[results.indexOf(false)];
      if (bad) { focusTarget(bad).focus(); return false; }
      return true;
    }

    // Two steps on every screen size: project first, then contact details.
    function render() {
      steps.forEach((s, i) => s.classList.toggle('is-active', i === cur));
      progress.hidden = false;
      back.hidden = cur === 0;
      next.hidden = cur === last;
      submit.hidden = cur !== last;
      progressText.textContent = `Step ${cur + 1} of ${steps.length}`;
      stepperItems.forEach((li, i) => { li.classList.toggle('is-current', i === cur); li.classList.toggle('is-done', i < cur); });
    }
    f.classList.add('is-stepped');
    render();

    const scrollToPanel = () => {
      const top = f.closest('.panel').getBoundingClientRect().top + scrollY - 16;
      if (f.closest('.panel').getBoundingClientRect().top < 0) scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    };

    next.addEventListener('click', () => {
      if (!validStep(cur)) return;
      cur += 1;
      render();
      push({ event: `${LP}_form_step`, step: cur + 1 });
      scrollToPanel();
      focusTarget(stepFields[cur][0]).focus({ preventScroll: true });
    });
    back.addEventListener('click', () => {
      cur = Math.max(0, cur - 1);
      render();
      scrollToPanel();
      focusTarget(stepFields[cur][0]).focus({ preventScroll: true });
    });

    // input formatting and live re-validation
    zip.addEventListener('input', () => { zip.value = cleanZip(zip.value); setZipNote(); });
    phone.addEventListener('input', () => {
      const d = phoneDigits(phone.value).slice(0, 10);
      phone.value = d.length > 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d.length > 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : d;
    });
    ['zip', 'name', 'first_name', 'last_name', 'phone', 'email'].forEach((n) => {
      const input = f.elements[n];
      if (!input) return;
      input.addEventListener('blur', () => { if (input.value) check(n); });
      input.addEventListener('input', () => { if (input.closest('.field').classList.contains('has-error')) check(n); });
    });
    groups.forEach((n) => $$(`input[name="${n}"]`, f).forEach((r) => r.addEventListener('change', () => check(n))));
    $$('select', f).forEach((s) => s.addEventListener('change', () => check(s.name)));
    f.addEventListener('input', () => formStart('form'), { once: true });
    f.addEventListener('change', () => formStart('form'), { once: true });

    // Copy of the lead for the agency's lead platform. Best effort: never blocks or fails the visitor's request.
    const sendLead = (data) => {
      const url = f.dataset.leadWebhook;
      if (!url) return;
      const lead = {
        form_id: f.dataset.formId,
        source: location.hostname,
        lead_source: LEAD_SOURCE,
        page: location.origin + location.pathname,
        submitted_at: new Date().toISOString(),
        submission_id: submissionId,
        service: SERVICE,
        zip: data.zip || '',
        timeline: data.timeline || data.start || '',
        details: data.details || '',
        name: data.name,
        phone: data.phone,
        email: data.email,
        contact: data.contact || '',
      };
      // Qualification answers asked only on some pages travel when present.
      ['first_name', 'last_name', 'project_type', 'budget', 'start', 'plans'].forEach((k) => { if (data[k]) lead[k] = data[k]; });
      ATTR_KEYS.forEach((k) => { if (data[k]) lead[k] = data[k]; });
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead), keepalive: true }).catch(() => {});
    };

    const showThanks = () => {
      f.hidden = true;
      thanks.hidden = false;
      const top = section.getBoundingClientRect().top;
      if (top < -40 || top > innerHeight * 0.5) thanks.closest('.panel').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      thanks.focus({ preventScroll: true });
    };

    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return;
      if (cur < last) { next.click(); return; } // Enter on step 1 means Continue
      status.textContent = '';
      for (let i = 0; i <= last; i++) {
        if (!validStep(i)) {
          if (i !== cur) { cur = i; render(); validStep(i); }
          return;
        }
      }

      const data = Object.fromEntries(new FormData(f));
      const verdict = guard ? guard.check(data) : (data.company || data.botcheck ? { trap: true } : {});
      if (verdict.trap) { sending = true; showThanks(); return; } // bot: thank it, send nothing
      if (verdict.message) { status.textContent = verdict.message; return; }
      delete data.company;
      // Pages that ask first and last name separately still send one name (Web3Forms reply-to, lead platform).
      if (!data.name && (data.first_name || data.last_name)) data.name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
      data.submission_id = submissionId;
      data.page = location.origin + location.pathname;

      sending = true;
      submit.disabled = true;
      f.setAttribute('aria-busy', 'true');
      submitLabel.textContent = 'Sending…';
      try {
        const res = await fetch(f.dataset.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        const reply = await res.json().catch(() => ({}));
        if (!res.ok || !reply.success) throw new Error(reply.message || 'Request failed');

        guard && guard.sent();
        sendLead(data); // keepalive: survives the move to the thank-you page
        // Conversion signal, once, only after Web3Forms confirmed the request.
        // `inputs` mirrors the main site (Ads enhanced conversions). In GTM, never map it into GA4 event parameters.
        const digits = phoneDigits(data.phone || '');
        const conversion = {
          event: 'generate_lead',
          service: SERVICE,
          lead_source: LEAD_SOURCE,
          inputs: {
            email: (data.email || '').trim().toLowerCase(),
            phone: digits.length === 10 ? `+1${digits}` : '',
          },
        };
        const thanksUrl = f.dataset.thanksUrl;
        let handedOff = false;
        if (thanksUrl) {
          // Pages with a thank-you page fire the conversion there: this one-time pass lets it push
          // generate_lead once for this submission, and a direct or repeated visit pushes nothing.
          try {
            sessionStorage.setItem('lcg-lead-ok', JSON.stringify({ ...conversion, submission_id: submissionId, t: Date.now() }));
            handedOff = true;
          } catch (e) { /* storage blocked: count the conversion here instead */ }
        }
        if (handedOff) {
          location.assign(thanksUrl);
        } else {
          showThanks();
          push(conversion);
        }
      } catch (err) {
        sending = false;
        submit.disabled = false;
        status.textContent = `We couldn’t send your request. Please try again, or call us at ${PHONE_TEXT}.`;
      } finally {
        f.removeAttribute('aria-busy');
        submitLabel.textContent = submitText;
      }
    });

    /* ---------------- Hero ZIP start ---------------- */
    const zs = $('[data-zipstart]');
    if (zs) {
      const zsInput = zs.elements.zip;
      const zsMsg = $('#zs-zip-msg');
      const setMsg = (text, isError) => { zsMsg.textContent = text; zsMsg.classList.toggle('is-error', !!isError); zsInput.setAttribute('aria-invalid', isError ? 'true' : 'false'); };
      zsInput.addEventListener('input', () => {
        zsInput.value = cleanZip(zsInput.value);
        formStart('hero');
        if (isZip(zsInput.value)) setMsg(inMassachusetts(zsInput.value) ? '' : AREA_NOTE, false);
        else if (zsMsg.classList.contains('is-error') || zsMsg.textContent) setMsg('', false);
      });
      zs.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = cleanZip(zsInput.value);
        if (v && !isZip(v)) { setMsg('Please enter a 5-digit ZIP code.', true); zsInput.focus(); return; }
        formStart('hero');
        if (v) { zip.value = v; setZipNote(); check('zip'); }
        cur = 0; render();
        section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        const target = v ? f.querySelector('input[name="timeline"]') : zip;
        setTimeout(() => target.focus({ preventScroll: true }), reduce ? 0 : 450);
      });
    }

    /* ---------------- One-click start: [data-pick] preselects Project Type ---------------- */
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-pick]');
      if (!btn || !f.elements.project_type) return;
      e.preventDefault();
      const pt = f.elements.project_type;
      if (pt.tagName === 'SELECT') {
        if ([...pt.options].some((o) => o.value === btn.dataset.pick)) { pt.value = btn.dataset.pick; check('project_type'); }
      } else {
        const radio = $$('input[name="project_type"]', f).find((r) => r.value === btn.dataset.pick);
        if (radio) { radio.checked = true; check('project_type'); }
      }
      formStart(btn.dataset.cta || 'pick');
      push({ event: `${LP}_project_pick`, project_type: btn.dataset.pick, pick_location: btn.dataset.cta || 'other' });
      cur = 0; render();
      section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      const target = nextOpen(0);
      setTimeout(() => target.focus({ preventScroll: true }), reduce ? 0 : 450);
    });
  }

  /* ---------------- Mobile action bar: out of the way of the hero action and the form ---------------- */
  const bar = $('[data-mbar]');
  if (bar && 'IntersectionObserver' in window) {
    const watched = [$('.zipstart'), $('.chooser'), section].filter(Boolean);
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
      bar.classList.toggle('is-hidden', visible.size > 0);
    }, { threshold: 0 });
    watched.forEach((el) => io.observe(el));
  }

  /* ---------------- Gallery viewer ---------------- */
  const viewer = $('[data-viewer]');
  const gallery = $('[data-gallery]');
  if (viewer && gallery) {
    const img = $('[data-viewer-img]', viewer);
    const cap = $('[data-viewer-cap]', viewer);
    let list = [];
    let idx = 0;
    const show = (i) => {
      idx = (i + list.length) % list.length;
      const btn = list[idx];
      const thumb = $('img', btn);
      img.src = btn.dataset.full;
      img.alt = thumb.alt;
      cap.textContent = btn.dataset.cap || '';
    };
    // Photos in the looping rows sit off-screen sideways, where lazy loading fires late; load them as the section approaches.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry], io) => {
        if (!entry.isIntersecting) return;
        $$('img', gallery).forEach((im) => { im.loading = 'eager'; });
        io.disconnect();
      }, { rootMargin: '800px 0px' }).observe(gallery);
    }
    gallery.addEventListener('click', (e) => {
      const btn = e.target.closest('.g__btn');
      if (!btn) return;
      if (typeof viewer.showModal !== 'function') { window.open(btn.dataset.full, '_blank', 'noopener'); return; }
      // The looping rows repeat each photo; the viewer steps through each one once.
      const seen = new Set();
      list = $$('.g__btn', gallery).filter((b) => !b.closest('[aria-hidden="true"]') && !seen.has(b.dataset.full) && seen.add(b.dataset.full));
      show(list.findIndex((b) => b.dataset.full === btn.dataset.full));
      viewer.showModal();
    });
    $('[data-viewer-close]', viewer).addEventListener('click', () => viewer.close());
    $('[data-viewer-prev]', viewer).addEventListener('click', () => show(idx - 1));
    $('[data-viewer-next]', viewer).addEventListener('click', () => show(idx + 1));
    viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });
    viewer.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    let x0 = null;
    viewer.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    viewer.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    viewer.addEventListener('close', () => { img.removeAttribute('src'); });
  }

  /* ---------------- Reviews: placeholder quotes render on staging and localhost only ---------------- */
  const tpl = $('#reviews-template');
  const slot = $('[data-reviews-slot]');
  if (tpl && slot && /^(lcg\.escolats\.com\.br|localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    slot.replaceWith(tpl.content.cloneNode(true));
  }
})();
