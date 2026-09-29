import { buildHeaders } from './build-headers.mjs';

await buildHeaders({ log: false });
const secondPass = await buildHeaders({ log: false });

if (secondPass.changed.length) {
  throw new Error(`Header generator is not idempotent: ${secondPass.changed.join(', ')}`);
}

console.log(`Header generator is idempotent across ${secondPass.pages.length} pages.`);
