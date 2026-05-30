/* Simply Vending Solutions — shared app (precompiled). Regenerate from source. */
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Silence the benign, non-actionable "ResizeObserver loop ..." browser
// notification (fires during layout settling/transitions; not a real error).
window.addEventListener("error", e => {
  if (e && e.message && e.message.indexOf("ResizeObserver loop") !== -1) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

// ============================================================
//  SCROLL CHOREOGRAPHY ENGINE
//  - IntersectionObserver-driven reveals with per-group stagger
//  - rAF parallax for hero + accent layers (desktop, motion-OK only)
//  Re-scanned by <App> on every route change so newly mounted
//  sections animate in too. Fully reduced-motion + mobile safe.
// ============================================================
const SVS_SCROLL = (() => {
  const mqReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduce = () => mqReduce && mqReduce.matches;

  // --- Reveal config -------------------------------------------------
  // group: stagger direct matches of `child` inside each `sel`
  // single: reveal each match of `sel` on its own
  const GROUPS = [{
    sel: ".svs-hero-ticker",
    child: ".svs-ticker-item, .svs-ticker-dot",
    v: "up-sm",
    step: 70,
    base: 480
  }, {
    sel: ".svs-flagship .svs-flavors",
    child: ".svs-flavor",
    v: "up",
    step: 70
  }, {
    sel: ".svs-values-grid",
    child: ".svs-value",
    v: "up",
    step: 90
  }, {
    sel: ".svs-services-grid",
    child: ".svs-service-card",
    v: "up",
    step: 90
  }, {
    sel: ".svs-proof-stats",
    child: ".svs-stat",
    v: "up",
    step: 90
  }, {
    sel: ".svs-logos-row",
    child: ".svs-logo-chip",
    v: "up-sm",
    step: 60
  }, {
    sel: ".svs-how-grid",
    child: ".svs-step",
    v: "up",
    step: 90
  }, {
    sel: ".svs-myb-flavor-list",
    child: ".svs-myb-flavor",
    v: "up-sm",
    step: 55
  }, {
    sel: ".svs-sp-features-grid",
    child: ".svs-sp-feature",
    v: "up",
    step: 90
  }, {
    sel: ".svs-hiw-steps",
    child: ".svs-hiw-step",
    v: "up",
    step: 90
  }, {
    sel: ".svs-pulse-points",
    child: ".svs-pulse-point",
    v: "up-sm",
    step: 90
  }, {
    sel: ".svs-spec-table",
    child: ".svs-spec-row",
    v: "up-sm",
    step: 55
  }, {
    sel: ".svs-sp-related-grid",
    child: ".svs-sp-related-card",
    v: "up",
    step: 90
  }, {
    sel: ".svs-about-values-grid",
    child: ".svs-about-value",
    v: "up",
    step: 90
  }, {
    sel: ".svs-timeline",
    child: ".svs-timeline-row",
    v: "up",
    step: 80
  }, {
    sel: ".svs-contact-promises",
    child: ".svs-contact-promise",
    v: "up-sm",
    step: 70
  }, {
    sel: ".svs-contact-info",
    child: "div",
    v: "up-sm",
    step: 80
  }, {
    sel: ".svs-footer-meta",
    child: ".svs-footer-col",
    v: "up-sm",
    step: 80
  }];
  const SINGLES = [
  // Hero — assembles on load
  {
    sel: ".svs-hero-eyebrow",
    v: "up-sm",
    d: 120
  }, {
    sel: ".svs-hero-line-1",
    v: "up",
    d: 220
  }, {
    sel: ".svs-hero-line-2",
    v: "up",
    d: 340
  }, {
    sel: ".svs-hero-sub",
    v: "up",
    d: 480
  }, {
    sel: ".svs-hero-cta",
    v: "up",
    d: 600
  },
  // Section headers + visuals
  {
    sel: ".svs-flagship-head",
    v: "up"
  }, {
    sel: ".svs-flagship-visual",
    v: "scale"
  }, {
    sel: ".svs-flagship-copy .svs-lede",
    v: "up",
    d: 80
  }, {
    sel: ".svs-flagship-copy > .svs-btn",
    v: "up-sm",
    d: 120
  }, {
    sel: ".svs-values-head",
    v: "up"
  }, {
    sel: ".svs-services-head",
    v: "up"
  }, {
    sel: ".svs-proof-intro",
    v: "up"
  }, {
    sel: ".svs-logos",
    v: "up",
    d: 120
  }, {
    sel: ".svs-testimonial-head",
    v: "up"
  }, {
    sel: ".svs-testimonial-marquee",
    v: "fade",
    d: 120
  }, {
    sel: ".svs-how-head",
    v: "up"
  }, {
    sel: ".svs-myb-title",
    v: "up"
  }, {
    sel: ".svs-myb-lede",
    v: "up",
    d: 90
  }, {
    sel: ".svs-myb-tabs",
    v: "up",
    d: 160
  }, {
    sel: ".svs-tapbar-head",
    v: "up"
  },
  // Service pages
  {
    sel: ".svs-sp-crumb",
    v: "fade"
  }, {
    sel: ".svs-sp-hero h1",
    v: "up",
    d: 80
  }, {
    sel: ".svs-sp-tagline",
    v: "up",
    d: 160
  }, {
    sel: ".svs-sp-lede",
    v: "up",
    d: 240
  }, {
    sel: ".svs-sp-cta",
    v: "up",
    d: 320
  }, {
    sel: ".svs-sp-hero-inner > *:last-child",
    v: "scale",
    d: 120
  }, {
    sel: ".svs-hiw-header",
    v: "up"
  }, {
    sel: ".svs-hiw-benefits",
    v: "up",
    d: 120
  },
  // Pulse spotlight (new product reveal)
  {
    sel: ".svs-pulse-badge",
    v: "up-sm"
  }, {
    sel: ".svs-pulse-title",
    v: "up",
    d: 90
  }, {
    sel: ".svs-pulse-lede",
    v: "up",
    d: 180
  }, {
    sel: ".svs-pulse-cta",
    v: "up",
    d: 320
  }, {
    sel: ".svs-pulse-hero",
    v: "scale",
    d: 80
  }, {
    sel: ".svs-pulse-accent--taps",
    v: "up",
    d: 300
  }, {
    sel: ".svs-pulse-accent--side",
    v: "up",
    d: 420
  }, {
    sel: ".svs-sp-gallery-head, .svs-sp-gallery h2",
    v: "up"
  }, {
    sel: ".svs-sp-gallery-marquee",
    v: "fade",
    d: 120
  }, {
    sel: ".svs-sp-specs-grid > *",
    v: "up"
  }, {
    sel: ".svs-sp-related-head, .svs-sp-related h2",
    v: "up"
  }, {
    sel: ".svs-sp-booking-inner > *",
    v: "up"
  },
  // About
  {
    sel: ".svs-about-hero h1",
    v: "up",
    d: 60
  }, {
    sel: ".svs-about-hero .svs-sp-lede, .svs-about-hero .svs-lede, .svs-about-hero p",
    v: "up",
    d: 160
  }, {
    sel: ".svs-about-founder-media",
    v: "scale"
  }, {
    sel: ".svs-about-founder-copy",
    v: "up",
    d: 100
  }, {
    sel: ".svs-about-values h2, .svs-about-values .svs-eyebrow",
    v: "up"
  }, {
    sel: ".svs-about-timeline h2",
    v: "up"
  },
  // Contact
  {
    sel: ".svs-contact-hero h1",
    v: "up",
    d: 80
  }, {
    sel: ".svs-contact-hero .svs-eyebrow",
    v: "up-sm"
  }, {
    sel: ".svs-contact-form-wrap",
    v: "scale",
    d: 120
  },
  // Footer
  {
    sel: ".svs-footer-lede",
    v: "up"
  }];

  // --- Parallax config ----------------------------------------------
  // type "scroll": offset from page scrollY (top-of-page layers)
  // type "center": offset from element's distance to viewport centre
  const PARALLAX = [{
    sel: ".svs-hero-image",
    type: "scroll",
    speed: 0.12,
    max: 70,
    scale: 1.16
  }, {
    sel: ".svs-hero-content",
    type: "scroll",
    speed: -0.16,
    max: 220,
    fade: 620
  }, {
    sel: ".svs-callout",
    type: "center",
    speed: 0.05,
    max: 26
  }, {
    sel: ".svs-pulse-glow",
    type: "center",
    speed: 0.08,
    max: 60
  }];
  let io = null;
  let pTargets = [];
  let ticking = false;
  let fallbackTimer = null;
  function ensureIO() {
    if (io) return io;
    io = new IntersectionObserver(entries => {
      for (const en of entries) {
        if (en.isIntersecting) {
          en.target.classList.add("svs-in");
          io.unobserve(en.target);
        }
      }
    }, {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0
    });
    return io;
  }
  function tag(el, variant, delay) {
    if (!el || el.dataset.rev) return;
    el.dataset.rev = "1";
    el.classList.add("svs-reveal");
    if (variant && variant !== "up") el.classList.add("svs-reveal--" + variant);
    if (delay) el.style.setProperty("--rev-delay", delay + "ms");
    if (reduce()) {
      el.classList.add("svs-in");
      return;
    }
    ensureIO().observe(el);
  }
  function scanReveals() {
    if (reduce()) return;
    try {
      for (const g of GROUPS) {
        document.querySelectorAll(g.sel).forEach(container => {
          const kids = container.querySelectorAll(":scope > " + g.child.split(",").join(", :scope > "));
          const list = kids.length ? kids : container.querySelectorAll(g.child);
          list.forEach((kid, i) => tag(kid, g.v, (g.base || 0) + i * g.step));
        });
      }
      for (const s of SINGLES) {
        document.querySelectorAll(s.sel).forEach(el => tag(el, s.v, s.d || 0));
      }
    } catch (e) {/* never let motion break the page */}
  }
  function scanParallax() {
    if (reduce() || window.innerWidth <= 768) {
      pTargets = [];
      return;
    }
    pTargets = [];
    for (const p of PARALLAX) {
      document.querySelectorAll(p.sel).forEach(el => {
        el.classList.add("svs-parallax");
        pTargets.push({
          el,
          cfg: p
        });
      });
    }
    updateParallax();
  }
  function updateParallax() {
    const y = window.pageYOffset || document.documentElement.scrollTop || 0;
    const vh = window.innerHeight || 800;
    for (const t of pTargets) {
      const {
        el,
        cfg
      } = t;
      let dy;
      if (cfg.type === "scroll") {
        dy = y * cfg.speed;
      } else {
        const r = el.getBoundingClientRect();
        dy = (r.top + r.height / 2 - vh / 2) * -cfg.speed;
      }
      dy = Math.max(-cfg.max, Math.min(cfg.max, dy));
      const scalePart = cfg.scale ? " scale(" + cfg.scale + ")" : "";
      el.style.transform = "translate3d(0," + dy.toFixed(1) + "px,0)" + scalePart;
      if (cfg.fade) el.style.opacity = Math.max(0, 1 - y / cfg.fade).toFixed(3);
    }
  }
  function onScroll() {
    if (ticking || !pTargets.length) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateParallax();
      ticking = false;
    });
  }
  let started = false;
  function start() {
    if (started) return;
    started = true;
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    window.addEventListener("resize", () => {
      scanParallax();
    }, {
      passive: true
    });
    if (mqReduce && mqReduce.addEventListener) {
      mqReduce.addEventListener("change", () => {
        if (reduce()) document.querySelectorAll(".svs-reveal").forEach(el => el.classList.add("svs-in"));
      });
    }
  }

  // Called by App after each route render (rAF + late pass for async content)
  function scan() {
    start();
    requestAnimationFrame(() => {
      scanReveals();
      scanParallax();
    });
    setTimeout(() => {
      scanReveals();
      scanParallax();
    }, 360);
    // Safety net: if anything is still hidden after 4s, reveal it.
    clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(() => {
      document.querySelectorAll(".svs-reveal:not(.svs-in)").forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < (window.innerHeight || 800)) el.classList.add("svs-in");
      });
    }, 4000);
  }
  return {
    scan
  };
})();

// ===== src/tokens.jsx =====
// Design tokens — warm hospitality palette inspired by Nespresso / Tesla / Ramp
// All palettes share the same structure so Tweaks can swap them.

const PALETTES = {
  cream: {
    name: "Cream & Brass",
    bg: "oklch(0.965 0.012 82)",
    // warm cream
    bgAlt: "oklch(0.93 0.018 78)",
    // deeper cream
    bgDeep: "oklch(0.22 0.015 50)",
    // espresso
    fg: "oklch(0.20 0.015 45)",
    // deep espresso text
    fgMuted: "oklch(0.42 0.015 50)",
    // muted body
    line: "oklch(0.82 0.015 78)",
    // hairline
    accent: "oklch(0.62 0.11 65)",
    // brass
    accentInk: "oklch(0.18 0.02 40)",
    // text on accent
    onDeep: "oklch(0.95 0.015 82)" // text on espresso bg
  },
  sage: {
    name: "Sage & Stone",
    bg: "oklch(0.965 0.008 130)",
    bgAlt: "oklch(0.92 0.015 130)",
    bgDeep: "oklch(0.24 0.018 155)",
    fg: "oklch(0.22 0.015 155)",
    fgMuted: "oklch(0.44 0.015 150)",
    line: "oklch(0.82 0.012 130)",
    accent: "oklch(0.55 0.08 155)",
    accentInk: "oklch(0.96 0.01 130)",
    onDeep: "oklch(0.95 0.01 130)"
  },
  terracotta: {
    name: "Terracotta & Bone",
    bg: "oklch(0.96 0.012 60)",
    bgAlt: "oklch(0.92 0.02 55)",
    bgDeep: "oklch(0.26 0.04 40)",
    fg: "oklch(0.22 0.02 40)",
    fgMuted: "oklch(0.45 0.02 45)",
    line: "oklch(0.83 0.018 60)",
    accent: "oklch(0.58 0.13 45)",
    accentInk: "oklch(0.98 0.01 60)",
    onDeep: "oklch(0.95 0.012 60)"
  },
  midnight: {
    name: "Midnight & Amber",
    bg: "oklch(0.17 0.015 250)",
    bgAlt: "oklch(0.22 0.018 250)",
    bgDeep: "oklch(0.10 0.02 250)",
    fg: "oklch(0.96 0.008 250)",
    fgMuted: "oklch(0.72 0.012 250)",
    line: "oklch(0.30 0.015 250)",
    accent: "oklch(0.72 0.12 70)",
    accentInk: "oklch(0.15 0.02 250)",
    onDeep: "oklch(0.96 0.008 250)"
  }
};

// CSS variable injection helper
function applyPalette(palette) {
  const root = document.documentElement;
  Object.entries(palette).forEach(([k, v]) => {
    if (k === "name") return;
    root.style.setProperty(`--c-${k}`, v);
  });
}
Object.assign(window, {
  PALETTES,
  applyPalette
});

// ===== src/atoms.jsx =====
// Reusable UI atoms — placeholders, stats, quote blocks, etc.

