"""Build three portable homepage studies; never writes production assets."""
from pathlib import Path
import ast, base64, hashlib, json, mimetypes, re

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent

def data(path):
    return 'data:' + (mimetypes.guess_type(path)[0] or 'application/octet-stream') + ';base64,' + base64.b64encode(path.read_bytes()).decode()

def css_file(path):
    text = path.read_text(encoding='utf-8-sig')
    def embed(m):
        url = m[1].strip('"\' ')
        if url.startswith(('data:', '#')): return m[0]
        asset = (path.parent / url.split('?')[0].split('#')[0]).resolve()
        if not asset.is_file(): raise ValueError(f'Missing asset: {asset}')
        return 'url("' + data(asset) + '")'
    return re.sub(r'url\(([^)]+)\)', embed, text)

# Reuse the embedded font bytes and the established card styling from the earlier
# local study. The generated HTML files do not need this builder or that study.
prior = (ROOT / 'mockups/Thematique/accueil-carousel.html').read_text(encoding='utf-8')
fonts = '\n'.join(re.findall(r'@font-face\s*\{[^}]+\}', prior))
tree = ast.parse((ROOT / 'mockups/Thematique/build_mockup.py').read_text(encoding='utf-8-sig'))
base_card_css = next(ast.literal_eval(n.value) for n in tree.body if isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'custom' for t in n.targets))

source = (ROOT / 'index.html').read_text(encoding='utf-8-sig')
source = re.sub(r'<link\b[^>]*>', '', source)
source = re.sub(r'<script\b[^>]*>.*?</script>', '', source, flags=re.S)
source = re.sub(r'\sdata-aos(?:-delay)?="[^"]*"', '', source)
source = source.replace('<div id="preloader"></div>', '')
source = source.replace('href="index.html"', 'href="#hero"')
source = re.sub(r'<a href="" class="glightbox.*?</a>', '<button type="button" id="video-open" class="btn-watch-video d-flex align-items-center"><i class="bi bi-play-circle"></i><span>Regarder la vidéo</span></button>', source)
source = re.sub(r'<a href="" aria-label="(?:X|Instagram)">.*?</a>', '', source)
for filename, i in [('environnement.html', 0), ('professionnel.html', 1), ('societe.html', 2)]:
    source = source.replace(f'href="{filename}"', f'href="#services" data-select-card="{i}"')
source = source.replace('id="scroll-top"', 'aria-label="Retour en haut" id="scroll-top"')

items = [
    ('Environnement', 'IA et environnement', 'iaenviro.png', 'L’intelligence artificielle et l’environnement'),
    ('Professionnel', 'IA dans le monde professionnel', 'iaprof.webp', 'L’intelligence artificielle dans le monde professionnel'),
    ('Société', 'IA et société', 'iasocietal.jpg', 'L’intelligence artificielle dans la société')
]
cards = []
for i, (title, subtitle, filename, alt) in enumerate(items):
    cards.append(f'''<article class="theme-card card--{'active' if i == 1 else 'inactive'}" data-side="{i-1}" role="group" aria-roledescription="diapositive" aria-label="{i+1} sur 3 : {title}">
      <div class="card-image"><img src="assets/img/steps/{filename}" alt="{alt}" width="480" height="300" draggable="false"><span class="selected-badge" aria-hidden="true">✓ Sélectionnée</span></div>
      <div class="card-content"><span class="card-number" aria-hidden="true">0{i+1}</span><h3>{title}</h3><p>{subtitle}</p>
      <ul><li>Contexte</li><li>Usages</li><li>Questions clés</li></ul>
      <span class="card-action" aria-hidden="true">{'Thématique sélectionnée' if i == 1 else 'Sélectionner cette thématique'} <span>↗</span></span></div>
      <button class="card-select" type="button" aria-label="Sélectionner : {title}" aria-pressed="{str(i == 1).lower()}"></button>
    </article>''')
