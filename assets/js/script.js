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
document.addEventListener("DOMContentLoaded", function () {
  const stickyLogo = document.getElementById("stickyLogo");

  // 初期状態を設定
  stickyLogo.classList.add("hidden");

  function handleScroll() {
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;

    if (currentScroll > viewportHeight) {
      if (!stickyLogo.classList.contains("show")) {
        stickyLogo.classList.remove("hidden");
        stickyLogo.classList.add("show");
      }
    } else {
      if (!stickyLogo.classList.contains("hidden")) {
        stickyLogo.classList.remove("show");
        stickyLogo.classList.add("hidden");
      }
    }
  }

  // シンプルなスクロールイベント
  window.addEventListener("scroll", handleScroll);

  // 初期チェック
  handleScroll();
});

// ハンバーガーメニュー
// ハンバーガーメニュー（scroll-behavior: smooth対応版）
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
  let scrollPosition = 0;

  const open = () => {
    // 現在のスクロール位置を保存
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
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

    // bodyの位置を固定（スクロール防止のため）
    body.style.position = "fixed";
    body.style.top = `-${scrollPosition}px`;
    body.style.width = "100%";

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

    // bodyの固定を解除
    body.style.position = "";
    body.style.top = "";
    body.style.width = "";

    // 一時的にscroll-behaviorを無効化して即座にスクロール位置を復元
    const originalScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, scrollPosition);

    // 次のフレームでscroll-behaviorを元に戻す
    requestAnimationFrame(() => {
      html.style.scrollBehavior = originalScrollBehavior;
    });

    // フォーカスを戻す（ハンバーガーボタンに戻す）
    if (lastFocused && lastFocused === btn) {
      btn.focus();
    }
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
    if (a) {
      // リンクがページ内リンクの場合の処理
      const href = a.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        close();
        // 少し遅延させてからスクロール
        setTimeout(() => {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
          }
        }, 300);
      } else {
        // 通常のリンクの場合
        setTimeout(close, 0);
      }
    }
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

    // nameにHTMLタグが含まれているかチェック
    if (name && /<[^>]+>/.test(name)) {
      nameEl.innerHTML = name; // HTMLとして挿入
    } else {
      nameEl.textContent = name || ""; // テキストとして挿入
    }

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

    // data-modal-text属性がない場合は処理を終了
    const dataText = card.getAttribute("data-modal-text");
    if (!dataText) return;

    const img =
      card.querySelector("img") ||
      card.parentElement?.querySelector(":scope > img") ||
      card.closest(".partners-item__wrap")?.querySelector("img");

    // data-modal-title属性があればそれを優先、なければ通常の名前を取得
    const modalTitle = card.getAttribute("data-modal-title");
    const name =
      modalTitle ||
      card.querySelector(".partners-item__name")?.textContent?.trim() ||
      card.parentElement
        ?.querySelector(".partners-item__name")
        ?.textContent?.trim() ||
      "";

    openModal({
      imgSrc: img?.getAttribute("src") || "",
      imgAlt: img?.getAttribute("alt") || name || "",
      name, // モーダルタイトル用
      text: dataText,
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

  const barHeight = () => bar.getBoundingClientRect().height || 80;
  const updateObserver = () => {
    if (window.__fixedBarIO__) window.__fixedBarIO__.disconnect();

    const rootMargin = `0px 0px ${-(barHeight() + 8)}px 0px`;
    const io = new IntersectionObserver(
      (entries) => {
        const ent = entries[0];
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

  updateObserver();

  window.addEventListener(
    "resize",
    () => {
      updateObserver();
    },
    { passive: true }
  );
});

// Ajexフィルタ機能
document.addEventListener("DOMContentLoaded", () => {
  const filters = document.getElementById("stageFilters");
  const list = document.getElementById("sessionList");
  if (!filters || !list) return;

  const STAGES = ["innovators", "crossover", "meetup", "demoday"];
  const cache = new Map();
  const ENDPOINT = (stage) => `./assets/data/sessions_${stage}.json`;

  // URLの?stage=を初期適用（なければ最初のボタンを選んでもOK）
  const url = new URL(window.location.href);
  const initialStage = url.searchParams.get("stage");
  if (initialStage && STAGES.includes(initialStage)) {
    markActive(initialStage);
    fetchAndRenderJSON(initialStage, { push: false });
  }

  filters.addEventListener("click", (e) => {
    const a = e.target.closest("[data-stage]");
    if (!a) return;
    e.preventDefault();
    const stage = a.dataset.stage;
    if (!STAGES.includes(stage)) return;
    markActive(stage);
    fetchAndRenderJSON(stage, { push: true });
  });

  function markActive(stage) {
    filters.querySelectorAll("[data-stage]").forEach((a) => {
      const active = a.dataset.stage === stage;
      a.classList.toggle("is-active", active);
      a.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  async function fetchAndRenderJSON(stage, { push }) {
    try {
      list.setAttribute("aria-busy", "true");
      list.style.opacity = "0.5";

      let data;
      if (cache.has(stage)) {
        data = cache.get(stage);
      } else {
        const res = await fetch(ENDPOINT(stage), {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Network error");
        data = await res.json();
        cache.set(stage, data);
      }

      list.innerHTML =
        (data.items || []).map(renderItem).join("") || emptyItem();

      const anchor = document.getElementById("session");
      if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });

      if (push) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("stage", stage);
        history.pushState({ stage }, "", newUrl);
      }
    } catch (e) {
      console.error(e);
      list.innerHTML = errorItem();
    } finally {
      list.removeAttribute("aria-busy");
      list.style.opacity = "";
    }
  }

  // ← ここを“唯一の”renderItemとして採用（multiple対応版）
  function renderItem(item) {
    const speakers = item.speakers || [];
    const speakersHTML = speakers
      .map(
        (sp) => `
      <li class="session-timetable__person__item">
        <img class="session-timetable__person__img" src="${
          sp.img || ""
        }" alt="">
        <div class="session-timetable__person__item__contents">
          <p class="session-timetable__person__company">${sp.company || ""}</p>
          <p class="session-timetable__person__name">${sp.nameJa || ""}</p>
          <p class="session-timetable__person__name--en">${sp.nameEn || ""}</p>
        </div>
      </li>
    `
      )
      .join("");

    const peopleClass =
      speakers.length > 1
        ? "session-timetable__person__items multiple"
        : "session-timetable__person__items";

    return `
      <li class="session-timetable__item">
        <div class="session-timetable__item__inner">
          <div class="session-timetable__heading">
            <h4 class="session-timetable__title">${item.title || ""}</h4>
            <div class="stage-item__heading">
              <img class="stage-item__icon" src="${
                item.stageIcon || ""
              }" alt="">
              <p class="stage-item__name">${item.stageLabel || ""}</p>
            </div>
          </div>
          <ul class="${peopleClass}">
            ${speakersHTML}
          </ul>
        </div>
      </li>
    `;
  }

  const emptyItem = () => `
    <li class="session-timetable__item">
      <p class="session-timetable__comment">対象セッションはありません</p>
    </li>
  `;

  const errorItem = () => `
    <li class="session-timetable__item">
      <p class="session-timetable__comment">読み込みに失敗しました。時間をおいて再度お試しください。</p>
    </li>
  `;

  window.addEventListener("popstate", (ev) => {
    const stage =
      (ev.state && ev.state.stage) ||
      new URL(window.location.href).searchParams.get("stage");
    if (stage && STAGES.includes(stage)) {
      markActive(stage);
      fetchAndRenderJSON(stage, { push: false });
    }
  });
});