// Striped placeholder — used in place of real photography.
// Labelled with monospace caption explaining what goes there.
function Placeholder({
  label,
  ratio = "4 / 3",
  tone = "warm",
  rounded = true,
  children,
  className = ""
}) {
  const styles = {
    warm: {
      bg1: "var(--c-bgAlt)",
      bg2: "var(--c-bg)",
      ink: "var(--c-fgMuted)"
    },
    deep: {
      bg1: "oklch(0.30 0.02 50)",
      bg2: "oklch(0.24 0.02 50)",
      ink: "var(--c-onDeep)"
    },
    accent: {
      bg1: "var(--c-accent)",
      bg2: "oklch(from var(--c-accent) calc(l + 0.04) c h)",
      ink: "var(--c-accentInk)"
    }
  }[tone];
  return /*#__PURE__*/React.createElement("div", {
    className: `svs-ph ${rounded ? "is-rounded" : ""} ${className}`,
    style: {
      aspectRatio: ratio,
      "--ph-bg1": styles.bg1,
      "--ph-bg2": styles.bg2,
      "--ph-ink": styles.ink
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-ph-stripes"
  }), label && /*#__PURE__*/React.createElement("div", {
    className: "svs-ph-label"
  }, label), children);
}
function Eyebrow({
  children,
  num,
  onDeep
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `svs-eyebrow ${onDeep ? "svs-eyebrow--onDeep" : ""}`
  }, num && /*#__PURE__*/React.createElement("span", {
    className: "svs-eyebrow-num"
  }, num), /*#__PURE__*/React.createElement("span", null, children));
}
function Stat({
  big,
  label,
  sub,
  onDeep
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `svs-stat ${onDeep ? "is-onDeep" : ""}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-stat-big"
  }, big), /*#__PURE__*/React.createElement("div", {
    className: "svs-stat-label"
  }, label), sub && /*#__PURE__*/React.createElement("div", {
    className: "svs-stat-sub"
  }, sub));
}
function FeatureRow({
  icon,
  title,
  body
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "svs-feature"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-feature-icon"
  }, icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "svs-feature-title"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "svs-feature-body"
  }, body)));
}

// Simple hairline icons — geometric, never illustrative
const Icons = {
  tap: /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 4h10v3H5zM8 7v5a2 2 0 0 0 2 2 2 2 0 0 0 2-2V7M10 14v3",
    stroke: "currentColor",
    strokeWidth: "1.3",
    strokeLinecap: "round"
  })),
  fridge: /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "4",
    y: "2.5",
    width: "12",
    height: "15",
    rx: "1.5",
    stroke: "currentColor",
    strokeWidth: "1.3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 8h12M7 5.5v1M7 10.5v1.5",
    stroke: "currentColor",
    strokeWidth: "1.3",
    strokeLinecap: "round"
  })),
  coffee: /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 7h10v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3zM14 9h2a2 2 0 0 1 0 4h-2M6 3v1.5M9 3v1.5M12 3v1.5",
    stroke: "currentColor",
    strokeWidth: "1.3",
    strokeLinecap: "round"
  })),
  event: /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "7",
    r: "2.5",
    stroke: "currentColor",
    strokeWidth: "1.3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "13",
    cy: "13",
    r: "2.5",
    stroke: "currentColor",
    strokeWidth: "1.3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 9l2 2",
    stroke: "currentColor",
    strokeWidth: "1.3"
  })),
  shield: /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2.5 4 5v5c0 3.5 2.5 6 6 7.5 3.5-1.5 6-4 6-7.5V5z",
    stroke: "currentColor",
    strokeWidth: "1.3",
    strokeLinejoin: "round"
  })),
  sparkle: /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 3v4M10 13v4M3 10h4M13 10h4M5 5l2.5 2.5M12.5 12.5 15 15M15 5l-2.5 2.5M7.5 12.5 5 15",
    stroke: "currentColor",
    strokeWidth: "1.3",
    strokeLinecap: "round"
  })),
  clock: /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "10",
    r: "7",
    stroke: "currentColor",
    strokeWidth: "1.3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 6v4l2.5 2",
    stroke: "currentColor",
    strokeWidth: "1.3",
    strokeLinecap: "round"
  })),
  palette: /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2.5c-4.1 0-7.5 3-7.5 6.8 0 2.5 2.1 4.2 4.5 4.2 1 0 1.5.5 1.5 1.3 0 1 .7 1.7 1.7 1.7 4 0 7.3-3.1 7.3-7 0-3.7-3.4-7-7.5-7Z",
    stroke: "currentColor",
    strokeWidth: "1.3",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "8",
    r: ".8",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "6",
    r: ".8",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "13",
    cy: "8",
    r: ".8",
    fill: "currentColor"
  }))
};

// Button helper
function Btn({
  href,
  variant = "ghost",
  size = "md",
  children,
  onClick
}) {
  const cls = `svs-btn svs-btn--${variant} svs-btn--${size}`;
  if (href) return /*#__PURE__*/React.createElement("a", {
    className: cls,
    href: href,
    onClick: onClick
  }, children);
  return /*#__PURE__*/React.createElement("button", {
    className: cls,
    onClick: onClick
  }, children);
}

// Media — drop in a real photo or video, falls back to the striped Placeholder
// if no src is given. Accepts any prop Placeholder accepts (ratio, tone, label,
// className, rounded) plus:
//   src        — path to image or video, e.g. "assets/lobby-tap.jpg"
//   kind       — "image" | "video" (auto-detected from extension if omitted)
//   alt        — accessibility text for images
//   poster     — poster frame for videos
//   objectPosition — "center", "top", "50% 30%", etc. (default "center")

// Relative asset srcs need to inherit the preview-server auth token.
// When deployed to a real host with no query string, this is a no-op.
function resolveAssetSrc(src) {
  if (!src) return src;
  if (/^(https?:|data:|blob:|\/)/i.test(src)) return src;
  const base = typeof window !== "undefined" && window.__ASSET_BASE || "";
  const qs = typeof window !== "undefined" && window.location && window.location.search || "";
  return base + src + qs;
}
function Media({
  src,
  kind,
  alt = "",
  poster,
  objectPosition = "center",
  ratio = "4 / 3",
  className = "",
  rounded = true,
  ...rest
}) {
  if (!src) return /*#__PURE__*/React.createElement(Placeholder, _extends({
    ratio: ratio,
    className: className,
    rounded: rounded
  }, rest));
  const resolved = resolveAssetSrc(src);
  const resolvedPoster = resolveAssetSrc(poster);
  const isVideo = kind === "video" || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src);
  const wrapCls = `svs-media-wrap ${rounded ? "is-rounded" : ""} ${className}`;
  const style = {
    aspectRatio: ratio
  };
  if (isVideo) {
    return /*#__PURE__*/React.createElement("div", {
      className: wrapCls,
      style: style
    }, /*#__PURE__*/React.createElement("video", {
      className: "svs-media",
      src: resolved,
      poster: resolvedPoster,
      autoPlay: true,
      muted: true,
      loop: true,
      playsInline: true,
      style: {
        objectPosition
      }
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: wrapCls,
    style: style
  }, /*#__PURE__*/React.createElement("img", {
    className: "svs-media",
    src: resolved,
    alt: alt,
    style: {
      objectPosition
    },
    loading: "lazy"
  }));
}
Object.assign(window, {
  Placeholder,
  Media,
  Eyebrow,
  Stat,
  FeatureRow,
  Icons,
  Btn,
  resolveAssetSrc,
  useDragMarquee
});

// useDragMarquee — adds click-and-drag panning to a CSS-keyframe marquee that
// translates `track` by exactly half its width (i.e. content duplicated 2×).
// Direction: 'rtl' = keyframes go from -50% → 0 (track scrolls right-to-left visually).
//            'ltr' = keyframes go from 0 → -50% (also scrolls right-to-left, opposite phase).
// After release, the CSS animation resumes from the dragged-to position via a
// negative animation-delay. Respects prefers-reduced-motion (drag works; no auto-resume).
function useDragMarquee({
  direction = "rtl"
} = {}) {
  const wrapRef = React.useRef(null);
  const trackRef = React.useRef(null);
  React.useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    const THRESHOLD = 6;
    let dragging = false;
    let pointerId = null;
    let startX = 0;
    let baseOffset = 0;
    let moved = false;
    let cachedDuration = 0;
    const reducedMotion = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const getLoopWidth = () => track.scrollWidth / 2;
    const getDuration = () => parseFloat(getComputedStyle(track).animationDuration) || 0;
    const getCurrentX = () => {
      const t = getComputedStyle(track).transform;
      if (!t || t === "none") return 0;
      try {
        return new DOMMatrixReadOnly(t).m41;
      } catch (_) {
        return 0;
      }
    };
    const wrapX = (x, W) => {
      if (W <= 0) return 0;
      let r = x % W;
      if (r > 0) r -= W;
      return r;
    };
    const onPointerDown = e => {
      if (e.button !== undefined && e.button !== 0) return;
      // Ignore drags initiated on form/interactive controls inside slides
      if (e.target.closest && e.target.closest("a,button,input,textarea,select")) return;
      const W = getLoopWidth();
      // Cache the running animation duration BEFORE we clobber it; computed
      // animationDuration goes to "0s" once we set inline `animation: none`.
      cachedDuration = getDuration();
      baseOffset = wrapX(getCurrentX(), W);
      track.style.animation = "none";
      track.style.transform = `translate3d(${baseOffset}px, 0, 0)`;
      dragging = true;
      moved = false;
      pointerId = e.pointerId;
      startX = e.clientX;
      try {
        wrap.setPointerCapture(e.pointerId);
      } catch (_) {}
      wrap.classList.add("is-dragging");
    };
    const onPointerMove = e => {
      if (!dragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > THRESHOLD) moved = true;
      const W = getLoopWidth();
      const x = wrapX(baseOffset + dx, W);
      track.style.transform = `translate3d(${x}px, 0, 0)`;
      if (moved) e.preventDefault();
    };
    const finish = e => {
      if (!dragging) return;
      dragging = false;
      try {
        wrap.releasePointerCapture(pointerId);
      } catch (_) {}
      wrap.classList.remove("is-dragging");
      const W = getLoopWidth();
      const D = cachedDuration;
      const xNow = wrapX(getCurrentX(), W);

      // Suppress one click if the pointer actually moved past the threshold
      if (moved) {
        const blocker = ev => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        wrap.addEventListener("click", blocker, {
          capture: true,
          once: true
        });
      }
      if (reducedMotion() || D <= 0 || W <= 0) {
        // Leave the dragged position in place; no auto-resume.
        pointerId = null;
        return;
      }

      // progress is the fraction of one cycle that has elapsed at xNow
      let progress;
      if (direction === "rtl") {
        // keyframes: -W → 0  ⇒  x = -W + W·p  ⇒  p = (x + W) / W
        progress = (xNow + W) / W;
      } else {
        // keyframes: 0 → -W   ⇒  x = -W·p     ⇒  p = -x / W
        progress = -xNow / W;
      }
      progress = (progress % 1 + 1) % 1;
      track.style.transform = "";
      track.style.animation = "";
      void track.offsetWidth; // reflow so the next delay is honored fresh
      track.style.animationDelay = `-${progress * D}s`;
      pointerId = null;
    };
    wrap.addEventListener("pointerdown", onPointerDown);
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerup", finish);
    wrap.addEventListener("pointercancel", finish);
    return () => {
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerup", finish);
      wrap.removeEventListener("pointercancel", finish);
    };
  }, [direction]);
  return {
    wrapRef,
    trackRef
  };
}

// ===== src/chrome.jsx =====
// Nav + Footer — shared across all pages
const {
  useState: useStateNav,
  useEffect: useEffectNav
} = React;
function Logo({
  mono
}) {
  return /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/"),
    className: "svs-logo",
    "aria-label": "Simply Vending Solutions \u2014 Premium Coffee"
  }, /*#__PURE__*/React.createElement("img", {
    src: resolveAssetSrc("assets/svs-logo-full-trim.png"),
    alt: "Simply Vending Solutions \u2014 Premium Coffee",
    className: "svs-logo-img"
  }));
}
function Nav({
  route,
  navigate
}) {
  const [open, setOpen] = useStateNav(false);
  const [scrolled, setScrolled] = useStateNav(false);
  useEffectNav(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer when route changes
  useEffectNav(() => {
    setOpen(false);
  }, [route]);

  // Lock body scroll + close on Escape while drawer is open
  useEffectNav(() => {
    if (!open) return;
    document.body.classList.add("svs-nav-locked");
    const onKey = e => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("svs-nav-locked");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const links = [{
    href: "#/services/draft",
    label: "Draft Beverages",
    flag: "Flagship"
  }, {
    href: "#/services/micromarts",
    label: "Micro Marts"
  }, {
    href: "#/services/coffee",
    label: "Hot Coffee"
  }, {
    href: "#/services/events",
    label: "Events"
  }, {
    href: "#/about",
    label: "About"
  }];
  return /*#__PURE__*/React.createElement("header", {
    className: `svs-nav ${scrolled ? "is-scrolled" : ""} ${route === "/" ? "is-home" : ""}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-nav-inner"
  }, /*#__PURE__*/React.createElement(Logo, null), /*#__PURE__*/React.createElement("nav", {
    className: "svs-nav-links",
    "aria-label": "Primary"
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.href,
    href: SVS.href(l.href),
    className: `svs-nav-link ${route.startsWith(l.href.replace("#", "")) ? "is-active" : ""}`
  }, l.label, l.flag && /*#__PURE__*/React.createElement("span", {
    className: "svs-nav-flag"
  }, l.flag)))), /*#__PURE__*/React.createElement("div", {
    className: "svs-nav-cta"
  }, /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/contact"),
    className: "svs-btn svs-btn--accent svs-btn--sm"
  }, "Schedule a Walkthrough", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 7h8m-3-3 3 3-3 3",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })))), /*#__PURE__*/React.createElement("button", {
    className: `svs-nav-toggle ${open ? "is-open" : ""}`,
    onClick: () => setOpen(!open),
    "aria-label": open ? "Close menu" : "Open menu",
    "aria-expanded": open
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null))), open && /*#__PURE__*/React.createElement("div", {
    className: "svs-nav-mobile",
    role: "dialog",
    "aria-label": "Site navigation"
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.href,
    href: SVS.href(l.href),
    onClick: () => setOpen(false)
  }, l.label)), /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/contact"),
    onClick: () => setOpen(false),
    className: "svs-btn svs-btn--accent"
  }, "Schedule a Walkthrough", /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8h10m-4-4 4 4-4 4",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "svs-nav-mobile-foot"
  }, /*#__PURE__*/React.createElement("a", {
    href: "tel:+17036262258",
    onClick: () => setOpen(false)
  }, "(703) 626-2258"), /*#__PURE__*/React.createElement("a", {
    href: "mailto:Jonathan@simplyvendingsolutionsllc.com",
    onClick: () => setOpen(false)
  }, "Jonathan@simplyvendingsolutionsllc.com"), /*#__PURE__*/React.createElement("span", null, "Fairfax, VA \xB7 Serving DC + NoVA"))));
}
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    className: "svs-footer",
    "data-screen-label": "Footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-footer-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-footer-lede"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-eyebrow svs-eyebrow--onDeep"
  }, "Level up your amenities"), /*#__PURE__*/React.createElement("h2", {
    className: "svs-display-md"
  }, "Let's build the lobby your residents ", /*#__PURE__*/React.createElement("em", null, "brag"), " about."), /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/contact"),
    className: "svs-btn svs-btn--accent svs-btn--lg"
  }, "Schedule a Walkthrough", /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8h10m-4-4 4 4-4 4",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "svs-footer-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-footer-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-footer-label"
  }, "Services"), /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/services/draft")
  }, "Draft Beverages"), /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/services/micromarts")
  }, "AI Micro Marts"), /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/services/coffee")
  }, "Hot Coffee"), /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/services/events")
  }, "Resident Events")), /*#__PURE__*/React.createElement("div", {
    className: "svs-footer-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-footer-label"
  }, "Company"), /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/about")
  }, "About"), /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/contact")
  }, "Become a Client"), /*#__PURE__*/React.createElement("a", {
    href: "https://www.instagram.com/simplyvendingsolutionsllc/",
    target: "_blank",
    rel: "noreferrer",
    className: "svs-social"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "18",
    height: "18",
    rx: "5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "17.5",
    cy: "6.5",
    r: "1",
    fill: "currentColor",
    stroke: "none"
  })), "Instagram")), /*#__PURE__*/React.createElement("div", {
    className: "svs-footer-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-footer-label"
  }, "Visit"), /*#__PURE__*/React.createElement("p", null, "2828 Dorr Ave.", /*#__PURE__*/React.createElement("br", null), "Fairfax, VA 22031"), /*#__PURE__*/React.createElement("a", {
    href: "tel:+17036262258"
  }, "(703) 626-2258"), /*#__PURE__*/React.createElement("a", {
    href: "mailto:Jonathan@simplyvendingsolutionsllc.com"
  }, "Jonathan@simplyvendingsolutionsllc.com")))), /*#__PURE__*/React.createElement("nav", {
    className: "svs-footer-areas",
    "aria-label": "Service areas"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-footer-areas-label"
  }, "Areas we serve"), /*#__PURE__*/React.createElement("span", {
    className: "svs-footer-areas-links"
  }, (typeof window !== "undefined" && window.SVS && window.SVS.CITIES ? window.SVS.CITIES : []).map(function (c) {
    return /*#__PURE__*/React.createElement("a", {
      key: c.slug,
      href: window.SVS.cityHref(c.slug)
    }, c.name);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "svs-footer-bot"
  }, /*#__PURE__*/React.createElement("img", {
    src: resolveAssetSrc("assets/svs-logo-full-trim.png"),
    alt: "Simply Vending Solutions \u2014 Premium Coffee",
    className: "svs-footer-logo"
  }), /*#__PURE__*/React.createElement("span", null, "\xA9 ", new Date().getFullYear(), " Simply Vending Solutions LLC"), /*#__PURE__*/React.createElement("span", {
    className: "svs-footer-dots"
  }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("span", null, "Serving 50+ properties across the DMV")));
}
Object.assign(window, {
  Logo,
  Nav,
  Footer
});

// ===== src/home_top.jsx =====
// Homepage — flagship page featuring the draft beverage amenity
const {
  useState: useStateHome,
  useEffect: useEffectHome
} = React;
function HeroHome({
  headline,
  sub,
  ambientBeans
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "svs-hero",
    "data-screen-label": "Hero"
  }, ambientBeans, /*#__PURE__*/React.createElement("div", {
    className: "svs-hero-image"
  }, /*#__PURE__*/React.createElement(Media
  // src="assets/hero-lobby.jpg"   /* ← drop a 3:2 lobby photo here */
  // kind="image"                  /* or kind="video" for a .mp4 clip */
  , {
    alt: "Residents pouring a nitro cold brew in a sunlit lobby",
    ratio: "auto",
    tone: "deep",
    rounded: false,
    className: "svs-hero-ph",
    objectPosition: "center",
    label: ""
  }), /*#__PURE__*/React.createElement("div", {
    className: "svs-hero-wash"
  }), /*#__PURE__*/React.createElement("div", {
    className: "svs-hero-steam",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-steam svs-steam--1"
  }), /*#__PURE__*/React.createElement("span", {
    className: "svs-steam svs-steam--2"
  }), /*#__PURE__*/React.createElement("span", {
    className: "svs-steam svs-steam--3"
  }), /*#__PURE__*/React.createElement("span", {
    className: "svs-steam svs-steam--4"
  }), /*#__PURE__*/React.createElement("span", {
    className: "svs-steam svs-steam--5"
  }), /*#__PURE__*/React.createElement("span", {
    className: "svs-steam svs-steam--6"
  })), /*#__PURE__*/React.createElement("div", {
    className: "svs-hero-grain"
  })), /*#__PURE__*/React.createElement("div", {
    className: "svs-hero-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-hero-eyebrow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-hero-dot"
  }), /*#__PURE__*/React.createElement("span", null, "Resident amenities \xB7 DMV \xB7 Since 2014")), /*#__PURE__*/React.createElement("h1", {
    className: "svs-hero-headline"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-hero-line-1"
  }, headline.line1), /*#__PURE__*/React.createElement("span", {
    className: "svs-hero-line-2"
  }, /*#__PURE__*/React.createElement("em", null, headline.line2))), /*#__PURE__*/React.createElement("p", {
    className: "svs-hero-sub"
  }, sub), /*#__PURE__*/React.createElement("div", {
    className: "svs-hero-cta"
  }, /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/contact"),
    className: "svs-btn svs-btn--accent svs-btn--lg"
  }, "Schedule a Walkthrough", /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8h10m-4-4 4 4-4 4",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/services/draft"),
    className: "svs-btn svs-btn--ghost-onDeep svs-btn--lg"
  }, "Meet the Draft Tap"))), /*#__PURE__*/React.createElement("div", {
    className: "svs-hero-ticker"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-ticker-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-ticker-big"
  }, "50+"), /*#__PURE__*/React.createElement("span", null, "properties served")), /*#__PURE__*/React.createElement("div", {
    className: "svs-ticker-dot"
  }), /*#__PURE__*/React.createElement("div", {
    className: "svs-ticker-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-ticker-big"
  }, "10 yrs"), /*#__PURE__*/React.createElement("span", null, "in amenities")), /*#__PURE__*/React.createElement("div", {
    className: "svs-ticker-dot"
  }), /*#__PURE__*/React.createElement("div", {
    className: "svs-ticker-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-ticker-big"
  }, "24/7"), /*#__PURE__*/React.createElement("span", null, "monitoring")), /*#__PURE__*/React.createElement("div", {
    className: "svs-ticker-dot"
  }), /*#__PURE__*/React.createElement("div", {
    className: "svs-ticker-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-ticker-big"
  }, "7-day"), /*#__PURE__*/React.createElement("span", null, "service"))));
}

