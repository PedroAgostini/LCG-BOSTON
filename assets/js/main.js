/* =========================================================
   LCG Boston, page interactions
   GSAP + ScrollTrigger + Lenis are loaded as globals (defer).
   ========================================================= */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const { gsap, ScrollTrigger, Lenis } = window;
const hasGsap = !!(gsap && ScrollTrigger);

if (hasGsap) html.classList.add('js');
$('[data-year]').textContent = new Date().getFullYear();

/* ---------------- Smooth scroll ---------------- */
let lenis = null;
if (hasGsap) {
  gsap.registerPlugin(ScrollTrigger);
  if (!reduce && Lenis) {
    lenis = window.lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}

/* ---------------- Mobile menu ---------------- */
const burger = $('[data-burger]');
const mmenu = $('[data-mmenu]');
let menuOpen = false;
function setMenu(open) {
  menuOpen = open;
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mmenu.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (lenis) open ? lenis.stop() : lenis.start();
  if (open && hasGsap && !reduce) gsap.from($$('a', mmenu), { y: 24, opacity: 0, stagger: 0.04, duration: 0.6, ease: 'expo.out' });
}
burger.addEventListener('click', () => setMenu(!menuOpen));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { setMenu(false); burger.focus(); } });

/* ---------------- Anchor links ---------------- */
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : el, { duration: 1.3 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    if (id === '#estimate') setTimeout(() => window.lcgForm?.focusCurrent(), lenis ? 1350 : 600);
  });
});

/* ---------------- Text splitting ---------------- */
function splitWords(el, cls = 'w') {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map((w) => `<span class="${cls}">${w}</span>`).join(' ');
  return $$('.' + cls, el);
}
function splitLines(el) {
  const original = el.innerHTML;
  const words = splitWords(el, 'sw');
  const lines = [];
  let top = null;
  words.forEach((w) => {
    if (w.offsetTop !== top) { lines.push([]); top = w.offsetTop; }
    lines[lines.length - 1].push(w.innerHTML);
  });
  el.innerHTML = lines.map((l) => `<span class="line-mask"><span>${l.join(' ')}</span></span>`).join('');
  return { inners: $$('.line-mask > span', el), revert: () => (el.innerHTML = original) };
}

/* ---------------- Loader + hero intro ---------------- */
function intro() {
  html.classList.add('is-loaded');
  if (!hasGsap) return;
  if (reduce) { gsap.set('[data-hero-in]', { opacity: 1, y: 0 }); gsap.set('[data-hero-mark] path', { strokeDashoffset: 0 }); return; }
  const { inners, revert } = splitLines($('.hero__title'));
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.fromTo('[data-hero-media]', { clipPath: 'inset(9% 7% 9% 7%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0)
    .fromTo('[data-hero-media] img', { scale: 1.25 }, { scale: 1, duration: 2.2 }, 0)
    .to('[data-hero-mark] path', { strokeDashoffset: 0, duration: 1.8, stagger: 0.16, ease: 'expo.inOut' }, 0.5)
    .fromTo(inners, { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.09, onComplete: revert }, 0.55)
    .to('[data-hero-in]', { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.8);
}
const minDelay = new Promise((r) => setTimeout(r, reduce ? 0 : 900));
const fontsReady = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 1800))]);
Promise.all([minDelay, fontsReady]).then(() => { intro(); initScroll(); });

