#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const postsDir = path.join(root, "content", "posts");
const reservedPages = new Set(["index", "about", "articles", "article"]);

function runNode(script, extraArgs = []) {
  const scriptPath = path.join(root, "scripts", script);
  return spawnSync(process.execPath, [scriptPath, ...extraArgs], {
    cwd: root,
    stdio: "inherit",
  });
}

function runNpmInstall() {
  const command = process.platform === "win32" ? "npm.cmd install --no-audit --no-fund" : "npm install --no-audit --no-fund";
  const result = spawnSync(command, {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });

  if (result.error) {
    console.error("[Drluffy] npm install failed to start:", result.error.message);
  }

  return result;
}

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseOption(args, key) {
  const full = `--${key}=`;
  const inline = args.find((arg) => arg.startsWith(full));
  if (inline) {
    return inline.slice(full.length).trim();
  }

  const index = args.findIndex((arg) => arg === `--${key}`);
  if (index >= 0 && args[index + 1]) {
    return args[index + 1].trim();
  }

  return "";
}

function createArticle(args) {
  const title = parseOption(args, "title") || parseOption(args, "t") || args.filter((arg) => !arg.startsWith("--")).join(" ").trim();
  if (!title) {
    console.error("[Drluffy] missing title. Example: Luffy create-article --title \"My New Post\"");
    process.exit(1);
  }

  const lang = (parseOption(args, "lang") || "en").toLowerCase() === "zh" ? "zh" : "en";
  const date = new Date().toISOString().slice(0, 10);
  const slug = parseOption(args, "slug") || slugify(title) || `post-${Date.now()}`;
  const filePath = path.join(postsDir, `${date}-${slug}.md`);

  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    console.error(`[Drluffy] article already exists: ${path.basename(filePath)}`);
    process.exit(1);
  }

  const excerpt = lang === "zh"
    ? "在这里写一段摘要。"
    : "Write a short excerpt here.";

  const content = `---\ntitle: \"${title.replace(/\"/g, "'")}\"\ndate: ${date}\ntags: [\"General\"]\nexcerpt: \"${excerpt}\"\ncover: \"/assets/images/covers/${slug}.jpg\"\nslug: \"${slug}\"\n---\n\n## ${lang === "zh" ? "前言" : "Intro"}\n\n${lang === "zh" ? "开始写你的内容..." : "Start writing your content..."}\n`;

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`[Drluffy] created: ${path.relative(root, filePath)}`);
  const result = runNode("build-content.js");
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function normalizePageName(input) {
  return slugify(input || "").replace(/\.html$/i, "");
}