// Flagship section — the draft beverage system
function FlagshipDraft() {
  const flavors = [{
    name: "Nitro Cold Brew",
    note: "Cascading, crema-rich",
    bg: "#F5EAD2",
    line: "#E6D4A8",
    accent: "#B88A2E"
  }, {
    name: "Iced Latte",
    note: "Barista-pulled, on tap",
    bg: "#F2E4D2",
    line: "#E2CDB0",
    accent: "#8B5A2B"
  }, {
    name: "Kombucha",
    note: "Rotating local brew",
    bg: "#E5EFD6",
    line: "#CFE0B4",
    accent: "#5C8A2E"
  }, {
    name: "Paradise Splash",
    note: "Seasonal refresher",
    bg: "#FBF1C8",
    line: "#F1E08F",
    accent: "#B89322"
  }, {
    name: "Electrolyte Ade",
    note: "Coming soon\nPost-workout boost",
    bg: "#D9ECF2",
    line: "#BADCE7",
    accent: "#2A7E96"
  }, {
    name: "Hibiscus Tea",
    note: "Ceremonial grade",
    bg: "#DCEBD3",
    line: "#BFD9B0",
    accent: "#4F7F39"
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "svs-flagship",
    "data-screen-label": "Flagship Draft"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-flagship-head"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    num: "01"
  }, "The Flagship"), /*#__PURE__*/React.createElement("h2", {
    className: "svs-display-lg"
  }, "A four-tap system that turns your lobby", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", null, "into the neighborhood caf\xE9."))), /*#__PURE__*/React.createElement("div", {
    className: "svs-flagship-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-flagship-visual"
  }, /*#__PURE__*/React.createElement(Media, {
    src: "assets/flagship-pulse.webp",
    alt: "The Pulse draft beverage system on a residence kitchen counter, pouring Latte, Nitro Cold Brew, and Refresher on tap",
    tone: "warm",
    ratio: "4 / 5",
    objectPosition: "center 42%",
    label: "Product photo \xB7 The Pulse draft beverage system, Craft on Draft, on a marble residence counter."
  }), /*#__PURE__*/React.createElement("div", {
    className: "svs-flagship-callouts"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-callout",
    style: {
      top: "12%",
      left: "0%"
    }
  }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("div", null, "Nitro-ready pressure", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", null, "25\u201340 PSI regulated"))), /*#__PURE__*/React.createElement("div", {
    className: "svs-callout",
    style: {
      top: "48%",
      right: "0%"
    },
    "data-comment-anchor": "55c7cae18e-div-792-15"
  }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("div", null, "Touchless pour", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", null, "Hygienic by default"))), /*#__PURE__*/React.createElement("div", {
    className: "svs-callout",
    style: {
      bottom: "8%",
      left: "4%"
    }
  }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("div", null, "Smart telemetry", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", null, "Keg levels \u2192 our team"))))), /*#__PURE__*/React.createElement("div", {
    className: "svs-flagship-copy"
  }, /*#__PURE__*/React.createElement("p", {
    className: "svs-lede"
  }, "Residents don't just want coffee \u2014 they want a ", /*#__PURE__*/React.createElement("em", null, "ritual"), ". Our four-tap system dispenses cafe-grade beverages at the pull of a handle, and fits the aesthetic of your boutique lobby."), /*#__PURE__*/React.createElement("div", {
    className: "svs-flavors"
  }, flavors.map((f, i) => /*#__PURE__*/React.createElement("div", {
    className: "svs-flavor",
    key: f.name,
    style: {
      "--flavor-bg": f.bg,
      "--flavor-line": f.line,
      "--flavor-accent": f.accent
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-flavor-num"
  }, String(i + 1).padStart(2, "0")), /*#__PURE__*/React.createElement("span", {
    className: "svs-flavor-name"
  }, f.name), /*#__PURE__*/React.createElement("span", {
    className: "svs-flavor-note"
  }, f.note)))), /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/services/draft"),
    className: "svs-btn svs-btn--dark svs-btn--lg"
  }, "Explore the Draft System", /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8h10m-4-4 4 4-4 4",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })))))));
}

// Value props — Tesla-style clean grid
function ValueProps() {
  const items = [{
    icon: Icons.sparkle,
    title: "All-in-one amenity partner",
    body: "One vendor, one invoice, one point of contact — across draft, coffee, micro marts, and events."
  }, {
    icon: Icons.clock,
    title: "24/7 monitoring, 7-day service",
    body: "Smart telemetry catches problems before residents do. We show up fast when something needs a human."
  }, {
    icon: Icons.palette,
    title: "Tailored to your aesthetic",
    body: "Every install is fit to your building — finishes, placement, product curation, signage."
  }, {
    icon: Icons.shield,
    title: "Ten years in the DMV",
    body: "Fifty-plus properties trust us. Greystar, Bozzuto, Kettler, and independent boutiques among them."
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "svs-values",
    "data-screen-label": "Value Props"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-values-head"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    num: "02"
  }, "Why property managers choose us"), /*#__PURE__*/React.createElement("h2", {
    className: "svs-display-md"
  }, "Built for buildings that care how things ", /*#__PURE__*/React.createElement("em", null, "feel"), ".")), /*#__PURE__*/React.createElement("div", {
    className: "svs-values-grid"
  }, items.map(it => /*#__PURE__*/React.createElement("div", {
    className: "svs-value",
    key: it.title
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-value-icon"
  }, it.icon), /*#__PURE__*/React.createElement("h3", {
    className: "svs-value-title"
  }, it.title), /*#__PURE__*/React.createElement("p", {
    className: "svs-value-body"
  }, it.body))))));
}

// Page-wide ambient animation — drifting coffee beans across the whole homepage
function HomeAmbientAnim() {
  // 28 beans with varying positions, sizes, durations, delays
  const beans = React.useMemo(() => {
    const specs = [{
      left: 3,
      delay: 0,
      dur: 22,
      size: 30,
      variant: "a"
    }, {
      left: 9,
      delay: -4,
      dur: 28,
      size: 22,
      variant: "b"
    }, {
      left: 15,
      delay: -11,
      dur: 26,
      size: 26,
      variant: "a"
    }, {
      left: 21,
      delay: -7,
      dur: 30,
      size: 18,
      variant: "b"
    }, {
      left: 27,
      delay: -15,
      dur: 24,
      size: 36,
      variant: "a"
    }, {
      left: 33,
      delay: -2,
      dur: 27,
      size: 22,
      variant: "b"
    }, {
      left: 39,
      delay: -9,
      dur: 32,
      size: 28,
      variant: "a"
    }, {
      left: 45,
      delay: -18,
      dur: 25,
      size: 20,
      variant: "b"
    }, {
      left: 51,
      delay: -6,
      dur: 29,
      size: 34,
      variant: "a"
    }, {
      left: 57,
      delay: -13,
      dur: 23,
      size: 24,
      variant: "b"
    }, {
      left: 63,
      delay: -20,
      dur: 31,
      size: 28,
      variant: "a"
    }, {
      left: 69,
      delay: -5,
      dur: 26,
      size: 20,
      variant: "b"
    }, {
      left: 75,
      delay: -16,
      dur: 34,
      size: 32,
      variant: "a"
    }, {
      left: 81,
      delay: -22,
      dur: 28,
      size: 38,
      variant: "b"
    }, {
      left: 87,
      delay: -25,
      dur: 27,
      size: 22,
      variant: "a"
    }, {
      left: 93,
      delay: -10,
      dur: 30,
      size: 26,
      variant: "b"
    }, {
      left: 6,
      delay: -28,
      dur: 33,
      size: 18,
      variant: "b"
    }, {
      left: 18,
      delay: -31,
      dur: 29,
      size: 30,
      variant: "a"
    }, {
      left: 30,
      delay: -3,
      dur: 35,
      size: 16,
      variant: "b"
    }, {
      left: 42,
      delay: -24,
      dur: 26,
      size: 34,
      variant: "a"
    }, {
      left: 54,
      delay: -30,
      dur: 24,
      size: 20,
      variant: "b"
    }, {
      left: 66,
      delay: -12,
      dur: 32,
      size: 28,
      variant: "a"
    }, {
      left: 78,
      delay: -19,
      dur: 27,
      size: 22,
      variant: "b"
    }, {
      left: 90,
      delay: -27,
      dur: 31,
      size: 32,
      variant: "a"
    }, {
      left: 12,
      delay: -14,
      dur: 25,
      size: 24,
      variant: "a"
    }, {
      left: 36,
      delay: -21,
      dur: 33,
      size: 20,
      variant: "b"
    }, {
      left: 60,
      delay: -8,
      dur: 28,
      size: 26,
      variant: "b"
    }, {
      left: 84,
      delay: -17,
      dur: 30,
      size: 30,
      variant: "a"
    }];
    return specs;
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "svs-hero-anim",
    "aria-hidden": "true"
  }, beans.map((b, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: `svs-bean-hero svs-bean-hero--${b.variant}`,
    style: {
      left: `${b.left}%`,
      width: `${b.size}px`,
      height: `${Math.round(b.size * 1.42)}px`,
      animationDelay: `${b.delay}s`,
      animationDuration: `${b.dur}s`
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 28 40",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("ellipse", {
    cx: "14",
    cy: "20",
    rx: "10",
    ry: "17",
    fill: "#2a170a"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 4 C 11 12, 11 28, 14 36",
    stroke: "#110801",
    strokeWidth: "1.8",
    fill: "none",
    strokeLinecap: "round"
  })))));
}

// One-shot entrance swirl — plays on every page load
function HomeEntranceSwirl() {
  const [active, setActive] = React.useState(true);
  React.useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(false), 3200); // unmount after animation
    return () => clearTimeout(t);
  }, [active]);
  if (!active) return null;
  // 36 beans sweeping horizontally across the page in staggered lanes
  const beans = Array.from({
    length: 36
  }, (_, i) => {
    const laneY = i * 137 % 90 - 45; // -45vh to +45vh vertical lane
    const driftY = i * 53 % 18 - 9; // small vertical drift while flying
    const size = 18 + i * 7 % 28;
    const delay = i * 55 % 1400; // 0-1.4s stagger
    const dur = 1800 + i * 47 % 900;
    const spin = i * 53 % 720 + 360;
    const variant = i % 2 === 0 ? "a" : "b";
    return {
      laneY,
      driftY,
      size,
      delay,
      dur,
      spin,
      variant
    };
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "svs-swirl",
    "aria-hidden": "true"
  }, beans.map((b, i) => {
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      className: `svs-swirl-bean svs-swirl-bean--${b.variant}`,
      style: {
        "--lane-y": `${b.laneY}vh`,
        "--drift-y": `${b.driftY}vh`,
        "--spin": `${b.spin}deg`,
        width: `${b.size}px`,
        height: `${Math.round(b.size * 1.42)}px`,
        animationDelay: `${b.delay}ms`,
        animationDuration: `${b.dur}ms`
      }
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 28 40",
      xmlns: "http://www.w3.org/2000/svg"
    }, /*#__PURE__*/React.createElement("ellipse", {
      cx: "14",
      cy: "20",
      rx: "10",
      ry: "17",
      fill: "#2a170a"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 4 C 11 12, 11 28, 14 36",
      stroke: "#110801",
      strokeWidth: "1.8",
      fill: "none",
      strokeLinecap: "round"
    })));
  }));
}
Object.assign(window, {
  HeroHome,
  FlagshipDraft,
  ValueProps,
  HomeAmbientAnim,
  HomeEntranceSwirl
});

