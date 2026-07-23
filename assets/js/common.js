/* =========================================================
   管理后台 · 通用脚本
   - 二级菜单（父-子 嵌套）
   - 顶部 Header 含"管理后台"徽章
   - 登录态读取（zb_admin_logged_in，存于 localStorage）
   ========================================================= */

/**
 * 菜单配置 —— 唯一数据源
 * 一级菜单可包含 children 数组
 * - 没有 href 的一级菜单必须有 children
 * - 有 href 的一级菜单（无 children）可直接跳转
 * @property {string} id        菜单唯一标识（也作为页面文件名/选中匹配键）
 * @property {string} name      显示文字
 * @property {string} [href]    跳转链接（叶子节点必填）
 * @property {string} icon      SVG path 内容
 * @property {Array}  [children] 子菜单数组
 */
/* 菜单配置：name/nameKey 二选一，i18n 用 nameKey */
const MENU_CONFIG = [
  {
    id: "users",
    nameKey: "menu.users",
    icon: '<circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.8" fill="none"/><circle cx="17" cy="9" r="2.5" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5 M14 19c0-2 2.5-3.5 4-3.5s3 1 3 3" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
    children: [
      { id: "invited-users", nameKey: "menu.invited-users", href: "invited-users.html" },
      // 我的代理（暂时隐藏，需恢复时取消注释）
      // { id: "my-agents",     nameKey: "menu.my-agents",     href: "my-agents.html" },
      { id: "agents",        nameKey: "menu.agents",        href: "agents.html" },
    ],
  },
  // 数据报表菜单（暂时隐藏，需恢复时取消注释）
  // {
  //   id: "reports",
  //   nameKey: "menu.reports",
  //   icon: '<path d="M3 3v18h18 M7 17l4-6 4 4 5-8" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  //   children: [
  //     { id: "reports-agent-perf", nameKey: "menu.reports-agent-perf", href: "reports-agent-perf.html" },
  //   ],
  // },
  {
    id: "orders",
    nameKey: "menu.orders",
    icon: '<path d="M4 5h16v4H4z M4 11h16v4H4z M4 17h16v3H4z" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="8" cy="7" r="0.8" fill="currentColor"/><circle cx="8" cy="13" r="0.8" fill="currentColor"/><circle cx="8" cy="18.5" r="0.8" fill="currentColor"/>',
    children: [
      { id: "orders-transfer",   nameKey: "menu.orders-transfer",   href: "orders-transfer.html" },
      { id: "orders-commission", nameKey: "menu.orders-commission", href: "orders-commission.html" },
    ],
  },
  {
    id: "system",
    nameKey: "menu.system",
    icon: '<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M9 9h6 M9 13h6 M9 17h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    children: [
      { id: "system-users", nameKey: "menu.system-users", href: "system-users.html" },
      { id: "system-roles", nameKey: "menu.system-roles", href: "system-roles.html" },
      // 菜单管理（暂时隐藏，需恢复时取消注释 + 把下面 system-menus.html 在 DEFAULT_MENUS 的 status 改回 1）
      // { id: "system-menus", nameKey: "menu.system-menus", href: "system-menus.html" },
    ],
  },
];

/* 站点配置（brandName 走 i18n）*/
const SITE_CONFIG = {
  brandIcon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 4l12 8-12 8V4z" fill="#fff"/></svg>',
  user: {
    name: "Admin",
    initial: "A",
  },
};

/* ============== 工具：当前页 id ============== */
function getCurrentPageId() {
  const path = window.location.pathname;
  const file = path.substring(path.lastIndexOf("/") + 1);
  return file.replace(".html", "") || "system-users";
}

/* ============== 查找当前菜单所属父级 ============== */
function findActiveParent(currentId) {
  for (const item of MENU_CONFIG) {
    if (!item.children) continue;
    if (item.children.some((c) => c.id === currentId)) return item.id;
  }
  return null;
}

/* 找当前页所属菜单（用于面包屑） */
function findMenuChain(currentId) {
  for (const item of MENU_CONFIG) {
    if (item.id === currentId) return [item];
    if (item.children) {
      const child = item.children.find((c) => c.id === currentId);
      if (child) return [item, child];
    }
  }
  return [];
}

/* ============== 渲染侧边栏 ============== */
function renderSidebar() {
  const currentId = getCurrentPageId();
  const activeParent = findActiveParent(currentId);

  const menuHtml = MENU_CONFIG.map((item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = activeParent === item.id;
    const isActiveLeaf = !hasChildren && item.id === currentId;

    if (hasChildren) {
      const subItems = item.children.map((c) => `
        <li>
          <a href="${c.href}" class="submenu-item ${c.id === currentId ? "active" : ""}" data-menu-id="${c.id}">
            ${c.nameKey ? t(c.nameKey) : c.name}
          </a>
        </li>
      `).join("");

      return `
        <li class="${isExpanded ? "expanded" : ""}">
          <div class="menu-item ${isExpanded ? "expanded" : ""}" data-toggle="${item.id}">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none">${item.icon}</svg>
            <span class="menu-text">${item.nameKey ? t(item.nameKey) : item.name}</span>
            <svg class="menu-arrow" viewBox="0 0 24 24" fill="none">
              <polyline points="9 6 15 12 9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <ul class="sidebar-submenu">
            ${subItems}
          </ul>
        </li>
      `;
    } else {
      return `
        <li>
          <a href="${item.href}" class="menu-item no-children ${isActiveLeaf ? "active" : ""}" data-menu-id="${item.id}">
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none">${item.icon}</svg>
            <span class="menu-text">${item.nameKey ? t(item.nameKey) : item.name}</span>
          </a>
        </li>
      `;
    }
  }).join("");

  return `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">${SITE_CONFIG.brandIcon}</div>
        <span>${t('app.brand')}</span>
      </div>
      <ul class="sidebar-menu">
        ${menuHtml}
      </ul>
    </aside>
  `;
}

