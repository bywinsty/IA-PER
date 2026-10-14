const resultsRoot = document.querySelector('#results-content');

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderChart(chart) {
  const article = createElement('article', 'result-chart');
  const heading = createElement('h3', 'result-chart__title', chart.title);
  article.append(heading);

  if (chart.type === 'rating') {
    const summary = createElement('p', 'result-chart__summary');
    summary.append(
      document.createTextNode('Moyenne '),
      createElement('strong', '', `${chart.mean.toLocaleString('fr-BE', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}/10`),
      document.createTextNode(` · médiane ${chart.median}/10 · échelle de ${chart.min} à ${chart.max}`)
    );
    article.append(summary);
  }

  if (chart.note) article.append(createElement('p', 'result-chart__note', chart.note));

  const list = createElement('ul', 'result-bars');
  list.setAttribute('aria-label', chart.title);
  const maxCount = Math.max(...chart.items.map(item => item.count), 1);
  for (const item of chart.items) {
    const row = createElement('li', 'result-bars__item');
    const top = createElement('div', 'result-bars__topline');
    top.append(createElement('span', 'result-bars__label', item.label));
    const percentage = Math.round((item.count / chart.n) * 100);
    top.append(createElement('span', 'result-bars__value', `${item.count} · ${percentage} %`));
    const track = createElement('span', 'result-bars__track');
    track.setAttribute('aria-hidden', 'true');
    const fill = createElement('span', 'result-bars__fill');
    fill.style.width = `${Math.max((item.count / maxCount) * 100, item.count ? 2 : 0)}%`;
    track.append(fill);
    row.append(top, track);
    list.append(row);
  }
  article.append(list, createElement('p', 'result-chart__sample', `${chart.n} ${chart.n > 1 ? 'réponses' : 'réponse'}`));
  return article;
}

function renderResults(data) {
  document.querySelector('[data-total-responses]').textContent = data.responses;
  const fragment = document.createDocumentFragment();
  for (const sectionData of data.sections) {
    const section = createElement('section', 'results-group');
    section.id = sectionData.id;
    section.setAttribute('aria-labelledby', `${sectionData.id}-title`);
    const header = createElement('header', 'results-group__header');
    header.append(createElement('h2', '', sectionData.title), createElement('p', '', sectionData.intro));
    const grid = createElement('div', 'results-grid');
    for (const chart of sectionData.charts) grid.append(renderChart(chart));
    section.append(header, grid);
    fragment.append(section);
  }
  resultsRoot.replaceChildren(fragment);
}

fetch('../../assets/data/survey-results.json')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(renderResults)
  .catch(() => {
    const message = createElement('p', 'results-error', 'Les résultats ne sont pas disponibles pour le moment. Vous pouvez consulter le sondage ou revenir un peu plus tard.');
    resultsRoot.replaceChildren(message);
  });
