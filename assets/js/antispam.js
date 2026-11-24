// LCG Boston: estimate form spam guard
// No captcha and no third-party script. Runs before the form is sent:
// - trap fields people never see (bots fill every input they find)
// - a minimum time on the page and proof of a real key press, click or tap
// - no web links in any answer
// - a send limit per browser, per hour
// Keep the form plugin's own spam filter on as well (WordPress: Akismet or the plugin's honeypot).
window.LCGGuard = (() => {
  const MIN_MS = 5000;
  const MAX_SENDS = 4;
  const WINDOW_MS = 60 * 60 * 1000;
  const LOG_KEY = 'lcg-form-sends';
  const LINK = /(https?:\/\/|www\.|\[url|<a\s|href\s*=)/i;

  const MESSAGES = {
    fast: 'That was quick. Please check your details and send again.',
    links: 'Web links can’t be sent through this form. Please remove the link and try again.',
    limit: 'We’ve already received several requests from this device. Please call or text (781) 732-1899 and we’ll get right back to you.',
  };

  const recentSends = () => {
    try { return (JSON.parse(localStorage.getItem(LOG_KEY)) || []).filter((t) => Date.now() - t < WINDOW_MS); } catch (e) { return []; }
  };

  const watch = (form) => {
    const t0 = Date.now();
    let human = false;
    const mark = (e) => { if (e.isTrusted) human = true; };
    ['pointerdown', 'touchstart', 'keydown', 'input'].forEach((type) => form.addEventListener(type, mark, { passive: true }));
    const traps = [...form.querySelectorAll('[data-hp]')];

    return {
      // Returns { trap: true } for a bot (show the thank-you, send nothing),
      // { message } when the visitor must fix something, or {} when the request is clean.
      // Trap fields are removed from `data`, so they never reach the inbox.
      check(data) {
        const caught = traps.some((el) => (el.type === 'checkbox' ? el.checked : el.value.trim() !== ''));
        traps.forEach((el) => delete data[el.name]);
        if (caught) return { trap: true };
        if (!human || Date.now() - t0 < MIN_MS) return { message: MESSAGES.fast };
        if (Object.values(data).some((v) => typeof v === 'string' && LINK.test(v))) return { message: MESSAGES.links };
        if (recentSends().length >= MAX_SENDS) return { message: MESSAGES.limit };
        return {};
      },
      sent() {
        try { localStorage.setItem(LOG_KEY, JSON.stringify([...recentSends(), Date.now()])); } catch (e) { /* storage blocked: no send limit in this browser */ }
      },
    };
  };

  return { watch };
})();
