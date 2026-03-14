import { throttle } from "/assets/js/utils.js";
import { t } from "/assets/js/i18n.js";

export function setupCatScroll({ rope, food, cat, catSvg, bubble, config }) {
  if (!rope || !food || !cat || !bubble) {
    return;
  }

  let hasCelebratedBottom = false;
  let virtualProgress = 0;

  if (catSvg) {
    const svgPath = config?.cat?.svg?.trim();
    if (svgPath) {
      catSvg.src = svgPath;
      catSvg.hidden = false;
      cat.classList.add("is-hidden");
    } else {
      catSvg.hidden = true;
      cat.classList.remove("is-hidden");
    }
  }

  function showBubble(message) {
    bubble.textContent = message;
    bubble.classList.add("is-visible");
    window.setTimeout(() => bubble.classList.remove("is-visible"), 1800);
  }

  function updateByProgress(progress) {
    const scrollTop = window.scrollY;
    const maxScrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ropeHeight = 90 + progress * 150;
    const catLift = progress * 10;

    rope.style.height = `${ropeHeight.toFixed(0)}px`;
    food.style.top = `${24 + ropeHeight - 2}px`;
    cat.style.transform = `translateY(${-catLift}px)`;
    if (catSvg && !catSvg.hidden) {
      catSvg.style.transform = `translateY(${-catLift}px)`;
    }

    if (progress > 0.99 && !hasCelebratedBottom) {
      hasCelebratedBottom = true;
      cat.classList.remove("is-jumping");
      catSvg?.classList.remove("is-jumping");
      void cat.offsetWidth;
      cat.classList.add("is-jumping");
      catSvg?.classList.add("is-jumping");
      showBubble(t("cat_munch"));
    }

    if (progress < 0.95) {
      hasCelebratedBottom = false;
    }
  }

  function currentProgress() {
    const maxScrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScrollable > 24) {
      return Math.max(0, Math.min(1, window.scrollY / maxScrollable));
    }
    return virtualProgress;
  }

  const onScroll = throttle(() => {
    updateByProgress(currentProgress());
  }, 20);

  const onWheel = throttle((event) => {
    const maxScrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScrollable > 24) {
      return;
    }
    virtualProgress = Math.max(0, Math.min(1, virtualProgress + event.deltaY / 900));
    updateByProgress(virtualProgress);
  }, 16);

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("wheel", onWheel, { passive: true });
  onScroll();

  return {
    speak(message) {
      showBubble(message);
    },
  };
}
