// FV泡泡

(() => {
  if (window.__KID_PARTICLES_INIT__) return;
  window.__KID_PARTICLES_INIT__ = true;

  const CANVAS_ID = "kid-particles";
  const JSON_PATH = "assets/parameter.json";

  const MM_TO_PX = 96 / 25.4;
  const mmToPx = (mm) => mm * MM_TO_PX;

  const DPR = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  const rand = (a, b) => a + Math.random() * (b - a);
  const choice = (arr) => arr[(Math.random() * arr.length) | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  // ================= 設定 =================
  const PRESET = {
    AREA: "right",
    RIGHT_STRIP_WIDTH: 795,
    DIAMETER_MM: [9, 8, 7, 6, 5, 4, 3, 2, 1],
    EMIT_PER_SEC: 120,
    SPEED_PX_PER_S: { min: 15, max: 60 },
    LIFE_S: { min: 2.0, max: 4.0 },
    DISAPPEAR_MODE_RATIO: { fade: 0.6, shrink: 0.4 },
    ALPHA_START: 1.0,
    ALPHA_END: 0.0,
    COLOR_MODE: "solid",
    COLOR: "rgba(255,255,255,1)",
    WOBBLE_STRENGTH: 10,
    WOBBLE_FREQ: 4.0,
  };

  // ========== parameter.json optional ==========
  async function loadParams() {
    try {
      const url = new URL(JSON_PATH, document.baseURI).href;
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return JSON.parse(await res.text());
    } catch {
      return { emitFrequency: PRESET.EMIT_PER_SEC };
    }
  }

  // ========== canvas setup ==========
  function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    const ctx = canvas.getContext("2d", { alpha: true });
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return ctx;
  }

  // ========== Particle ==========
  class Particle {
    constructor(bounds) {
      const dMm = choice(PRESET.DIAMETER_MM);
      const dPx = mmToPx(dMm);
      this.r0 = dPx / 2;
      this.r1 = 0;

      this.x = rand(bounds.l, bounds.r);
      this.y = rand(bounds.t, bounds.b);

      this.life = rand(PRESET.LIFE_S.min, PRESET.LIFE_S.max);
      this.age = 0;

      const modeRand = Math.random();
      this.mode =
        modeRand < PRESET.DISAPPEAR_MODE_RATIO.fade ? "fade" : "shrink";

      const dir = choice(["up", "down", "left", "right"]);
      const sp = rand(PRESET.SPEED_PX_PER_S.min, PRESET.SPEED_PX_PER_S.max);
      if (dir === "up") {
        this.vx = 0;
        this.vy = -sp;
      }
      if (dir === "down") {
        this.vx = 0;
        this.vy = sp;
      }
      if (dir === "left") {
        this.vx = -sp;
        this.vy = 0;
      }
      if (dir === "right") {
        this.vx = sp;
        this.vy = 0;
      }

      this.color = PRESET.COLOR;
      this.phase = Math.random() * Math.PI * 2;
    }

    update(dt, bounds, tGlobal) {
      const wob = PRESET.WOBBLE_STRENGTH;
      const wfr = PRESET.WOBBLE_FREQ;
      const wx = Math.sin(tGlobal * wfr + this.phase) * wob;
      const wy = Math.cos(tGlobal * wfr + this.phase) * wob;

      this.x += (this.vx + wx) * dt;
      this.y += (this.vy + wy) * dt;

      if (this.x < bounds.l) {
        this.x = bounds.l;
        this.vx = Math.abs(this.vx);
      }
      if (this.x > bounds.r) {
        this.x = bounds.r;
        this.vx = -Math.abs(this.vx);
      }
      if (this.y < bounds.t) {
        this.y = bounds.t;
        this.vy = Math.abs(this.vy);
      }
      if (this.y > bounds.b) {
        this.y = bounds.b;
        this.vy = -Math.abs(this.vy);
      }

      this.age += dt;
      return this.age < this.life;
    }

    draw(ctx) {
      const t = clamp(this.age / this.life, 0, 1);
      const alpha =
        this.mode === "fade"
          ? lerp(PRESET.ALPHA_START, PRESET.ALPHA_END, t)
          : PRESET.ALPHA_START;
      const r = this.mode === "shrink" ? lerp(this.r0, this.r1, t) : this.r0;

      if (r <= 0 || alpha <= 0) return;
      const col = this.color.replace(/rgba?\(([^)]+)\)/, (m, inner) => {
        const parts = inner.split(",").map((s) => s.trim());
        if (parts.length === 3) parts.push(alpha.toFixed(3));
        else parts[3] = alpha.toFixed(3);
        return `rgba(${parts.join(",")})`;
      });
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========== Start ==========
  function start() {
    const canvas = document.getElementById(CANVAS_ID);
    if (!canvas) return;

    let ctx = setupCanvas(canvas);
    let W = canvas.clientWidth;
    let H = canvas.clientHeight;

    const getBounds = () => {
      if (PRESET.AREA === "right" && PRESET.RIGHT_STRIP_WIDTH < W) {
        const l = W - PRESET.RIGHT_STRIP_WIDTH;
        return { l, r: W, t: 0, b: H, w: PRESET.RIGHT_STRIP_WIDTH, h: H };
      }
      return { l: 0, r: W, t: 0, b: H, w: W, h: H };
    };

    let params;
    let particles = [];
    let leftover = 0;

    function handleResize() {
      ctx = setupCanvas(canvas);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
    }
    window.addEventListener("resize", handleResize, { passive: true });

    loadParams().then((p) => {
      params = p || {};
      loop(performance.now());
    });

    let last = performance.now();
    function loop(now) {
      requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      ctx.clearRect(0, 0, W, H);

      const bounds = getBounds();

      const perSec = Math.max(0, params.emitFrequency ?? PRESET.EMIT_PER_SEC);
      const toEmit = perSec * dt + leftover;
      const count = Math.floor(toEmit);
      leftover = toEmit - count;

      for (let i = 0; i < count; i++) particles.push(new Particle(bounds));

      const alive = [];
      const tGlobal = now / 1000;
      for (const p of particles) {
        if (p.update(dt, bounds, tGlobal)) alive.push(p);
      }
      particles = alive;

      for (const p of particles) p.draw(ctx);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();

// 追従ロゴ
document.addEventListener("DOMContentLoaded", () => {
  const stickyLogo = document.getElementById("stickyLogo");
  const fv = document.querySelector(".fv");

  if (!stickyLogo || !fv) return;

  const fvHeight = fv.offsetHeight;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;

    if (scrollY > fvHeight) {
      stickyLogo.classList.add("show");
    } else {
      stickyLogo.classList.remove("show");
    }
  });
});

// ハンバーガーメニュー
(() => {
  const btn = document.querySelector(".js-hamburger");
  const drawer = document.querySelector(".js-drawer");
  const backdrop =
    document.querySelector(".drawer-backdrop") ||
    (() => {
      const bd = document.createElement("div");
      bd.className = "drawer-backdrop md-show";
      bd.hidden = true;
      document.body.appendChild(bd);
      return bd;
    })();
  if (!btn || !drawer) return;

  const html = document.documentElement;
  const body = document.body;
  const labelEl = btn.querySelector(".hamburger__label");
  const OPEN_LABEL = "close";
  const CLOSE_LABEL = "menu";

  let lastFocused = null;

  const open = () => {
    lastFocused = document.activeElement;

    btn.classList.add("is-active");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "メニューを閉じる");
    if (labelEl) labelEl.textContent = OPEN_LABEL;

    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");

    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add("is-open"));

    html.classList.add("is-drawer-open");
    body.classList.add("is-drawer-open");

    // 初期フォーカス
    const first = drawer.querySelector(
      'a,button,[tabindex]:not([tabindex="-1"])'
    );
    (first || drawer).focus();
  };

  const close = () => {
    btn.classList.remove("is-active");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "メニューを開く");
    if (labelEl) labelEl.textContent = CLOSE_LABEL;

    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");

    backdrop.classList.remove("is-open");
    setTimeout(() => {
      backdrop.hidden = true;
    }, 280);

    html.classList.remove("is-drawer-open");
    body.classList.remove("is-drawer-open");

    if (lastFocused) lastFocused.focus();
  };

  btn.addEventListener("click", () => {
    drawer.classList.contains("is-open") ? close() : open();
  });
  backdrop.addEventListener("click", close);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) {
      e.preventDefault();
      close();
    }
  });
  drawer.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (a) setTimeout(close, 0);
  });
})();

