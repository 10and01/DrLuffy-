#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const postsDir = path.join(root, "content", "posts");
const dataDir = path.join(root, "data");

function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) {
    throw new Error("Missing frontmatter block.");
  }

  const endIndex = raw.indexOf("\n---", 4);
  if (endIndex < 0) {
    throw new Error("Invalid frontmatter delimiter.");
  }

  const frontmatterRaw = raw.slice(3, endIndex).trim();
  const body = raw.slice(endIndex + 4).trim();
  const meta = {};

  for (const line of frontmatterRaw.split("\n")) {
    const divider = line.indexOf(":");
    if (divider < 0) continue;

    const key = line.slice(0, divider).trim();
    let value = line.slice(divider + 1).trim();

    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((entry) => entry.trim().replace(/^\"|\"$/g, "").replace(/^'|'$/g, ""))
        .filter(Boolean);
    } else {
      value = value.replace(/^\"|\"$/g, "").replace(/^'|'$/g, "");
    }

    meta[key] = value;
  }

  return { meta, body };
}

function markdownToHtml(markdown) {
  const lines = markdown.split("\n");
  const html = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      closeList();
      html.push(`<h3>${trimmed.slice(4)}</h3>`);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      closeList();
      html.push(`<h2>${trimmed.slice(3)}</h2>`);
      continue;
    }

    if (trimmed.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${trimmed.slice(2)}</li>`);
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      closeList();
      html.push(`<p>${trimmed}</p>`);
      continue;
    }

    closeList();
    html.push(`<p>${trimmed}</p>`);
  }

  closeList();
  return html.join("\n");
}

function estimateReadingTime(markdown) {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function build() {
  ensureDataDir();

  const files = fs.readdirSync(postsDir).filter((name) => name.endsWith(".md"));
  const articles = [];
  const articleMap = {};

  for (const file of files) {
    const fullPath = path.join(postsDir, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { meta, body } = parseFrontmatter(raw);

    const slug = meta.slug || file.replace(/\.md$/, "");
    const html = markdownToHtml(body);

    articles.push({
      slug,
      title: meta.title || slug,
      date: meta.date || "1970-01-01",
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      excerpt: meta.excerpt || "",
      cover: meta.cover || "",
      readingTime: estimateReadingTime(body),
    });

    articleMap[slug] = html;
  }

  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.writeFileSync(path.join(dataDir, "articles.json"), `${JSON.stringify(articles, null, 2)}\n`);
  fs.writeFileSync(path.join(dataDir, "article-map.json"), `${JSON.stringify(articleMap, null, 2)}\n`);

  console.log(`Built ${articles.length} articles.`);
}

build();
