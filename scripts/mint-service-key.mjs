// Mint a service API key for an external client (e.g. their PHP backend).
// Usage: PG_URL="postgres://..." node scripts/mint-service-key.mjs "client-name"
import { createHash, randomBytes } from 'node:crypto';
import pg from 'pg';

const name = process.argv[2] || 'default-client';
const raw = 'sk_live_' + randomBytes(24).toString('hex');
const hash = createHash('sha256').update(raw).digest('hex');
const prefix = raw.slice(0, 16) + '…';

const c = new pg.Client({ connectionString: process.env.PG_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query('insert into public.service_keys (name, key_hash, prefix) values ($1,$2,$3)', [name, hash, prefix]);
await c.end();

console.log(`Service key for "${name}" (store securely — shown ONCE):\n`);
console.log(raw);
