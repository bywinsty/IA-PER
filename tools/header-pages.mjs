/**
 * The one source of truth for every generated site header.
 *
 * Keep page-specific content and relative routes here; `templates/header.mjs`
 * owns the markup and `build-headers.mjs` normalizes existing page references.
 */
const homeRoutes = {
  'index.html': 'index.html',
  'thematiques.html': 'pages/thematiques.html',
  'environnement.html': 'pages/thématiques/environnement.html',
  'professionnel.html': 'pages/thématiques/professionnel.html',
  'societe.html': 'pages/thématiques/societe.html',
  'sondage.html': 'pages/sondage.html',
  '404.html': '404.html'
};

const thematicRoutes = {
  'index.html': '../../index.html',
  'thematiques.html': '../thematiques.html',
  'environnement.html': 'environnement.html',
  'professionnel.html': 'professionnel.html',
  'societe.html': 'societe.html',
  'sondage.html': '../sondage.html',
  '404.html': '../../404.html'
};

const thematicIndexRoutes = {
  'index.html': '../index.html',
  'thematiques.html': 'thematiques.html',
  'environnement.html': 'thématiques/environnement.html',
  'professionnel.html': 'thématiques/professionnel.html',
  'societe.html': 'thématiques/societe.html',
  'sondage.html': 'sondage.html',
  '404.html': '../404.html'
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
      { label: 'À propos', href: '#about' },
      { label: 'Équipe du projet', href: '#team' },
      { label: 'Partenaires', href: '#partners' }
    ]
  },
  {
    file: 'pages/thematiques.html',
    type: 'thematics',
    assetPrefix: '../',
    homeHref: '../index.html',
    routes: thematicIndexRoutes,
    navigationLabel: 'Navigation des thématiques',
    currentLabel: 'Thématiques',
    currentHref: 'thematiques.html',
    sections: [
      { label: 'Environnement', href: 'thématiques/environnement.html' },
      { label: 'Professionnel', href: 'thématiques/professionnel.html' },
      { label: 'Société', href: 'thématiques/societe.html' }
    ],
    themeCtaLabel: 'Sondage',
    themeCtaHref: 'sondage.html',
  },
  {
    file: 'pages/sondage.html',
    type: 'breadcrumb-cadence',
    showThemeCta: false,
    assetPrefix: '../',
    homeHref: '../index.html',
    routes: thematicRoutes,
    breadcrumbs: [
      { label: 'Accueil', href: '../index.html' },
      { label: 'Thématiques', href: 'thematiques.html' },
      { label: 'Sondage', href: 'sondage.html', current: true }
    ]
  },
  {
    file: 'pages/thématiques/environnement.html',
    type: 'breadcrumb-cadence',
    showThemeCta: false,
    assetPrefix: '../../',
    homeHref: '../../index.html',
    routes: thematicRoutes,
    breadcrumbs: [
      { label: 'Accueil', href: '../../index.html' },
      { label: 'Thématiques', href: '../thematiques.html' },
      { label: 'Environnement', href: 'environnement.html', current: true }
    ]
  },
  {
    file: 'pages/thématiques/professionnel.html',
    type: 'breadcrumb-cadence',
    showThemeCta: false,
    assetPrefix: '../../',
    homeHref: '../../index.html',
    routes: thematicRoutes,
    breadcrumbs: [
      { label: 'Accueil', href: '../../index.html' },
      { label: 'Thématiques', href: '../thematiques.html' },
      { label: 'Professionnel', href: 'professionnel.html', current: true }
    ]
  },
  {
    file: 'pages/thématiques/societe.html',
    type: 'breadcrumb-cadence',
    showThemeCta: false,
    assetPrefix: '../../',
    homeHref: '../../index.html',
    routes: thematicRoutes,
    breadcrumbs: [
      { label: 'Accueil', href: '../../index.html' },
      { label: 'Thématiques', href: '../thematiques.html' },
      { label: 'Société', href: 'societe.html', current: true }
    ]
  },
  {
    file: '404.html',
    type: 'brand-only',
    assetPrefix: '',
    homeHref: 'index.html',
    routes: homeRoutes
  }
];
