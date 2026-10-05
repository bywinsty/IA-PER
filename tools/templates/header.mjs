const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

function renderHomeNavigation(page, indent, eol) {
  const links = page.sections.map(({ label, href }) => [
    `${indent}      <li>`,
    `${indent}        <a href="${escapeHtml(href)}">`,
    `${indent}          <span>${escapeHtml(label)}</span>`,
    `${indent}        </a>`,
    `${indent}      </li>`
  ].join(eol)).join(eol);

  return [
    `${indent}    <nav class="header-page-nav" aria-label="Navigation de la page d’accueil">`,
    `${indent}      <a href="${escapeHtml(page.currentHref)}" class="header-current-link" aria-current="page">`,
    `${indent}        <span>${escapeHtml(page.currentLabel)}</span>`,
    `${indent}      </a>`,
    `${indent}      <ol class="header-section-links">`,
    links,
    `${indent}      </ol>`,
    `${indent}    </nav>`
  ].join(eol);
}

function renderBreadcrumbs(page, indent, eol, { prefix = '' } = {}) {
  const nestedIndent = `${indent}${prefix}`;
  const items = page.breadcrumbs.map(({ label, href, current }) => {
    const classes = current ? 'breadcrumb-button current' : 'breadcrumb-button';
    const currentAttribute = current ? ' aria-current="page"' : '';
    return `${nestedIndent}        <li><a href="${escapeHtml(href)}" class="${classes}"${currentAttribute}>${escapeHtml(label)}</a></li>`;
  }).join(eol);

  return [
    `${nestedIndent}    <nav class="header-breadcrumbs" aria-label="Fil d’Ariane">`,
    `${nestedIndent}      <ol>`,
    items,
    `${nestedIndent}      </ol>`,
    `${nestedIndent}    </nav>`
  ].join(eol);
}

function renderSectionNavigation(page, indent, eol, { prefix = '' } = {}) {
  const nestedIndent = `${indent}${prefix}`;
  const links = page.sections.map(({ label, href }) => [
      `${nestedIndent}      <li>`,
      `${nestedIndent}        <a href="${escapeHtml(href)}">`,
      `${nestedIndent}          <span>${escapeHtml(label)}</span>`,
      `${nestedIndent}        </a>`,
      `${nestedIndent}      </li>`
    ].join(eol)).join(eol);

  return [
    `${nestedIndent}    <nav class="header-page-nav header-section-nav" aria-label="Navigation de la page Thématiques">`,
    `${nestedIndent}      <ol class="header-section-links">`,
    links,
    `${nestedIndent}      </ol>`,
    `${nestedIndent}    </nav>`
  ].join(eol);
}

function renderBreadcrumbSections(page, indent, eol) {
  return [
    `${indent}    <div class="header-navigation-stack">`,
    renderBreadcrumbs(page, indent, eol, { prefix: '  ' }),
    ...(page.sections?.length ? [renderSectionNavigation(page, indent, eol, { prefix: '  ' })] : []),
    `${indent}    </div>`
  ].join(eol);
}

function renderScrollProgress(indent, eol) {
  return [
    `${indent}  <div`,
    `${indent}    id="scroll-progress"`,
    `${indent}    class="scroll-progress"`,
    `${indent}    role="progressbar"`,
    `${indent}    aria-label="Progression de lecture"`,
    `${indent}    aria-valuemin="0"`,
    `${indent}    aria-valuemax="100"`,
    `${indent}    aria-valuenow="0"`,
    `${indent}    aria-valuetext="0%">`,
    `${indent}    <span class="scroll-progress__bar" aria-hidden="true"></span>`,
    `${indent}  </div>`
  ].join(eol);
}

/** Render one complete, marker-delimited header block. */
export function renderHeader(page, { eol = '\n', indent = '  ' } = {}) {
  const asset = (relativePath) => `${page.assetPrefix ?? ''}assets/${relativePath}`;
  const scrollProgress = renderScrollProgress(indent, eol);
  const navigation = page.type === 'home'
    ? renderHomeNavigation(page, indent, eol)
    : page.type === 'breadcrumb-sections'
      ? renderBreadcrumbSections(page, indent, eol)
      : renderBreadcrumbs(page, indent, eol);

  return [
    `${indent}<!-- generated:header:start -->`,
    `${indent}<header id="header" class="header d-flex align-items-center fixed-top">`,
    `${indent}  <div class="container-fluid position-relative d-flex align-items-center">`,
    '',
    `${indent}    <div class="header-brand d-flex align-items-center me-auto">`,
    `${indent}      <a href="${escapeHtml(page.homeHref ?? 'index.html')}" class="logo d-flex align-items-center" aria-label="IA-PER">`,
    `${indent}        <img`,
    `${indent}          src="${escapeHtml(asset('img/ia-per.svg'))}"`,
    `${indent}          class="site-logo"`,
    `${indent}          width="75"`,
    `${indent}          height="75"`,
    `${indent}          alt="IA-PER — Progrès, Enjeux et Responsabilités">`,
    `${indent}      </a>`,
    '',
    navigation,
    `${indent}    </div>`,
    '',
    `${indent}  </div>`,
    '',
    scrollProgress,
    `${indent}</header>`,
    `${indent}<!-- generated:header:end -->`
  ].join(eol);
}