// introduction背景のほわっと
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".introduction");
  if (!section) return;

  const MAX_BLUR_PX = 12;
  const START = 0.08;
  const END = 0.55;
  const SMOOTH = 0.25;

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  let current = 0;
  let ticking = false;

  function update() {
    const vh = window.innerHeight;
    const r = section.getBoundingClientRect();

    const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    const denom = Math.min(vh, r.height) || 1;
    let ratio = visible / denom;

    let u = (ratio - START) / (END - START);
    u = clamp01(u);

    const eased = easeInOutCubic(u);
    const target = MAX_BLUR_PX * eased;

    current = current + (target - current) * SMOOTH;
    section.style.setProperty("--intro-blur", `${current.toFixed(2)}px`);
  }

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  };

  // ===== SPだけで有効化（〜767.98px想定）=====
  const mq = window.matchMedia("(max-width: 767.98px)");

  function enable() {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll(); // 初期反映
  }

  function disable() {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    ticking = false;
    current = 0;
    section.style.setProperty("--intro-blur", "0px"); // PCでは常にゼロ
  }

  function watch(e) {
    if (e.matches) {
      enable();
    } else {
      disable();
    }
  }

  // 初期判定＆変更監視（古いブラウザ対応も）
  watch(mq);
  if (mq.addEventListener) {
    mq.addEventListener("change", watch);
  } else {
    mq.addListener(watch);
  }
});

