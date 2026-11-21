// Saves the running API's OpenAPI document to openapi/karatly-api.json, so the web app's types can be
// regenerated from it (npm run generate:api). Start karatly-api first.
//   npm run fetch:api                       from http://localhost:8081
//   KARATLY_API_URL=http://host:port npm run fetch:api
import { writeFile } from 'node:fs/promises';

const base = process.env.KARATLY_API_URL ?? 'http://localhost:8081';
const response = await fetch(`${base}/v3/api-docs`);
if (!response.ok) {
  console.error(`Could not fetch ${base}/v3/api-docs (HTTP ${response.status}). Is karatly-api running?`);
  process.exit(1);
}
const spec = await response.json();
await writeFile(new URL('../openapi/karatly-api.json', import.meta.url), JSON.stringify(spec, null, 2) + '\n');
console.log(`Saved OpenAPI ${spec.info?.version ?? ''} to openapi/karatly-api.json`);
