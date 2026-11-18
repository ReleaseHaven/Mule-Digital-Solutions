#!/usr/bin/env python3
"""Build static language pages: / (en), /da, /es from _build/template.html + _build/i18n.js.
Run from the repo root:  python3 _build/build.py"""
import json, re, subprocess, html, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.loads(subprocess.check_output(['node', '-e',
    "global.window={};require(process.argv[1]);console.log(JSON.stringify(window.MDS_T))",
    os.path.join(ROOT, '_build', 'i18n.js')]))
tpl = open(os.path.join(ROOT, '_build', 'template.html'), encoding='utf-8').read()
BASE = 'https://www.muledigitalsolutions.com'
PAGES = {
    'en': {'out': 'index.html',    'url': BASE + '/',   'home': '/',   'og': 'og-image.png'},
    'da': {'out': 'da/index.html', 'url': BASE + '/da', 'home': '/da', 'og': 'og-image-da.png'},
    'es': {'out': 'es/index.html', 'url': BASE + '/es', 'home': '/es', 'og': 'og-image-es.png'},
}
def esc(t): return html.escape(t, quote=True)
for lang, cfg in PAGES.items():
    tr = T[lang]; m = tr['meta']; s = tpl
    def text_sub(mo):
        key = mo.group(2)
        return mo.group(1) + (esc(tr[key]).replace('&#x27;', "'") if key in tr else mo.group(3)) + mo.group(4)
    s = re.sub(r'(<[^>]*\bdata-i18n="([^"]+)"[^>]*>)([^<]*)(</)', text_sub, s)
    def html_sub(mo):
        key = mo.group(2)
        return mo.group(1) + tr.get(key, mo.group(3)) + mo.group(4)
    s = re.sub(r'(<[^>]*\bdata-i18n-html="([^"]+)"[^>]*>)(.*?)(</h2>)', html_sub, s, flags=re.S)
    rep = {'{{htmllang}}': m['lang'], '{{lang}}': lang, '{{title}}': esc(m['title']), '{{desc}}': esc(m['desc']),
           '{{url}}': cfg['url'], '{{home}}': cfg['home'], '{{ogimage}}': cfg['og'], '{{oglocale}}': m['ogLocale']}
    for k, v in rep.items(): s = s.replace(k, v)
    # hero first word + data for site.js
    s = s.replace('<span class="hero-word" id="heroWord">business</span>',
                  '<span class="hero-word" id="heroWord">' + esc(tr['words'][0]) + '</span>')
    s = s.replace('<html ', "<html data-words='" + esc(json.dumps(tr['words'], ensure_ascii=False)) + "' ", 1)
    wa = 'https://wa.me/4521962866?text=' + __import__('urllib.parse').parse.quote(tr['wa'])
    s = s.replace('href="https://wa.me/4521962866"', 'href="' + wa + '"')
    s = re.sub(r'(class="lang-btn" href="[^"]*" data-lang="%s")' % lang, r'\1 aria-current="page"', s)
    s = s.replace('aria-current="page"', 'aria-current="page" class-active', 1)
    s = re.sub(r'class="lang-btn" (href="[^"]*" data-lang="%s" aria-current="page") class-active' % lang, r'class="lang-btn active" \1', s)
    assert '{{' not in s, re.findall(r'\{\{\w+\}\}', s)
    out = os.path.join(ROOT, cfg['out']); os.makedirs(os.path.dirname(out) or ROOT, exist_ok=True)
    open(out, 'w', encoding='utf-8').write(s)
    print('built', cfg['out'])
