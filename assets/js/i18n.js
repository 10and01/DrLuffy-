const LANG_STORAGE = "drluffy.lang";

const dictionary = {
  en: {
    nav_home: "Home",
    nav_about: "About",
    nav_articles: "Articles",
    lang_toggle: "中文",
    theme_toggle_title: "Slide to switch between day and night",
    slideshow_title: "Photo Showcase",
    slideshow_prev: "Prev",
    slideshow_next: "Next",
    slideshow_exit: "Exit",
    slideshow_hint: "Click photo to zoom. Swipe or use the controls to browse.",
    lightbox_close: "Close",
    entry_label: "System Ready",
    entry_title: "Drluffy",
    entry_subtitle: "A futuristic personal space is waiting behind this portal.",
    entry_explore: "Explore",
    home_eyebrow: "Digital Portfolio",
    home_title: "Build Tomorrow, One Commit At A Time",
    home_subtitle: "A futuristic personal website with interactive particles, animated cat assistant, and markdown-powered articles.",
    home_read_articles: "Read Articles",
    home_about_me: "About Me",
    home_latest_articles: "Latest Articles",
    about_title: "About Me",
    about_desc: "Builder, writer, and explorer focused on resilient software and delightful interfaces.",
    about_timeline: "Timeline",
    about_tl_2022: "Started building interactive web experiences.",
    about_tl_2024: "Published technical articles and open-source tooling.",
    about_tl_2026: "Launched this futuristic personal website.",
    articles_title: "Articles",
    articles_desc: "Hexo-like article cards, sorted by date with tag filtering and pagination.",
    articles_search_placeholder: "Search title or tags",
    article_contents: "Contents",
    article_not_found: "Article not found",
    article_missing_slug: "Missing slug parameter.",
    article_could_not_load: "The requested article could not be loaded.",
    article_prev_prefix: "Previous:",
    article_next_prefix: "Next:",
    article_back: "Back to Articles",
    article_no_results: "No articles found.",
    pager_prev: "Prev",
    pager_next: "Next",
    pager_page: "Page",
    footer_visits: "Visits",
    footer_local: "local",
    footer_disabled: "disabled",
    unit_min: "min",
    cat_munch: "Munch!",
    slideshow_empty: "Add gallery images in data/site-config.json to enable the showcase.",
  },
  zh: {
    nav_home: "首页",
    nav_about: "关于",
    nav_articles: "文章",
    lang_toggle: "EN",
    theme_toggle_title: "滑动切换白天和黑夜主题",
    slideshow_title: "相册展示",
    slideshow_prev: "上一张",
    slideshow_next: "下一张",
    slideshow_exit: "退出",
    slideshow_hint: "点击照片可放大。支持左右滑动或按钮浏览。",
    lightbox_close: "关闭",
    entry_label: "系统已就绪",
    entry_title: "Drluffy",
    entry_subtitle: "未来感个人空间已准备完成，点击即可进入。",
    entry_explore: "Explore",
    home_eyebrow: "数字作品集",
    home_title: "为明天构建，每次提交都算数",
    home_subtitle: "一个带粒子跟随、猫咪交互与 Markdown 文章系统的未来感个人网站。",
    home_read_articles: "阅读文章",
    home_about_me: "了解我",
    home_latest_articles: "最新文章",
    about_title: "关于我",
    about_desc: "专注于韧性软件与高质量交互体验的构建者与写作者。",
    about_timeline: "时间线",
    about_tl_2022: "开始构建互动式网页体验。",
    about_tl_2024: "发布技术文章并维护开源工具。",
    about_tl_2026: "上线这个未来感个人网站。",
    articles_title: "文章",
    articles_desc: "类 Hexo 风格文章卡片，支持按日期、标签筛选与分页。",
    articles_search_placeholder: "搜索标题或标签",
    article_contents: "目录",
    article_not_found: "未找到文章",
    article_missing_slug: "缺少 slug 参数。",
    article_could_not_load: "请求的文章无法加载。",
    article_prev_prefix: "上一篇：",
    article_next_prefix: "下一篇：",
    article_back: "返回文章列表",
    article_no_results: "没有匹配文章。",
    pager_prev: "上一页",
    pager_next: "下一页",
    pager_page: "第",
    footer_visits: "访问量",
    footer_local: "本地",
    footer_disabled: "已关闭",
    unit_min: "分钟",
    cat_munch: "啊呜！",
    slideshow_empty: "请在 data/site-config.json 中配置相册图片以启用展示。",
  },
};

let currentLang = localStorage.getItem(LANG_STORAGE) || "en";

function safeLang(value) {
  return value === "zh" ? "zh" : "en";
}

function applyStaticText() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    const value = dictionary[currentLang][key];
    if (typeof value === "string") {
      node.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.getAttribute("data-i18n-placeholder");
    const value = dictionary[currentLang][key];
    if (typeof value === "string") {
      node.setAttribute("placeholder", value);
    }
  });

  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    const key = node.getAttribute("data-i18n-title");
    const value = dictionary[currentLang][key];
    if (typeof value === "string") {
      node.setAttribute("title", value);
    }
  });
}

export function t(key) {
  return dictionary[currentLang][key] || dictionary.en[key] || key;
}

export function getLanguage() {
  return currentLang;
}

export function setupLanguageToggle(button) {
  currentLang = safeLang(currentLang);
  applyStaticText();

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "zh" : "en";
    localStorage.setItem(LANG_STORAGE, currentLang);
    applyStaticText();
    window.dispatchEvent(new CustomEvent("lang:change", { detail: currentLang }));
  });
}
