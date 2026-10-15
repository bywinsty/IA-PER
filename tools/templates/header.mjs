const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

function renderHomeNavigation(page, indent, eol) {
  const currentLink = page.primaryNavigation ? [] : [
    `${indent}      <a href="${escapeHtml(page.currentHref)}" class="header-current-link" aria-current="page">`,
    `${indent}        <span>${escapeHtml(page.currentLabel)}</span>`,
    `${indent}      </a>`
  ];
  const links = page.sections.map(({ label, href }) => [
    `${indent}      <li>`,
    `${indent}        <a href="${escapeHtml(href)}">`,
    `${indent}          <span>${escapeHtml(label)}</span>`,
    `${indent}        </a>`,
    `${indent}      </li>`
  ].join(eol)).join(eol);

  return [
    `${indent}    <nav class="header-page-nav" aria-label="${escapeHtml(page.navigationLabel ?? 'Navigation de la page d’accueil')}">`,
    ...currentLink,
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

function renderThemeCta(page, indent) {
  const themesHref = page.routes?.['thematiques.html'] ?? 'pages/thematiques.html';
  const href = page.themeCtaHref ?? `${themesHref}#themes`;
  const label = page.themeCtaLabel ?? 'Découvrir les thématiques';

  return `${indent}      <a href="${escapeHtml(href)}" class="header-theme-cta">${escapeHtml(label)} <span aria-hidden="true">→</span></a>`;
}

function renderPrimaryNavigation(page, indent, eol) {
  const links = page.primaryNavigation.map(({ label, href, current }) => {
    const currentValue = current === true ? 'page' : current;
    const currentAttribute = currentValue ? ` aria-current="${escapeHtml(currentValue)}"` : '';
    return `${indent}      <a href="${escapeHtml(href)}" class="header-primary-link"${currentAttribute}><span>${escapeHtml(label)}</span></a>`;
  }).join(eol);

  return [
    `${indent}    <nav class="header-primary-nav" aria-label="${escapeHtml(page.primaryNavigationLabel ?? 'Navigation principale')}">`,
    links,
    `${indent}    </nav>`
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
  const usesCadenceHeader = ['home', 'thematics', 'brand-only', 'breadcrumb-cadence'].includes(page.type);
  const scrollProgressInsideInner = usesCadenceHeader
    ? renderScrollProgress(`${indent}  `, eol)
    : '';
  const scrollProgressOutsideInner = usesCadenceHeader ? '' : scrollProgress;
  const navigation = page.primaryNavigationOnly || page.type === 'brand-only'
    ? ''
    : page.type === 'home' || page.type === 'thematics'
      ? renderHomeNavigation(page, indent, eol)
      : page.type === 'breadcrumb-sections'
        ? renderBreadcrumbSections(page, indent, eol)
        : renderBreadcrumbs(page, indent, eol);
  const headerAction = page.primaryNavigation
    ? renderPrimaryNavigation(page, indent, eol)
    : page.type === 'brand-only' || page.showThemeCta === false
      ? ''
      : renderThemeCta(page, indent);
  const navigationInsideBrand = page.primaryNavigation ? [] : navigation ? [navigation] : [];
  const navigationAfterBrand = page.primaryNavigation && !page.primaryNavigationOnly && navigation ? [navigation] : [];

  return [
    `${indent}<!-- generated:header:start -->`,
    `${indent}<header id="header" class="header d-flex align-items-center fixed-top">`,
    `${indent}  <div class="container-fluid container-xl position-relative d-flex align-items-center">`,
    '',
    `${indent}    <div class="header-inner d-flex align-items-center">`,
    `${indent}      <div class="header-brand d-flex align-items-center me-auto">`,
    `${indent}      <a href="${escapeHtml(page.homeHref ?? 'index.html')}" class="logo d-flex align-items-center" aria-label="IA-PER">`,
    `${indent}        <img`,
    `${indent}          src="${escapeHtml(asset('img/ia-per.svg'))}"`,
    `${indent}          class="site-logo"`,
    `${indent}          width="75"`,
    `${indent}          height="75"`,
    `${indent}          alt="IA-PER — Progrès, Enjeux et Responsabilités">`,
    `${indent}        <span class="site-name">IA-PER</span>`,
    `${indent}      </a>`,
    '',
    ...navigationInsideBrand,
    `${indent}      </div>`,
    ...navigationAfterBrand,
    ...(headerAction ? [headerAction] : []),
    ...(scrollProgressInsideInner ? [scrollProgressInsideInner] : []),
    `${indent}    </div>`,
    '',
    `${indent}  </div>`,
    '',
    ...(scrollProgressOutsideInner ? [scrollProgressOutsideInner] : []),
    `${indent}</header>`,
    `${indent}<!-- generated:header:end -->`
  ].join(eol);
}