// ===== src/home_bottom.jsx =====
// Homepage — bottom half: services grid, proof, testimonial, CTA
const {
  useState: useStateHomeB
} = React;
const SERVICES = [{
  id: "draft",
  num: "I",
  name: "Draft Beverages",
  tagline: "Four taps. Cafe-grade. Unforgettable.",
  body: "Nitro cold brew, lattes, kombucha, sports drinks — poured on demand from a system built for boutique lobbies.",
  href: "#/services/draft",
  phLabel: "KVM four-tap draft tower in dramatic studio lighting with Pay-by-the-Ounce touchscreen",
  flag: "Flagship",
  src: "assets/draft-gallery-kvm.avif",
  relatedSrc: "assets/draft-related.jpg",
  objectPosition: "center"
}, {
  id: "micromarts",
  num: "II",
  name: "AI Micro Marts",
  tagline: "Walk in. Grab. Walk out.",
  body: "Smart-fridge convenience with computer vision checkout. Stocked weekly with local snacks and essentials.",
  href: "#/services/micromarts",
  phLabel: "Lifestyle · Resident grabbing from smart fridge",
  src: "assets/service-micromart.jpg"
}, {
  id: "coffee",
  num: "III",
  name: "Hot Coffee",
  tagline: "The classic, done right.",
  body: "Premium single-serve and bean-to-cup machines. Curated roasters, daily-fresh beans, zero maintenance for you.",
  href: "#/services/coffee",
  phLabel: "Product · Bean-to-cup machine on warm counter",
  src: "assets/service-coffee.jpg"
}, {
  id: "events",
  num: "IV",
  name: "Resident Events",
  tagline: "Amenity + experience.",
  body: "Pop-up cookouts, mixology nights, wellness mornings — turnkey programming that builds real community.",
  href: "#/services/events",
  phLabel: "Lifestyle · Resident holiday buffet with full catering service",
  src: "assets/service-events.jpg"
}];
function ServicesGrid({
  featured
}) {
  // Re-order so featured service is first, keep rest in original order.
  const ordered = [...SERVICES].sort((a, b) => {
    if (a.id === featured) return -1;
    if (b.id === featured) return 1;
    return 0;
  });
  return /*#__PURE__*/React.createElement("section", {
    className: "svs-services",
    "data-screen-label": "Services Grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-services-head"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    num: "03"
  }, "Four amenities, one partner"), /*#__PURE__*/React.createElement("h2", {
    className: "svs-display-md"
  }, "Pick what your residents will love. ", /*#__PURE__*/React.createElement("em", null, "We handle the rest."))), /*#__PURE__*/React.createElement("div", {
    className: "svs-services-grid"
  }, ordered.map((s, i) => /*#__PURE__*/React.createElement("a", {
    key: s.id,
    href: SVS.href(s.href),
    className: `svs-service-card ${i === 0 ? "is-feature" : ""}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-service-visual"
  }, /*#__PURE__*/React.createElement(Media, {
    src: s.src,
    alt: s.phLabel,
    tone: i === 0 ? "deep" : "warm",
    ratio: s.ratio || (i === 0 ? "16 / 10" : "4 / 3"),
    objectPosition: s.objectPosition || "center",
    label: s.phLabel
  }), s.flag && /*#__PURE__*/React.createElement("span", {
    className: "svs-service-flag"
  }, s.flag)), /*#__PURE__*/React.createElement("div", {
    className: "svs-service-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-service-num"
  }, s.num), /*#__PURE__*/React.createElement("div", {
    className: "svs-service-title-group"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "svs-service-title"
  }, s.name), /*#__PURE__*/React.createElement("p", {
    className: "svs-service-tagline"
  }, s.tagline)), /*#__PURE__*/React.createElement("span", {
    className: "svs-service-arrow"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 22 22",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 11h12m-5-5 5 5-5 5",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })))), /*#__PURE__*/React.createElement("p", {
    className: "svs-service-body"
  }, s.body))))));
}
function ProofStrip() {
  return /*#__PURE__*/React.createElement("section", {
    className: "svs-proof",
    "data-screen-label": "Proof"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-proof-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-proof-intro"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    num: "04",
    onDeep: true
  }, "Trusted across the DMV"), /*#__PURE__*/React.createElement("h2", {
    className: "svs-display-md",
    style: {
      color: "var(--c-onDeep)"
    }
  }, "Ten years in. ", /*#__PURE__*/React.createElement("em", null, "Fifty-plus"), " properties.", /*#__PURE__*/React.createElement("br", null), "Still the only call you need to make.")), /*#__PURE__*/React.createElement("div", {
    className: "svs-proof-stats"
  }, /*#__PURE__*/React.createElement(Stat, {
    big: "50+",
    label: "Properties served",
    sub: "From boutique walk-ups to 400-unit high-rises",
    onDeep: true
  }), /*#__PURE__*/React.createElement(Stat, {
    big: "10 yrs",
    label: "In amenity services",
    sub: "Started with a single cold brew keg in 2014",
    onDeep: true
  }), /*#__PURE__*/React.createElement(Stat, {
    big: "99.2%",
    label: "Uptime last quarter",
    sub: "Smart telemetry + same-day response",
    onDeep: true
  }), /*#__PURE__*/React.createElement(Stat, {
    big: "7 days",
    label: "Service window",
    sub: "Including weekends. Residents don't take days off.",
    onDeep: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "svs-logos"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-logos-label"
  }, "Partnered with"), /*#__PURE__*/React.createElement("div", {
    className: "svs-logos-row"
  }, ["GREYSTAR", "BOZZUTO", "KETTLER", "EQUITY", "LINCOLN", "AVALON"].map(n => /*#__PURE__*/React.createElement("span", {
    key: n,
    className: "svs-logo-chip"
  }, n))))));
}
function Testimonial() {
  const {
    wrapRef: marqueeRef,
    trackRef
  } = useDragMarquee({
    direction: "rtl"
  });
  const reviews = [{
    quote: "Honestly, the best and most reliable coffee provider we've ever worked with. Residents mention the draft bar on every single tour.",
    name: "Lizz M.",
    role: "Property Manager · Arlington, VA",
    tone: "warm",
    accent: false
  }, {
    quote: "We replaced our tired pod machine with the draft bar and tours just close faster now. Residents actually hang out in the lobby — which was the whole point.",
    name: "Marcus Whitfield",
    role: "Property Manager · Washington, DC",
    tone: "deep"
  }, {
    quote: "Service is the part nobody else gets right. Something's off on a Tuesday and the truck shows up Wednesday morning. I'm not chasing anyone.",
    name: "Priya Anand",
    role: "Property Manager · Washington, DC",
    tone: "accent"
  }, {
    quote: "Swapped the old vending machine for the micromarket and our satisfaction scores jumped two points that quarter. It finally feels like an amenity, not a vending machine.",
    name: "Jordan Castellanos",
    role: "Property Manager · Washington, DC",
    tone: "warm"
  }, {
    quote: "I've been doing this fifteen years and I've never had a vendor I didn't have to babysit. These guys just handle it. That's the review.",
    name: "Diane Reeves",
    role: "Property Manager · Washington, DC",
    tone: "deep"
  }, {
    quote: "The nitro cold brew is what sold our residents. We've had people bring guests downstairs just to show off the taps. A little wild, honestly.",
    name: "Tomás Okafor",
    role: "Property Manager · Washington, DC",
    tone: "accent"
  }, {
    quote: "Two weeks from first walkthrough to launch day, and they brought pastries the morning we went live. That's the kind of partner you keep around.",
    name: "Hannah Levin",
    role: "Property Manager · Washington, DC",
    tone: "warm"
  }, {
    quote: "I budgeted for a Keurig refresh and ended up with a four-tap system that pays for itself in tour conversions. Easiest pitch I've made to ownership in years.",
    name: "Ray Patel",
    role: "Property Manager · Washington, DC",
    tone: "deep"
  }];

  // Render the list twice for seamless infinite drift
  const loop = [...reviews, ...reviews];
  return /*#__PURE__*/React.createElement("section", {
    className: "svs-testimonial",
    "data-screen-label": "Testimonial"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-testimonial-head"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Word of Mouth"), /*#__PURE__*/React.createElement("h2", {
    className: "svs-display-lg"
  }, "From the people who ", /*#__PURE__*/React.createElement("em", null, "run the buildings."))), /*#__PURE__*/React.createElement("div", {
    className: "svs-testimonial-marquee",
    ref: marqueeRef,
    "aria-label": "Resident manager testimonials, scrolling. Drag to scrub."
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-testimonial-track",
    ref: trackRef
  }, loop.map((t, i) => /*#__PURE__*/React.createElement("figure", {
    className: "svs-testimonial-slide",
    key: i,
    "aria-hidden": i >= reviews.length ? "true" : undefined
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-quote-mark",
    "aria-hidden": "true"
  }, "\u201C"), /*#__PURE__*/React.createElement("blockquote", null, t.quote), /*#__PURE__*/React.createElement("figcaption", {
    className: "svs-testimonial-meta"
  }, /*#__PURE__*/React.createElement(Media, {
    alt: t.name,
    tone: t.tone,
    ratio: "1 / 1",
    className: "svs-avatar",
    label: ""
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "svs-testimonial-name"
  }, t.name), /*#__PURE__*/React.createElement("div", {
    className: "svs-testimonial-role"
  }, t.role))))))));
}
function HowItWorks() {
  const steps = [{
    n: "01",
    title: "Walkthrough",
    body: "We visit your property, understand your residents, and design an amenity mix that fits."
  }, {
    n: "02",
    title: "Install",
    body: "White-glove installation in under a day. Finishes tailored to your lobby."
  }, {
    n: "03",
    title: "Launch",
    body: "Resident launch kit — posters, app prompts, opening-day pop-up — included."
  }, {
    n: "04",
    title: "Operate",
    body: "We monitor, restock, and service. You hear from us only with good news."
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "svs-how",
    "data-screen-label": "How It Works"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-how-head"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    num: "05"
  }, "How it works"), /*#__PURE__*/React.createElement("h2", {
    className: "svs-display-md"
  }, "Four steps. Under thirty days.")), /*#__PURE__*/React.createElement("div", {
    className: "svs-how-grid"
  }, steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
    className: "svs-step",
    key: s.n
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-step-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-step-num"
  }, s.n), i < steps.length - 1 && /*#__PURE__*/React.createElement("span", {
    className: "svs-step-line"
  })), /*#__PURE__*/React.createElement("h3", {
    className: "svs-step-title"
  }, s.title), /*#__PURE__*/React.createElement("p", {
    className: "svs-step-body"
  }, s.body))))));
}
Object.assign(window, {
  ServicesGrid,
  ProofStrip,
  Testimonial,
  HowItWorks,
  SERVICES
});

// ===== src/how_it_works.jsx =====
// HOW IT WORKS — six steps for the Draft Beverages page.
// Recreated natively from the source illustration (header + step grid + benefits bar).

const HIW_STEPS = [{
  n: "01",
  img: "assets/hiw-step1.png",
  alt: "Technician delivering and installing a draft beverage tap unit",
  caption: /*#__PURE__*/React.createElement(React.Fragment, null, "We deliver and install a sleek, automated tap at ", /*#__PURE__*/React.createElement("b", null, "no cost to you"), ".")
}, {
  n: "02",
  img: "assets/hiw-step2.png",
  alt: "Service technician cleaning and refilling the draft tap",
  caption: /*#__PURE__*/React.createElement(React.Fragment, null, "We handle all refills, cleaning and maintenance. ", /*#__PURE__*/React.createElement("b", null, "You don't lift a finger."))
}, {
  n: "03",
  img: "assets/hiw-step3.png",
  alt: "Guests pouring premium cold brew from a self-serve tap",
  caption: /*#__PURE__*/React.createElement(React.Fragment, null, "Guests ", /*#__PURE__*/React.createElement("b", null, "tap to pay and pour"), " \u2014 premium cold brew, ready 24/7.")
}, {
  n: "04",
  img: "assets/hiw-step4.png",
  alt: "A Happy Hour event with discounted pours under string lights",
  caption: /*#__PURE__*/React.createElement(React.Fragment, null, "Offer ", /*#__PURE__*/React.createElement("b", null, "free pours"), " during events or hours ", /*#__PURE__*/React.createElement("b", null, "you choose"), " \u2014 we bill you at a discount.")
}, {
  n: "05",
  img: "assets/hiw-step5.png",
  alt: "Dashboard showing real-time pour and refill data",
  caption: /*#__PURE__*/React.createElement(React.Fragment, null, "We ", /*#__PURE__*/React.createElement("b", null, "track usage"), " and refill levels in real-time so you don't have to.")
}, {
  n: "06",
  img: "assets/hiw-step6.png",
  alt: "Happy guests thanking the host for a premium beverage experience",
  caption: /*#__PURE__*/React.createElement(React.Fragment, null, "People love it. You look like a ", /*#__PURE__*/React.createElement("b", null, "hero"), ". It's that simple.")
}];
const HIW_BENEFITS = [{
  icon: "shield",
  label: "No upfront cost"
}, {
  icon: "wrench",
  label: "We handle everything"
}, {
  icon: "clock",
  label: "Always stocked"
}, {
  icon: "star",
  label: "Guests love it"
}, {
  icon: "trend",
  label: "You get the credit"
}];
function HiwBenefitIcon({
  kind
}) {
  const s = {
    width: 22,
    height: 22,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };
  switch (kind) {
    case "shield":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("path", {
        d: "M12 3 4 6v6c0 4.5 3.4 7.8 8 9 4.6-1.2 8-4.5 8-9V6l-8-3z"
      }));
    case "wrench":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("path", {
        d: "m6 18 4-4M16 4l4 4-6 6-4-4 6-6zM4 20l5-5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m4 20 1.5 1.5"
      }));
    case "clock":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "9"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 7v5l3 2"
      }));
    case "star":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("path", {
        d: "m12 3 2.7 5.7L21 9.6l-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.3-.9L12 3z"
      }));
    case "trend":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("path", {
        d: "M3 17 10 10l4 4 7-7"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M14 7h7v7"
      }));
    default:
      return null;
  }
}
function PulseSpotlight() {
  return /*#__PURE__*/React.createElement("section", {
    className: "svs-pulse",
    "data-screen-label": "Pulse System",
    "aria-labelledby": "svs-pulse-title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-pulse-glow",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-pulse-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-pulse-copy"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-pulse-badge"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-pulse-badge-dot",
    "aria-hidden": "true"
  }), "Just launched \xB7 The Pulse System"), /*#__PURE__*/React.createElement("h2", {
    id: "svs-pulse-title",
    className: "svs-pulse-title"
  }, "Meet ", /*#__PURE__*/React.createElement("em", null, "Pulse"), " \u2014 our newest draft technology."), /*#__PURE__*/React.createElement("p", {
    className: "svs-pulse-lede"
  }, "Pulse is the ", /*#__PURE__*/React.createElement("b", null, "latest beverage technology we've brought to the public"), " \u2014 a ground-up redesign of the draft platform. It pours an ", /*#__PURE__*/React.createElement("b", null, "expanded lineup of new drinks"), " and delivers major gains in ", /*#__PURE__*/React.createElement("b", null, "reliability and consistency"), ", so every cup is the same great pour for residents and employees, all day, every day."), /*#__PURE__*/React.createElement("ul", {
    className: "svs-pulse-points"
  }, /*#__PURE__*/React.createElement("li", {
    className: "svs-pulse-point"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-pulse-point-k"
  }, "New"), /*#__PURE__*/React.createElement("span", {
    className: "svs-pulse-point-l"
  }, "A broader menu of craft drinks on tap")), /*#__PURE__*/React.createElement("li", {
    className: "svs-pulse-point"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-pulse-point-k"
  }, "Reliable"), /*#__PURE__*/React.createElement("span", {
    className: "svs-pulse-point-l"
  }, "Smarter hardware means far less downtime")), /*#__PURE__*/React.createElement("li", {
    className: "svs-pulse-point"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-pulse-point-k"
  }, "Consistent"), /*#__PURE__*/React.createElement("span", {
    className: "svs-pulse-point-l"
  }, "The same dialed-in pour, cup after cup"))), /*#__PURE__*/React.createElement("div", {
    className: "svs-pulse-cta"
  }, /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/contact"),
    className: "svs-btn svs-btn--accent svs-btn--lg"
  }, "Schedule a Walkthrough", /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8h10m-4-4 4 4-4 4",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "svs-pulse-visual"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-pulse-chip",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "14",
    height: "14",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M13 2 3 14h7l-1 8 10-12h-7l1-8z"
  })), "Now available"), /*#__PURE__*/React.createElement("figure", {
    className: "svs-pulse-hero"
  }, /*#__PURE__*/React.createElement("img", {
    src: resolveAssetSrc("assets/pulse-lifestyle.webp"),
    alt: "The Pulse draft beverage system installed on a residence kitchen counter, pouring Latte, Nitro Cold Brew, and Refresher on tap",
    loading: "lazy"
  })), /*#__PURE__*/React.createElement("figure", {
    className: "svs-pulse-accent svs-pulse-accent--taps svs-parallax-pulse",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("img", {
    src: resolveAssetSrc("assets/pulse-taps.webp"),
    alt: "",
    loading: "lazy"
  })), /*#__PURE__*/React.createElement("figure", {
    className: "svs-pulse-accent svs-pulse-accent--side svs-parallax-pulse",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("img", {
    src: resolveAssetSrc("assets/pulse-side.webp"),
    alt: "",
    loading: "lazy"
  }))))));
}
Object.assign(window, {
  PulseSpotlight
});
function DraftHowItWorks({
  serviceName = "Draft Beverages"
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "svs-hiw",
    "aria-labelledby": "svs-hiw-title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement("header", {
    className: "svs-hiw-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-hiw-headline"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    num: "B"
  }, "How it works"), /*#__PURE__*/React.createElement("h2", {
    id: "svs-hiw-title",
    className: "svs-hiw-title"
  }, "Six steps. ", /*#__PURE__*/React.createElement("em", null, "From install to hero."))), /*#__PURE__*/React.createElement("div", {
    className: "svs-hiw-lede"
  }, /*#__PURE__*/React.createElement("p", null, "We make it ", /*#__PURE__*/React.createElement("b", null, "ridiculously easy"), " to bring draft beverages to your property. Here's what to expect.")), /*#__PURE__*/React.createElement("aside", {
    className: "svs-hiw-tag",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "22",
    height: "22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"
  })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Premium cold brew."), /*#__PURE__*/React.createElement("br", null), "Made simple."))), /*#__PURE__*/React.createElement("ol", {
    className: "svs-hiw-steps",
    "aria-label": "Six steps from install to hero"
  }, HIW_STEPS.map(step => /*#__PURE__*/React.createElement("li", {
    key: step.n,
    className: "svs-hiw-step"
  }, /*#__PURE__*/React.createElement("figure", {
    className: "svs-hiw-step-photo"
  }, /*#__PURE__*/React.createElement("img", {
    src: resolveAssetSrc(step.img),
    alt: step.alt,
    loading: "lazy"
  }), /*#__PURE__*/React.createElement("span", {
    className: "svs-hiw-step-num",
    "aria-hidden": "true"
  }, step.n)), /*#__PURE__*/React.createElement("p", {
    className: "svs-hiw-step-caption"
  }, step.caption)))), /*#__PURE__*/React.createElement("div", {
    className: "svs-hiw-benefits",
    role: "list"
  }, HIW_BENEFITS.map(b => /*#__PURE__*/React.createElement("div", {
    key: b.label,
    role: "listitem",
    className: "svs-hiw-benefit"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-hiw-benefit-icon",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement(HiwBenefitIcon, {
    kind: b.icon
  })), /*#__PURE__*/React.createElement("span", {
    className: "svs-hiw-benefit-label"
  }, b.label))))));
}
Object.assign(window, {
  DraftHowItWorks
});

// ===== src/meet_beverages.jsx =====
// Six tap handles, one per category. Click a handle, see a breakdown of all
// the flavors in that category. Handles are styled after a real coffee-bar
// tap rail (square sign on top + vertical rotated text + chrome faucet).

const TR_DRINKS = [
// ---- Iced Coffee ---------------------------------------------------------
{
  id: "nitro",
  name: "Nitro Cold Brew",
  group: "Iced Coffee",
  color: "#1A130D",
  accent: "#7A4F1A",
  available: true,
  isNew: false,
  soon: false,
  description: "Eighteen-hour cold extraction, charged with nitrogen for a cascading, Guinness-like pour and naturally creamy mouthfeel.",
  serve: "Iced · 38°F",
  caffeine: "High",
  body: "Velvety",
  brew: "Nitro · cold-extracted 18h",
  pairings: ["Almond croissant", "Chocolate babka", "Pre-meeting clarity"]
}, {
  id: "cold-brew",
  name: "Smooth Cold Brew",
  group: "Iced Coffee",
  color: "#1A130D",
  accent: "#5C3823",
  available: true,
  isNew: false,
  soon: false,
  description: "The cold-brew classic — low-acid, no bitter edges, served straight over ice.",
  serve: "Iced · 38°F",
  caffeine: "High",
  body: "Smooth",
  brew: "Slow-steep · 18h",
  pairings: ["Banana bread", "Granola bar", "Hot afternoons"]
}, {
  id: "oat-latte",
  name: "Caramel Macchiato Latte",
  group: "Iced Coffee",
  color: "#5E3A1F",
  accent: "#E0B58C",
  available: true,
  isNew: true,
  soon: false,
  description: "Cold Brew pulled into cold caramel syrup. Creamy, naturally sweet, never watery.",
  serve: "Iced · 38°F",
  caffeine: "Medium-high",
  body: "Creamy",
  brew: "Oat milk · double espresso",
  pairings: ["Avocado toast", "Blueberry muffin", "Sunny commutes"]
}, {
  id: "mocha",
  name: "Iced Mocha",
  group: "Iced Coffee",
  color: "#3D1F18",
  accent: "#A56241",
  available: true,
  isNew: false,
  soon: false,
  description: "Single-origin chocolate syrup, double espresso, cold milk. Dessert energy with espresso bones.",
  serve: "Iced · 38°F",
  caffeine: "Medium-high",
  body: "Rich",
  brew: "Cocoa · espresso · milk",
  pairings: ["Chocolate chip cookie", "Birthday treats", "Slow Saturdays"]
}, {
  id: "vanilla-latte",
  name: "Iced Vanilla Latte",
  group: "Iced Coffee",
  color: "#5E3A1F",
  accent: "#F4D2B0",
  available: true,
  isNew: false,
  soon: false,
  description: "Madagascar vanilla, cold brew, cold milk. The crowd-pleaser that's actually well-built.",
  serve: "Iced · 38°F",
  caffeine: "Medium-high",
  body: "Creamy",
  brew: "Vanilla · espresso · milk",
  pairings: ["Berry scone", "Shortbread", "Slow Saturdays"]
},
// ---- Hot Coffee — LIVE --------------------------------------------------
{
  id: "drip-coffee",
  name: "Drip Coffee",
  group: "Hot Coffee",
  color: "#1A130D",
  accent: "#7A4F1A",
  available: true,
  isNew: true,
  soon: false,
  description: "Single-origin DMV-roasted beans, brewed to a clean medium body. The everyday cup, available 24/7.",
  serve: "Hot · 165°F",
  caffeine: "Medium-high",
  body: "Balanced",
  brew: "Local roaster · medium roast",
  pairings: ["Buttered toast", "Bagels", "Monday mornings"]
}, {
  id: "hot-latte",
  name: "Hot Latte",
  group: "Hot Coffee",
  color: "#5E3A1F",
  accent: "#E0B58C",
  available: true,
  isNew: true,
  soon: false,
  description: "A double shot of espresso pulled into steamed oat milk. Three-second pour, café-grade body.",
  serve: "Hot · 158°F",
  caffeine: "Medium-high",
  body: "Creamy",
  brew: "Oat milk · double espresso",
  pairings: ["Croissant", "Banana bread", "First-meeting prep"]
}, {
  id: "cappuccino",
  name: "Cappuccino",
  group: "Hot Coffee",
  color: "#3F2818",
  accent: "#C9B391",
  available: true,
  isNew: true,
  soon: false,
  description: "Equal espresso, steamed milk, and a stiff microfoam crown. The Italian classic, no compromises.",
  serve: "Hot · 158°F",
  caffeine: "Medium-high",
  body: "Frothy",
  brew: "Microfoam · double espresso",
  pairings: ["Almond biscotti", "Espresso shortbread", "Aperol-amber afternoon"]
}, {
  id: "americano",
  name: "Americano",
  group: "Hot Coffee",
  color: "#1A130D",
  accent: "#3D2310",
  available: true,
  isNew: true,
  soon: false,
  description: "Hot water and a long-pulled double shot of espresso. The clean, crema-forward cup the bean speaks for.",
  serve: "Hot · 168°F",
  caffeine: "High",
  body: "Clean",
  brew: "Hot water · double espresso",
  pairings: ["Dark chocolate", "Almond biscotti", "A blank notebook"]
},
// ---- Kombucha ----------------------------------------------------------
{
  id: "ginger-kombucha",
  name: "Mango Peach",
  group: "Kombucha",
  color: "#3F5A2E",
  accent: "#F4A93A",
  available: true,
  isNew: false,
  soon: false,
  description: "Fresh-pressed mango, lightly fermented. Bright, peppery, settles the stomach.",
  serve: "Iced · 40°F",
  caffeine: "Low",
  body: "Crisp",
  brew: "Locally fermented · 14 days",
  pairings: ["Sushi", "Spicy noodles", "Post-lunch reset"]
}, {
  id: "berry-kombucha",
  name: "Passion Fruit",
  group: "Kombucha",
  color: "#5C2A45",
  accent: "#C73E6F",
  available: true,
  isNew: false,
  soon: false,
  description: "Passion Fruit on a clean kombucha base. Tart, jammy, naturally fizzy.",
  serve: "Iced · 40°F",
  caffeine: "Low",
  body: "Tart",
  brew: "Mixed berries · 14 days",
  pairings: ["Yogurt parfait", "Lemon bars", "Afternoon energy"]
}, {
  id: "citrus-kombucha",
  name: "Strawberry Lavender",
  group: "Kombucha",
  color: "#7B6E1A",
  accent: "#FCD37A",
  available: true,
  isNew: true,
  soon: false,
  description: "Strawberry and a whisper of lavender. Bright, dry, breakfast-friendly.",
  serve: "Iced · 40°F",
  caffeine: "Low",
  body: "Effervescent",
  brew: "Citrus blend · 14 days",
  pairings: ["Avocado toast", "Smoked salmon bagel", "Sunday brunch"]
}, {
  id: "original-kombucha",
  name: "Ginger",
  group: "Kombucha",
  color: "#7A6E2E",
  accent: "#D4C284",
  available: true,
  isNew: false,
  soon: false,
  description: "Your classic ginger kombucha — the way it's supposed to taste. Slightly tart, lightly sweet, very alive.",
  serve: "Iced · 40°F",
  caffeine: "Low",
  body: "Clean",
  brew: "Black tea · 14 days",
  pairings: ["Anything", "Everything", "Daily ritual"]
},
// ---- Refreshers --------------------------------------------------------
{
  id: "strawberry-refresher",
  name: "Coral Splash",
  group: "Refreshers",
  color: "#9C2A3E",
  accent: "#F58A9F",
  available: true,
  isNew: false,
  soon: false,
  description: "Real strawberry purée, lychee, fresh lemon, sparkling water. No high-fructose anything.",
  serve: "Iced · 38°F",
  caffeine: "Medium",
  body: "Bright",
  brew: "Real fruit · sparkling",
  pairings: ["Pool deck", "Caprese salad", "Outdoor lunches"]
}, {
  id: "peach-mango",
  name: "Paradise Splash",
  group: "Refreshers",
  color: "#C56A1F",
  accent: "#F4A93A",
  available: true,
  isNew: true,
  soon: false,
  description: "Tree-ripe mango and dragonfruit, gently sparkling. Zero artificial sweeteners.",
  serve: "Iced · 38°F",
  caffeine: "Medium",
  body: "Fruity",
  brew: "Real fruit · sparkling",
  pairings: ["Yogurt bowl", "Banh mi", "Workout-day hydration"]
}, {
  id: "watermelon-mint",
  name: "Sunshine Splash",
  group: "Refreshers",
  color: "#A8324F",
  accent: "#F4A0A6",
  available: true,
  isNew: false,
  soon: false,
  description: "Cold-pressed passionfruit with a snap of fresh pineapple. Hydrating, clean, faintly sweet.",
  serve: "Iced · 38°F",
  caffeine: "Medium",
  body: "Crisp",
  brew: "Real fruit · sparkling",
  pairings: ["Feta salad", "Beach reads", "Friday afternoons"]
}, {
  id: "cucumber-lime",
  name: "Cucumber Lime",
  group: "Refreshers",
  color: "#5A8A4F",
  accent: "#A8D58A",
  available: true,
  isNew: false,
  soon: false,
  description: "Cucumber, lime, a touch of basil. The most adult thing on the rail — almost a cocktail mixer.",
  serve: "Iced · 38°F",
  caffeine: "Medium",
  body: "Crisp",
  brew: "Real fruit · sparkling",
  pairings: ["Cheese plate", "Lemon-poppyseed cake", "After-work wind-down"]
},
// ---- Iced Tea ----------------------------------------------------------
{
  id: "black-tea",
  name: "Black Tea",
  group: "Iced Tea",
  color: "#5C3818",
  accent: "#C9956A",
  available: true,
  isNew: false,
  soon: false,
  description: "Whole-leaf Assam, cold-steeped twelve hours. Smooth, malty, naturally sweet — no syrup needed.",
  serve: "Iced · 40°F",
  caffeine: "Medium",
  body: "Smooth",
  brew: "Whole-leaf · cold steep 12h",
  pairings: ["Shortbread", "Cucumber sandwiches", "Long reads"]
}, {
  id: "green-tea",
  name: "Green Tea",
  group: "Iced Tea",
  color: "#6B7A2A",
  accent: "#C5D58A",
  available: true,
  isNew: false,
  soon: false,
  description: "Cold-steeped sencha. Vegetal, faintly sweet, never bitter — the way iced green tea should taste.",
  serve: "Iced · 40°F",
  caffeine: "Low-medium",
  body: "Light",
  brew: "Sencha · cold steep 12h",
  pairings: ["Sushi", "Edamame", "Afternoon focus"]
}, {
  id: "hibiscus",
  name: "Hibiscus",
  group: "Iced Tea",
  color: "#9C2A3E",
  accent: "#E04A60",
  available: true,
  isNew: true,
  soon: false,
  description: "Pure hibiscus, no caffeine. Tart, ruby-red, naturally bright — like cranberry's better cousin.",
  serve: "Iced · 40°F",
  caffeine: "None",
  body: "Tart",
  brew: "Hibiscus · cold steep 12h",
  pairings: ["Tres leches", "Tacos al pastor", "Hot afternoons"]
}, {
  id: "earl-grey",
  name: "Earl Grey",
  group: "Iced Tea",
  color: "#3D2818",
  accent: "#9C7E5A",
  available: true,
  isNew: false,
  soon: false,
  description: "Bergamot-forward black tea, cold-steeped to keep the citrus oil bright. The sophisticate's pick.",
  serve: "Iced · 40°F",
  caffeine: "Medium",
  body: "Aromatic",
  brew: "Bergamot · cold steep 12h",
  pairings: ["Lavender shortbread", "Lemon tart", "Quiet afternoons"]
},
// ---- Energy — coming soon ---------------------------------------------
{
  id: "citrus-surge",
  name: "Citrus Surge",
  group: "Energy",
  color: "#A02418",
  accent: "#FFE54A",
  available: false,
  isNew: false,
  soon: true,
  description: "Grapefruit, lemon, B-vitamins, and clean caffeine from green tea. Pilot launches with the spring keg drop.",
  serve: "Iced · 38°F",
  caffeine: "High",
  body: "Bright",
  brew: "Adaptogens · clean caffeine",
  pairings: ["Pre-workout", "Long meetings", "Deadline days"]
}, {
  id: "berry-boost",
  name: "Berry Boost",
  group: "Energy",
  color: "#7A0E08",
  accent: "#F58A9F",
  available: false,
  isNew: false,
  soon: true,
  description: "Black raspberry, acai, B-vitamins. Tart, deep, with a measured caffeine punch — no jitter, no crash.",
  serve: "Iced · 38°F",
  caffeine: "High",
  body: "Deep",
  brew: "Adaptogens · clean caffeine",
  pairings: ["Trail runs", "Afternoon slumps", "Long drives"]
}, {
  id: "tropical-power",
  name: "Tropical Power",
  group: "Energy",
  color: "#C56A1F",
  accent: "#FCD37A",
  available: false,
  isNew: false,
  soon: true,
  description: "Pineapple, passionfruit, and a touch of coconut water. Hydrating energy, vacation vibes, 2pm kick.",
  serve: "Iced · 38°F",
  caffeine: "Medium-high",
  body: "Tropical",
  brew: "Adaptogens · clean caffeine",
  pairings: ["Pickleball", "Outdoor lunch", "Friday afternoons"]
}];
const TR_CATEGORIES = [{
  id: "iced-coffee",
  group: "Iced Coffee",
  label: "Cold Brew",
  sub: "Iced",
  sign: "Iced Coffee",
  tagline: "Nitro, oat-milk, and slow-steeped cold brew on tap.",
  description: "Eighteen-hour cold extraction, poured smooth. Our flagship category — the reason residents stop in the lobby on the way to work.",
  handleBg: "#0E0A07",
  handleFg: "#F4F1EA",
  subBg: null,
  signBg: "#F4F1EA",
  signFg: "#1A130D",
  accent: "#C9A865"
}, {
  id: "kombucha",
  group: "Kombucha",
  label: "Kombucha",
  sub: "Live",
  sign: "Kombucha",
  tagline: "Live-cultured, low-sugar, properly fizzy.",
  description: "Locally fermented, rotated weekly. Naturally lower in sugar than the bottled stuff and far more alive.",
  handleBg: "#3F5A2E",
  handleFg: "#F0E8C8",
  subBg: "#2A3D1F",
  signBg: "#F4D2B0",
  signFg: "#3F5A2E",
  accent: "#9CC15F"
}, {
  id: "refreshers",
  group: "Refreshers",
  label: "Refresher",
  sub: "Sparkling",
  sign: "Refreshers",
  tagline: "Fizzy, fruit-forward, never a sugar bomb.",
  description: "Real-fruit purées meet sparkling water on tap. Zero artificial sweeteners, no high-fructose anything.",
  handleBg: "#1F6E82",
  handleFg: "#F4F1EA",
  subBg: "#0F4655",
  signBg: "#E03A2A",
  signFg: "#FFFFFF",
  accent: "#F4D2B0"
}, {
  id: "iced-tea",
  group: "Iced Tea",
  label: "Iced Tea",
  sub: "Cold Steep",
  sign: "Iced Tea",
  tagline: "Cold-steeped, lightly sweet, never bitter.",
  description: "Whole-leaf teas steeped over twelve hours in cold water. Smoother body, lower tannins, naturally sweet.",
  handleBg: "#8A5320",
  handleFg: "#FFF6E0",
  subBg: "#5C3818",
  signBg: "#1A130D",
  signFg: "#F0DEA4",
  accent: "#F4D2B0"
}, {
  id: "energy",
  group: "Energy",
  label: "Energy",
  sub: "Coming Soon",
  sign: "Energy",
  tagline: "Caffeine, B-vitamins, real fruit. No crash.",
  description: "Functional energy formulated with adaptogens and clean caffeine. Pilot launches with the spring keg drop.",
  handleBg: "#A02418",
  handleFg: "#FFE54A",
  subBg: "#7A0E08",
  signBg: "#FFE54A",
  signFg: "#A02418",
  accent: "#FFE54A",
  soon: true
}];

// ----- Single tap handle ----------------------------------------------------
function TapHandle({
  cat,
  isActive,
  onClick,
  idx
}) {
  const tilt = (idx * 1.7 % 3 - 1.5).toFixed(2); // -1.5° .. 1.5° resting tilt
  const styleVars = {
    "--tilt": `${tilt}deg`,
    "--ring": cat.accent,
    "--handle-bg": cat.handleBg,
    "--handle-fg": cat.handleFg,
    "--sub-bg": cat.subBg || cat.handleBg,
    "--sign-bg": cat.signBg,
    "--sign-fg": cat.signFg
  };
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "radio",
    "aria-checked": isActive,
    className: "svs-tap" + (isActive ? " is-active" : "") + (cat.soon ? " is-soon" : ""),
    style: styleVars,
    onClick: onClick,
    "aria-label": `${cat.label} — ${cat.tagline}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-tap-handle",
    "aria-hidden": "true"
  }, cat.soon && /*#__PURE__*/React.createElement("span", {
    className: "svs-tap-soon"
  }, "Soon"), /*#__PURE__*/React.createElement("span", {
    className: "svs-tap-sign"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-tap-sign-text"
  }, cat.sign)), /*#__PURE__*/React.createElement("span", {
    className: "svs-tap-bracket"
  }), /*#__PURE__*/React.createElement("span", {
    className: "svs-tap-body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-tap-body-label"
  }, cat.label))), /*#__PURE__*/React.createElement("span", {
    className: "svs-tap-faucet",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-tap-faucet-collar"
  }), /*#__PURE__*/React.createElement("span", {
    className: "svs-tap-faucet-body"
  }), /*#__PURE__*/React.createElement("span", {
    className: "svs-tap-faucet-spout"
  })));
}

