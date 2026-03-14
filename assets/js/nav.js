export function setupNavReveal(header) {
  if (!header) {
    return;
  }

  let visible = window.matchMedia("(max-width: 700px)").matches;
  if (visible) {
    header.classList.add("is-visible");
  }

  const onMove = (event) => {
    const nearTop = event.clientY < 100;
    const nearHeader = event.clientY < 160 && event.clientX > window.innerWidth * 0.15 && event.clientX < window.innerWidth * 0.85;
    const shouldShow = nearTop || nearHeader;
    header.classList.toggle("is-visible", shouldShow || visible);
  };

  const onResize = () => {
    visible = window.matchMedia("(max-width: 700px)").matches;
    header.classList.toggle("is-visible", visible);
  };

  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("resize", onResize);
}
