import { getState, setState } from "/assets/js/state.js";
import { getLanguage, t } from "/assets/js/i18n.js";

function normalizeGalleryItem(item) {
  if (typeof item === "string") {
    return { src: item, alt: "", altZh: "", caption: "", captionZh: "" };
  }
  return {
    src: item?.src || "",
    alt: item?.alt || "",
    altZh: item?.altZh || "",
    caption: item?.caption || "",
    captionZh: item?.captionZh || "",
  };
}

export function setupIdleSlideshow({ overlay, stage, frame, image, caption, prevButton, nextButton, exitButton, lightbox, lightboxImage, lightboxClose, catSpeaker, config }) {
  if (!overlay || !stage || !frame || !image || !caption || !prevButton || !nextButton || !exitButton || !lightbox || !lightboxImage || !lightboxClose) {
    return;
  }

  if (Array.isArray(config?.greetings) && config.greetings.length > 0) {
    setState("greetings", config.greetings);
  }
  if (typeof config?.idleTimeoutMs === "number") {
    setState("idleTimeoutMs", config.idleTimeoutMs);
  }
  if (typeof config?.slideshowIntervalMs === "number") {
    setState("slideshowIntervalMs", config.slideshowIntervalMs);
  }

  let photos = Array.isArray(config?.gallery) ? config.gallery.map(normalizeGalleryItem).filter((item) => item.src) : [];
  let idleTimer = null;
  let slideshowTimer = null;
  let index = 0;
  let touchStartX = 0;

  function slideText(item) {
    if (!item) {
      return t("slideshow_empty");
    }
    const lang = getLanguage();
    return lang === "zh"
      ? item.captionZh || item.caption || item.altZh || item.alt || ""
      : item.caption || item.captionZh || item.alt || item.altZh || "";
  }

  function updateFrameRatio() {
    if (image.naturalWidth && image.naturalHeight) {
      frame.style.aspectRatio = `${image.naturalWidth} / ${image.naturalHeight}`;
    }
  }

  function renderSlide(nextIndex = index) {
    if (photos.length === 0) {
      image.removeAttribute("src");
      image.alt = "";
      caption.textContent = t("slideshow_empty");
      frame.style.aspectRatio = "16 / 10";
      return;
    }

    index = (nextIndex + photos.length) % photos.length;
    const current = photos[index];
    const lang = getLanguage();
    image.src = current.src;
    image.alt = lang === "zh" ? current.altZh || current.alt || "" : current.alt || current.altZh || "";
    caption.textContent = slideText(current);
  }

  image.addEventListener("load", updateFrameRatio);

  function restartAutoplay() {
    window.clearInterval(slideshowTimer);
    slideshowTimer = null;
    if (photos.length > 1) {
      const state = getState();
      slideshowTimer = window.setInterval(() => renderSlide(index + 1), state.slideshowIntervalMs);
    }
  }

  function startSlideshow() {
    setState("mode", "slideshow");
    overlay.classList.add("is-active");
    overlay.setAttribute("aria-hidden", "false");
    renderSlide(index);
    restartAutoplay();
  }

  function stopSlideshow() {
    overlay.classList.remove("is-active");
    overlay.setAttribute("aria-hidden", "true");
    setState("mode", "normal");
    window.clearInterval(slideshowTimer);
    slideshowTimer = null;

    const greetings = getState().greetings;
    if (catSpeaker && greetings.length > 0) {
      const message = greetings[Math.floor(Math.random() * greetings.length)];
      catSpeaker(message);
    }
  }

  function resetIdleTimer() {
    const state = getState();
    window.clearTimeout(idleTimer);
    if (overlay.classList.contains("is-active")) {
      return;
    }
    idleTimer = window.setTimeout(startSlideshow, state.idleTimeoutMs);
  }

  prevButton.addEventListener("click", () => {
    renderSlide(index - 1);
    restartAutoplay();
  });

  nextButton.addEventListener("click", () => {
    renderSlide(index + 1);
    restartAutoplay();
  });

  stage.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0]?.clientX || 0;
  }, { passive: true });

  stage.addEventListener("touchend", (event) => {
    const endX = event.changedTouches[0]?.clientX || 0;
    const deltaX = endX - touchStartX;
    if (Math.abs(deltaX) < 40) {
      return;
    }
    renderSlide(deltaX > 0 ? index - 1 : index + 1);
    restartAutoplay();
  }, { passive: true });

  image.addEventListener("click", () => {
    if (!image.src) {
      return;
    }
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightbox.classList.add("is-active");
    lightbox.setAttribute("aria-hidden", "false");
  });

  lightboxClose.addEventListener("click", () => {
    lightbox.classList.remove("is-active");
    lightbox.setAttribute("aria-hidden", "true");
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      lightbox.classList.remove("is-active");
      lightbox.setAttribute("aria-hidden", "true");
    }
  });

  exitButton.addEventListener("click", () => {
    stopSlideshow();
    resetIdleTimer();
  });

  window.addEventListener("lang:change", () => renderSlide(index));

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      lightbox.classList.remove("is-active");
      lightbox.setAttribute("aria-hidden", "true");
    }
  });

  ["mousemove", "keydown", "mousedown", "touchstart", "wheel", "scroll"].forEach((eventName) => {
    window.addEventListener(eventName, resetIdleTimer, { passive: true });
  });

  resetIdleTimer();
}