section = '''<section id="services" class="themes section" aria-labelledby="services-title">
    <div class="container section-title"><span class="section-eyebrow">TROIS REGARDS SUR L’IA</span><h2 id="services-title">Thématiques</h2><p>Explorez les grands enjeux liés à l’usage de l’intelligence artificielle.</p></div>
    <div class="theme-carousel" role="region" aria-roledescription="carrousel" aria-label="Les trois thématiques" aria-describedby="carousel-help">
      <div class="card-track">''' + '\n'.join(cards) + '''</div>
      <div class="carousel-controls"><button class="arrow-button" id="previous-card" type="button" aria-label="Thématique précédente">←</button>
        <div class="carousel-dots" role="group" aria-label="Choisir une thématique">''' + ''.join(f'<button type="button" aria-label="Afficher {title}" aria-pressed="{str(i == 1).lower()}"><span></span></button>' for i, (title, *_) in enumerate(items)) + '''</div>
        <button class="arrow-button" id="next-card" type="button" aria-label="Thématique suivante">→</button></div>
      <p class="carousel-status" role="status" aria-live="polite" aria-atomic="true">02 / 03 — Professionnel</p>
      <p id="carousel-help">Cliquez, faites glisser ou utilisez les flèches du clavier.</p>
    </div>
  </section>'''
source = re.sub(r'<section id="services".*?</section>', lambda _: section, source, count=1, flags=re.S)
source = re.sub(r'src="(assets/[^"]+)"', lambda m: 'src="' + data(ROOT / m[1]) + '"', source)
source = source.replace('</body>', '''<dialog id="video-dialog" aria-labelledby="video-title"><h2 id="video-title">La vidéo du projet</h2><p>La vidéo n’est pas encore disponible dans cette maquette.</p><form method="dialog"><button class="dialog-close">Fermer</button></form></dialog></body>''')

