# Sri Sathya Sai District CSR Portal

A static website for the Corporate Social Responsibility (CSR) Facilitation Cell of Sri Sathya Sai District, Government of Andhra Pradesh. It connects corporate CSR funding with district development priorities — infrastructure, education, healthcare, water supply, sanitation, and clean energy — and gives companies a single-window channel to propose and adopt projects with the District Administration.

**Live site:** https://csr-srisathyasai.vercel.app/
**Official district portal:** https://srisathyasai.ap.gov.in/

## Pages

| Page | Description |
|---|---|
| [`index.html`](index.html) | Homepage — district snapshot stats, priority sectors, featured CSR project proposals, leadership message, partner CTA, and the CSR proposal (EoI) form |
| [`about-district.html`](about-district.html) | District profile — administrative demographics, official district map, geography & climate, industrial/agricultural economy, and the full list of 32 mandals |

## Tech stack

Plain static HTML/CSS/JS — no build step, no framework, no package manager.

- **Bootstrap 5** for layout/components (`bootstrap.min.css`)
- **jQuery**, **WOW.js** + **animate.css** for scroll animations, **Waypoints** + **CounterUp** for animated stat counters, **Owl Carousel** (library included, not currently used on any page)
- **Bootstrap Icons** and **Font Awesome 6** (loaded via CDN) for iconography
- Google Fonts: Bai Jamjuree (headings) and Inter (body)
- Custom theme variables and component styling layered on top in `style.css` and inline `<style>` blocks in each page

## Project structure

```
index.html                About District CSR Portal homepage
about-district.html        District profile page
style.css                  Custom site styles
main.js                    Site behavior (spinner, sticky nav, counters, back-to-top, carousels)
bootstrap.min.css          Bootstrap framework
animate.min.css, wow.min.js, easing.min.js, waypoints.min.js, counterup.min.js, owl.carousel.min.{css,js}
                            Third-party UI libraries
img/                        All site imagery — see below
```

### `img/` contents

- `csr_logo.svg` — site emblem (inline SVG, used as favicon and header logo)
- `cm.jpg`, `collector.jpg`, `collector-portrait.jpg`, `joint-collector.jpg`, `joint-collector-portrait.jpg` — official photos of the Chief Minister, Collector, and Joint Collector (headshots for compact badges, portraits for the Leadership Message section)
- `district-map.jpg` — official AP Government constituency-wise map of Sri Sathya Sai District (compressed from a 24MB/14042×9934px source to ~475KB/2000px wide for web use)
- `roads.png` / `drainage.png` / `endowments.png` / `sports.png` / `education.png` / `disaster.png` / `fisheries.png` / `health.png` / `sanitation.png` / `solar.png` / `plantation.png` / `public_utilities.png` (+ `*_active.png` hover variants) — generic sector icons for the Priority Sectors grid

## Running locally

No build or dev server is required — these are plain static files. Open `index.html` directly in a browser, or serve the folder with any static file server, e.g.:

```bash
npx serve .
# or
python -m http.server 8000
```

## Deployment

Deployed on [Vercel](https://vercel.com/), connected to this GitHub repository. Pushing to `main` triggers an automatic production redeploy — no `vercel.json` or build configuration needed since the site is served as static files.

## Content accuracy notes

District facts (formation date, revenue divisions, mandals, villages, population, geography, industries) are sourced from public records (Wikipedia, official district portal, news coverage) and cross-checked where possible. Featured project outlays are **indicative planning figures for discussion**, not confirmed or collected CSR funds — this is stated on the homepage. The Corporate Partners section is an open invitation for founding partners rather than a list of confirmed partners, since none are confirmed yet.
