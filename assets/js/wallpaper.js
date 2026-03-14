export function setupWallpaper({ layer, config }) {
  if (!layer) {
    return;
  }

  function applyWallpaper(theme) {
    const wallpaper = config?.wallpaper?.[theme] || config?.wallpaper?.default || "";
    layer.style.backgroundImage = wallpaper ? `url(${wallpaper})` : "none";
  }

  applyWallpaper(document.body.dataset.theme || config?.theme || "night");
  window.addEventListener("theme:change", (event) => applyWallpaper(event.detail));
}
