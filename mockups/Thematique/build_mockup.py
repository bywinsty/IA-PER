from pathlib import Path
import base64, mimetypes, re, urllib.request

ROOT = Path('D:/IA-PER')
OUT = Path('D:/IA-PER-mockups')
def data(path):
    return 'data:' + (mimetypes.guess_type(str(path))[0] or 'application/octet-stream') + ';base64,' + base64.b64encode(path.read_bytes()).decode()

def css_file(path):
    css = path.read_text(encoding='utf-8-sig')
    def replace(m):
        url = m[1].strip('"\' ')
        if url.startswith(('data:', 'http', '#')): return m[0]
        asset = (path.parent / url.split('?')[0].split('#')[0]).resolve()
        return 'url("' + data(asset) + '")' if asset.is_file() else 'none'
    return re.sub(r'url\(([^)]+)\)', replace, css)

html = (ROOT / 'index.html').read_text(encoding='utf-8-sig')
html = re.sub(r'<link\b[^>]*>', '', html)
html = re.sub(r'<script\b[^>]*>.*?</script>', '', html, flags=re.S)
html = re.sub(r'\sdata-aos(?:-delay)?="[^"]*"', '', html)
html = html.replace('<div id="preloader"></div>', '')
html = html.replace('<title>IA-PER - Accueil</title>', '<title>IA-PER — Accueil · Thématiques</title>')
html = html.replace('href="index.html"', 'href="#hero"')
html = re.sub(r'<a href="" class="glightbox.*?</a>', '<a href="#services" class="btn-watch-video d-flex align-items-center"><i class="bi bi-arrow-down-circle"></i><span>Explorer les thématiques</span></a>', html)
html = re.sub(r'<a href="" aria-label="(?:X|Instagram)">.*?</a>', '', html)
for filename, index in [('environnement.html', 0), ('professionnel.html', 1), ('societe.html', 2)]:
    html = html.replace('href="' + filename + '"', f'href="#services" data-select-card="{index}"')

cards = []
for i, (title, subtitle, filename, alt) in enumerate([
    ('Environnement', 'IA et environnement', 'iaenviro.png', 'L’intelligence artificielle et l’environnement'),
    ('Professionnel', 'IA dans le monde professionnel', 'iaprof.webp', 'L’intelligence artificielle dans le monde professionnel'),
    ('Société', 'IA et société', 'iasocietal.jpg', 'L’intelligence artificielle dans la société')
]):
    active = i == 1
    cards.append(f'''<article class="theme-card card--{'active' if active else 'inactive'}" role="group" aria-roledescription="diapositive" aria-label="{i+1} sur 3 : {title}">
      <div class="card-image"><img src="assets/img/steps/{filename}" alt="{alt}" width="480" height="300" draggable="false"><span class="selected-badge" aria-hidden="true">✓ Sélectionnée</span></div>
      <div class="card-content"><span class="card-number" aria-hidden="true">0{i+1}</span><h3>{title}</h3><p>{subtitle}</p>
      <ul><li>Contexte</li><li>Usages</li><li>Questions clés</li></ul>
      <span class="card-action" aria-hidden="true">Sélectionner cette thématique <span>↗︎</span></span></div>
      <button class="card-select" type="button" aria-label="Sélectionner : {title}" aria-pressed="{str(active).lower()}"></button>
    </article>''')

section = '''<section id="services" class="themes section" aria-labelledby="services-title">
    <div class="container section-title"><span class="section-eyebrow">TROIS REGARDS SUR L’IA</span><h2 id="services-title">Thématiques</h2><p>Explorez les grands enjeux liés à l’usage de l’intelligence artificielle.</p></div>
    <div class="theme-carousel" role="region" aria-roledescription="carrousel" aria-label="Les trois thématiques" aria-describedby="carousel-help">
      <div class="card-track">''' + '\n'.join(cards) + '''</div>
      <div class="carousel-controls"><button class="arrow-button" id="previous-card" type="button" aria-label="Thématique précédente">←</button>
        <div class="carousel-dots" role="group" aria-label="Choisir une thématique">
          <button type="button" aria-label="Afficher Environnement" aria-pressed="false"><span></span></button>
          <button type="button" aria-label="Afficher Professionnel" aria-pressed="true"><span></span></button>
          <button type="button" aria-label="Afficher Société" aria-pressed="false"><span></span></button>
        </div><button class="arrow-button" id="next-card" type="button" aria-label="Thématique suivante">→</button></div>
      <p class="carousel-status" aria-live="polite" aria-atomic="true">02 / 03 — Professionnel</p>
      <p id="carousel-help">Cliquez sur une carte ou faites glisser pour explorer.</p>
    </div>
  </section>'''
