gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", function () {
  // 単一のオーバーレイ要素を作成
  const backgroundOverlay = document.createElement("div");
  backgroundOverlay.className = "background-overlay";
  document.body.appendChild(backgroundOverlay);

  // オーバーレイの初期設定
  gsap.set(backgroundOverlay, {
    opacity: 0,
    "--bg-color": "rgba(255, 255, 255, 0.50)",
    "--blur-amount": "15px",
  });

  // 要素の存在を確認する関数
  function elementExists(selector) {
    return document.querySelector(selector) !== null;
  }

  // 初期スクロール位置をチェックして、適切な状態に設定
  function checkInitialPosition() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const introElement = document.querySelector(".introduction");

    if (introElement) {
      const introRect = introElement.getBoundingClientRect();
      const introTop = introRect.top + scrollY;
      const windowHeight = window.innerHeight;

      // introductionセクションが画面内にある場合のみブラーを表示
      if (scrollY + windowHeight > introTop) {
        // 初期状態でintroductionが見えている場合
        gsap.set(backgroundOverlay, {
          opacity: 1,
          "--bg-color": "rgba(255, 255, 255, 0.50)",
          "--blur-amount": "15px",
        });
      }
    }
  }

  // 初期位置チェックを少し遅延させて実行（DOMの完全読み込みを待つ）
  setTimeout(checkInitialPosition, 100);

  // introductionセクションでオーバーレイを表示（存在確認付き）
  if (elementExists(".introduction") && elementExists(".footer")) {
    ScrollTrigger.create({
      trigger: ".introduction",
      start: "top bottom",
      endTrigger: ".footer",
      end: "top bottom",
      onEnter: () => {
        gsap.to(backgroundOverlay, {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        });
      },
      onLeave: () => {
        gsap.to(backgroundOverlay, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        });
      },
      onEnterBack: () => {
        gsap.to(backgroundOverlay, {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        });
      },
      onLeaveBack: () => {
        gsap.to(backgroundOverlay, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        });
      },
    });
  }

  // 各セクションの設定（存在する場合のみ適用）

  // introductionセクション
  if (elementExists(".introduction")) {
    ScrollTrigger.create({
      trigger: ".introduction",
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        gsap.to(backgroundOverlay, {
          "--bg-color": "rgba(255, 255, 255, 0.50)",
          "--blur-amount": "15px",
          duration: 0.6,
          ease: "power2.inOut",
        });
      },
      onEnterBack: () => {
        gsap.to(backgroundOverlay, {
          "--bg-color": "rgba(255, 255, 255, 0.50)",
          "--blur-amount": "15px",
          duration: 0.6,
          ease: "power2.inOut",
        });
      },
    });
  }

  // main-contentsセクション（デフォルト設定）
  if (elementExists(".main-contents")) {
    ScrollTrigger.create({
      trigger: ".main-contents",
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        gsap.to(backgroundOverlay, {
          "--bg-color": "rgba(255, 255, 255, 0.50)",
          "--blur-amount": "15px",
          duration: 0.6,
          ease: "power2.inOut",
        });
      },
      onEnterBack: () => {
        gsap.to(backgroundOverlay, {
          "--bg-color": "rgba(255, 255, 255, 0.50)",
          "--blur-amount": "15px",
          duration: 0.6,
          ease: "power2.inOut",
        });
      },
    });
  }

  // side-eventsセクション（デフォルト設定）
  if (elementExists(".side-events")) {
    ScrollTrigger.create({
      trigger: ".side-events",
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        gsap.to(backgroundOverlay, {
          "--bg-color": "rgba(255, 255, 255, 0.50)",
          "--blur-amount": "15px",
          duration: 0.6,
          ease: "power2.inOut",
        });
      },
      onEnterBack: () => {
        gsap.to(backgroundOverlay, {
          "--bg-color": "rgba(255, 255, 255, 0.50)",
          "--blur-amount": "15px",
          duration: 0.6,
          ease: "power2.inOut",
        });
      },
    });
  }

  // guestsセクションの設定
  if (elementExists(".guests")) {
    ScrollTrigger.create({
      trigger: ".guests",
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        gsap.to(backgroundOverlay, {
          "--bg-color": "rgba(156, 182, 223, 0.30)",
          "--blur-amount": "25px",
          duration: 0.8,
          ease: "power2.inOut",
        });
      },
      onLeave: () => {
        gsap.to(backgroundOverlay, {
          "--bg-color": "rgba(255, 255, 255, 0.50)",
          "--blur-amount": "15px",
          duration: 0.8,
          ease: "power2.inOut",
        });
      },
      onEnterBack: () => {
        gsap.to(backgroundOverlay, {
          "--bg-color": "rgba(156, 182, 223, 0.30)",
          "--blur-amount": "25px",
          duration: 0.8,
          ease: "power2.inOut",
        });
      },
      onLeaveBack: () => {
        gsap.to(backgroundOverlay, {
          "--bg-color": "rgba(255, 255, 255, 0.50)",
          "--blur-amount": "15px",
          duration: 0.8,
          ease: "power2.inOut",
        });
      },
    });
  }

  // partnersセクション（デフォルト設定）
  if (elementExists(".partners")) {
    ScrollTrigger.create({
      trigger: ".partners",
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        gsap.to(backgroundOverlay, {
          "--bg-color": "rgba(255, 255, 255, 0.50)",
          "--blur-amount": "15px",
          duration: 0.8,
          ease: "power2.inOut",
        });
      },
      onEnterBack: () => {
        gsap.to(backgroundOverlay, {
          "--bg-color": "rgba(255, 255, 255, 0.50)",
          "--blur-amount": "15px",
          duration: 0.8,
          ease: "power2.inOut",
        });
      },
    });
  }

  // outlineセクション（ブラーと背景を解除）
  if (elementExists(".outline")) {
    ScrollTrigger.create({
      trigger: ".outline",
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        gsap.to(backgroundOverlay, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
        });
      },
      onLeave: () => {
        gsap.to(backgroundOverlay, {
          opacity: 1,
          "--bg-color": "rgba(255, 255, 255, 0.50)",
          "--blur-amount": "15px",
          duration: 0.8,
          ease: "power2.inOut",
        });
      },
      onEnterBack: () => {
        gsap.to(backgroundOverlay, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
        });
      },
      onLeaveBack: () => {
        gsap.to(backgroundOverlay, {
          opacity: 1,
          "--bg-color": "rgba(255, 255, 255, 0.50)",
          "--blur-amount": "15px",
          duration: 0.8,
          ease: "power2.inOut",
        });
      },
    });
  }

  // achievementセクション（デフォルト設定）
  if (elementExists(".achievement")) {
    ScrollTrigger.create({
      trigger: ".achievement",
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        gsap.to(backgroundOverlay, {
          opacity: 1,
          "--bg-color": "rgba(255, 255, 255, 0.50)",
          "--blur-amount": "15px",
          duration: 0.8,
          ease: "power2.inOut",
        });
      },
      onEnterBack: () => {
        gsap.to(backgroundOverlay, {
          opacity: 1,
          "--bg-color": "rgba(255, 255, 255, 0.50)",
          "--blur-amount": "15px",
          duration: 0.8,
          ease: "power2.inOut",
        });
      },
    });
  }

  // ScrollTriggerのリフレッシュ（レイアウト変更に対応）
  ScrollTrigger.refresh();
});