function pageTemplate(pageName, title) {
  const prettyTitle = title || pageName.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script>
    try {
      if (sessionStorage.getItem("drluffy.exploreSessionSeen") !== "1") {
        document.documentElement.classList.add("drluffy-gate-pending");
      }
    } catch {
      document.documentElement.classList.add("drluffy-gate-pending");
    }
  </script>
  <title>${prettyTitle} | Drluffy</title>
  <link rel="stylesheet" href="/assets/css/tokens.css">
  <link rel="stylesheet" href="/assets/css/main.css">
</head>
<body data-page="custom">
  <canvas id="particle-canvas" aria-hidden="true"></canvas>
  <div class="wallpaper-layer" id="wallpaper-layer" aria-hidden="true"></div>

  <section id="entry-gate" class="entry-gate" aria-hidden="false">
    <div class="entry-gate-panel glass-panel">
      <p class="eyebrow entry-status" data-i18n="entry_label">System Ready</p>
      <h1 class="entry-title" data-i18n="entry_title">Drluffy</h1>
      <p class="subtitle entry-subtitle" data-i18n="entry_subtitle">A futuristic personal space is waiting behind this portal.</p>
      <button id="explore-button" class="btn btn-primary" data-i18n="entry_explore">Explore</button>
    </div>
  </section>

  <header class="site-header" id="site-header">
    <div class="brand">Drluffy</div>
    <nav class="main-nav" id="main-nav" aria-label="Main navigation">
      <a href="/index.html" data-i18n="nav_home">Home</a>
      <a href="/about.html" data-i18n="nav_about">About</a>
      <a href="/articles.html" data-i18n="nav_articles">Articles</a>
      <a href="/${pageName}.html" class="active">${prettyTitle}</a>
    </nav>
    <div class="header-actions">
      <label class="theme-switch" for="theme-toggle" data-i18n-title="theme_toggle_title">
        <span class="theme-icon" aria-hidden="true">&#9728;</span>
        <input id="theme-toggle" class="theme-switch-input" type="checkbox" role="switch">
        <span class="theme-switch-track"><span class="theme-switch-thumb"></span></span>
        <span class="theme-icon" aria-hidden="true">&#9790;</span>
      </label>
      <button id="lang-toggle" class="btn btn-secondary lang-toggle" data-i18n="lang_toggle">中文</button>
    </div>
  </header>

  <main class="page-shell">
    <section class="glass-panel">
      <h1>${prettyTitle}</h1>
      <p>This page was created by <code>Luffy create-page</code>. Customize the content as needed.</p>
    </section>
  </main>

  <footer class="site-footer glass-panel" aria-label="Site statistics">
    <span data-i18n="footer_visits">Visits</span>
    <strong id="visit-count">-</strong>
  </footer>

  <aside id="cat-widget" class="cat-widget" aria-label="Scroll assistant cat">
    <div class="pulley"></div>
    <div class="rope" id="cat-rope"></div>
    <div class="food" id="cat-food"></div>
    <img class="cat-svg" id="cat-svg" alt="">
    <div class="cat" id="cat-character"><span class="cat-ears"></span><span class="cat-eyes"></span></div>
    <div class="cat-bubble" id="cat-bubble" aria-live="polite"></div>
  </aside>

  <section class="idle-overlay" id="idle-overlay" aria-hidden="true">
    <div class="idle-content glass-panel">
      <header>
        <h2 data-i18n="slideshow_title">Photo Showcase</h2>
        <div class="inline-actions">
          <button id="slideshow-prev" class="btn btn-secondary" data-i18n="slideshow_prev">Prev</button>
          <button id="slideshow-next" class="btn btn-secondary" data-i18n="slideshow_next">Next</button>
          <button id="exit-slideshow" class="btn btn-primary" data-i18n="slideshow_exit">Exit</button>
        </div>
      </header>
      <div id="slideshow-stage" class="slideshow-stage">
        <div id="slideshow-frame" class="slideshow-frame">
          <img id="slideshow-image" class="slideshow-image" alt="">
        </div>
      </div>
      <p id="slideshow-caption" class="slideshow-caption"></p>
      <p class="slideshow-hint" data-i18n="slideshow_hint">Click photo to zoom. Swipe or use the controls to browse.</p>
    </div>
  </section>

  <section class="lightbox" id="lightbox" aria-hidden="true">
    <button id="lightbox-close" class="lightbox-close" type="button" data-i18n="lightbox_close">Close</button>
    <img id="lightbox-image" class="lightbox-image" alt="">
  </section>

  <script type="module" src="/assets/js/main.js"></script>
</body>
</html>
`;
}

function createPage(args) {
  const rawName = parseOption(args, "name") || parseOption(args, "n") || args.filter((arg) => !arg.startsWith("--")).join(" ");
  const pageName = normalizePageName(rawName);

  if (!pageName) {
    console.error("[Drluffy] missing page name. Example: Luffy create-page --name portfolio");
    process.exit(1);
  }

  const outputPath = path.join(root, `${pageName}.html`);
  if (fs.existsSync(outputPath)) {
    console.error(`[Drluffy] page already exists: ${pageName}.html`);
    process.exit(1);
  }

  const title = parseOption(args, "title") || "";
  fs.writeFileSync(outputPath, pageTemplate(pageName, title), "utf8");
  console.log(`[Drluffy] page created: ${pageName}.html`);
}

function deletePage(args) {
  const rawName = parseOption(args, "name") || parseOption(args, "n") || args.filter((arg) => !arg.startsWith("--")).join(" ");
  const pageName = normalizePageName(rawName);
  const force = args.includes("--force");

  if (!pageName) {
    console.error("[Drluffy] missing page name. Example: Luffy delete-page --name portfolio");
    process.exit(1);
  }

  if (reservedPages.has(pageName) && !force) {
    console.error("[Drluffy] refusing to delete core page without --force.");
    process.exit(1);
  }

  const targetPath = path.join(root, `${pageName}.html`);
  if (!fs.existsSync(targetPath)) {
    console.error(`[Drluffy] page not found: ${pageName}.html`);
    process.exit(1);
  }

  fs.unlinkSync(targetPath);
  console.log(`[Drluffy] page deleted: ${pageName}.html`);
}

function install() {
  console.log("[Drluffy] installing project dependencies...");
  const installResult = runNpmInstall();
  if (installResult.status !== 0) {
    process.exit(installResult.status || 1);
  }

  console.log("[Drluffy] building article data...");
  const buildResult = runNode("build-content.js");
  if (buildResult.status !== 0) {
    process.exit(buildResult.status || 1);
  }

  console.log("[Drluffy] install complete.");
}

function run(args) {
  const buildResult = runNode("build-content.js");
  if (buildResult.status !== 0) {
    process.exit(buildResult.status || 1);
  }

  const port = parseOption(args, "port") || "4173";
  runNode("serve.js", [`--port=${port}`]);
}

function printHelp() {
  console.log(`Drluffy CLI\n\nUsage:\n  Luffy install\n  Luffy run [--port=4173]\n  Luffy create-article --title "My Post" [--lang zh|en] [--slug custom-slug]\n  Luffy create-page --name portfolio [--title "Portfolio"]\n  Luffy delete-page --name portfolio [--force]\n\nAliases:\n  Luffy new-article ...\n`);
}

const [, , command, ...args] = process.argv;

switch (command) {
  case "install":
    install();
    break;
  case "run":
    run(args);
    break;
  case "create-article":
  case "new-article":
    createArticle(args);
    break;
  case "create-page":
    createPage(args);
    break;
  case "delete-page":
    deletePage(args);
    break;
  case "help":
  case "--help":
  case "-h":
  case undefined:
    printHelp();
    break;
  default:
    console.error(`[Drluffy] unknown command: ${command}`);
    printHelp();
    process.exit(1);
}