// ----- Category detail panel — slides in next to the active handle ---------
function CategoryDetail({
  cat,
  drinks,
  onClose
}) {
  if (!cat) return null;
  const live = drinks.filter(d => !d.soon);
  return /*#__PURE__*/React.createElement("aside", {
    className: "svs-tap-detail",
    key: cat.id,
    role: "region",
    "aria-label": `Flavors in ${cat.label}`,
    style: {
      "--detail-accent": cat.accent
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "svs-tap-detail-close",
    onClick: onClose,
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 2l10 10M12 2L2 12",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }))), /*#__PURE__*/React.createElement("header", {
    className: "svs-tap-detail-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-tap-detail-head-text"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-tap-detail-eyebrow",
    style: {
      color: cat.accent
    }
  }, "Category"), /*#__PURE__*/React.createElement("h3", {
    className: "svs-tap-detail-name"
  }, cat.group), /*#__PURE__*/React.createElement("p", {
    className: "svs-tap-detail-blurb"
  }, cat.description)), /*#__PURE__*/React.createElement("div", {
    className: "svs-tap-detail-counter",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-tap-detail-counter-num"
  }, drinks.length), /*#__PURE__*/React.createElement("span", {
    className: "svs-tap-detail-counter-lbl"
  }, drinks.length === 1 ? "flavor" : "flavors", cat.soon ? " · soon" : ""))), /*#__PURE__*/React.createElement("ul", {
    className: "svs-tap-detail-grid"
  }, drinks.map(d => /*#__PURE__*/React.createElement("li", {
    key: d.id,
    className: "svs-flavor" + (d.soon ? " is-soon" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-flavor-bar",
    style: {
      background: `linear-gradient(180deg, ${d.accent} 0%, ${d.color} 100%)`
    },
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "svs-flavor-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-flavor-head"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "svs-flavor-name"
  }, d.name), d.soon ? /*#__PURE__*/React.createElement("span", {
    className: "svs-flavor-pill svs-flavor-pill--soon"
  }, "Soon") : d.isNew ? /*#__PURE__*/React.createElement("span", {
    className: "svs-flavor-pill svs-flavor-pill--new"
  }, "New") : /*#__PURE__*/React.createElement("span", {
    className: "svs-flavor-pill svs-flavor-pill--live"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-flavor-dot"
  }), "On tap")), /*#__PURE__*/React.createElement("p", {
    className: "svs-flavor-desc"
  }, d.description), /*#__PURE__*/React.createElement("dl", {
    className: "svs-flavor-specs"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Serve"), /*#__PURE__*/React.createElement("dd", null, d.serve)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Caffeine"), /*#__PURE__*/React.createElement("dd", null, d.caffeine)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Body"), /*#__PURE__*/React.createElement("dd", null, d.body))), d.pairings && d.pairings.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "svs-flavor-pairs"
  }, /*#__PURE__*/React.createElement("span", null, "Pairs with"), /*#__PURE__*/React.createElement("ul", null, d.pairings.slice(0, 3).map(p => /*#__PURE__*/React.createElement("li", {
    key: p
  }, p)))))))));
}

// ----- Main component ------------------------------------------------------
function MeetYourBeverages() {
  const [activeId, setActiveId] = React.useState("iced-coffee");
  const active = TR_CATEGORIES.find(c => c.id === activeId);
  const drinks = active ? TR_DRINKS.filter(d => d.group === active.group) : [];
  return /*#__PURE__*/React.createElement("section", {
    className: "svs-tapbar",
    "aria-labelledby": "svs-tapbar-title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-tapbar-wall",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-tapbar-wall-grain"
  }), /*#__PURE__*/React.createElement("div", {
    className: "svs-tapbar-wall-vignette"
  })), /*#__PURE__*/React.createElement("div", {
    className: "svs-container svs-tapbar-inner"
  }, /*#__PURE__*/React.createElement("header", {
    className: "svs-tapbar-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    num: "A"
  }, "Meet your beverages"), /*#__PURE__*/React.createElement("h2", {
    id: "svs-tapbar-title",
    className: "svs-display-md svs-tapbar-title"
  }, "Five taps. ", /*#__PURE__*/React.createElement("em", null, "Every category.")), /*#__PURE__*/React.createElement("p", {
    className: "svs-tapbar-lede"
  }, "Pull a handle to see what's pouring underneath. We rotate flavors monthly \u2014 these are the families that always have a tap.")), /*#__PURE__*/React.createElement("div", {
    className: "svs-tapbar-counter",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-tapbar-counter-num"
  }, TR_CATEGORIES.length), /*#__PURE__*/React.createElement("span", {
    className: "svs-tapbar-counter-lbl"
  }, "categories"))), /*#__PURE__*/React.createElement("div", {
    className: "svs-tapbar-stage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-tapbar-rail",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-tapbar-rail-shine"
  })), /*#__PURE__*/React.createElement("div", {
    className: "svs-tapbar-row",
    role: "radiogroup",
    "aria-label": "Beverage categories"
  }, TR_CATEGORIES.map((cat, idx) => /*#__PURE__*/React.createElement(TapHandle, {
    key: cat.id,
    cat: cat,
    idx: idx,
    isActive: cat.id === activeId,
    onClick: () => setActiveId(cat.id)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "svs-tapbar-tray",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-tapbar-tray-grate"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "svs-tapbar-detail-wrap"
  }, /*#__PURE__*/React.createElement(CategoryDetail, {
    cat: active,
    drinks: drinks,
    onClose: () => setActiveId(null)
  }))));
}
Object.assign(window, {
  MeetYourBeverages
});

// ===== src/draft_hero.jsx =====
// Draft Beverages — looping pour video as the hero. Scroll-zooms into the
// glass so the next section reads like a continuous push-in.

