import { escapeHtml, formatDate, readJson } from "/assets/js/utils.js";
import { getLanguage, t } from "/assets/js/i18n.js";

const PAGE_SIZE = 5;

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function articleMetaText(article) {
  const tags = (article.tags || []).join(", ");
  const locale = getLanguage() === "zh" ? "zh-CN" : "en-US";
  return `${formatDate(article.date, locale)} · ${article.readingTime || 1} ${t("unit_min")} · ${tags}`;
}

export async function renderHomeLatest() {
  const root = document.getElementById("latest-articles");
  if (!root) return;

  const articles = await readJson("/data/articles.json");
  const latest = articles.slice(0, 3);

  root.innerHTML = latest
    .map((article) => {
      const safeTitle = escapeHtml(article.title);
      const safeExcerpt = escapeHtml(article.excerpt || "");
      return `<article class="article-card">
        <h3><a href="/article.html?slug=${encodeURIComponent(article.slug)}">${safeTitle}</a></h3>
        <p class="meta">${escapeHtml(articleMetaText(article))}</p>
        <p>${safeExcerpt}</p>
      </article>`;
    })
    .join("");
}

export async function renderArticleListPage() {
  const root = document.getElementById("articles-container");
  if (!root) return;

  const pagination = document.getElementById("pagination");
  const searchInput = document.getElementById("article-search");
  const tagFilter = document.getElementById("tag-filter");
  const allArticles = await readJson("/data/articles.json");

  const tags = [...new Set(allArticles.flatMap((article) => article.tags || []))];
  let selectedTag = "";
  let searchTerm = "";
  let currentPage = 1;

  function filteredArticles() {
    return allArticles.filter((article) => {
      const byTag = !selectedTag || (article.tags || []).includes(selectedTag);
      const bySearch = !searchTerm
        || article.title.toLowerCase().includes(searchTerm)
        || (article.tags || []).join(" ").toLowerCase().includes(searchTerm);
      return byTag && bySearch;
    });
  }

  function renderTags() {
    tagFilter.innerHTML = tags
      .map((tag) => `<button class="tag-chip ${tag === selectedTag ? "is-active" : ""}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`)
      .join("");

    tagFilter.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        selectedTag = button.dataset.tag === selectedTag ? "" : String(button.dataset.tag);
        currentPage = 1;
        render();
      });
    });
  }

  function render() {
    const filtered = filteredArticles();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    root.innerHTML = pageItems
      .map((article) => `<article class="article-card">
          <h3><a href="/article.html?slug=${encodeURIComponent(article.slug)}">${escapeHtml(article.title)}</a></h3>
          <p class="meta">${escapeHtml(articleMetaText(article))}</p>
          <p>${escapeHtml(article.excerpt || "")}</p>
        </article>`)
      .join("") || `<article class="article-card">${escapeHtml(t("article_no_results"))}</article>`;

    pagination.innerHTML = `
      <button ${currentPage <= 1 ? "disabled" : ""} data-page="prev">${escapeHtml(t("pager_prev"))}</button>
      <span>${escapeHtml(t("pager_page"))} ${currentPage} / ${totalPages}</span>
      <button ${currentPage >= totalPages ? "disabled" : ""} data-page="next">${escapeHtml(t("pager_next"))}</button>
    `;

    pagination.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        currentPage += button.dataset.page === "prev" ? -1 : 1;
        render();
      });
    });

    renderTags();
  }

  searchInput?.addEventListener("input", () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    currentPage = 1;
    render();
  });

  render();
}

function buildToc(markdownHtml) {
  const temp = document.createElement("div");
  temp.innerHTML = markdownHtml;
  const headings = [...temp.querySelectorAll("h2, h3")];

  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `section-${index + 1}`;
    }
  });

  const toc = headings.map((heading) => ({
    level: heading.tagName,
    id: heading.id,
    text: heading.textContent || "",
  }));

  return {
    html: temp.innerHTML,
    toc,
  };
}

export async function renderArticleDetailPage() {
  const container = document.getElementById("article-content");
  if (!container) return;

  const tocContainer = document.getElementById("article-toc");
  const navContainer = document.getElementById("article-nav");
  const slug = getQueryParam("slug");

  if (!slug) {
    container.innerHTML = `<h1>${escapeHtml(t("article_not_found"))}</h1><p>${escapeHtml(t("article_missing_slug"))}</p>`;
    return;
  }

  const [articles, map] = await Promise.all([
    readJson("/data/articles.json"),
    readJson("/data/article-map.json"),
  ]);

  const article = articles.find((item) => item.slug === slug);
  const html = map[slug];

  if (!article || !html) {
    container.innerHTML = `<h1>${escapeHtml(t("article_not_found"))}</h1><p>${escapeHtml(t("article_could_not_load"))}</p>`;
    return;
  }

  const { html: updatedHtml, toc } = buildToc(html);
  document.title = `${article.title} | Drluffy`;

  container.innerHTML = `
    <header>
      <h1>${escapeHtml(article.title)}</h1>
      <p class="meta">${escapeHtml(articleMetaText(article))}</p>
      <ul class="chip-list">${(article.tags || []).map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>
    </header>
    <section>${updatedHtml}</section>
  `;

  tocContainer.innerHTML = toc
    .map((item) => `<a href="#${escapeHtml(item.id)}" style="padding-left:${item.level === "H3" ? "0.75rem" : "0"}">${escapeHtml(item.text)}</a>`)
    .join("");

  const index = articles.findIndex((item) => item.slug === slug);
  const prev = articles[index + 1];
  const next = articles[index - 1];
  navContainer.innerHTML = `
    <a href="${prev ? `/article.html?slug=${encodeURIComponent(prev.slug)}` : "/articles.html"}">${prev ? `${escapeHtml(t("article_prev_prefix"))} ${escapeHtml(prev.title)}` : escapeHtml(t("article_back"))}</a>
    <a href="${next ? `/article.html?slug=${encodeURIComponent(next.slug)}` : "/articles.html"}">${next ? `${escapeHtml(t("article_next_prefix"))} ${escapeHtml(next.title)}` : escapeHtml(t("article_back"))}</a>
  `;
}