// areaページ-----モーダル
document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector(".partners-items");
  const modal = document.getElementById("partner-modal");
  if (!list || !modal) return; // area.html 以外でエラーにしない

  const imgEl = modal.querySelector("#partner-modal-img");
  const nameEl = modal.querySelector("#partner-modal-title");
  const textEl = modal.querySelector("#partner-modal-text");
  const dialog = modal.querySelector(".partner-modal__dialog");

  const lockScroll = () => {
    document.documentElement.style.overflow = "hidden";
  };
  const unlockScroll = () => {
    document.documentElement.style.overflow = "";
  };

  const openModal = ({ imgSrc, imgAlt, name, text }) => {
    imgEl.src = imgSrc || "";
    imgEl.alt = imgAlt || name || "";
    nameEl.textContent = name || "";

    textEl.innerHTML = "";
    if (text && /<[^>]+>/.test(text)) {
      textEl.innerHTML = text;
    } else {
      textEl.textContent = text || "";
    }

    modal.setAttribute("aria-hidden", "false");
    lockScroll();
    if (!modal.hasAttribute("tabindex")) modal.setAttribute("tabindex", "-1");
    modal.focus();
  };

  const closeModal = () => {
    modal.setAttribute("aria-hidden", "true");
    unlockScroll();
  };

  list.addEventListener("click", (e) => {
    const card = e.target.closest(
      ".partners-item__individual, .partners-item__wrap"
    );
    if (!card || !list.contains(card)) return;

    const img =
      card.querySelector("img") ||
      card.parentElement?.querySelector(":scope > img") ||
      card.closest(".partners-item__wrap")?.querySelector("img");

    const name =
      card.querySelector(".partners-item__name")?.textContent?.trim() ||
      card.parentElement
        ?.querySelector(".partners-item__name")
        ?.textContent?.trim() ||
      "";

    const dataText = card.getAttribute("data-modal-text");
    const plainText =
      card.querySelector(".partners-item__text")?.textContent?.trim() ||
      card.parentElement
        ?.querySelector(".partners-item__text")
        ?.textContent?.trim() ||
      "";

    openModal({
      imgSrc: img?.getAttribute("src") || "",
      imgAlt: img?.getAttribute("alt") || name || "",
      name,
      text: dataText ?? plainText,
    });
  });

  const closeBtns = modal.querySelectorAll("[data-modal-close]");
  closeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeModal();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
      closeModal();
    }
  });

  if (dialog) dialog.addEventListener("click", (e) => e.stopPropagation());
});

// sessionページ--固定ボタンfooter以下非表示
document.addEventListener("DOMContentLoaded", () => {
  const bar = document.querySelector(".fixed-bar__wrap");
  const footer = document.querySelector("footer");
  if (!bar || !footer) return;

  // バーの高さぶん早めにトリガーさせる（重なり防止）
  const barHeight = () => bar.getBoundingClientRect().height || 80;
  const updateObserver = () => {
    // 既存のObserverがあればdisconnect
    if (window.__fixedBarIO__) window.__fixedBarIO__.disconnect();

    const rootMargin = `0px 0px ${-(barHeight() + 8)}px 0px`;
    const io = new IntersectionObserver(
      (entries) => {
        const ent = entries[0];
        // フッターが見え始めたら隠す／離れたら出す
        if (ent.isIntersecting) {
          bar.classList.add("is-out");
        } else {
          bar.classList.remove("is-out");
        }
      },
      { threshold: 0, rootMargin }
    );

    io.observe(footer);
    window.__fixedBarIO__ = io;
  };

  // 初期化
  updateObserver();

  // 画面回転やリサイズで高さが変わる場合に追従
  window.addEventListener(
    "resize",
    () => {
      // リサイズ後の高さで rootMargin を再計算
      updateObserver();
    },
    { passive: true }
  );
});
