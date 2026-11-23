# How India overtook China — Remotion data story

A 50-second YouTube Short (1080×1920, 30 fps) plus a 1920×1080 landscape cut, built with
[Remotion](https://www.remotion.dev/) (React + TypeScript). It covers the world's most populous
countries from 1960 to 2025, using World Bank data.

| Scene | Time | Component |
|---|---|---|
| Hook: "For centuries, China was #1. Not anymore." | 0–3 s | `src/scenes/Hook.tsx` |
| Bar chart race, top 10, 1960 → 2025, with callouts | 3–38 s | `src/scenes/BarRace.tsx` |
| Zoom into the India/China crossover plus final numbers | 38–45 s | `src/scenes/Crossing.tsx` |
| End card: source, channel, CTA | 45–50 s | `src/scenes/EndCard.tsx` |

## Commands

```bash
npm install
npm run dev               # Remotion Studio at http://localhost:3000
npm run render            # npx remotion render Short out/short.mp4
npm run render:landscape  # npx remotion render Landscape out/landscape.mp4
npm run fetch-data        # re-download World Bank data into src/data/population.json
```

On a network that can't download Remotion's Chrome, point it at an existing build with
`REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell`. Behind an HTTPS proxy, run
`fetch-data` with `NODE_USE_ENV_PROXY=1`.

## Using it as a template

- `src/theme.ts`: colors (one accent), font, safe zones, spring presets.
- `src/config.ts`: scene lengths, on-screen copy, channel name, callouts, hero/rival countries.
- `src/data/population.json`: the data. Callouts marked as data-driven (the crossover year and
  "India passes 1 billion") are computed from it, so they always match the bars.
- Scenes read the composition size and lay out inside the safe zone for that orientation.
  Portrait keeps clear of the Shorts bottom caption area (460 px) and right-hand button column (190 px).

## Data

- **Indicator:** World Bank WDI `SP.POP.TOTL` (Population, total).
  <https://data.worldbank.org/indicator/SP.POP.TOTL>
- **API:** `https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=20000&date=1960:2026`
- **Vintage:** last updated by the World Bank 2026-11-11; retrieved 2026-11-23. Covers 1960–2025.
- **Countries:** the 14 countries that ranked in the top 10 in at least one year, so the chart
  can show ranks changing: India, China, USA, Indonesia, Pakistan, Nigeria, Brazil, Bangladesh,
  Russia, Ethiopia, Mexico, Japan, Germany, UK. Each entry has its own source link in the JSON.
- Values are copied from the API unchanged. Between two published years, values are interpolated
  for animation only; every whole year shows the exact World Bank figure.
- License: CC BY 4.0.

Note: in this World Bank vintage, India passes China in **2021**. The commonly quoted "2023" comes
from UN World Population Prospects (April 2023).

Fonts: Inter (OFL-1.1), bundled in `public/fonts`. Flags: `country-flag-icons` (SVG).