html = re.sub(r'<section id="services".*?</section>', lambda m: section, html, count=1, flags=re.S)
html = re.sub(r'src="(assets/[^"]+)"', lambda m: 'src="' + data(ROOT / m[1]) + '"', html)

fonts = ''
try:
    request = urllib.request.Request('https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&display=swap', headers={'User-Agent':'Mozilla/5.0'})
    fonts = urllib.request.urlopen(request, timeout=20).read().decode()
    def font_data(m):
        payload = urllib.request.urlopen(m[1], timeout=20).read()
        return 'url(data:font/woff2;base64,' + base64.b64encode(payload).decode() + ')'
    fonts = re.sub(r'url\((https://[^)]+)\)', font_data, fonts)
except Exception as error:
    fonts = ''
    print('Using system font fallback:', type(error).__name__)

styles = '\n'.join(css_file(ROOT / p) for p in ['assets/vendor/bootstrap/css/bootstrap.min.css', 'assets/vendor/bootstrap-icons/bootstrap-icons.css', 'assets/css/main.css'])
custom = r'''
/* Standalone carousel. Fixed layout width; active scaling never changes snap geometry. */
.themes{background:#f5f8fc;padding:76px 0 58px;overflow:hidden}
.themes .section-title{padding-bottom:12px}.section-eyebrow{display:block;color:#52708b;font-size:11px;font-weight:700;letter-spacing:2.5px;margin-bottom:16px}
.theme-carousel{--card-width:360px;max-width:1240px;margin:auto}
.card-track{display:flex;gap:24px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:none;padding:34px max(0px,calc(50% - var(--card-width)/2)) 44px;touch-action:pan-x pan-y pinch-zoom;cursor:grab;position:relative}
.card-track::-webkit-scrollbar{display:none}.card-track.is-dragging{cursor:grabbing;scroll-snap-type:none}.card-track.is-dragging *{cursor:grabbing!important;user-select:none}
.theme-card{flex:0 0 var(--card-width);width:var(--card-width);position:relative;scroll-snap-align:center;scroll-snap-stop:always;border-radius:22px;background:#fff;border:2px solid transparent;overflow:hidden;transform-origin:center;transition:transform .38s ease,box-shadow .38s ease,border-color .38s ease;isolation:isolate}
.card--active{transform:scale(1);border-color:#47b2e4;box-shadow:0 18px 38px #254a7926}
.card--inactive{transform:scale(.9);box-shadow:0 6px 20px #254a7912}
.card--inactive .card-image img{filter:saturate(.55)}
.card-image{height:228px;position:relative;background:#dbe7ef}.card-image img{width:100%;height:100%;object-fit:cover;transition:filter .38s ease;user-select:none}
.selected-badge{position:absolute;top:16px;right:16px;border-radius:30px;background:#fff;color:#1c5775;padding:7px 12px;font-size:11px;font-weight:700;opacity:0;transition:opacity .25s}
.card--active .selected-badge{opacity:1}.card-content{padding:39px 27px 23px;position:relative}
.card-number{position:absolute;top:-27px;left:27px;background:#37517e;border:4px solid white;color:white;border-radius:50%;width:54px;height:54px;display:grid;place-items:center;font:700 20px var(--heading-font)}
.card--active .card-number{background:#1f6f94}.card-content h3{font-size:27px;font-weight:700;margin:0 0 8px;color:#28496b}.card-content p{font-size:14px;color:#606d79;margin:0 0 21px}
.card-content ul{list-style:none;padding:0;margin:0;display:grid;gap:9px;font-size:14px;color:#4d5c6a}.card-content li::before{content:'✓';display:inline-grid;place-items:center;border:1px solid #327d9c;color:#256d8b;width:17px;height:17px;border-radius:50%;font-size:11px;margin-right:10px}
.card-action{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e5edf3;margin-top:23px;padding-top:15px;color:#526b80;font-size:12px;font-weight:600}.card-action>span{font-size:21px}.card--active .card-action{color:#17688f}
.card-select{position:absolute;inset:0;width:100%;height:100%;z-index:2;border:0;border-radius:20px;background:transparent;cursor:pointer}.card-select:focus-visible{outline:3px solid #102f60;outline-offset:-6px}
.carousel-controls{display:flex;align-items:center;justify-content:center;gap:25px;margin-top:-7px}.arrow-button{width:46px;height:46px;border-radius:50%;border:1px solid #c5d7e6;background:white;color:#254f70;font-size:24px;transition:background .2s}.arrow-button:hover:not(:disabled){background:#e0f3fc}.arrow-button:disabled{opacity:.35;cursor:default}
.carousel-dots{display:flex;gap:3px}.carousel-dots button{border:0;background:none;width:36px;height:44px;display:grid;place-items:center;padding:4px}.carousel-dots span{width:8px;height:8px;background:#9daebe;border-radius:10px;transition:width .25s,background .25s}.carousel-dots [aria-pressed=true] span{width:25px;background:#2287b8}
.carousel-status{margin:14px 0 5px;text-align:center;font-size:13px;font-weight:600;color:#37517e}#carousel-help{font-size:12px;text-align:center;color:#637486;margin:0;padding:0 18px}
button:focus-visible,a:focus-visible{outline:3px solid #1f709c;outline-offset:4px}
.header{background:#fff}.hero .animated{animation:none}.hero .btn-get-started{color:#102c43}.scroll-top{visibility:visible;opacity:1}
@media(min-width:1500px){.theme-carousel{--card-width:380px}}
@media(max-width:767px){.theme-carousel{--card-width:min(78vw,340px)}.card-track{gap:12px;padding-top:26px;padding-bottom:32px}.themes{padding:54px 0 42px}.card-image{height:190px}.card-content{padding:35px 20px 20px}.card-content h3{font-size:24px}.card-number{left:20px}.card-content p{font-size:13px}.card-action{font-size:11px}.themes .section-title p{font-size:14px}.section-eyebrow{font-size:10px;letter-spacing:2px}.hero .d-flex:has(.btn-get-started){flex-wrap:wrap;gap:18px}.hero .btn-watch-video{margin-left:0}.hero .hero-title{font-size:32px}.card--inactive{transform:scale(.92)}}
@media(prefers-reduced-motion:reduce){html:root{scroll-behavior:auto}*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
'''
script = r'''
(() => {
  'use strict';
  const root = document.querySelector('.theme-carousel');
  const track = root.querySelector('.card-track');
  const cards = [...root.querySelectorAll('.theme-card')];
  const dots = [...root.querySelectorAll('.carousel-dots button')];
  const previous = document.getElementById('previous-card');
  const next = document.getElementById('next-card');
  const status = root.querySelector('.carousel-status');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 1, pending = null, timer = 0, frame = 0, gesture = null, suppressClick = false;
  const clamp = index => Math.max(0, Math.min(cards.length - 1, index));
  function paint(index, announce = false) {
    selected = clamp(index);
    cards.forEach((card, i) => {
      const active = i === selected;
      card.classList.toggle('card--active', active);
      card.classList.toggle('card--inactive', !active);
      card.querySelector('button').setAttribute('aria-pressed', String(active));
      card.querySelector('.card-action').firstChild.textContent = active ? 'Thématique sélectionnée ' : 'Sélectionner cette thématique ';
      dots[i].setAttribute('aria-pressed', String(active));
    });
    previous.disabled = selected === 0;
    next.disabled = selected === cards.length - 1;
    if (announce) status.textContent = `${String(selected + 1).padStart(2, '0')} / 03 — ${cards[selected].querySelector('h3').textContent}`;
  }
  function center(index, instant = false) {
    pending = clamp(index);
    paint(pending, true);
    const card = cards[pending];
    track.scrollTo({left:card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2, behavior:instant || motion.matches ? 'instant' : 'smooth'});
    clearTimeout(timer);
    timer = setTimeout(settle, 220);
  }
  function nearest() {
    const midpoint = track.scrollLeft + track.clientWidth / 2;
    return cards.reduce((best, card, i) => Math.abs(card.offsetLeft + card.offsetWidth / 2 - midpoint) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - midpoint) ? i : best, 0);
  }
  function settle() {
    if (gesture) return;
    pending = null;
    paint(nearest(), true);
  }
  cards.forEach((card,i) => card.querySelector('button').addEventListener('click', () => {if (!suppressClick) center(i)}));
  dots.forEach((dot,i) => dot.addEventListener('click', () => center(i)));
  previous.addEventListener('click', () => center(selected - 1));
  next.addEventListener('click', () => center(selected + 1));
  root.addEventListener('keydown', event => {
    const targets = {ArrowLeft:selected - 1,ArrowRight:selected + 1,Home:0,End:cards.length - 1};
    if (!(event.key in targets)) return;
    event.preventDefault();
    const index = clamp(targets[event.key]);
    center(index);
    cards[index].querySelector('button').focus({preventScroll:true});
  });
  track.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(() => {if (pending === null) paint(nearest());frame = 0});
    clearTimeout(timer);timer = setTimeout(settle, 160);
  }, {passive:true});
  track.addEventListener('scrollend', settle);
  track.addEventListener('wheel', () => {pending = null}, {passive:true});
  // Touch uses browser scrolling and CSS snapping, preserving vertical page scrolling and pinch zoom.
  // Mouse dragging is an enhancement; a drag must never trigger a subsequent card click.
  track.addEventListener('pointerdown', event => {
    pending = null;suppressClick = false;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    gesture = {id:event.pointerId,x:event.clientX,scroll:track.scrollLeft,moved:false};
  });
  track.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const delta = event.clientX - gesture.x;
    if (!gesture.moved && Math.abs(delta) < 7) return;
    if (!gesture.moved) {gesture.moved = true;track.setPointerCapture(event.pointerId);track.classList.add('is-dragging')}
    event.preventDefault();track.scrollLeft = gesture.scroll - delta;
  });
  function release(event) {
    if (!gesture || event.pointerId !== gesture.id) return;
    const moved = gesture.moved;gesture = null;
    track.classList.remove('is-dragging');
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    if (moved) {suppressClick = true;center(nearest());setTimeout(() => {suppressClick = false}, 0)}
  }
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  document.querySelectorAll('[data-select-card]').forEach(link => link.addEventListener('click', () => center(Number(link.dataset.selectCard))));
  document.querySelectorAll('.faq-question').forEach(button => button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    document.getElementById(button.getAttribute('aria-controls')).setAttribute('aria-hidden', String(!expanded));
    button.closest('.faq-item').classList.toggle('faq-active', expanded);
  }));
  new ResizeObserver(() => center(selected, true)).observe(track);
  center(selected, true);
})();
'''
html = html.replace('</head>', '<style>\n' + fonts + '\n' + styles + '\n' + custom + '\n</style>\n</head>')
html = html.replace('</body>', '<script>\n' + script + '\n</script>\n</body>')
OUT.mkdir(exist_ok=True)
(OUT / 'accueil-carousel.html').write_text(html, encoding='utf-8')
(OUT / 'carousel-check.js').write_text(script, encoding='utf-8')
print('Standalone HTML:', OUT / 'accueil-carousel.html')
print('Size:', len(html.encode()), 'bytes')
print('External asset references:', re.findall(r'(?:src|href)="(?:assets/|https://fonts)[^"]*"', html))