/* ============== 渲染 Header ============== */
function renderHeader(pageTitle) {
  const currentId = getCurrentPageId();
  const chain = findMenuChain(currentId);
  const breadcrumb = chain.length
    ? chain.map((m, i) => {
        const name = m.nameKey ? t(m.nameKey) : m.name;
        return i === chain.length - 1
          ? `<span class="current">${name}</span>`
          : `<span>${name}</span><span>/</span>`;
      }).join(" ")
    : `<span class="current">${pageTitle || ""}</span>`;

  const currentLang = getLang();

  return `
    <header class="header">
      <div class="breadcrumb">
        ${breadcrumb}
        <span class="admin-badge">${t('app.adminBadge')}</span>
      </div>
      <div class="header-actions">
        <!-- 语言切换 -->
        <div class="lang-dropdown" id="langDropdown">
          <button class="icon-btn" title="${t('app.langSwitch')}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>
              <path d="M3 12h18 M12 3a14 14 0 0 1 4 9 14 14 0 0 1-4 9 14 14 0 0 1-4-9 14 14 0 0 1 4-9z"
                stroke="currentColor" stroke-width="1.6" fill="none"/>
            </svg>
          </button>
          <div class="dropdown-menu lang-menu">
            <a href="#" data-lang="zh" class="${currentLang === 'zh' ? 'active' : ''}">
              <span>🇨🇳</span>${t('app.langZh')}
              ${currentLang === 'zh' ? '<svg width="14" height="14" viewBox="0 0 24 24" style="margin-left:auto;color:var(--color-primary)"><polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
            </a>
            <a href="#" data-lang="en" class="${currentLang === 'en' ? 'active' : ''}">
              <span>🇺🇸</span>${t('app.langEn')}
              ${currentLang === 'en' ? '<svg width="14" height="14" viewBox="0 0 24 24" style="margin-left:auto;color:var(--color-primary)"><polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
            </a>
          </div>
        </div>

        <div class="user-dropdown" id="userDropdown">
          <button class="user-trigger">
            <div class="avatar">${SITE_CONFIG.user.initial}</div>
            <span class="user-name">${SITE_CONFIG.user.name}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="dropdown-menu">
            <a href="#" id="btnLogout" style="color:#e64545"><span>↩️</span>${t('app.logout')}</a>
          </div>
        </div>
      </div>
    </header>
  `;
}

/* ============== 交互绑定 ============== */
function bindMenuToggle() {
  document.querySelectorAll("[data-toggle]").forEach((el) => {
    el.addEventListener("click", () => {
      const li = el.closest("li");
      const expanded = li.classList.toggle("expanded");
      el.classList.toggle("expanded", expanded);
    });
  });
}

function bindUserDropdown() {
  const dropdown = document.getElementById("userDropdown");
  if (!dropdown) return;
  const trigger = dropdown.querySelector(".user-trigger");
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });
  document.addEventListener("click", () => dropdown.classList.remove("open"));

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        localStorage.removeItem("zb_admin_logged_in");
        localStorage.removeItem("zb_admin_account");
      } catch (err) {}
      window.location.href = "login.html";
    });
  }
}

function bindLangDropdown() {
  const dropdown = document.getElementById("langDropdown");
  if (!dropdown) return;
  const trigger = dropdown.querySelector(".icon-btn");
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });
  document.addEventListener("click", () => dropdown.classList.remove("open"));

  dropdown.querySelectorAll("[data-lang]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      setLang(a.dataset.lang);
    });
  });
}

/* ============== 初始化入口 ============== */
function initLayout(contentHtml) {
  const pageTitleKey = document.body.dataset.titleKey;
  const pageTitle = pageTitleKey ? t(pageTitleKey) : (document.body.dataset.title || "");
  document.title = `${pageTitle} - ${t('app.brand')}`;

  const app = document.getElementById("app");
  if (!app) {
    console.error("[管理后台] #app 容器不存在");
    return;
  }

  app.innerHTML = `
    <div class="app-layout">
      ${renderSidebar()}
      <div class="main-wrapper">
        ${renderHeader(pageTitle)}
        <main class="main-content">
          ${contentHtml || ""}
        </main>
      </div>
    </div>
  `;

  bindMenuToggle();
  bindUserDropdown();
  bindLangDropdown();

  if (typeof window.onPageReady === "function") {
    window.onPageReady();
  }
}
