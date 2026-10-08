# claudia.gallery study copy

A study copy of the homepage of [claudia.gallery](https://claudia.gallery/), rebuilt to learn from its design.
**Claudia by anabology.** This is not the original site and is not affiliated with it.

- Live copy: https://plexormedia.github.io/claudia-gallery-study2/
- Original: https://claudia.gallery/
- Terms for using Claudia and the site's images: https://claudia.gallery/use/

## What's here

| Path | What it is |
|---|---|
| `index.html` | The original homepage, adapted as listed below |
| `static/css/site.css` | The original stylesheet. It also holds the styles for the site's other pages (film rooms, gallery, lightbox, wiki) |
| `static/css/study-copy.css` | The only new styles: the "Study copy" tag and the footer note |
| `static/js/site.js` | The original script: split-flaps, hero slideshow and detector boxes, header, video loops, copy buttons, gallery, lightbox, film player |
| `static/js/hls.light.min.js` | hls.js 1.7.3 (Apache 2.0), byte-identical to the file the original serves |
| `static/fonts/` | The fonts, rebuilt from their official releases. See `static/fonts/README.md` |

Only the homepage is copied. Links to the site's other pages, and all images, videos and films, point to claudia.gallery,
which allows other sites to load them. Please keep it that way: no bulk downloading.

## What changed from the original

The first commit (`2c50741`) holds the homepage's HTML, CSS and JavaScript exactly as claudia.gallery served them on
8 October 2026. To see every change since, run `git diff 2c50741 -- index.html static/css static/js` or open the
[comparison on GitHub](https://github.com/plexormedia/claudia-gallery-study2/compare/2c50741...main).

1. **Paths.** GitHub Pages serves this site under `/claudia-gallery-study2/`, so the page's own files (CSS, JS, fonts)
   use relative paths instead of root paths like `/static/...`.
2. **Media and other pages.** Images, videos, films (HLS streams), the favicon and links to the other pages use full
   `https://claudia.gallery/...` URLs.
3. **Fonts.** The original font files can't be loaded from another domain, so they are rebuilt from the same typefaces
   (TeX Gyre Heros, DINish, IBM Plex Mono). Plex Mono's `@font-face` rules gained a `unicode-range` so it covers exactly
   the characters the original's file does.
4. **Analytics removed.** The original's Cloudflare analytics script reports to the site owner's account.
5. **Labelled as a copy.** A "Study copy" tag in the header, a credit note in the footer, "(study copy)" in the title and
   link previews, and a `noindex` tag so search engines don't list it. The canonical link still points to the original.

The film-page scripts in `site.js` (gallery filters, lightbox) are unchanged and still expect the original site's paths;
the homepage doesn't use them.

## Licences

- Claudia and the site's images are used as the original site allows: https://claudia.gallery/use/
- The page's HTML, CSS and JavaScript belong to their author; they are reproduced here for study, with credit.
- Fonts: GUST Font License (TeX Gyre Heros) and SIL Open Font License 1.1 (DINish, IBM Plex Mono). Licence files and
  details are in `static/fonts/`.
- hls.js: Apache License 2.0, see `static/js/LICENSE-hls.js.txt`.
