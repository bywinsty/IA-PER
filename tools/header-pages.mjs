/**
 * The one source of truth for every generated site header.
 *
 * Keep page-specific content and relative routes here; `templates/header.mjs`
 * owns the markup and `build-headers.mjs` normalizes existing page references.
 */
const homeRoutes = {
  'index.html': 'index.html',
  'thematiques.html': 'pages/thématiques/thematiques.html',
  'environnement.html': 'pages/thématiques/environnement.html',
  'professionnel.html': 'pages/thématiques/professionnel.html',
  'societe.html': 'pages/thématiques/societe.html',
  '404.html': 'pages/404.html',
  'service-details.html': 'pages/service-details.html',
  'starter-page.html': 'pages/starter-page.html'
};

const pagesRoutes = {
  'index.html': '../index.html',
  'thematiques.html': 'thématiques/thematiques.html',
  'environnement.html': 'thématiques/environnement.html',
  'professionnel.html': 'thématiques/professionnel.html',
  'societe.html': 'thématiques/societe.html',
  '404.html': '404.html',
  'service-details.html': 'service-details.html',
  'starter-page.html': 'starter-page.html'
};

const thematicRoutes = {
  'index.html': '../../index.html',
  'thematiques.html': 'thematiques.html',
  'environnement.html': 'environnement.html',
  'professionnel.html': 'professionnel.html',
  'societe.html': 'societe.html',
  '404.html': '../404.html',
  'service-details.html': '../service-details.html',
  'starter-page.html': '../starter-page.html'
};
export const headerPages = [
  {
    file: 'index.html',
    type: 'home',
    assetPrefix: '',
    homeHref: 'index.html',
    routes: homeRoutes,
    currentLabel: 'Accueil',
    currentHref: '#hero',
    sections: [
      { label: 'À propos de l’étude', href: '#about' },
      { label: 'Équipe du projet', href: '#team' },
      { label: 'Partenaires et soutiens', href: '#partners' }
    ]
  },
  {
    file: 'pages/thématiques/thematiques.html',
    type: 'breadcrumb',
    assetPrefix: '../../',
    homeHref: '../../index.html',
    routes: thematicRoutes,
    breadcrumbs: [
      { label: 'Accueil', href: '../../index.html' },
      { label: 'Thématiques', href: 'thematiques.html', current: true }
    ]
  },
  {
    file: 'pages/thématiques/environnement.html',
    type: 'breadcrumb',
    assetPrefix: '../../',
    homeHref: '../../index.html',
    routes: thematicRoutes,
    breadcrumbs: [
      { label: 'Accueil', href: '../../index.html' },
      { label: 'Thématiques', href: 'thematiques.html' },
      { label: 'Environnement', href: 'environnement.html', current: true }
    ]
  },
  {
    file: 'pages/thématiques/professionnel.html',
    type: 'breadcrumb',
    assetPrefix: '../../',
    homeHref: '../../index.html',
    routes: thematicRoutes,
    breadcrumbs: [
      { label: 'Accueil', href: '../../index.html' },
      { label: 'Thématiques', href: 'thematiques.html' },
      { label: 'Professionnel', href: 'professionnel.html', current: true }
    ]
  },
  {
    file: 'pages/thématiques/societe.html',
    type: 'breadcrumb',
    assetPrefix: '../../',
    homeHref: '../../index.html',
    routes: thematicRoutes,
    breadcrumbs: [
      { label: 'Accueil', href: '../../index.html' },
      { label: 'Thématiques', href: 'thematiques.html' },
      { label: 'Société', href: 'societe.html', current: true }
    ]
  },
  {
    file: 'pages/404.html',
    type: 'breadcrumb',
    assetPrefix: '../',
    homeHref: '../index.html',
    routes: pagesRoutes,
    breadcrumbs: [
      { label: 'Accueil', href: '../index.html' },
      { label: '404', href: '404.html', current: true }
    ]
  },
  {
    file: 'pages/service-details.html',
    type: 'breadcrumb',
    assetPrefix: '../',
    homeHref: '../index.html',
    routes: pagesRoutes,
    breadcrumbs: [
      { label: 'Accueil', href: '../index.html' },
      { label: 'Service Details', href: 'service-details.html', current: true }
    ]
  },
  {
    file: 'pages/starter-page.html',
    type: 'breadcrumb',
    assetPrefix: '../',
    homeHref: '../index.html',
    routes: pagesRoutes,
    breadcrumbs: [
      { label: 'Accueil', href: '../index.html' },
      { label: 'Starter Page', href: 'starter-page.html', current: true }
    ]
  }
];