function DraftAnimatedHero() {
  const rawSrc = resolveAssetSrc("assets/draft-hero.mp4");
  const [src, setSrc] = React.useState(rawSrc);
  const videoRef = React.useRef(null);

  // The preview server's query string (?srcmap=1&t=...) confuses some
  // ranged video requests — it can return source-map JSON instead of
  // binary, which triggers MEDIA_ERR_SRC_NOT_SUPPORTED. Fetch the file
  // ourselves and hand the <video> a blob URL instead.
  React.useEffect(() => {
    let cancelled = false;
    let blobUrl = null;
    fetch(rawSrc).then(r => r.ok ? r.blob() : Promise.reject(new Error("fetch failed " + r.status))).then(b => {
      if (cancelled) return;
      // Force the right MIME — some servers strip it on the redirect.
      const typed = b.type && b.type.startsWith("video/") ? b : new Blob([b], {
        type: "video/mp4"
      });
      blobUrl = URL.createObjectURL(typed);
      setSrc(blobUrl);
    }).catch(() => {/* fall back to rawSrc — already set */});
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [rawSrc]);

  // Force-load and force-play. React's autoPlay can race the network state.
  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.load();
    } catch (_) {}
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    tryPlay();
    v.addEventListener("loadeddata", tryPlay);
    v.addEventListener("canplay", tryPlay);
    return () => {
      v.removeEventListener("loadeddata", tryPlay);
      v.removeEventListener("canplay", tryPlay);
    };
  }, [src]);
  return /*#__PURE__*/React.createElement("div", {
    className: "svs-draft-hero",
    "aria-label": "Looping video \u2014 a draft beverage pouring into a glass"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-draft-hero-stage"
  }, /*#__PURE__*/React.createElement("video", {
    ref: videoRef,
    className: "svs-draft-hero-video",
    src: src,
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    preload: "auto",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "svs-draft-hero-vignette",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("span", {
    className: "svs-draft-hero-caption"
  }, "OUR DRAFT LATTE \xB7 CREAMY AND DELICIOUS"));
}
Object.assign(window, {
  DraftAnimatedHero
});

// ===== src/draft_bg.jsx =====
// Draft Beverages — page background animation. Six color-wash phases, one per
// tap category, each with its own family of slowly drifting garnish icons.

const DRAFT_BG_PHASES = [{
  id: "cold",
  color: "#C9A865",
  icon: "bean",
  count: 14
}, {
  id: "hot",
  color: "#8B4A2A",
  icon: "steam",
  count: 12
}, {
  id: "kombucha",
  color: "#6FAA45",
  icon: "bubble",
  count: 18
}, {
  id: "refresher",
  color: "#2A8FA8",
  icon: "citrus",
  count: 14
}, {
  id: "tea",
  color: "#B07A3E",
  icon: "leaf",
  count: 14
}, {
  id: "energy",
  color: "#E84F2A",
  icon: "spark",
  count: 14
}];
function DraftBgIcon({
  kind
}) {
  switch (kind) {
    case "bean":
      return /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "currentColor",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("g", {
        transform: "rotate(-22 12 12)"
      }, /*#__PURE__*/React.createElement("ellipse", {
        cx: "12",
        cy: "12",
        rx: "6",
        ry: "9.2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M9 4 Q11 12 9 20",
        stroke: "rgba(0,0,0,0.32)",
        strokeWidth: "1.4",
        fill: "none",
        strokeLinecap: "round"
      })));
    case "steam":
      return /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2.2",
        strokeLinecap: "round",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M8 22 Q4 17 8 13 Q12 9 8 4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M15 22 Q19 17 15 13 Q11 9 15 4"
      }));
    case "bubble":
      return /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "currentColor",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "9",
        opacity: "0.85"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "9",
        cy: "9",
        r: "2.6",
        fill: "rgba(255,255,255,0.55)"
      }));
    case "citrus":
      return /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "10",
        fill: "currentColor",
        opacity: "0.85"
      }), /*#__PURE__*/React.createElement("g", {
        stroke: "rgba(255,255,255,0.55)",
        strokeWidth: "0.9",
        fill: "none"
      }, /*#__PURE__*/React.createElement("line", {
        x1: "12",
        y1: "3",
        x2: "12",
        y2: "21"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "3",
        y1: "12",
        x2: "21",
        y2: "12"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "5.5",
        y1: "5.5",
        x2: "18.5",
        y2: "18.5"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "18.5",
        y1: "5.5",
        x2: "5.5",
        y2: "18.5"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "1.6",
        fill: "rgba(255,255,255,0.5)"
      })));
    case "leaf":
      return /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M3 12 Q12 1 21 12 Q12 23 3 12 Z",
        fill: "currentColor"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M3 12 L21 12",
        stroke: "rgba(0,0,0,0.32)",
        strokeWidth: "1.2",
        fill: "none"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M7 10 Q12 12 17 10 M7 14 Q12 12 17 14",
        stroke: "rgba(0,0,0,0.18)",
        strokeWidth: "0.8",
        fill: "none"
      }));
    case "spark":
      return /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "currentColor",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M12 1.5 L13.4 10.6 L22.5 12 L13.4 13.4 L12 22.5 L10.6 13.4 L1.5 12 L10.6 10.6 Z"
      }));
    default:
      return null;
  }
}
function DraftBgAnimation() {
  const [phase, setPhase] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => {
      setPhase(p => (p + 1) % DRAFT_BG_PHASES.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);
  const current = DRAFT_BG_PHASES[phase];
  return /*#__PURE__*/React.createElement("div", {
    className: "svs-draft-bg",
    "aria-hidden": "true",
    style: {
      "--wash": current.color
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-draft-bg-wash"
  }), /*#__PURE__*/React.createElement("div", {
    className: "svs-draft-bg-vignette"
  }), DRAFT_BG_PHASES.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: "svs-draft-bg-phase" + (i === phase ? " is-active" : "")
  }, Array.from({
    length: p.count
  }).map((_, n) => {
    // Deterministic pseudo-random placement & timing per phase+index
    const seed = (n * 37 + p.id.charCodeAt(0) * 13 + p.id.charCodeAt(1) * 7) % 1000;
    const x = seed * 1.3 % 100;
    const y = seed * 2.1 % 100;
    const dur = 22 + seed % 18;
    const delay = -(seed * 0.31 % 14);
    const size = 22 + seed % 28;
    return /*#__PURE__*/React.createElement("span", {
      key: n,
      className: "svs-draft-bg-garnish",
      style: {
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        color: p.color,
        "--dur": `${dur}s`,
        "--delay": `${delay}s`
      }
    }, /*#__PURE__*/React.createElement(DraftBgIcon, {
      kind: p.icon
    }));
  }))));
}
Object.assign(window, {
  DraftBgAnimation
});

