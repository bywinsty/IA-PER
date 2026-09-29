/**
 * The one source of truth for every generated site header.
 *
 * Keep page-specific content here; `templates/header.mjs` owns the markup.
 */
export const headerPages = [
  {
    file: 'index.html',
    type: 'home',
    currentLabel: 'Accueil',
    currentHref: '#hero',
    sections: [
      { label: 'À propos de l’étude', href: '#about' },
      { label: 'Équipe du projet', href: '#team' },
      { label: 'Partenaires et soutiens', href: '#partners' }
    ]
  },
  {
    file: 'thematiques.html',
    type: 'breadcrumb',
    breadcrumbs: [
      { label: 'Accueil', href: 'index.html' },
      { label: 'Thématiques', href: 'thematiques.html', current: true }
    ]
  },
  {
    file: 'environnement.html',
    type: 'breadcrumb',
    breadcrumbs: [
      { label: 'Accueil', href: 'index.html' },
      { label: 'Thématiques', href: 'thematiques.html' },
      { label: 'Environnement', href: 'environnement.html', current: true }
    ]
  },
  {
    file: 'professionnel.html',
    type: 'breadcrumb',
    breadcrumbs: [
      { label: 'Accueil', href: 'index.html' },
      { label: 'Thématiques', href: 'thematiques.html' },
      { label: 'Professionnel', href: 'professionnel.html', current: true }
    ]
  },
  {
    file: 'societe.html',
    type: 'breadcrumb',
    breadcrumbs: [
      { label: 'Accueil', href: 'index.html' },
      { label: 'Thématiques', href: 'thematiques.html' },
      { label: 'Société', href: 'societe.html', current: true }
    ]
  },
  {
    file: '404.html',
    type: 'breadcrumb',
    breadcrumbs: [
      { label: 'Accueil', href: 'index.html' },
      { label: '404', href: '404.html', current: true }
    ]
  },
  {
    file: 'service-details.html',
    type: 'breadcrumb',
    breadcrumbs: [
      { label: 'Accueil', href: 'index.html' },
      { label: 'Service Details', href: 'service-details.html', current: true }
    ]
  },
  {
    file: 'starter-page.html',
    type: 'breadcrumb',
    breadcrumbs: [
      { label: 'Accueil', href: 'index.html' },
      { label: 'Starter Page', href: 'starter-page.html', current: true }
    ]
  }
];
