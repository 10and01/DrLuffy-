export function throttle(fn, waitMs) {
  let last = 0;
  let pending = null;

  return (...args) => {
    const now = Date.now();
    const remaining = waitMs - (now - last);

    if (remaining <= 0) {
      last = now;
      fn(...args);
      return;
    }

    if (pending) {
      return;
    }

    pending = setTimeout(() => {
      last = Date.now();
      pending = null;
      fn(...args);
    }, remaining);
  };
}

export function formatDate(input, locale = "en-US") {
  const value = new Date(input);
  return value.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function readJson(url) {
  return fetch(url, { cache: "no-store" }).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }
    return res.json();
  });
}

export function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