styles = '\n'.join(css_file(ROOT / p) for p in ['assets/vendor/bootstrap/css/bootstrap.min.css', 'assets/vendor/bootstrap-icons/bootstrap-icons.css', 'assets/css/main.css'])
common = '''
/* The dimensions used for snapping stay constant during all visual transitions. */
.card-track{padding-inline:0;gap:24px}
.card-track::before,.card-track::after{content:"";flex:0 0 max(0px,calc((100% - var(--card-width))/2 - 24px))}
.card-select{touch-action:pan-x pan-y pinch-zoom}
.theme-card{transition:transform .45s cubic-bezier(.2,.7,.2,1),box-shadow .45s,border-color .3s}
.carousel-dots button{width:44px;height:44px}.arrow-button{min-width:46px}
.card--inactive{opacity:1}.card--active{border-color:#1683b4}
.theme-carousel{max-width:1280px}.themes{scroll-margin-top:95px}
.header{background:#f3f4f6}.hero .btn-watch-video{background:none;border:0;padding:0;color:white}
.hero .btn-watch-video:focus-visible{outline-color:#47b2e4}
dialog{border:1px solid #d3dfeb;border-radius:20px;padding:32px;max-width:min(440px,90vw);color:#37517e;box-shadow:0 24px 90px #0005}
dialog::backdrop{background:#101c39a6}.dialog-close{border:0;border-radius:24px;background:#37517e;color:white;padding:10px 24px}
.card--active .card-action>span{transform:rotate(45deg)}
.card-action>span{display:inline-block;transition:transform .3s}
@media(max-width:767px){.card-track{gap:12px}.card-track::before,.card-track::after{flex-basis:max(0px,calc((100% - var(--card-width))/2 - 12px))}.hero .hero-title{font-size:30px}.hero .d-flex:has(.btn-get-started){gap:15px}.hero .btn-watch-video{font-size:13px}.themes{scroll-margin-top:80px}}
'''
variants = {
 '01-classique': ('Classique · Cartes centrées', '''
.themes{background:linear-gradient(180deg,#f7fafd,#edf3f8)}
.card--active .card-content{background:linear-gradient(135deg,#fff,#f1f9fd)}
.card-image{height:225px}.card--inactive .card-image img{filter:saturate(.7)}
'''),
 '02-perspective': ('Perspective · Galerie en relief', '''
.themes{background:radial-gradient(ellipse at 50% 45%,#dbf0ff,transparent 57%),#f7f9ff;padding-top:80px}
.theme-carousel{--card-width:380px;max-width:1320px}.card-track{gap:4px;padding-block:42px 52px}
.card-track::before,.card-track::after{flex-basis:max(0px,calc((100% - var(--card-width))/2 - 4px))}
.theme-card{border-radius:26px;border:1px solid #dde7f2;transform:perspective(1100px) scale(.87);box-shadow:0 12px 24px #2c3d611c}
.theme-card[data-side="-1"],.theme-card[data-side="-2"]{transform:perspective(1100px) rotateY(24deg) scale(.86)}
.theme-card[data-side="1"],.theme-card[data-side="2"]{transform:perspective(1100px) rotateY(-24deg) scale(.86)}
.theme-card.card--active{transform:perspective(1100px) rotateY(0) scale(1);box-shadow:0 28px 45px #29466a30;border-color:#85bddb}
.card-image{height:240px}.card-content{padding-top:36px}.card-number{border-radius:15px;background:#435493}.card--active .card-number{background:#435493}
.card--active .selected-badge{color:#354880}.card--active .card-action{color:#354880}.carousel-dots [aria-pressed=true] span{background:#435493}
.arrow-button{border-radius:14px}.section-eyebrow{color:#556691}
@media(max-width:767px){.theme-carousel{--card-width:min(78vw,340px)}.card-image{height:205px}.card-track{padding-block:30px 38px}.theme-card[data-side]{transform:perspective(1000px) rotateY(12deg) scale(.9)}.theme-card[data-side="1"],.theme-card[data-side="2"]{transform:perspective(1000px) rotateY(-12deg) scale(.9)}.theme-card.card--active{transform:perspective(1000px) rotateY(0) scale(1)}}
'''),
 '03-immersif': ('Immersif · Regards sur l’IA', '''
.themes{background:radial-gradient(ellipse at 50% 55%,#203a59,transparent 64%),#121d38;color:#e5edf8;padding-block:78px 60px}
.themes .section-title h2{color:white}.themes .section-title p{color:#becbdc}.section-eyebrow{color:#84cbea}
.theme-carousel{--card-width:410px;max-width:1410px}.card-track{gap:20px;padding-block:35px 40px}
.card-track::before,.card-track::after{flex-basis:max(0px,calc((100% - var(--card-width))/2 - 20px))}
.theme-card{height:520px;border-radius:20px;background:#142c43;border:1px solid #4b6178}
.card-image{position:absolute;inset:0;height:100%}.card-image::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,#08121e08 10%,#091828aa 42%,#091725 78%)}
.card-image img{height:100%;object-fit:cover;object-position:center;transition:filter .4s,transform .7s}.card--inactive .card-image img{filter:saturate(.4);transform:scale(1.04)}
.card-content{position:absolute;bottom:0;left:0;right:0;padding:30px;color:white;z-index:1}.card-content h3{color:white;font-size:32px}.card-content p{color:#c9d9e9;margin-bottom:22px}.card-content ul{color:#dae5ef;gap:10px}
.card-content li::before{border-color:#85d4f4;color:#a0e4ff}.card-number{position:static;width:auto;height:auto;display:block;background:none!important;border:0;border-radius:0;color:#8cd9fa;font-size:16px;letter-spacing:3px;margin-bottom:10px}
.selected-badge{z-index:1;background:#b7ecff;color:#123b55;top:20px;right:20px}.card-action{border-color:#7f9ab24d;color:#c6daeb}.card--active .card-action{color:#96e1ff}
.card--active{border-color:#77d5ff;box-shadow:0 20px 48px #0005}.card--inactive{transform:scale(.91)}
.arrow-button{background:#21334c;border-color:#536983;color:#d9f2ff}.arrow-button:hover:not(:disabled){background:#304966}.arrow-button:disabled{opacity:.4}
.carousel-dots span{background:#667a91}.carousel-dots [aria-pressed=true] span{background:#85d8fa}.carousel-status{color:#e5effa}#carousel-help{color:#afc1d5}
.themes button:focus-visible{outline-color:#b4eaff}.card-select:focus-visible{outline-color:#b4eaff}
@media(max-width:767px){.theme-carousel{--card-width:min(80vw,350px)}.theme-card{height:480px}.card-track{gap:12px}.card-track::before,.card-track::after{flex-basis:max(0px,calc((100% - var(--card-width))/2 - 12px))}.card-content{padding:24px 20px}.card-content h3{font-size:26px}.card-image{height:100%}}
''')
}
script = (OUT / 'carousel.js').read_text(encoding='utf-8')
for slug, (title, variant_css) in variants.items():
    html = source.replace('<title>IA-PER - Accueil</title>', f'<title>IA-PER — {title}</title>')
    html = html.replace('</head>', '<style>\n' + fonts + '\n' + styles + '\n' + base_card_css + '\n' + common + '\n' + variant_css + '\n</style></head>')
    html = html.replace('</body>', '<script>\n' + script + '\n</script></body>')
    (OUT / f'{slug}.html').write_text(html, encoding='utf-8')
    print(f'{slug}.html: {len(html.encode()):,} bytes; all assets embedded')
