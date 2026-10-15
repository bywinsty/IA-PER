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

const thematicDetailNavigation = [
  { label: 'Accueil', href: thematicRoutes['index.html'] },
  { label: 'Thématiques', href: thematicRoutes['thematiques.html'] }
];

const surveyNavigation = [
  { label: 'Accueil', href: '../index.html' },
  { label: 'Thématiques', href: 'thematiques.html' }
];

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
    navigationLabel: 'Sections de la page d’accueil',
    primaryNavigationLabel: 'Navigation principale',
    primaryNavigation: [
      { label: 'Accueil', href: homeRoutes['index.html'], current: true },
      { label: 'Thématiques', href: homeRoutes['thematiques.html'] }
    ],
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
    navigationLabel: 'Sections de la page Thématiques',
    primaryNavigationLabel: 'Navigation principale',
    primaryNavigation: [
      { label: 'Accueil', href: thematicIndexRoutes['index.html'] },
      { label: 'Thématiques', href: thematicIndexRoutes['thematiques.html'], current: true }
    ],
    sections: [
      { label: 'Thématiques', href: '#themes' },
      { label: 'Sondage', href: '#sondage' },
      { label: 'Questions fréquemment posées', href: '#faq' }
    ],
  },
  {
    file: 'pages/sondage.html',
    type: 'breadcrumb-cadence',
    showThemeCta: false,
    primaryNavigationOnly: true,
    primaryNavigationLabel: 'Navigation principale',
    primaryNavigation: surveyNavigation,
    assetPrefix: '../',
    homeHref: '../index.html',
    routes: thematicRoutes
  },
  {
    file: 'pages/thématiques/environnement.html',
    type: 'breadcrumb-cadence',
    showThemeCta: false,
    primaryNavigationOnly: true,
    primaryNavigationLabel: 'Navigation principale',
    primaryNavigation: thematicDetailNavigation,
    assetPrefix: '../../',
    homeHref: '../../index.html',
    routes: thematicRoutes
  },
  {
    file: 'pages/thématiques/professionnel.html',
    type: 'breadcrumb-cadence',
    showThemeCta: false,
    primaryNavigationOnly: true,
    primaryNavigationLabel: 'Navigation principale',
    primaryNavigation: thematicDetailNavigation,
    assetPrefix: '../../',
    homeHref: '../../index.html',
    routes: thematicRoutes
  },
  {
    file: 'pages/thématiques/societe.html',
    type: 'breadcrumb-cadence',
    showThemeCta: false,
    primaryNavigationOnly: true,
    primaryNavigationLabel: 'Navigation principale',
    primaryNavigation: thematicDetailNavigation,
    assetPrefix: '../../',
    homeHref: '../../index.html',
    routes: thematicRoutes
  },
  {
    file: '404.html',
    type: 'brand-only',
    assetPrefix: '',
    homeHref: 'index.html',
    routes: homeRoutes,
    primaryNavigationLabel: 'Navigation principale',
    primaryNavigation: [
      { label: 'Accueil', href: homeRoutes['index.html'] },
      { label: 'Thématiques', href: homeRoutes['thematiques.html'] }
    ]
  }
];
