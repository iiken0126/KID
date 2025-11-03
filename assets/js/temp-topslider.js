// 無限横スクロールSwiper初期化
document.addEventListener("DOMContentLoaded", function () {
  // 共通設定
  const commonConfig = {
    slidesPerView: "auto",
    spaceBetween: 24,
    loop: true,
    loopedSlides: 10, // ループ用の複製スライド数を増やす
    loopAdditionalSlides: 10, // 追加のループスライド
    allowTouchMove: true,
    speed: 10000, // トランジション速度を長くしてより滑らかに

    // 自動スクロール設定（右から左へ）
    autoplay: {
      delay: 0, // 遅延なし（連続スクロール）
      disableOnInteraction: false, // ユーザー操作後も継続
      reverseDirection: false, // false = 右から左へ
      waitForTransition: false, // トランジション完了を待たない
    },

    // スムーズな動きのための詳細設定
    cssMode: false, // JSベースのアニメーション
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
    updateOnWindowResize: true,
    resizeObserver: true,

    // フリーモード設定を無効化（より安定した動きのため）
    freeMode: false,

    // センタリング無効化
    centeredSlides: false,

    // エフェクト
    effect: "slide",

    // グラブカーソル
    grabCursor: true,

    // パフォーマンス設定
    preloadImages: true,
    updateOnImagesReady: true,

    // レスポンシブ設定
    breakpoints: {
      320: {
        spaceBetween: 16,
        speed: 8000,
        loopedSlides: 8,
      },
      768: {
        spaceBetween: 20,
        speed: 9000,
        loopedSlides: 9,
      },
      1024: {
        spaceBetween: 24,
        speed: 10000,
        loopedSlides: 10,
      },
    },
  };

  // 上段のSwiper設定
  const swiperTopConfig = {
    ...commonConfig,
    on: {
      init: function () {
        console.log("上段Swiper初期化完了");
        // linear timing functionを確実に適用
        this.wrapperEl.style.transitionTimingFunction = "linear";
      },
      slideChange: function () {
        // スライド変更時もlinearを維持
        this.wrapperEl.style.transitionTimingFunction = "linear";
      },
      transitionStart: function () {
        this.wrapperEl.style.transitionTimingFunction = "linear";
      },
      transitionEnd: function () {
        // トランジション終了後もlinearを維持
        this.wrapperEl.style.transitionTimingFunction = "linear";
      },
    },
  };

  // 下段のSwiper設定（同じ方向、少し速度を変える）
  const swiperBottomConfig = {
    ...commonConfig,
    speed: 10500, // 少し異なる速度でより自然な見た目に
    on: {
      init: function () {
        console.log("下段Swiper初期化完了");
        // linear timing functionを確実に適用
        this.wrapperEl.style.transitionTimingFunction = "linear";
      },
      slideChange: function () {
        // スライド変更時もlinearを維持
        this.wrapperEl.style.transitionTimingFunction = "linear";
      },
      transitionStart: function () {
        this.wrapperEl.style.transitionTimingFunction = "linear";
      },
      transitionEnd: function () {
        // トランジション終了後もlinearを維持
        this.wrapperEl.style.transitionTimingFunction = "linear";
      },
    },
  };

  // Swiperインスタンスの作成
  const swiperTop = new Swiper(".guests-swiper-top", swiperTopConfig);
  const swiperBottom = new Swiper(".guests-swiper-bottom", swiperBottomConfig);

  // 初期化後にlinearを再度適用（確実性のため）
  setTimeout(() => {
    const wrappers = document.querySelectorAll(".swiper-wrapper");
    wrappers.forEach((wrapper) => {
      wrapper.style.transitionTimingFunction = "linear";
      wrapper.style.willChange = "transform"; // パフォーマンス最適化
    });
  }, 100);

  // ホバー時の一時停止機能
  const guestsSection = document.querySelector(".guests-section");

  if (guestsSection) {
    guestsSection.addEventListener("mouseenter", function () {
      swiperTop.autoplay.stop();
      swiperBottom.autoplay.stop();
    });

    guestsSection.addEventListener("mouseleave", function () {
      swiperTop.autoplay.start();
      swiperBottom.autoplay.start();
    });
  }

  // タッチデバイスでの一時停止
  let touchStarted = false;

  guestsSection?.addEventListener("touchstart", function () {
    if (!touchStarted) {
      touchStarted = true;
      swiperTop.autoplay.stop();
      swiperBottom.autoplay.stop();
    }
  });

  guestsSection?.addEventListener("touchend", function () {
    setTimeout(() => {
      touchStarted = false;
      swiperTop.autoplay.start();
      swiperBottom.autoplay.start();
    }, 3000); // 3秒後に自動スクロール再開
  });

  // 動画酔い配慮（prefers-reduced-motion対応）
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  function handleMotionPreference() {
    if (prefersReducedMotion.matches) {
      // アニメーションを完全停止
      swiperTop.autoplay.stop();
      swiperBottom.autoplay.stop();
      swiperTop.disable();
      swiperBottom.disable();
    } else {
      // アニメーション有効化
      swiperTop.enable();
      swiperBottom.enable();
      swiperTop.autoplay.start();
      swiperBottom.autoplay.start();
    }
  }

  handleMotionPreference();
  prefersReducedMotion.addEventListener("change", handleMotionPreference);

  // ウィンドウリサイズ時の再計算
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      swiperTop.update();
      swiperBottom.update();
      // リサイズ後もlinearを維持
      document.querySelectorAll(".swiper-wrapper").forEach((wrapper) => {
        wrapper.style.transitionTimingFunction = "linear";
      });
    }, 250);
  });

  // パフォーマンス最適化：非表示時の停止
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      swiperTop.autoplay.stop();
      swiperBottom.autoplay.stop();
    } else {
      swiperTop.autoplay.start();
      swiperBottom.autoplay.start();
      // 再開時にもlinearを適用
      document.querySelectorAll(".swiper-wrapper").forEach((wrapper) => {
        wrapper.style.transitionTimingFunction = "linear";
      });
    }
  });

  // ループのガクつき対策：スライドの事前読み込みと更新
  function optimizeLoop() {
    [swiperTop, swiperBottom].forEach((swiper) => {
      swiper.lazy?.load();
      swiper.update();
    });
  }

  // 定期的に更新（ガクつき防止）
  setInterval(optimizeLoop, 30000); // 30秒ごと
});
