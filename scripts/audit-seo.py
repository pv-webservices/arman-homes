"""Audit built HTML and sitemap without making any network requests."""
from html.parser import HTMLParser
from html import unescape
from pathlib import Path
from urllib.parse import urlsplit, unquote
from xml.etree import ElementTree as ET
from datetime import datetime
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
ORIGIN = 'https://armanhomes.in'


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.title = ''
        self.in_title = False
        self.in_schema = False
        self.schemas = []
        self.schema_text = ''
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if tag == 'title': self.in_title = True
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.in_schema = True
            self.schema_text = ''

    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
        if tag == 'script' and self.in_schema:
            self.schemas.append(self.schema_text)
            self.in_schema = False

    def handle_data(self, text):
        if self.in_title: self.title += text
        if self.in_schema: self.schema_text += text

    def meta(self, key):
        return next((a.get('content', '') for t, a in self.tags if t == 'meta' and key in (a.get('name'), a.get('property'))), '')


def audit(dist=DIST):
    errors, pages, titles, descriptions, indexable, links = [], {}, {}, {}, set(), set()
    whatsapp_links, phone_links, forms = 0, 0, 0
    for file in dist.rglob('*.html'):
        route = '/' + file.relative_to(dist).as_posix()
        route = route[:-10] if route.endswith('index.html') else route
        pages[route] = Page(file.read_text(encoding='utf-8'))
    def check(ok, route, message):
        if not ok: errors.append(f'{route}: {message}')
    for route, page in sorted(pages.items()):
        check(0 < len(page.title) <= 65, route, 'title must be 1–65 characters')
        description = page.meta('description')
        check(70 <= len(description) <= 170, route, f'description must be 70–170 characters (got {len(description)})')
        check(page.title not in titles, route, 'duplicate title')
        check(description not in descriptions, route, 'duplicate description')
        titles[page.title], descriptions[description] = route, route
        headings = [int(a.get('aria-level', t[1])) for t, a in page.tags if re.fullmatch('h[1-6]', t)]
        check(headings.count(1) == 1, route, 'expected exactly one H1')
        check(all(b <= a + 1 for a, b in zip([0] + headings, headings)), route, 'skipped heading level')
        canonicals = [a.get('href') for t, a in page.tags if t == 'link' and a.get('rel') == 'canonical']
        robots = page.meta('robots')
        if 'noindex' in robots:
            check(not canonicals, route, 'noindex page has canonical')
            check('follow' in robots and 'nofollow' not in robots, route, 'utility page must allow following links')
        else:
            indexable.add(ORIGIN + route)
            check(robots == 'index, follow, max-image-preview:large', route, 'incorrect indexable robots')
            check(canonicals == [ORIGIN + route], route, 'missing or incorrect self-canonical')
            check(bool(re.fullmatch(r'/(?:[a-z0-9-]+/)*', route)), route, 'unclean URL')
            check(page.meta('og:url') == ORIGIN + route, route, 'incorrect og:url')
        for key in ['og:title', 'og:description', 'og:type', 'og:site_name', 'og:image', 'og:image:alt', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']:
            check(bool(page.meta(key)), route, f'missing {key}')
        check(page.meta('og:image:width') == '1200' and page.meta('og:image:height') == '630', route, 'social image dimensions')
        for tag, attrs in page.tags:
            if tag == 'form' and 'data-inquiry-form' in attrs:
                forms += 1
                check(not attrs.get('action') and not attrs.get('method'), route, 'enquiry has native submission endpoint')
            if tag == 'a' and attrs.get('href', '').startswith('tel:'):
                phone_links += 1
                check(attrs['href'] == 'tel:+919354210824', route, 'incorrect phone destination')
            if tag == 'a' and 'wa.me' in attrs.get('href', ''):
                whatsapp_links += 1
                from urllib.parse import parse_qs
                wa = urlsplit(attrs['href'])
                check(wa.scheme == 'https' and wa.netloc == 'wa.me' and wa.path == '/919354210824' and bool(parse_qs(wa.query).get('text', [''])[0]), route, 'incorrect WhatsApp link or missing message')
            if tag == 'a' and attrs.get('target') == '_blank':
                check({'noopener', 'noreferrer'} <= set(attrs.get('rel', '').split()), route, 'unsafe external handoff')
            if tag == 'img':
                check('alt' in attrs, route, f'image missing alt: {attrs.get("src")}')
                check(int(attrs.get('width', '0')) > 0 and int(attrs.get('height', '0')) > 0, route, 'image missing dimensions')
            for attr in ['href', 'src', 'poster']:
                value = attrs.get(attr, '')
                if value.startswith('/') and not value.startswith('//'): links.add((route, value))
                if value.startswith('#'): links.add((route, route + value))
            if tag in ['img', 'source']:
                for candidate in attrs.get('srcset', '').split(','):
                    if candidate.strip().startswith('/'): links.add((route, candidate.strip().split()[0]))
        schemas = []
        for schema in page.schemas:
            check('<' not in schema, route, 'unescaped less-than sign in JSON-LD')
            try: schemas.extend(json.loads(schema).get('@graph', []))
            except (ValueError, AttributeError): check(False, route, 'invalid JSON-LD')
        types = {s.get('@type') for s in schemas}
        check({'RealEstateAgent', 'WebSite'} <= types, route, 'missing business or website schema')
        for schema in schemas:
            if schema.get('@type') == 'RealEstateAgent':
                check(all(schema.get(key) for key in ['@id', 'url', 'logo', 'telephone', 'address']), route, 'incomplete business schema')
            if schema.get('@type') == 'WebSite':
                check(all(schema.get(key) for key in ['@id', 'url', 'publisher']), route, 'incomplete website schema')
            if schema.get('@type') == 'BreadcrumbList':
                items = schema.get('itemListElement', [])
                check(len(items) >= 2 and all(item.get('position') == i + 1 and item.get('name') and item.get('item', '').startswith(ORIGIN + '/') for i, item in enumerate(items)), route, 'invalid breadcrumb items')
        if route != '/' and 'noindex' not in robots: check('BreadcrumbList' in types, route, 'missing breadcrumb schema')
        for required in ['/favicon.svg', '/favicon.ico', '/apple-touch-icon.png', '/site.webmanifest']:
            check(any(a.get('href') == required for t, a in page.tags if t == 'link'), route, f'missing icon/manifest {required}')
        social = urlsplit(page.meta('og:image'))
        social_file = dist / social.path.lstrip('/')
        check(social_file.is_file(), route, 'missing social image')
        if social_file.is_file():
            data = social_file.read_bytes()
            check(data[:8] == b'\x89PNG\r\n\x1a\n' and int.from_bytes(data[16:20], 'big') == 1200 and int.from_bytes(data[20:24], 'big') == 630, route, 'social card must be 1200×630')
    for route, value in sorted(links):
        parsed = urlsplit(value)
        relative = unquote(parsed.path).lstrip('/')
        target = dist / relative
        if target.is_dir(): target = target / 'index.html'
        check(target.is_file(), route, f'broken link or asset: {value}')
        if parsed.fragment and target.suffix == '.html' and target.is_file():
            parsed_page = Page(target.read_text(encoding='utf-8'))
            check(any(a.get('id') == unquote(parsed.fragment) for t, a in parsed_page.tags), route, f'missing fragment: {value}')
    for file in [*dist.rglob('*.html'), *dist.rglob('*.js')]:
        check(not re.search(r'formsubmit\.co|emailjs|nodemailer|_replyto|smtp\b', file.read_text(encoding='utf-8'), re.I), str(file.relative_to(dist)), 'obsolete email-form integration')
    for file in dist.rglob('*.css'):
        for value in re.findall(r'url\([\'\"]?([^\)\'\"]+)', file.read_text(encoding='utf-8')):
            if value.startswith(('data:', 'http:', 'https:')): continue
            target = dist / value.lstrip('/') if value.startswith('/') else file.parent / value
            check(target.is_file(), str(file.relative_to(dist)), f'broken CSS resource: {value}')
    check('/thank-you/' not in pages, 'routes', 'obsolete success route retained')
    check(forms == 6, 'forms', f'expected six WhatsApp enquiry forms, got {forms}')
    ico = (dist / 'favicon.ico').read_bytes()
    check(ico[:6] == b'\x00\x00\x01\x00\x01\x00' and ico[6:8] == b'00', 'favicon', 'ICO missing 48px representation')
    sitemap = ET.parse(dist / 'sitemap.xml').getroot()
    urls = {node.text for node in sitemap.findall('{*}url/{*}loc')}
    check(urls == indexable, 'sitemap', f'URLs differ from indexable pages: {urls ^ indexable}')
    for url in sitemap.findall('{*}url'):
        if url.find('{*}lastmod') is None: continue
        try: datetime.fromisoformat(url.findtext('{*}lastmod', '').replace('Z', '+00:00'))
        except ValueError: check(False, 'sitemap', 'missing or invalid lastmod')
    index = ET.parse(dist / 'sitemap-index.xml').getroot()
    check(index.findtext('{*}sitemap/{*}loc') == ORIGIN + '/sitemap.xml', 'sitemap-index', 'incorrect sitemap location')
    robots = (dist / 'robots.txt').read_text()
    check('Allow: /' in robots and 'Disallow:' not in robots and 'Sitemap: ' + ORIGIN + '/sitemap-index.xml' in robots, 'robots', 'incorrect crawler directives')
    for size in [48, 96, 192, 512, 180]:
        file = dist / (f'favicon-{size}x{size}.png' if size != 180 else 'apple-touch-icon.png')
        data = file.read_bytes() if file.is_file() else b''
        check(data[:8] == b'\x89PNG\r\n\x1a\n' and int.from_bytes(data[16:20], 'big') == size and int.from_bytes(data[20:24], 'big') == size, 'favicon', f'missing or incorrect {size}px square PNG')
    manifest = json.loads((dist / 'site.webmanifest').read_text())
    check(all(manifest.get(key) for key in ['name', 'short_name', 'icons', 'theme_color', 'background_color']), 'manifest', 'missing required fields')
    for icon in manifest.get('icons', []): check((dist / icon.get('src', '').lstrip('/')).is_file(), 'manifest', 'missing icon file')
    return {'passed': not errors, 'pages': len(pages), 'indexable': len(indexable), 'internal_links_and_assets': len(links), 'whatsapp_links': whatsapp_links, 'phone_links': phone_links, 'forms': forms, 'issues': errors, 'indexable_urls': sorted(indexable)}


if __name__ == '__main__':
    report = audit()
    (ROOT / 'output/audit').mkdir(parents=True, exist_ok=True)
    (ROOT / 'output/audit/seo.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if report['passed'] else 1)
