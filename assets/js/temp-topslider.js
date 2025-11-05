// Swiperの初期化
document.addEventListener("DOMContentLoaded", function () {
  // ブレイクポイント設定（SCSSと同じ）
  const BREAKPOINT_MD = 768;

  // フルード計算用の設定値（SCSSと同じ）
  const PC_SETTINGS = {
    maxWidth: 1600,
    designWidth: 1512,
    tabletMaxWidth: 1000,
    tabletMinWidth: 769,
    minScale: 0.75, // 769pxで75%
  };

  const SP_SETTINGS = {
    baseWidth: 390,
    minWidth: 375,
    maxWidth: 768,
  };

  // 現在の画面幅に応じたオフセット値を計算（カード幅の50%）
  function calculateOffset() {
    const vw = window.innerWidth;

    // モバイル（768px以下）
    if (vw <= BREAKPOINT_MD) {
      // SPでは64px固定
      return 64;
    }

    // PCサイズでカード幅を計算
    // SCSSの.guests-itemの幅設定に基づく
    const baseCardWidth = 430; // デザイン時のカード幅
    let cardWidth;

    // タブレット範囲（769px〜1000px）: 縮小
    if (vw >= PC_SETTINGS.tabletMinWidth && vw <= PC_SETTINGS.tabletMaxWidth) {
      // カード幅の75%〜100%で変動
      const minVal = baseCardWidth * PC_SETTINGS.minScale; // 322.5px
      const maxVal = baseCardWidth; // 430px
      const range = PC_SETTINGS.tabletMaxWidth - PC_SETTINGS.tabletMinWidth;
      const progress = (vw - PC_SETTINGS.tabletMinWidth) / range;
      cardWidth = minVal + (maxVal - minVal) * progress;
    }
    // デスクトップ範囲（1001px〜1511px）: 固定
    else if (vw >= 1001 && vw <= 1511) {
      cardWidth = baseCardWidth; // 430px
    }
    // 大画面（1512px以上）: 拡大
    else if (vw >= PC_SETTINGS.designWidth) {
      const minVal = baseCardWidth;
      const maxVal =
        baseCardWidth * (PC_SETTINGS.maxWidth / PC_SETTINGS.designWidth); // 約454.5px
      const range = PC_SETTINGS.maxWidth - PC_SETTINGS.designWidth;
      const progress = Math.min((vw - PC_SETTINGS.designWidth) / range, 1);
      cardWidth = minVal + (maxVal - minVal) * progress;
    }
    // デフォルト
    else {
      cardWidth = baseCardWidth;
    }

    // カード幅の50%を返す
    return cardWidth / 2;
  }

  // スライドのクローンを追加する関数
  function cloneSlides(swiperSelector) {
    const swiperWrapper = document.querySelector(
      `${swiperSelector} .swiper-wrapper`
    );
    if (!swiperWrapper) return;

    const slides = swiperWrapper.querySelectorAll(
      ".swiper-slide:not(.swiper-slide-clone)"
    );
    const slideCount = slides.length;
    const viewportWidth = window.innerWidth;

    // カードの幅を動的に取得
    const slideWidth = slides[0] ? slides[0].offsetWidth : 400;
    const spaceBetween = 20;

    // 画面幅を埋めるのに必要なスライド数を計算
    const slidesNeeded =
      Math.ceil(viewportWidth / (slideWidth + spaceBetween)) + 2;

    // 必要なクローンセット数を計算（最低でも3セット）
    const cloneSets = Math.max(3, Math.ceil(slidesNeeded / slideCount));

    // 既存のクローンを削除
    swiperWrapper
      .querySelectorAll(".swiper-slide-clone")
      .forEach(function (clone) {
        clone.remove();
      });

    // クローンを追加
    for (let i = 0; i < cloneSets; i++) {
      slides.forEach(function (slide) {
        const clone = slide.cloneNode(true);
        clone.classList.add("swiper-slide-clone");
        swiperWrapper.appendChild(clone);
      });
    }
  }

  // スライドをクローン
  cloneSlides(".guests-swiper-top");
  cloneSlides(".guests-swiper-bottom");

  // 現在のオフセット値を取得
  let currentOffset = calculateOffset();

  // 上段のSwiper設定
  const swiperTop = new Swiper(".guests-swiper-top", {
    // 基本設定
    slidesPerView: "auto",
    spaceBetween: 20,
    loop: true,
    loopAdditionalSlides: 10,
    loopedSlides: 10,

    // 自動再生設定
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
      waitForTransition: false,
    },

    // スムーズなスライド設定
    speed: 8000,

    // タッチ操作を無効化
    allowTouchMove: false,
    simulateTouch: false,
    grabCursor: false,

    // ブレイクポイント（768px）
    breakpoints: {
      // モバイル（768px以下）
      768: {
        slidesPerView: "auto",
        spaceBetween: 10,
        speed: 6000,
      },
      // デスクトップ（769px以上）
      769: {
        slidesPerView: "auto",
        spaceBetween: 20,
        speed: 8000,
      },
    },
  });

  // 下段のSwiper設定（動的オフセット付き）
  const swiperBottom = new Swiper(".guests-swiper-bottom", {
    // 基本設定
    slidesPerView: "auto",
    spaceBetween: 20,
    loop: true,
    loopAdditionalSlides: 10,
    loopedSlides: 10,

    // 動的オフセットの設定
    slidesOffsetBefore: currentOffset,

    // 自動再生設定
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
      waitForTransition: false,
    },

    // スムーズなスライド設定
    speed: 8000,

    // タッチ操作を無効化
    allowTouchMove: false,
    simulateTouch: false,
    grabCursor: false,

    // ブレイクポイント（768px）
    breakpoints: {
      // モバイル（768px以下）
      768: {
        slidesPerView: "auto",
        spaceBetween: 10,
        slidesOffsetBefore: 64,
        speed: 6000,
      },
      // デスクトップ（769px以上）
      769: {
        slidesPerView: "auto",
        spaceBetween: 20,
        slidesOffsetBefore: currentOffset,
        speed: 8000,
      },
    },
  });

  // オフセット値を動的に更新する関数
  function updateOffset() {
    const newOffset = calculateOffset();

    // オフセット値が変更された場合のみ更新
    if (newOffset !== currentOffset) {
      currentOffset = newOffset;

      // 下段のSwiperのオフセットを更新
      if (swiperBottom && swiperBottom.params) {
        swiperBottom.params.slidesOffsetBefore = currentOffset;

        // 現在の画面幅に応じたブレイクポイント設定も更新
        if (window.innerWidth > BREAKPOINT_MD) {
          swiperBottom.params.breakpoints[769].slidesOffsetBefore =
            currentOffset;
        }

        swiperBottom.update();
      }
    }
  }

  // パフォーマンス最適化：ページ非表示時の処理
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      swiperTop.autoplay.stop();
      swiperBottom.autoplay.stop();
    } else {
      swiperTop.autoplay.start();
      swiperBottom.autoplay.start();
    }
  });

  // ウィンドウリサイズ時の処理
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      // オフセット値を更新
      updateOffset();

      // クローンを再生成
      cloneSlides(".guests-swiper-top");
      cloneSlides(".guests-swiper-bottom");

      // Swiperを更新
      swiperTop.update();
      swiperBottom.update();

      // 自動再生を再開
      swiperTop.autoplay.start();
      swiperBottom.autoplay.start();
    }, 250);
  });

  // デバッグ用：現在のオフセット値を確認
  console.log("Initial settings:", {
    offset: currentOffset.toFixed(2) + "px",
    cardWidth: (currentOffset * 2).toFixed(2) + "px",
    viewportWidth: window.innerWidth + "px",
  });
});
