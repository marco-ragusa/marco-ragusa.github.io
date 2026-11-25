# marco-ragusa.github.io

Personal site of Marco Ragusa, DevOps & SRE engineer. Static HTML/CSS/JS, served by GitHub Pages. No build step.

## Files

- `index.html`: all content
- `style.css`: layout, light/dark theme
- `script.js`: theme toggle, uptime strip, role durations
- `assets/fonts/`: Archivo variable font, self-hosted (SIL OFL, see `OFL.txt`)
- `assets/og-image.png`: link preview image (1200×630)
- `assets/favicon.svg`, `assets/apple-touch-icon.png`

## Updating experience

Each job is an `<li class="role">` in the Experience list. The "Uptime since June 2017" strip and the
"x years, y months" labels are generated from these attributes, so there is nothing else to edit:

```html
<li class="role" id="avaloq" data-start="2026-01" data-company="Avaloq">
```

- `data-start` / `data-end`: `YYYY-MM`. Leave out `data-end` for the current job, the strip then grows every month by itself.
- `data-company`: label under the strip. Consecutive roles with the same company are merged into one segment.
- `id`: clicking a segment in the strip jumps here.

When the job changes, also regenerate `assets/og-image.png` (it is a static picture of the strip).

## Local preview

```sh
python3 -m http.server 8000
```

then open http://localhost:8000 (opening `index.html` directly from disk blocks the font).