// ===== src/service_page.jsx =====
// Service detail pages — deeper dives for each service
const SERVICE_DETAILS = {
  draft: {
    num: "I",
    name: "Draft Beverages",
    eyebrow: "Service · Flagship",
    tagline: "Four taps. Cafe-grade. Unforgettable.",
    lede: "The draft beverage system is why property managers call us. One installation. Four rotating taps. Cafe-grade beverages on demand, 24/7, no barista required.",
    heroLabel: "Hero · Close-up of nitro cold brew cascading into glass from the draft tap. Warm golden hour light.",
    heroSrc: "assets/draft-hero-v2.jpg",
    hasGallery: true,
    gallery: [{
      src: "assets/draft-gallery-1.jpg",
      ratio: "4 / 5",
      tone: "warm",
      alt: "Installation in a boutique lobby",
      label: "Gallery · Installation in a boutique lobby",
      className: "g1"
    }, {
      src: "assets/draft-gallery-2.jpg",
      ratio: "1 / 1",
      tone: "warm",
      alt: "Residents using the amenity",
      label: "Gallery · Residents using the amenity",
      className: "g2"
    }, {
      src: "assets/draft-gallery-3-v2.jpg",
      ratio: "4 / 3",
      tone: "deep",
      alt: "LOUIS CAFE dual-cabinet install — Nitro Cold Brew & Kombucha with Craft Tea taps",
      label: "Gallery · LOUIS CAFE — dual-cabinet install",
      className: "g3",
      objectPosition: "center 45%"
    }, {
      src: "assets/draft-gallery-pulse.webp",
      ratio: "3 / 4",
      tone: "deep",
      alt: "The Pulse system installed on an Aura Residences kitchen counter, pouring Latte, Nitro Cold Brew, and Refresher on tap",
      label: "Gallery · Pulse — Aura Residences install",
      className: "g5",
      objectPosition: "center 30%"
    }, {
      src: "assets/draft-gallery-kvm.avif",
      ratio: "3 / 2",
      tone: "deep",
      alt: "KVM four-tap draft tower in dramatic studio lighting with Pay-by-the-Ounce touchscreen",
      label: "Gallery · KVM tap tower — Pay by the Ounce",
      className: "g6",
      objectPosition: "center 45%"
    }],
    features: [{
      icon: Icons.sparkle,
      title: "Four rotating taps",
      body: "Nitro cold brew, oat latte, kombucha, electrolyte, matcha, seasonal. Menu rotates quarterly."
    }, {
      icon: Icons.clock,
      title: "Telemetry-monitored",
      body: "Keg levels, CO₂ pressure, and temperature streamed to our ops team. You never run dry."
    }, {
      icon: Icons.palette,
      title: "Custom finishes",
      body: "Brushed steel, oak, matte black, or brass. Your lobby, your aesthetic."
    }, {
      icon: Icons.shield,
      title: "Touchless pour",
      body: "IR-sensor handles keep the experience hygienic by default."
    }],
    specs: [["Footprint", "24″ W × 30″ D × 72″ H"], ["Electrical", "Standard 120V · 15A"], ["Plumbing", "Not required · self-contained"], ["Capacity", "6 × 5-gal kegs"], ["Restock cadence", "Weekly (high-traffic: 2×/wk)"], ["Install window", "Same day"]]
  },
  micromarts: {
    num: "II",
    name: "AI Micro Marts",
    eyebrow: "Service",
    tagline: "Walk in. Grab. Walk out.",
    lede: "A 24/7 convenience store your residents actually use. Computer vision auto-charges on exit — no scanning, no checkout, no staff. We stock it weekly with snacks, essentials, and local favorites.",
    heroLabel: "Hero · Smart fridge, softly lit, resident reaching in at night for a snack.",
    heroSrc: "assets/micromart-hero.jpg",
    gallery: [{
      src: "assets/micromart-gallery-1.jpg",
      ratio: "16 / 9",
      tone: "deep",
      alt: "AI Micro Mart lifestyle install in a modern amenity lounge",
      label: "Gallery · AI Micro Mart — modern amenity install",
      className: "g1"
    }, {
      src: "assets/micromart-gallery-2.jpg",
      ratio: "16 / 9",
      tone: "deep",
      alt: "Triple-bay Micromart smart fridge lineup",
      label: "Gallery · Triple-bay Micromart — snacks, beverages, essentials",
      className: "g2",
      objectPosition: "center 45%"
    }, {
      src: "assets/micromart-gallery-3.jpg",
      ratio: "16 / 9",
      tone: "deep",
      alt: "Three-door SmartMart in a corporate hotel lobby",
      label: "Gallery · SmartMart triple — hotel lobby",
      className: "g3"
    }, {
      src: "assets/micromart-gallery-4.jpg",
      ratio: "16 / 9",
      tone: "warm",
      alt: "Micro mart alongside a café lounge",
      label: "Gallery · Café-adjacent install",
      className: "g4"
    }],
    features: [{
      icon: Icons.fridge,
      title: "Computer vision checkout",
      body: "Open door, take what you want, close door. Charged automatically to the resident's card on file."
    }, {
      icon: Icons.sparkle,
      title: "Local + curated",
      body: "Not the usual gas-station SKUs. Local bakeries, craft sodas, better-for-you snacks."
    }, {
      icon: Icons.clock,
      title: "Restocked weekly",
      body: "Your property manager sees consumption dashboards. Reordering is on us."
    }, {
      icon: Icons.shield,
      title: "Zero shrink",
      body: "Vision + RFID means no missed scans, no theft. You keep 100% of revenue share."
    }],
    specs: [["Footprint", "Single bay: 36″ W · multi-bay configurable"], ["Electrical", "Standard 120V · 15A"], ["Connectivity", "Wi-Fi + LTE backup"], ["SKU count", "120–180 per bay"], ["Restock", "Weekly, on your schedule"], ["Revenue share", "Available — ask us"]]
  },
  coffee: {
    num: "III",
    name: "Hot Coffee",
    eyebrow: "Service",
    tagline: "The classic, done right.",
    lede: "Premium single-serve and bean-to-cup machines for buildings that want morning coffee handled — no fuss, no mess, no running-out. Curated roasters and daily-fresh beans included.",
    heroLabel: "Hero · Bean-to-cup touchscreen machine on a marble counter in a sunlit open office, porcelain cups at left.",
    heroSrc: "assets/coffee-hero.jpg",
    gallery: [{
      src: "assets/coffee-gallery-1.jpg",
      ratio: "4 / 5",
      tone: "warm",
      alt: "Keurig K-2500 single-serve commercial coffee maker with mug",
      label: "Gallery · Keurig K-2500 single-serve",
      className: "g1"
    }, {
      src: "assets/coffee-gallery-2.jpg",
      ratio: "3 / 2",
      tone: "deep",
      alt: "Sip-with-me bean-to-cup machine in a sunlit glass-walled lobby lounge",
      label: "Gallery · Lobby-lounge bean-to-cup install",
      className: "g2"
    }, {
      src: "assets/coffee-gallery-3.jpg",
      ratio: "3 / 2",
      tone: "warm",
      alt: "Buzz Towr bean-to-cup machine on a minimalist office breakroom counter",
      label: "Gallery · Breakroom counter install",
      className: "g3"
    }, {
      src: "assets/coffee-gallery-4.jpg",
      ratio: "3 / 2",
      tone: "warm",
      alt: "Filling a De'Longhi TrueBrew with whole coffee beans",
      label: "Gallery · Filling with fresh whole beans",
      className: "g4"
    }],
    features: [{
      icon: Icons.coffee,
      title: "Bean-to-cup or single-serve",
      body: "Choose the format that fits your lobby traffic. Both are self-cleaning."
    }, {
      icon: Icons.sparkle,
      title: "Local roasters",
      body: "We partner with DMV roasters. You can spotlight a rotating roaster-of-the-month."
    }, {
      icon: Icons.clock,
      title: "Auto-restock",
      body: "Beans, milk, cups — topped up weekly. Nothing ever runs out before 9am."
    }, {
      icon: Icons.shield,
      title: "Self-cleaning",
      body: "Daily auto-rinse. Deep clean weekly by our team. Zero maintenance for your staff."
    }],
    specs: [["Footprint", "18″ W × 22″ D (counter unit)"], ["Electrical", "Standard 120V · 15A"], ["Water", "Plumbed or tank-fed"], ["Drinks", "Americano, Espresso, Latte, Cappuccino, Hot Water"], ["Restock", "Weekly"], ["Install window", "Half day"]]
  },
  events: {
    num: "IV",
    name: "Resident Events",
    eyebrow: "Service",
    tagline: "Amenity + experience.",
    lede: "Cookouts, pasta bars, mixology nights, wellness mornings, seasonal tastings — turnkey programming that turns your building into a community. We plan, staff, and cleanup.\n\nTo book an event, visit our booking portal where we provide all the details and pricing quotes for all of our events!",
    heroLabel: "Hero · Holiday resident buffet — chafing dishes, garlands, and place-card signage in a styled amenity lounge.",
    heroSrc: "assets/service-events.jpg",
    heroObjectPosition: "center 40%",
    gallery: [{
      src: "assets/events-gallery-hot-brunch.jpg",
      ratio: "3 / 2",
      tone: "warm",
      alt: "Hot brunch event setup — chafing dishes of breakfast potatoes, scrambled eggs, sausage, pancakes, and bacon, with glass dispensers of orange and cranberry juice and trays of fresh berries on a black-linen table",
      label: "Gallery · Hot brunch — full chafer service with juice bar",
      caption: "Hot brunch — chafing dishes, juice bar, fresh fruit station",
      className: "gG"
    }, {
      src: "assets/events-gallery-korean-bbq-buffet.jpg",
      ratio: "3 / 2",
      tone: "warm",
      alt: "Catered Korean BBQ buffet — chafing dishes of quesadillas, beef bulgogi, and nacho cheese with chalkboard signage",
      label: "Gallery · Korean BBQ buffet — quesadillas, bulgogi, nacho cheese",
      caption: "Nacho and Quesadilla Bar — chalkboard menu, full chafer service",
      className: "gA"
    }, {
      src: "assets/events-gallery-sundae-cup.jpg",
      ratio: "2 / 3",
      tone: "warm",
      alt: "Resident holding a build-your-own sundae cup loaded with caramel, M&Ms, strawberries, and chocolate sprinkles",
      label: "Gallery · Build-your-own sundae cup, fully loaded",
      caption: "Sundae bar — build-your-own, every topping on the table",
      className: "gB"
    }, {
      src: "assets/events-gallery-halloween-bar.jpg",
      ratio: "3 / 2",
      tone: "deep",
      alt: "Halloween candy apple and dessert bar — bowls of sprinkles, M&Ms, and chocolate chips next to trays of green apples on sticks and a Happy Halloween plate",
      label: "Gallery · Halloween candy apple + topping bar",
      caption: "Halloween night — candy apple bar with full topping spread",
      className: "gC"
    }, {
      src: "assets/events-gallery-hot-chocolate-bar.jpg",
      ratio: "2 / 3",
      tone: "warm",
      alt: "Holiday hot chocolate bar — red linens, Ghirardelli packets, plaid and holly cups, a wood Hot Cocoa block, and a Warm Up at the Hot Chocolate Bar sign",
      label: "Gallery · Holiday hot chocolate bar",
      caption: "Holiday hot chocolate bar — Ghirardelli, custom signage, plaid cups",
      className: "gD"
    }, {
      src: "assets/events-gallery-smores-bar.jpg",
      ratio: "3 / 2",
      tone: "warm",
      alt: "S'mores Bar setup with hanging banner, marshmallows, chocolate squares, graham crackers, and hot cocoa supplies on a black-linen table",
      label: "Gallery · S'mores Bar + Hot Cocoa station",
      caption: "S'mores Bar — full setup, hot cocoa, marshmallows, signage",
      className: "gE"
    }, {
      src: "assets/events-gallery-rooftop-yoga.jpg",
      ratio: "2 / 3",
      tone: "deep",
      alt: "Rooftop yoga class — residents on pastel mats stretching under a pergola with the DC skyline behind them",
      label: "Gallery · Rooftop yoga on a summer morning",
      caption: "Rooftop yoga — Saturday morning class with skyline views",
      className: "gF"
    }, {
      src: "assets/events-gallery-1.jpg",
      ratio: "3 / 2",
      tone: "warm",
      alt: "Catered resident buffet — chafing dishes of pulled pork and roasted vegetables, gingham linens, slider buns",
      label: "Gallery · Catered resident buffet with full service",
      caption: "Resident barbecue lunch — pulled pork buffet with full service",
      className: "g1"
    }, {
      src: "assets/events-gallery-2.jpg",
      ratio: "3 / 2",
      tone: "deep",
      alt: "Build-your-own smoothie bar — fresh fruit, greens, and yogurt cups laid out on a black-linen table by the window",
      label: "Gallery · Build-your-own smoothie bar",
      caption: "Smoothie bar — fresh fruit, greens, and yogurt by the window",
      className: "g2"
    }, {
      src: "assets/events-gallery-3.jpg",
      ratio: "2 / 3",
      tone: "warm",
      alt: "Two residents grinning behind a fully-decorated gingerbread house at a holiday decorating night",
      label: "Gallery · Holiday gingerbread decorating night",
      caption: "Gingerbread night — residents decorating houses together",
      className: "g3"
    }, {
      src: "assets/events-gallery-4.jpg",
      ratio: "2 / 3",
      tone: "deep",
      alt: "Mixology night setup — a long line of premium spirits, bamboo-cradled cocktail shakers, and martini glasses",
      label: "Gallery · Mixology night — full bar with bartender service",
      caption: "Mixology night — full bar with bartender service",
      className: "g4"
    }],
    features: [{
      icon: Icons.event,
      title: "Turnkey programming",
      body: "We bring the bar, the baristas, the linens, the signage. You bring the residents."
    }, {
      icon: Icons.sparkle,
      title: "Themed experiences",
      body: "Summer ade bars, holiday cocoa, espresso tastings, kombucha + mocktail nights."
    }, {
      icon: Icons.palette,
      title: "Branded to your building",
      body: "Signage and menus designed to match your property's brand, not ours."
    }, {
      icon: Icons.clock,
      title: "Under 2 weeks to book",
      body: "Most events scheduled within 10 days. Seasonal programming can be calendared a year out."
    }],
    specs: [["Event types", "Morning · Happy hour · Seasonal · Wellness"], ["Staff", "1–4 baristas/mixologists"], ["Lead time", "10 days standard · rush available"], ["Duration", "2–4 hour standard · flexible"], ["Attendees", "30–300 residents"], ["Add-ons", "DJ, florals, photographer"]],
    heroCta: {
      label: "Book An Event",
      href: "https://simplycateringsolutions.com",
      external: true
    },
    bookingPortal: {
      kicker: "Event booking portal",
      title: "Pick a date. We'll handle the rest.",
      lede: "Property managers can browse the catalog, choose a format, and reserve a date directly through our online booking portal — no phone tag, no email threads.",
      bullets: ["Live availability across the DMV calendar", "Confirm in minutes, not days", "Signed quote + run-of-show emailed on booking"],
      cta: "Open the booking portal",
      href: "https://simplycateringsolutions.com"
    },
    catalog: {
      kicker: "The catalog",
      title: "Events we've actually run.",
      lede: "Every entry below is something we've programmed for a real DMV property — not a wishlist. Mix, match, or hand us a theme and we'll build something custom.",
      groups: [{
        name: "Popular",
        items: ["Hot brunch — pancakes, eggs, bacon, juice bar", "Rooftop cookout — burgers, hot dogs, kabobs", "Burrito & taco bar", "Mixology class", "S'mores night", "Build-your-own smoothie bar"]
      }, {
        name: "Holiday & Seasonal",
        items: ["Valentine's Day sweets & flowers", "Cinco de Mayo burritos & tacos", "Mother's Day brunch", "4th of July cookout", "Thanksgiving feast", "Pumpkin carving night", "Christmas cookies & treats", "Gingerbread house decorating", "Hot cocoa bar", "S'mores night"]
      }, {
        name: "Food & Drink",
        items: ["Hot brunch — pancakes, eggs, bacon, juice bar", "Morning parfait bar", "Breakfast grab-and-go", "Coffee & donuts", "Rooftop cookout — burgers, hot dogs, kabobs", "Barbecue lunch / dinner", "Mediterranean kabobs & sides", "Burrito & taco bar", "Nacho bar", {
          label: "Custom pasta bar",
          isNew: true
        }, {
          label: "Cooking class",
          isNew: true
        }, {
          label: "Mixology class",
          isNew: true
        }, "Happy hour drinks", "Appetizers & wine", "Wine & charcuterie", "Wine tasting"]
      }, {
        name: "Wellness & Lifestyle",
        items: ["Morning yoga + healthy breakfast", "Yoga class (pair with any food event)", "Fitness class (pair with any food event)", "Build-your-own smoothie bar", "Movie night with fresh popcorn & sweets"]
      }]
    }
  }
};
function GalleryMarquee({
  gallery
}) {
  const {
    wrapRef,
    trackRef
  } = useDragMarquee({
    direction: "ltr"
  });
  // Pace the scroll with the number of photos so the speed feels constant
  // no matter how many you add (≈10s per photo, capped between 40s and 200s).
  const duration = Math.min(200, Math.max(40, gallery.length * 10));
  const loop = [...gallery, ...gallery];
  return /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-gallery-marquee",
    ref: wrapRef,
    "aria-label": "Gallery, scrolling. Drag to scrub.",
    style: {
      "--gallery-drift-duration": `${duration}s`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-gallery-track",
    ref: trackRef
  }, loop.map((g, i) => {
    const {
      caption,
      className,
      ...mediaProps
    } = g;
    const isDup = i >= gallery.length;
    return /*#__PURE__*/React.createElement("figure", {
      className: `svs-sp-gallery-cell ${className || ""}`,
      key: i,
      "aria-hidden": isDup ? "true" : undefined
    }, /*#__PURE__*/React.createElement(Media, _extends({}, mediaProps, {
      className: ""
    })), caption && /*#__PURE__*/React.createElement("figcaption", {
      className: "svs-sp-gallery-caption"
    }, caption));
  })));
}
function ServicePage({
  id
}) {
  const d = SERVICE_DETAILS[id];
  if (!d) return null;
  const isDraft = id === "draft";
  // Eyebrow letters shift depending on whether draft-only sections precede the gallery.
  const hasCatalog = !!d.catalog;
  const hasBooking = !!d.bookingPortal;
  const L = isDraft ? {
    gallery: "C",
    catalog: "D",
    features: "D",
    specs: "E",
    related: "F"
  } : hasCatalog ? hasBooking ? {
    gallery: "A",
    catalog: "B",
    booking: "C",
    features: "D",
    specs: "E",
    related: "F"
  } : {
    gallery: "A",
    catalog: "B",
    features: "C",
    specs: "D",
    related: "E"
  } : {
    gallery: "A",
    features: "B",
    specs: "C",
    related: "D"
  };
  return /*#__PURE__*/React.createElement("main", {
    className: "svs-service-page" + (isDraft ? " is-draft" : ""),
    "data-screen-label": `Service: ${d.name}`
  }, isDraft && /*#__PURE__*/React.createElement(DraftBgAnimation, null), /*#__PURE__*/React.createElement("section", {
    className: "svs-sp-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-hero-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-hero-copy"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-crumb"
  }, /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/")
  }, "Home"), /*#__PURE__*/React.createElement("span", null, "/"), /*#__PURE__*/React.createElement("span", null, "Services"), /*#__PURE__*/React.createElement("span", null, "/"), /*#__PURE__*/React.createElement("span", {
    className: "is-current"
  }, d.name)), /*#__PURE__*/React.createElement(Eyebrow, {
    num: d.num
  }, d.eyebrow), /*#__PURE__*/React.createElement("h1", {
    className: "svs-display-xl"
  }, d.name), /*#__PURE__*/React.createElement("p", {
    className: "svs-sp-tagline"
  }, /*#__PURE__*/React.createElement("em", null, d.tagline)), d.lede.split("\n\n").map((para, i) => /*#__PURE__*/React.createElement("p", {
    className: "svs-sp-lede",
    key: i
  }, para)), /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-cta"
  }, (() => {
    const cta = d.heroCta || {
      label: "Schedule a Walkthrough",
      href: "#/contact"
    };
    const externalProps = cta.external ? {
      target: "_blank",
      rel: "noopener noreferrer"
    } : {};
    return /*#__PURE__*/React.createElement("a", _extends({
      href: SVS.href(cta.href)
    }, externalProps, {
      className: "svs-btn svs-btn--accent svs-btn--lg"
    }), cta.label, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M3 8h10m-4-4 4 4-4 4",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })));
  })())), /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-hero-media" + (id === "draft" ? " svs-sp-hero-media--draft" : "")
  }, id === "draft" ? /*#__PURE__*/React.createElement(DraftAnimatedHero, null) : /*#__PURE__*/React.createElement(Media, {
    src: d.heroSrc,
    alt: d.heroLabel,
    tone: "deep",
    ratio: "4 / 5",
    label: d.heroLabel,
    className: d.heroFit === "contain" ? "svs-media-contain" : ""
  }))))), id === "draft" && /*#__PURE__*/React.createElement(MeetYourBeverages, null), id === "draft" && /*#__PURE__*/React.createElement(PulseSpotlight, null), id === "draft" && /*#__PURE__*/React.createElement(DraftHowItWorks, {
    serviceName: d.name
  }), /*#__PURE__*/React.createElement("section", {
    className: "svs-sp-gallery"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    num: L.gallery
  }, "See it in the wild")), (() => {
    const gallery = d.gallery || [{
      ratio: "4 / 5",
      tone: "warm",
      alt: "Installation in a boutique lobby",
      label: "Gallery · Installation in a boutique lobby",
      className: "g1"
    }, {
      ratio: "1 / 1",
      tone: "warm",
      alt: "Residents using the amenity",
      label: "Gallery · Residents using the amenity",
      className: "g2"
    }, {
      ratio: "4 / 3",
      tone: "deep",
      alt: "Detail shot — finishes and branding",
      label: "Gallery · Detail shot — finishes and branding",
      className: "g3"
    }, {
      ratio: "3 / 4",
      tone: "warm",
      alt: "Launch-day pop-up",
      label: "Gallery · Launch-day pop-up",
      className: "g4"
    }];
    return /*#__PURE__*/React.createElement(GalleryMarquee, {
      gallery: gallery
    });
  })()), d.catalog && /*#__PURE__*/React.createElement("section", {
    className: "svs-sp-catalog"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-catalog-head"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    num: L.catalog
  }, d.catalog.kicker), /*#__PURE__*/React.createElement("h2", {
    className: "svs-display-md"
  }, d.catalog.title), d.catalog.lede && /*#__PURE__*/React.createElement("p", {
    className: "svs-sp-catalog-lede"
  }, d.catalog.lede)), /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-catalog-grid"
  }, d.catalog.groups.map(grp => /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-catalog-group",
    key: grp.name
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-catalog-rule",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("h3", {
    className: "svs-sp-catalog-group-name"
  }, grp.name), /*#__PURE__*/React.createElement("ul", {
    className: "svs-sp-catalog-list"
  }, grp.items.map((it, i) => {
    const item = typeof it === "string" ? {
      label: it
    } : it;
    return /*#__PURE__*/React.createElement("li", {
      className: "svs-sp-catalog-item",
      key: i
    }, /*#__PURE__*/React.createElement("span", {
      className: "svs-sp-catalog-item-label"
    }, item.label), grp.name === "Popular" && /*#__PURE__*/React.createElement("span", {
      className: "svs-sp-catalog-tag svs-sp-catalog-tag--popular"
    }, "Popular"), item.isNew && /*#__PURE__*/React.createElement("span", {
      className: "svs-sp-catalog-tag"
    }, "New"));
  }))))))), d.bookingPortal && /*#__PURE__*/React.createElement("section", {
    className: "svs-sp-booking",
    "data-screen-label": "Events \u2014 Booking portal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-booking-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-booking-copy"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    num: L.booking,
    onDeep: true
  }, d.bookingPortal.kicker), /*#__PURE__*/React.createElement("h2", {
    className: "svs-display-md"
  }, d.bookingPortal.title), /*#__PURE__*/React.createElement("p", {
    className: "svs-sp-booking-lede"
  }, d.bookingPortal.lede), /*#__PURE__*/React.createElement("ul", {
    className: "svs-sp-booking-bullets"
  }, d.bookingPortal.bullets.map(b => /*#__PURE__*/React.createElement("li", {
    key: b
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-sp-booking-check",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 6.2l2.4 2.4L9.6 3.4",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("span", null, b)))), /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-booking-cta"
  }, /*#__PURE__*/React.createElement("a", {
    href: SVS.href(d.bookingPortal.href),
    target: "_blank",
    rel: "noopener noreferrer",
    className: "svs-btn svs-btn--accent svs-btn--lg"
  }, d.bookingPortal.cta, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8h10m-4-4 4 4-4 4",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), d.bookingPortal.note && /*#__PURE__*/React.createElement("span", {
    className: "svs-sp-booking-note"
  }, d.bookingPortal.note))), /*#__PURE__*/React.createElement("aside", {
    className: "svs-sp-booking-mock",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-booking-mock-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-sp-booking-mock-dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "svs-sp-booking-mock-dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "svs-sp-booking-mock-dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "svs-sp-booking-mock-url"
  }, "simplycateringsolutions.com")), /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-booking-mock-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-booking-mock-eyebrow"
  }, "Step 1 of 3 \xB7 Select a date"), /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-booking-mock-month"
  }, "May 2026"), /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-booking-mock-dow"
  }, /*#__PURE__*/React.createElement("span", null, "M"), /*#__PURE__*/React.createElement("span", null, "T"), /*#__PURE__*/React.createElement("span", null, "W"), /*#__PURE__*/React.createElement("span", null, "T"), /*#__PURE__*/React.createElement("span", null, "F"), /*#__PURE__*/React.createElement("span", null, "S"), /*#__PURE__*/React.createElement("span", null, "S")), /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-booking-mock-grid"
  }, Array.from({
    length: 35
  }).map((_, i) => {
    const day = i - 3;
    const visible = day >= 1 && day <= 31;
    const isSel = day === 17;
    const isAvail = [4, 6, 11, 13, 18, 20, 25, 27].includes(day);
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "svs-sp-booking-mock-day" + (!visible ? " is-empty" : isSel ? " is-sel" : isAvail ? " is-avail" : "")
    }, visible ? day : "");
  })), /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-booking-mock-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-booking-mock-card-label"
  }, "Selected event"), /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-booking-mock-card-title"
  }, "Rooftop cookout \xB7 burgers + kabobs"), /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-booking-mock-card-meta"
  }, /*#__PURE__*/React.createElement("span", null, "Sun \xB7 May 17"), /*#__PURE__*/React.createElement("span", {
    className: "svs-sp-booking-mock-divider"
  }), /*#__PURE__*/React.createElement("span", null, "2 baristas"), /*#__PURE__*/React.createElement("span", {
    className: "svs-sp-booking-mock-divider"
  }), /*#__PURE__*/React.createElement("span", null, "~80 res.")))))))), /*#__PURE__*/React.createElement("section", {
    className: "svs-sp-features"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    num: L.features
  }, "What's included"), /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-features-grid"
  }, d.features.map(f => /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-feature",
    key: f.title
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-value-icon"
  }, f.icon), /*#__PURE__*/React.createElement("h3", {
    className: "svs-value-title"
  }, f.title), /*#__PURE__*/React.createElement("p", {
    className: "svs-value-body"
  }, f.body)))))), /*#__PURE__*/React.createElement("section", {
    className: "svs-sp-specs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-specs-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    num: L.specs
  }, "Spec sheet"), /*#__PURE__*/React.createElement("h2", {
    className: "svs-display-md"
  }, "Plug in. That's the install."), /*#__PURE__*/React.createElement("p", {
    className: "svs-sp-specs-lede"
  }, "We designed every system around a simple truth: if it's complicated for you, it's already a failure. Standard electrical, no plumbing (where possible), same-day install.")), /*#__PURE__*/React.createElement("div", {
    className: "svs-spec-table"
  }, d.specs.map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    className: "svs-spec-row",
    key: k
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-spec-k"
  }, k), /*#__PURE__*/React.createElement("span", {
    className: "svs-spec-v"
  }, v))))))), /*#__PURE__*/React.createElement("section", {
    className: "svs-sp-related"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    num: L.related
  }, "Other services"), /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-related-grid"
  }, SERVICES.filter(s => s.id !== id).map(s => /*#__PURE__*/React.createElement("a", {
    key: s.id,
    href: SVS.href(s.href),
    className: "svs-sp-related-card"
  }, /*#__PURE__*/React.createElement(Media, {
    src: s.relatedSrc || s.src,
    alt: s.phLabel,
    tone: "warm",
    ratio: "4 / 3",
    label: s.phLabel,
    objectPosition: s.relatedSrc ? undefined : s.objectPosition
  }), /*#__PURE__*/React.createElement("div", {
    className: "svs-sp-related-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-service-num"
  }, s.num), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "svs-service-title"
  }, s.name), /*#__PURE__*/React.createElement("div", {
    className: "svs-service-tagline"
  }, s.tagline)), /*#__PURE__*/React.createElement("span", {
    className: "svs-service-arrow"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 9h10m-4-4 4 4-4 4",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))))))))));
}
Object.assign(window, {
  ServicePage,
  SERVICE_DETAILS
});

// ===== src/about_contact.jsx =====
// About + Contact pages
const {
  useState: useStateAbout
} = React;
function AboutPage() {
  const values = [{
    num: "01",
    title: "Transparency",
    body: "Pricing, uptime, restock schedules — all visible to you in a live dashboard. Nothing hidden."
  }, {
    num: "02",
    title: "Accessibility",
    body: "Amenities that work for every resident. ADA-compliant interfaces. Multilingual menus."
  }, {
    num: "03",
    title: "Innovation",
    body: "We pilot new hardware every quarter. Our flagship properties get first access to what's next."
  }];
  const timeline = [{
    year: "2014",
    title: "A single keg",
    body: "Jonathan installs the first cold brew keg at a 60-unit walk-up in Arlington."
  }, {
    year: "2017",
    title: "Ten properties",
    body: "Hot coffee service added. Word spreads among DMV property managers."
  }, {
    year: "2021",
    title: "Draft beverage system",
    body: "The flagship six-tap system launches. Instantly becomes our signature offering."
  }, {
    year: "2023",
    title: "AI micro marts",
    body: "Computer-vision checkout rolls out across boutique mid-rises."
  }, {
    year: "2025",
    title: "Fifty-plus properties",
    body: "Partnered with Greystar, Bozzuto, Kettler, and dozens of boutique operators."
  }];
  return /*#__PURE__*/React.createElement("main", {
    className: "svs-about-page",
    "data-screen-label": "About"
  }, /*#__PURE__*/React.createElement("section", {
    className: "svs-about-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    num: "01"
  }, "About Simply Vending Solutions"), /*#__PURE__*/React.createElement("h1", {
    className: "svs-display-xl"
  }, "We started with ", /*#__PURE__*/React.createElement("em", null, "one cold brew keg."), /*#__PURE__*/React.createElement("br", null), "Now we run the amenity programs at fifty-plus DMV buildings."))), /*#__PURE__*/React.createElement("section", {
    className: "svs-about-founder"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-about-founder-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-about-founder-media"
  }, /*#__PURE__*/React.createElement(Media, {
    src: "assets/about-mission-lobby-coffee.jpg",
    alt: "Two residents sharing coffee at a branded Simply Vending Solutions lobby coffee bar",
    tone: "warm",
    ratio: "4 / 5",
    label: ""
  }), /*#__PURE__*/React.createElement("div", {
    className: "svs-about-founder-caption"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-about-founder-name"
  }, "Morning at the bar"), /*#__PURE__*/React.createElement("div", {
    className: "svs-about-founder-role"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "svs-about-founder-copy"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    num: "A"
  }, "Our mission"), /*#__PURE__*/React.createElement("h2", {
    className: "svs-display-md"
  }, "Simplify the property manager's workload. ", /*#__PURE__*/React.createElement("em", null, "Delight the resident.")), /*#__PURE__*/React.createElement("p", {
    className: "svs-body-lg"
  }, "Simply Vending Solutions began in 2014 with a single cold brew keg, installed for a property manager who was tired of watching her Keurig break every other week. We kept her lobby stocked. She told three friends. They told three friends."), /*#__PURE__*/React.createElement("p", {
    className: "svs-body-lg"
  }, "Ten years later, we serve fifty-plus buildings across the DMV \u2014 from boutique walk-ups in Del Ray to four-hundred-unit high-rises in Ballston. What hasn't changed: you get one partner, one invoice, one phone number that ", /*#__PURE__*/React.createElement("em", null, "actually picks up.")))))), /*#__PURE__*/React.createElement("section", {
    className: "svs-about-values"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    num: "B"
  }, "Core values"), /*#__PURE__*/React.createElement("div", {
    className: "svs-about-values-grid"
  }, values.map(v => /*#__PURE__*/React.createElement("div", {
    className: "svs-about-value",
    key: v.num
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-about-value-num"
  }, v.num), /*#__PURE__*/React.createElement("h3", {
    className: "svs-display-sm"
  }, v.title), /*#__PURE__*/React.createElement("p", {
    className: "svs-body-lg"
  }, v.body)))))), /*#__PURE__*/React.createElement("section", {
    className: "svs-about-timeline"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    num: "C"
  }, "Our story"), /*#__PURE__*/React.createElement("h2", {
    className: "svs-display-md"
  }, "Ten years in the amenity business."), /*#__PURE__*/React.createElement("div", {
    className: "svs-timeline"
  }, timeline.map((t, i) => /*#__PURE__*/React.createElement("div", {
    className: "svs-timeline-row",
    key: t.year
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-timeline-year"
  }, t.year), /*#__PURE__*/React.createElement("div", {
    className: "svs-timeline-dot"
  }, /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("div", {
    className: "svs-timeline-body"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "svs-timeline-title"
  }, t.title), /*#__PURE__*/React.createElement("p", null, t.body))))))));
}

