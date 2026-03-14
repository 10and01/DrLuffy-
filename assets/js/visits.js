import { getLanguage, t } from "/assets/js/i18n.js";

const LOCAL_FALLBACK_KEY = "drluffy.localVisitCount";

function formatCount(value) {
  const locale = getLanguage() === "zh" ? "zh-CN" : "en-US";
  return Number(value).toLocaleString(locale);
}

async function fetchCountApi(namespace, key) {
  const response = await fetch(`https://api.countapi.xyz/hit/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`);
  if (!response.ok) {
    throw new Error("countapi request failed");
  }
  const payload = await response.json();
  if (typeof payload.value !== "number") {
    throw new Error("countapi response missing value");
  }
  return payload.value;
}

function bumpLocalCount() {
  const current = Number(localStorage.getItem(LOCAL_FALLBACK_KEY) || "0") || 0;
  const next = current + 1;
  localStorage.setItem(LOCAL_FALLBACK_KEY, String(next));
  return next;
}

export async function setupVisitCounter(config) {
  const counter = document.getElementById("visit-count");
  if (!counter) {
    return;
  }

  if (config?.visits?.enabled === false) {
    counter.textContent = t("footer_disabled");
    return;
  }

  const provider = config?.visits?.provider || "countapi";

  try {
    let value;
    if (provider === "countapi") {
      const namespace = config?.visits?.namespace || "drluffy";
      const key = config?.visits?.key || "site";
      value = await fetchCountApi(namespace, key);
    } else {
      value = bumpLocalCount();
    }
    counter.textContent = formatCount(value);
  } catch {
    const localValue = bumpLocalCount();
    counter.textContent = `${formatCount(localValue)} (${t("footer_local")})`;
  }

  window.addEventListener("lang:change", () => {
    const numeric = Number(String(counter.textContent).replace(/[^\d]/g, ""));
    if (Number.isFinite(numeric) && numeric > 0) {
      const hasLocalTag = counter.textContent.includes("(");
      counter.textContent = hasLocalTag ? `${formatCount(numeric)} (${t("footer_local")})` : formatCount(numeric);
    }
  });
}
