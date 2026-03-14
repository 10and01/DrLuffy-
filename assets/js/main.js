import { createParticleSystem } from "/assets/js/particles.js";
import { setupWallpaper } from "/assets/js/wallpaper.js";
import { setupCatScroll } from "/assets/js/cat-scroll.js";
import { setupIdleSlideshow } from "/assets/js/idle-slideshow.js";
import { setupNavReveal } from "/assets/js/nav.js";
import { renderArticleDetailPage, renderArticleListPage, renderHomeLatest } from "/assets/js/articles.js";
import { setupLanguageToggle } from "/assets/js/i18n.js";
import { loadSiteConfig } from "/assets/js/site-config.js";
import { setupThemeToggle } from "/assets/js/theme.js";
import { setupVisitCounter } from "/assets/js/visits.js";

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function typeInto(element, fullText, speedMs = 28) {
  element.textContent = "";
  for (let i = 0; i < fullText.length; i += 1) {
    element.textContent += fullText[i];
    await wait(speedMs);
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

async function playEntryTyping(gate, entryConfig) {
  const title = gate.querySelector(".entry-title");
  const subtitle = gate.querySelector(".entry-subtitle");
  if (!title || !subtitle) {
    return;
  }

  const fullTitle = title.textContent || "";
  const fullSubtitle = subtitle.textContent || "";
  await typeInto(title, fullTitle, entryConfig.titleTypeSpeedMs);
  await wait(entryConfig.subtitleDelayMs);
  await typeInto(subtitle, fullSubtitle, entryConfig.subtitleTypeSpeedMs);
}

function setupEntryGate(config) {
  const gate = document.getElementById("entry-gate");
  const exploreButton = document.getElementById("explore-button");
  const html = document.documentElement;

  const entryConfig = {
    titleTypeSpeedMs: Number(config?.entry?.titleTypeSpeedMs) || 38,
    subtitleTypeSpeedMs: Number(config?.entry?.subtitleTypeSpeedMs) || 18,
    subtitleDelayMs: Number(config?.entry?.subtitleDelayMs) || 180,
    blinkMinOpacity: clamp(Number(config?.entry?.blinkMinOpacity ?? 0.45), 0.05, 0.95),
    blinkGlowAlpha: clamp(Number(config?.entry?.blinkGlowAlpha ?? 0.55), 0, 1),
    blinkGlowSizePx: clamp(Number(config?.entry?.blinkGlowSizePx ?? 10), 2, 24),
    leaveDurationMs: Number(config?.entry?.leaveDurationMs) || 430,
  };

  if (!gate || !exploreButton) {
    html.classList.remove("drluffy-gate-pending");
    document.body.classList.add("is-entered");
    return;
  }

  gate.style.setProperty("--entry-blink-min-opacity", String(entryConfig.blinkMinOpacity));
  gate.style.setProperty("--entry-blink-glow-size", `${entryConfig.blinkGlowSizePx}px`);
  gate.style.setProperty("--entry-blink-glow", `rgba(118, 221, 255, ${entryConfig.blinkGlowAlpha})`);

  if (config.enableExploreGate === false) {
    html.classList.remove("drluffy-gate-pending");
    document.body.classList.add("is-entered");
    gate.setAttribute("aria-hidden", "true");
    return;
  }

  const sessionKey = "drluffy.exploreSessionSeen";
  const sessionSeen = sessionStorage.getItem(sessionKey) === "1";
  if (sessionSeen) {
    html.classList.remove("drluffy-gate-pending");
    document.body.classList.add("is-entered");
    gate.setAttribute("aria-hidden", "true");
    return;
  }

  html.classList.add("drluffy-gate-pending");
  document.body.classList.remove("is-entered");
  gate.setAttribute("aria-hidden", "false");
  void playEntryTyping(gate, entryConfig);

  window.addEventListener("lang:change", () => {
    if (!document.body.classList.contains("is-entered")) {
      void playEntryTyping(gate, entryConfig);
    }
  });

  exploreButton.addEventListener("click", () => {
    sessionStorage.setItem(sessionKey, "1");
    gate.classList.add("is-leaving");
    window.setTimeout(() => {
      html.classList.remove("drluffy-gate-pending");
      document.body.classList.add("is-entered");
      gate.setAttribute("aria-hidden", "true");
      gate.classList.remove("is-leaving");
    }, entryConfig.leaveDurationMs);
  });
}

function initInteractions(config) {
  setupLanguageToggle(document.getElementById("lang-toggle"));
  setupThemeToggle({
    toggle: document.getElementById("theme-toggle"),
    initialTheme: config.theme,
  });

  setupEntryGate(config);

  createParticleSystem(document.getElementById("particle-canvas"), {
    particles: config.particles,
  });

  const catApi = setupCatScroll({
    rope: document.getElementById("cat-rope"),
    food: document.getElementById("cat-food"),
    cat: document.getElementById("cat-character"),
    catSvg: document.getElementById("cat-svg"),
    bubble: document.getElementById("cat-bubble"),
    config,
  });

  setupWallpaper({
    layer: document.getElementById("wallpaper-layer"),
    config,
  });

  if (config.enableIdleSlideshow !== false) {
    setupIdleSlideshow({
      overlay: document.getElementById("idle-overlay"),
      stage: document.getElementById("slideshow-stage"),
      frame: document.getElementById("slideshow-frame"),
      image: document.getElementById("slideshow-image"),
      caption: document.getElementById("slideshow-caption"),
      prevButton: document.getElementById("slideshow-prev"),
      nextButton: document.getElementById("slideshow-next"),
      exitButton: document.getElementById("exit-slideshow"),
      lightbox: document.getElementById("lightbox"),
      lightboxImage: document.getElementById("lightbox-image"),
      lightboxClose: document.getElementById("lightbox-close"),
      catSpeaker: (message) => catApi?.speak(message),
      config,
    });
  }

  setupNavReveal(document.getElementById("site-header"));
  void setupVisitCounter(config);
}

async function renderByPage(page) {
  if (page === "home") {
    await renderHomeLatest();
  }
  if (page === "articles") {
    await renderArticleListPage();
  }
  if (page === "article") {
    await renderArticleDetailPage();
  }
}

async function initPage() {
  const config = await loadSiteConfig();
  initInteractions(config);

  const page = document.body.dataset.page;
  await renderByPage(page);

  window.addEventListener("lang:change", async () => {
    await renderByPage(page);
  });
}

initPage().catch((error) => {
  console.error(error);
});
