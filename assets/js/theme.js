const THEME_STORAGE = "drluffy.theme";

function safeTheme(value) {
  return value === "day" ? "day" : "night";
}

export function getTheme() {
  return safeTheme(document.body.dataset.theme || "night");
}

export function setupThemeToggle({ toggle, initialTheme = "night" }) {
  const stored = localStorage.getItem(THEME_STORAGE);
  let currentTheme = safeTheme(stored || initialTheme);

  function applyTheme(theme) {
    currentTheme = safeTheme(theme);
    document.body.dataset.theme = currentTheme;
    if (toggle) {
      toggle.checked = currentTheme === "day";
    }
    localStorage.setItem(THEME_STORAGE, currentTheme);
    window.dispatchEvent(new CustomEvent("theme:change", { detail: currentTheme }));
  }

  applyTheme(currentTheme);

  toggle?.addEventListener("change", () => {
    applyTheme(toggle.checked ? "day" : "night");
  });

  return {
    getTheme: () => currentTheme,
    setTheme: applyTheme,
  };
}
