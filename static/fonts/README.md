# Fonts

The original site's font files can't be loaded from another domain, so this copy carries its own, built from the
official releases and checked against the originals: every character the original files contain has the same advance
width, and every kerning pair tested matches (measured in Chrome on claudia.gallery, reproduced here with HarfBuzz).

| File | Source | Licence | What was done |
|---|---|---|---|
| `heros-400.woff2` | TeX Gyre Heros 2.004, Regular | GUST Font License (`LICENSE-TeX-Gyre-Heros-GUST.txt`, which applies the LPPL 1.3c in `LICENSE-TeX-Gyre-Heros-LPPL-1.3c.txt`; upstream notes in `README-TeX-Gyre-Heros.txt`) | Subset to the original file's 232 characters; renamed "Heros Web Subset" as the licence requests for derived fonts |
| `heros-400i.woff2` | TeX Gyre Heros 2.004, Italic | GUST Font License | Same |
| `heros-700.woff2` | TeX Gyre Heros 2.004, Bold | GUST Font License | Same |
| `heroscn-700.woff2` | TeX Gyre Heros Cn 2.004, Bold | GUST Font License | Same, renamed "Heros Cn Web Subset" |
| `dinishcn-900.woff2` | DINish Condensed Black ([playbeing/dinish](https://github.com/playbeing/dinish)) | SIL OFL 1.1, no reserved name (`LICENSE-DINish-OFL.txt`) | Subset to the original file's 227 characters |
| `plexmono-400.woff2` | IBM Plex Mono 2.005, Regular (`@ibm/plex-mono` 2.5.0) | SIL OFL 1.1, reserved name "Plex" (`LICENSE-IBM-Plex-Mono-OFL.txt`) | Unmodified. `site.css` limits it to the original file's characters with `unicode-range` |
| `plexmono-500.woff2` | IBM Plex Mono 2.005, Medium | SIL OFL 1.1 | Unmodified, same `unicode-range` |

Subsets were made with fontTools' `pyftsubset` defaults (default layout features, hinting kept), which reproduce the
original files' sizes to within a few percent.
