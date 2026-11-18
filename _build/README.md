# Build

The site is three static pages built from one template:

- `_build/template.html` - the page (English text as fallback)
- `_build/i18n.js` - all texts in EN / DA / ES (Argentine Spanish)
- `_build/build.py` - writes `index.html` (EN), `da/index.html` and `es/index.html`

After changing text or layout: `python3 _build/build.py`, check mobile, then commit.
`_build/` is excluded from deploys via `.vercelignore`.
