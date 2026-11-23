// Re-downloads World Bank SP.POP.TOTL and rewrites src/data/population.json.
// Usage: node scripts/fetch-population.mjs
// Keeps every country (aggregates excluded) that ranked top-10 in any year.
import {writeFileSync} from 'node:fs';

const API = 'https://api.worldbank.org/v2';
const SHORT = {USA: 'USA', RUS: 'Russia', GBR: 'UK'};

const get = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
};

const countryListUrl = `${API}/country?format=json&per_page=400`;
const dataUrl = `${API}/country/all/indicator/SP.POP.TOTL?format=json&per_page=20000&date=1960:2100`;

const [, countries] = await get(countryListUrl);
const real = new Map(countries.filter((c) => c.region.id !== 'NA').map((c) => [c.id, c]));
const [header, rows] = await get(dataUrl);

const data = {};
for (const r of rows) {
  if (!real.has(r.countryiso3code) || r.value === null) continue;
  (data[r.countryiso3code] ??= {})[Number(r.date)] = r.value;
}
// Latest year with values for (nearly) every country.
const counts = {};
Object.values(data).forEach((d) => Object.keys(d).forEach((y) => (counts[y] = (counts[y] ?? 0) + 1)));
const lastYear = Math.max(...Object.keys(counts).filter((y) => counts[y] >= real.size * 0.9).map(Number));
const years = Array.from({length: lastYear - 1960 + 1}, (_, i) => 1960 + i);

const union = new Set();
for (const y of years) {
  Object.entries(data)
    .filter(([, d]) => d[y] !== undefined)
    .sort((a, b) => b[1][y] - a[1][y])
    .slice(0, 10)
    .forEach(([k]) => union.add(k));
}
for (const k of union) {
  const missing = years.filter((y) => data[k][y] === undefined);
  if (missing.length) throw new Error(`${k} is missing ${missing.join(', ')} — not filling gaps.`);
}

const out = {
  meta: {
    indicator: 'SP.POP.TOTL',
    indicatorName: 'Population, total',
    source: 'World Bank, World Development Indicators',
    sourceUrl: 'https://data.worldbank.org/indicator/SP.POP.TOTL',
    apiUrl: dataUrl.replace('2100', '2026'),
    countryListApiUrl: countryListUrl,
    license: 'CC BY 4.0 (https://datacatalog.worldbank.org/public-licenses#cc-by)',
    wbLastUpdated: header.lastupdated,
    retrievedOn: new Date().toISOString().slice(0, 10),
    firstYear: years[0],
    lastYear,
    selection:
      'Every country (aggregates excluded) that ranked in the top 10 by SP.POP.TOTL in at least one year 1960-' +
      lastYear +
      ', so the bar chart race can show ranks changing. Values are copied verbatim from the API; no interpolation or estimation.',
    notes: [
      'The World Bank reports historical series for present-day borders (e.g. Russian Federation and Germany are given for 1960 onward).',
      "In this World Bank vintage India's population exceeds China's from 2021 onward.",
    ],
  },
  years,
  countries: [...union]
    .sort((a, b) => data[b][lastYear] - data[a][lastYear])
    .map((k) => {
      const c = real.get(k);
      return {
        iso3: k,
        iso2: c.iso2Code,
        name: c.name,
        shortName: SHORT[k] ?? c.name,
        sourceUrl: `https://data.worldbank.org/indicator/SP.POP.TOTL?locations=${c.iso2Code}`,
        apiUrl: `${API}/country/${k}/indicator/SP.POP.TOTL?format=json&per_page=100`,
        values: years.map((y) => data[k][y]),
      };
    }),
};
writeFileSync(new URL('../src/data/population.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(`Wrote ${out.countries.length} countries, ${years[0]}-${lastYear} (WB updated ${header.lastupdated}).`);