// Contact / Schedule a Walkthrough
function ContactPage() {
  const [form, setForm] = useStateAbout({
    name: "",
    role: "",
    property: "",
    units: "",
    email: "",
    phone: "",
    services: [],
    date: "",
    time: "",
    notes: ""
  });
  const [submitted, setSubmitted] = useStateAbout(false);
  const services = [{
    id: "draft",
    label: "Draft Beverages",
    icon: Icons.tap
  }, {
    id: "micromarts",
    label: "AI Micro Marts",
    icon: Icons.fridge
  }, {
    id: "coffee",
    label: "Hot Coffee",
    icon: Icons.coffee
  }, {
    id: "events",
    label: "Resident Events",
    icon: Icons.event
  }];
  const toggleService = id => {
    setForm(f => ({
      ...f,
      services: f.services.includes(id) ? f.services.filter(x => x !== id) : [...f.services, id]
    }));
  };
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const submit = e => {
    e.preventDefault();
    setSubmitted(true);
  };

  // Date slots — next 14 weekdays
  const dateSlots = (() => {
    const out = [];
    const d = new Date();
    while (out.length < 10) {
      d.setDate(d.getDate() + 1);
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue;
      out.push({
        value: d.toISOString().slice(0, 10),
        dow: d.toLocaleDateString("en-US", {
          weekday: "short"
        }),
        dd: d.getDate(),
        mon: d.toLocaleDateString("en-US", {
          month: "short"
        })
      });
    }
    return out;
  })();
  const times = ["9:00", "10:30", "12:00", "1:30", "3:00", "4:30"];
  return /*#__PURE__*/React.createElement("main", {
    className: "svs-contact-page",
    "data-screen-label": "Contact"
  }, /*#__PURE__*/React.createElement("section", {
    className: "svs-contact-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-contact-hero-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    num: "01"
  }, "Become a client"), /*#__PURE__*/React.createElement("h1", {
    className: "svs-display-xl"
  }, "Schedule a ", /*#__PURE__*/React.createElement("em", null, "walkthrough."), /*#__PURE__*/React.createElement("br", null), "We'll bring samples."), /*#__PURE__*/React.createElement("p", {
    className: "svs-body-lg"
  }, "We'll visit your property, walk your lobby, taste through the beverage menu, and sketch an amenity plan tailored to your residents. Typically 45 minutes."), /*#__PURE__*/React.createElement("div", {
    className: "svs-contact-promises"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-contact-promise"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-value-icon"
  }, Icons.clock), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Same-week response."), " Usually same-day.")), /*#__PURE__*/React.createElement("div", {
    className: "svs-contact-promise"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-value-icon"
  }, Icons.sparkle), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Tasting included."), " We bring the full draft menu.")), /*#__PURE__*/React.createElement("div", {
    className: "svs-contact-promise"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-value-icon"
  }, Icons.shield), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "No obligation."), " It's just a walkthrough."))), /*#__PURE__*/React.createElement("div", {
    className: "svs-contact-info"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "svs-contact-label"
  }, "Phone"), /*#__PURE__*/React.createElement("a", {
    href: "tel:+17036262258"
  }, "(703) 626-2258")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "svs-contact-label"
  }, "Email"), /*#__PURE__*/React.createElement("a", {
    href: "mailto:Jonathan@simplyvendingsolutionsllc.com"
  }, "Jonathan@simplyvendingsolutionsllc.com")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "svs-contact-label"
  }, "Office"), /*#__PURE__*/React.createElement("div", null, "2828 Dorr Ave.", /*#__PURE__*/React.createElement("br", null), "Fairfax, VA 22031")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "svs-contact-label"
  }, "Follow"), /*#__PURE__*/React.createElement("a", {
    href: "https://www.instagram.com/simplyvendingsolutionsllc/",
    target: "_blank",
    rel: "noreferrer",
    className: "svs-social"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "18",
    height: "18",
    rx: "5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "17.5",
    cy: "6.5",
    r: "1",
    fill: "currentColor",
    stroke: "none"
  })), "@simplyvendingsolutionsllc")))), /*#__PURE__*/React.createElement("div", {
    className: "svs-contact-form-wrap"
  }, !submitted ? /*#__PURE__*/React.createElement("form", {
    className: "svs-contact-form",
    onSubmit: submit
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-form-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-form-step"
  }, "Step 1 of 1"), /*#__PURE__*/React.createElement("h2", {
    className: "svs-display-sm"
  }, "Book your walkthrough")), /*#__PURE__*/React.createElement("div", {
    className: "svs-form-grid"
  }, /*#__PURE__*/React.createElement("label", {
    className: "svs-field"
  }, /*#__PURE__*/React.createElement("span", null, "Your name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: form.name,
    onChange: e => set("name", e.target.value),
    placeholder: "Jane Smith"
  })), /*#__PURE__*/React.createElement("label", {
    className: "svs-field"
  }, /*#__PURE__*/React.createElement("span", null, "Role"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: form.role,
    onChange: e => set("role", e.target.value),
    placeholder: "Property Manager"
  })), /*#__PURE__*/React.createElement("label", {
    className: "svs-field svs-field--wide"
  }, /*#__PURE__*/React.createElement("span", null, "Property name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: form.property,
    onChange: e => set("property", e.target.value),
    placeholder: "The Grove at Del Ray"
  })), /*#__PURE__*/React.createElement("label", {
    className: "svs-field"
  }, /*#__PURE__*/React.createElement("span", null, "Unit count"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: form.units,
    onChange: e => set("units", e.target.value),
    placeholder: "220"
  })), /*#__PURE__*/React.createElement("label", {
    className: "svs-field"
  }, /*#__PURE__*/React.createElement("span", null, "Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    required: true,
    value: form.email,
    onChange: e => set("email", e.target.value),
    placeholder: "you@property.com"
  })), /*#__PURE__*/React.createElement("label", {
    className: "svs-field svs-field--wide"
  }, /*#__PURE__*/React.createElement("span", null, "Phone"), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    value: form.phone,
    onChange: e => set("phone", e.target.value),
    placeholder: "(703) 555-0100"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "svs-form-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-form-block-label"
  }, "Which services interest you?"), /*#__PURE__*/React.createElement("div", {
    className: "svs-form-chips"
  }, services.map(s => /*#__PURE__*/React.createElement("button", {
    type: "button",
    key: s.id,
    className: `svs-chip ${form.services.includes(s.id) ? "is-on" : ""}`,
    onClick: () => toggleService(s.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-chip-icon"
  }, s.icon), /*#__PURE__*/React.createElement("span", null, s.label))))), /*#__PURE__*/React.createElement("label", {
    className: "svs-field svs-field--full"
  }, /*#__PURE__*/React.createElement("span", null, "Anything we should know? (optional)"), /*#__PURE__*/React.createElement("textarea", {
    rows: "3",
    value: form.notes,
    onChange: e => set("notes", e.target.value),
    placeholder: "E.g., we're a new lease-up, looking for draft + events package."
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "svs-btn svs-btn--accent svs-btn--lg svs-btn--wide"
  }, "Request Walkthrough", /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8h10m-4-4 4 4-4 4",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })))) : /*#__PURE__*/React.createElement("div", {
    className: "svs-contact-success"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-success-mark"
  }, "\u2713"), /*#__PURE__*/React.createElement("h2", {
    className: "svs-display-sm"
  }, "You're on the calendar."), /*#__PURE__*/React.createElement("p", null, "We'll send a calendar invite to ", /*#__PURE__*/React.createElement("strong", null, form.email), " within the hour, plus a note about what samples we'll bring to your walkthrough."), /*#__PURE__*/React.createElement("button", {
    className: "svs-btn svs-btn--ghost",
    onClick: () => setSubmitted(false)
  }, "Book another")))))));
}
Object.assign(window, {
  AboutPage,
  ContactPage
});

// ===== src/app.jsx =====
// Main app shell — router, tweaks panel, edit-mode wiring
const {
  useState: useStateApp,
  useEffect: useEffectApp,
  useRef: useRefApp
} = React;

// Tweakable defaults — wrapped so the host can rewrite them on disk.
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "cream",
  "featured": "draft",
  "heroLine1": "Level up your amenities.",
  "heroLine2": "One partner. Every pour.",
  "heroSub": "We run the draft beverages, micro marts, coffee, and resident events at fifty-plus DMV properties. One vendor. One phone number. Residents who brag about your lobby.",
  "density": "comfortable",
  "variant": "editorial"
} /*EDITMODE-END*/;
function useHashRoute() {
  const initial = typeof window !== "undefined" && window.__SVS_ROUTE || "/";
  const [route, setRoute] = useStateApp(() => initial);
  useEffectApp(() => {
    const onPop = () => {
      setRoute(typeof window !== "undefined" && window.__SVS_ROUTE || "/");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = r => {
    window.location.href = typeof window !== "undefined" && window.SVS ? window.SVS.href(r) : r;
  };
  return [route, navigate];
}
function HomePage({
  tweaks
}) {
  return /*#__PURE__*/React.createElement("main", {
    className: "svs-home",
    "data-screen-label": "Home",
    "data-variant": tweaks.variant
  }, /*#__PURE__*/React.createElement(HomeEntranceSwirl, null), /*#__PURE__*/React.createElement(HeroHome, {
    ambientBeans: /*#__PURE__*/React.createElement(HomeAmbientAnim, null),
    headline: {
      line1: tweaks.heroLine1,
      line2: tweaks.heroLine2
    },
    sub: tweaks.heroSub
  }), /*#__PURE__*/React.createElement(FlagshipDraft, null), /*#__PURE__*/React.createElement(ValueProps, null), /*#__PURE__*/React.createElement(ServicesGrid, {
    featured: tweaks.featured
  }), /*#__PURE__*/React.createElement(ProofStrip, null), /*#__PURE__*/React.createElement(Testimonial, null), /*#__PURE__*/React.createElement(HowItWorks, null));
}
function TweaksPanel({
  tweaks,
  setTweak,
  open,
  setOpen
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks",
    role: "dialog",
    "aria-label": "Tweaks"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-tweaks-title"
  }, "Tweaks"), /*#__PURE__*/React.createElement("button", {
    className: "svs-tweaks-close",
    onClick: () => setOpen(false),
    "aria-label": "Close"
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-label"
  }, "Palette"), /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-palettes"
  }, Object.entries(PALETTES).map(([id, p]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    className: `svs-tweaks-palette ${tweaks.palette === id ? "is-on" : ""}`,
    onClick: () => setTweak("palette", id),
    "aria-label": p.name
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-tweaks-swatches"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      background: p.bg
    }
  }), /*#__PURE__*/React.createElement("i", {
    style: {
      background: p.bgDeep
    }
  }), /*#__PURE__*/React.createElement("i", {
    style: {
      background: p.accent
    }
  })), /*#__PURE__*/React.createElement("span", null, p.name))))), /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-label"
  }, "Featured service"), /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-chips"
  }, [["draft", "Draft"], ["micromarts", "Micro Marts"], ["coffee", "Coffee"], ["events", "Events"]].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    className: `svs-tweaks-chip ${tweaks.featured === id ? "is-on" : ""}`,
    onClick: () => setTweak("featured", id)
  }, label)))), /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-label"
  }, "Hero headline"), /*#__PURE__*/React.createElement("input", {
    className: "svs-tweaks-input",
    value: tweaks.heroLine1,
    onChange: e => setTweak("heroLine1", e.target.value)
  }), /*#__PURE__*/React.createElement("input", {
    className: "svs-tweaks-input",
    value: tweaks.heroLine2,
    onChange: e => setTweak("heroLine2", e.target.value),
    placeholder: "italic line"
  })), /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-label"
  }, "Hero sub-copy"), /*#__PURE__*/React.createElement("textarea", {
    className: "svs-tweaks-input",
    rows: "3",
    value: tweaks.heroSub,
    onChange: e => setTweak("heroSub", e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-label"
  }, "Layout density"), /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-chips"
  }, [["tight", "Tight"], ["comfortable", "Comfortable"], ["spacious", "Spacious"]].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    className: `svs-tweaks-chip ${tweaks.density === id ? "is-on" : ""}`,
    onClick: () => setTweak("density", id)
  }, label)))), /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-label"
  }, "Hero variant"), /*#__PURE__*/React.createElement("div", {
    className: "svs-tweaks-chips"
  }, [["editorial", "Editorial"], ["immersive", "Immersive"], ["split", "Split"]].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    className: `svs-tweaks-chip ${tweaks.variant === id ? "is-on" : ""}`,
    onClick: () => setTweak("variant", id)
  }, label)))));
}
function App() {
  const [route, navigate] = useHashRoute();
  const [tweaks, setTweaks] = useStateApp(TWEAK_DEFAULTS);
  const [panelOpen, setPanelOpen] = useStateApp(false);

  // Sticky mobile CTA visibility — show only after user scrolls past hero,
  // and never on the contact page (form is already onscreen).
  const [stickyVisible, setStickyVisible] = useStateApp(false);
  useEffectApp(() => {
    const onScroll = () => {
      const triggered = window.scrollY > 480;
      setStickyVisible(triggered);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffectApp(() => {
    const shouldShow = stickyVisible && route !== "/contact";
    document.body.classList.toggle("svs-has-sticky-cta", shouldShow);
  }, [stickyVisible, route]);
  // Apply palette
  useEffectApp(() => {
    applyPalette(PALETTES[tweaks.palette] || PALETTES.cream);
  }, [tweaks.palette]);

  // Density + variant on root
  useEffectApp(() => {
    document.documentElement.dataset.density = tweaks.density;
    document.documentElement.dataset.variant = tweaks.variant;
  }, [tweaks.density, tweaks.variant]);

  // Scroll choreography — (re)scan reveals + parallax whenever the route changes
  useEffectApp(() => {
    SVS_SCROLL.scan();
  }, [route]);

  // Edit mode protocol
  useEffectApp(() => {
    const onMsg = e => {
      const d = e.data || {};
      if (d.type === "__activate_edit_mode") setPanelOpen(true);
      if (d.type === "__deactivate_edit_mode") setPanelOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({
      type: "__edit_mode_available"
    }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);
  const setTweak = (k, v) => {
    setTweaks(t => {
      const next = {
        ...t,
        [k]: v
      };
      window.parent.postMessage({
        type: "__edit_mode_set_keys",
        edits: {
          [k]: v
        }
      }, "*");
      return next;
    });
  };

  // Route resolution
  let view;
  if (route === "/" || route === "") view = /*#__PURE__*/React.createElement(HomePage, {
    tweaks: tweaks
  });else if (route === "/about") view = /*#__PURE__*/React.createElement(AboutPage, null);else if (route === "/contact") view = /*#__PURE__*/React.createElement(ContactPage, null);else if (route.startsWith("/services/")) {
    const id = route.split("/")[2];
    view = /*#__PURE__*/React.createElement(ServicePage, {
      id: id
    });
  } else view = /*#__PURE__*/React.createElement(HomePage, {
    tweaks: tweaks
  });
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Nav, {
    route: route,
    navigate: navigate
  }), view, /*#__PURE__*/React.createElement(Footer, null), route !== "/contact" && /*#__PURE__*/React.createElement("a", {
    href: SVS.href("/contact"),
    className: `svs-sticky-cta ${stickyVisible ? "is-visible" : ""}`,
    "aria-label": "Schedule a walkthrough"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-sticky-cta-label"
  }, /*#__PURE__*/React.createElement("span", {
    className: "svs-sticky-cta-eyebrow"
  }, "Free walkthrough"), /*#__PURE__*/React.createElement("span", {
    className: "svs-sticky-cta-text"
  }, "Schedule a visit")), /*#__PURE__*/React.createElement("span", {
    className: "svs-sticky-cta-arrow",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8h10m-4-4 4 4-4 4",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })))), /*#__PURE__*/React.createElement(TweaksPanel, {
    tweaks: tweaks,
    setTweak: setTweak,
    open: panelOpen,
    setOpen: setPanelOpen
  }));
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/*#__PURE__*/React.createElement(App, null));