/* ---------------- Scroll-driven pieces ---------------- */
function initScroll() {
  if (!hasGsap) { initStaticBuild(); return; }

  const nav = $('[data-nav]');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-solid', y > 40);
      nav.classList.toggle('is-hidden', !menuOpen && self.direction === 1 && y > 700);
    },
  });

  // current section in nav
  $$('.nav__links a').forEach((a) => {
    const sec = $(a.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 45%', end: 'bottom 45%',
      onToggle: (s) => a.classList.toggle('is-current', s.isActive),
    });
  });

  initBuild();

  // mobile conversion bar: after the hero, hidden while the form is on screen
  const mbar = $('[data-mbar]');
  let pastHero = false, onForm = false;
  const syncBar = () => mbar.classList.toggle('is-on', pastHero && !onForm);
  ScrollTrigger.create({ trigger: '.hero', start: 'bottom 80%', end: 'max', onToggle: (s) => { pastHero = s.isActive; syncBar(); } });
  ScrollTrigger.create({ trigger: '#estimate', start: 'top 70%', end: 'bottom 30%', onToggle: (s) => { onForm = s.isActive; syncBar(); } });

  if (reduce) { gsap.set('[data-reveal]', { opacity: 1, y: 0 }); finishStatic(); return; }

  // hero exit
  gsap.to('[data-hero-media] img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__content', { y: -80, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: '40% top', end: 'bottom top', scrub: true } });
  // generic reveals
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out', overwrite: true }),
  });

  // headings reveal line by line
  $$('[data-split]:not(.hero__title)').forEach((el) => {
    const { inners, revert } = splitLines(el);
    gsap.set(inners, { yPercent: 110 });
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(inners, { yPercent: 0, duration: 1.15, stagger: 0.08, ease: 'expo.out', onComplete: revert }),
    });
  });

  // about lead: words light up as you read
  $$('[data-words]').forEach((el) => {
    const words = splitWords(el);
    gsap.to(words, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 52%', scrub: true } });
  });

  // light parallax on stacked images
  $$('[data-parallax]').forEach((el) => {
    const v = parseFloat(el.dataset.parallax);
    gsap.fromTo(el, { yPercent: -v }, { yPercent: v, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // brand mark draws itself behind "Why choose us"
  gsap.to('[data-draw] path', { strokeDashoffset: 0, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: '.why', start: 'top 75%', end: 'bottom 60%', scrub: true } });

  // counter
  $$('[data-count]').forEach((el) => {
    const n = +el.dataset.count;
    const o = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: n, duration: 1.6, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)) }) });
  });

  // steps connector line
  gsap.to('[data-line]', { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.steps__wrap', start: 'top 75%', end: 'top 35%', scrub: true } });


  addEventListener('load', () => ScrollTrigger.refresh());
}

function finishStatic() {
  $$('[data-draw] path, [data-line]').forEach((p) => (p.style.strokeDashoffset = 0));
  $$('[data-words] .w').forEach((w) => (w.style.opacity = 1));
}

/* ---------------- 3D build section ---------------- */
const buildEl = $('.build');
const stageEls = $$('[data-stages] li');
const pctEl = $('[data-pct]');
const STAGE_STARTS = [0, 0.14, 0.30, 0.52, 0.72, 0.88]; // mirrors STAGES in build3d.js
let stageIdx = 0;

function updateBuildUI(p) {
  let i = 0;
  for (let k = 0; k < STAGE_STARTS.length; k++) if (p >= STAGE_STARTS[k] - 0.0001) i = k;
  pctEl.textContent = Math.round(p * 100);
  if (i === stageIdx) return;
  stageIdx = i;
  stageEls.forEach((el, k) => el.classList.toggle('is-active', k === i));

}

function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

async function loadScene() {
  const { createBuildScene } = await import('./build3d.js');
  return createBuildScene($('.build__canvas'));
}

function initStaticBuild() {
  buildEl.classList.add('build--static');
  if (!webglOK()) { html.classList.add('no-webgl'); return; }
  loadScene().then((s) => s.jumpTo(1)).catch(() => html.classList.add('no-webgl'));
}

function initBuild() {
  if (reduce || !webglOK()) { initStaticBuild(); return; }

  let scene = null, progress = 0, visible = false;

  // the pin exists right away, so every trigger below it measures correctly
  ScrollTrigger.create({
    trigger: buildEl,
    pin: '.build__pin',
    start: 'top top',
    end: () => '+=' + Math.round(innerHeight * 4.2),
    scrub: true,
    onUpdate: (self) => { progress = self.progress; updateBuildUI(progress); scene?.setProgress(progress); },
  });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    scene?.setActive(visible);
  }, { rootMargin: '200px 0px' }).observe(buildEl);

  buildEl.addEventListener('pointermove', (e) => {
    if (!scene || e.pointerType !== 'mouse') return;
    scene.setPointer((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
  });

  loadScene()
    .then((s) => { scene = s; s.jumpTo(progress); s.setActive(visible); })
    .catch((err) => { console.warn('[LCG] 3D scene unavailable', err); html.classList.add('no-webgl'); });
}

/* ---------------- Services: glass cards + 3D popup ---------------- */
(function serviceModal() {
  const SERVICES = {
    kitchen: {
      title: 'Kitchen Remodel', icon: 'ph-cooking-pot', form: 'Kitchen Remodel',
      desc: 'Custom layouts, premium cabinetry, and code-compliant installations engineered for daily durability and elevated design.',
      items: ['Custom layouts and island design', 'Three cabinet lines to choose from', 'Countertops, tile backsplash and lighting', 'Plumbing and electrical permitted to code'],
    },
    bathroom: {
      title: 'Bathroom Remodel', icon: 'ph-bathtub', form: 'Bathroom Remodel',
      desc: 'Luxury tile work, custom glass enclosures, and updated plumbing layouts built for maximum comfort and lasting water protection.',
      items: ['Tile floors, walls and shower pans', 'Custom glass shower enclosures', 'Vanities, fixtures and ventilation', 'Waterproofing and updated plumbing layouts'],
    },
    full: {
      title: 'Full Home Renovations', icon: 'ph-house-line', form: 'Full Home Renovation',
      desc: 'Complete interior transformations and structural reconfigurations managed with dedicated job-site oversight from start to finish.',
      items: ['Layout changes and wall removals', 'Structural reconfigurations, planned and permitted', 'Flooring, millwork and paint throughout', 'One schedule and one point of contact'],
    },
    addition: {
      title: 'Home Additions', icon: 'ph-arrows-out-cardinal', form: 'Home Addition',
      desc: 'Seamless multi-room expansions and second-story builds engineered to integrate flawlessly with your original architecture.',
      items: ['Single and multi-room additions', 'Second-story builds', 'Foundation, framing and roof tie-ins', 'Siding, trim and rooflines matched to your home'],
    },
    adu: {
      title: 'ADUs & In-Law Suites', icon: 'ph-door-open', form: 'ADU or In-Law Suite',
      desc: 'Attached or detached accessory dwelling units designed and built to strict local municipal zoning and building codes.',
      items: ['Attached and detached units', 'Zoning and permit guidance for your town', 'Kitchenette, bath and living space', 'Separate entry and utilities'],
    },
    exterior: {
      title: 'Exterior Renovations', icon: 'ph-house', form: 'Exterior Renovation',
      desc: 'High-durability siding, certified roofing installations, and complete trim systems engineered to withstand harsh New England weather.',
      items: ['Roofing: sheathing, underlayment and shingles', 'Siding and complete trim systems', 'Gutters and downspouts', 'Built for New England snow, wind and salt air'],
    },
  };
  const keys = Object.keys(SERVICES);
  const dlg = $('[data-svc-modal]');
  const canvas = $('.svc-modal__canvas', dlg);
  const img = $('.svc-modal__img', dlg);
  let current = keys[0], viewer = null, viewerP = null, opener = null, req = 0;

  function fill(key) {
    const s = SERVICES[key];
    current = key;
    $('[data-svc-title]', dlg).textContent = s.title;
    $('[data-svc-icon]', dlg).className = 'ph ' + s.icon;
    $('[data-svc-desc]', dlg).textContent = s.desc;
    $('[data-svc-list]', dlg).innerHTML = s.items.map((t) => `<li><i class="ph ph-check"></i><span>${t}</span></li>`).join('');
    const photo = $(`.svc-card[data-service="${key}"] img`);
    img.src = photo.src;
    img.srcset = photo.srcset;
    img.sizes = '(max-width: 860px) 100vw, 60vw';
    img.alt = photo.alt;
  }

  async function load3D(key) {
    if (!webglOK()) { dlg.classList.add('is-static'); return; }
    const mine = ++req; // only the latest request may draw a scene
    try {
      if (!viewer) {
        dlg.classList.add('is-loading');
        viewerP ||= import('./service3d.js').then((m) => m.createServiceViewer(canvas, { reduce }));
        viewer = await viewerP;
      }
      if (mine !== req || !dlg.open) return;
      viewer.show(key);
      viewer.start();
    } catch (err) {
      console.warn('[LCG] service 3D unavailable', err);
      dlg.classList.add('is-static');
    } finally {
      if (mine === req) dlg.classList.remove('is-loading');
    }
  }

  function open(key, trigger) {
    if (trigger) opener = trigger;
    fill(key);
    if (!dlg.open) { dlg.showModal(); lenis?.stop(); }
    load3D(key);
  }
  const step = (dir) => open(keys[(keys.indexOf(current) + dir + keys.length) % keys.length]);

  $$('.svc-card').forEach((card) => {
    $('.svc-card__hit', card).addEventListener('click', (e) => open(card.dataset.service, e.currentTarget));
  });
  $('[data-svc-close]', dlg).addEventListener('click', () => dlg.close());
  $('[data-svc-prev]', dlg).addEventListener('click', () => step(-1));
  $('[data-svc-next]', dlg).addEventListener('click', () => step(1));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  dlg.addEventListener('close', () => {
    viewer?.stop();
    lenis?.start();
    opener?.focus({ preventScroll: true });
  });

  // CTA: preselect this service in the estimate form, then the anchor handler scrolls there
  $('[data-svc-cta]', dlg).addEventListener('click', () => {
    window.lcgForm?.selectService(SERVICES[current].form);
    opener = null;
    dlg.close();
    lenis?.start();
  }, true);
})();

/* ---------------- Projects loop ---------------- */
// photos in the looping rows sit off-screen sideways, where lazy loading never fires in time;
// switch them all to eager as the section approaches
(function projectsLoop() {
  const pg = $('.pg');
  if (!pg) return;
  new IntersectionObserver(([entry], io) => {
    if (!entry.isIntersecting) return;
    $$('img', pg).forEach((img) => (img.loading = 'eager'));
    io.disconnect();
  }, { rootMargin: '800px 0px' }).observe(pg);
})();

/* ---------------- FAQ ---------------- */
$$('[data-faq] details').forEach((d) => {
  const s = $('summary', d);
  const a = $('.faq__a', d);
  s.addEventListener('click', (e) => {
    if (!hasGsap || reduce) return;
    e.preventDefault();
    if (d.open) {
      gsap.to(a, { height: 0, duration: 0.45, ease: 'power3.inOut', onComplete: () => { d.open = false; a.style.height = ''; } });
    } else {
      d.open = true;
      gsap.fromTo(a, { height: 0 }, { height: 'auto', duration: 0.55, ease: 'power3.out', onComplete: () => (a.style.height = '') });
    }
  });
});

/* ---------------- Estimate form (3 steps) ---------------- */
(function form() {
  const f = $('[data-form]');
  if (!f) return;
  const ok = $('[data-success]');
  const status = $('.form__status', f);
  const steps = $$('[data-step]', f);
  const labels = $$('.steps-bar__labels li', f);
  const fill = $('[data-fill]', f);
  const count = $('[data-count]', f);
  const back = $('[data-back]', f), next = $('[data-next]', f), submit = $('.form__submit', f);
  const phone = $('#f-phone'), zip = $('#f-zip');
  const last = steps.length - 1;
  let cur = 0;

  phone.addEventListener('input', () => {
    const d = phone.value.replace(/\D/g, '').replace(/^1/, '').slice(0, 10);
    phone.value = d.length > 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d.length > 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : d;
  });
  zip.addEventListener('input', () => (zip.value = zip.value.replace(/\D/g, '').slice(0, 5)));

  const rules = {
    service: (v) => (v ? '' : 'Please choose the type of project.'),
    zip: (v) => (/^\d{5}$/.test(v) ? '' : 'Please enter a 5-digit ZIP code.'),
    name: (v) => (v.trim().length > 1 ? '' : 'Please enter your name.'),
    phone: (v) => (v.replace(/\D/g, '').length === 10 ? '' : 'Please enter a 10-digit phone number.'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.'),
  };
  const stepFields = [['service'], ['zip'], ['name', 'phone', 'email']];
  const value = (n) => (n === 'service' ? f.querySelector('input[name="service"]:checked')?.value || '' : f.elements[n].value);
  const target = (n) => (n === 'service' ? f.querySelector('input[name="service"]') : f.elements[n]);
  const firstInput = (s) => s.querySelector('input[type="text"], input[type="tel"], input[type="email"], textarea') || s.querySelector('input');

  function check(n) {
    const msg = rules[n](value(n));
    $('#f-' + n + '-err').textContent = msg;
    if (n === 'service') $('.choices', f).classList.toggle('has-error', !!msg);
    else {
      f.elements[n].closest('.field').classList.toggle('has-error', !!msg);
      f.elements[n].setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
    return !msg;
  }
  function validStep(i) {
    const names = stepFields[i];
    const bad = names[names.map(check).indexOf(false)];
    if (bad) { target(bad).focus(); return false; }
    return true;
  }

  function go(i, focus = true) {
    cur = i;
    steps.forEach((s, k) => { s.hidden = k !== i; s.classList.toggle('is-active', k === i); });
    labels.forEach((l, k) => { l.classList.toggle('is-active', k === i); l.classList.toggle('is-done', k < i); });
    fill.style.transform = `scaleX(${(i + 1) / steps.length})`;
    count.textContent = `Step ${i + 1} of ${steps.length}`;
    back.hidden = i === 0;
    next.hidden = i === last;
    submit.hidden = i !== last;
    if (hasGsap && !reduce) gsap.fromTo(steps[i], { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out' });
    if (focus) firstInput(steps[i])?.focus({ preventScroll: true });
  }

  next.addEventListener('click', () => { if (validStep(cur)) go(cur + 1); });
  back.addEventListener('click', () => go(cur - 1));
  // picking a service is the whole first step, so move on by itself
  $$('input[name="service"]', f).forEach((r) => r.addEventListener('change', () => {
    check('service');
    if (cur === 0) setTimeout(() => go(1), 260);
  }));

  ['zip', 'name', 'phone', 'email'].forEach((n) => {
    const input = f.elements[n];
    input.addEventListener('blur', () => { if (input.value) check(n); });
    input.addEventListener('input', () => { if (input.closest('.field').classList.contains('has-error')) check(n); });
  });

  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cur < last) { next.click(); return; } // Enter on an early step means "Continue"
    status.textContent = '';
    for (let i = 0; i <= last; i++) {
      if (!validStep(i)) { if (i !== cur) { go(i, false); validStep(i); } return; }
    }
    if (f.elements.company.value) return; // honeypot

    const lbl = $('.form__submit-lbl', submit);
    submit.classList.add('is-loading');
    lbl.textContent = 'Sending';
    try {
      // WordPress: replace with the form plugin endpoint (or let the plugin handle submit)
      await new Promise((r) => setTimeout(r, 900));
      f.hidden = true;
      ok.hidden = false;
      ok.focus();
      if (hasGsap && !reduce) gsap.from(ok, { y: 24, opacity: 0, duration: 0.8, ease: 'expo.out' });
      window.dataLayer?.push({ event: 'generate_lead', service: value('service') });
    } catch {
      status.textContent = 'Something went wrong. Please call us at (781) 732-1899.';
    } finally {
      submit.classList.remove('is-loading');
      lbl.textContent = 'Request My Estimate';
    }
  });

  go(0, false);

  // used by the service popup and anchor links
  window.lcgForm = {
    selectService(v) {
      const r = f.querySelector(`input[name="service"][value="${v}"]`);
      if (!r) return;
      r.checked = true;
      check('service');
      go(1, false);
    },
    focusCurrent() { firstInput(steps[cur])?.focus({ preventScroll: true }); },
  };
})();
