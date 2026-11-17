# SellerCove local preview (Codespaces)

This is a local-only development setup. It does not create Cloudflare resources,
deploy a Worker, contact production D1, configure DNS, or use real customer data.

## What is included

- `cod-server/wrangler.toml`: local Worker bindings and a local D1 database named
  `codflow-os-db`; no production environment is defined.
- `cod-client-astro/wrangler.toml`: dashboard D1 binding to the same local
  database and the same `.wrangler-shared` persistence directory configured
  in `astro.config.mjs`.
- `cod-server/scripts/seed-sellercove-demo.mjs`: repeatable synthetic fixture:
  one local store with cart enabled, two approved sellers, two seller-owner
  accounts, one product per seller, and known DZD prices/stock.
- The existing `seed-store.ts` still supplies store defaults and a default
  shipping profile/rates on an empty local database.

## Requirements

Node.js 22.12 or newer and npm. Open the repository root in GitHub Codespaces.
Do not run any command containing `--remote`, `deploy`, or `production`.

## Local-only environment files

The Codespaces startup script configures these ignored files automatically
before launching the API and storefront. It uses GitHub's built-in
`CODESPACE_NAME` and `GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN` variables
to derive the forwarded origins, preserves existing secrets and unrelated
entries, and creates a local-only `BETTER_AUTH_SECRET` if one is missing.

To regenerate the values manually from the repository root, run:

```bash
node cod-server/scripts/configure-sellercove-codespaces.mjs
```

The script configures:

- `cod-server/.dev.vars`: the shared local `STORE_API_KEY` and exact
  `ALLOWED_ORIGINS` for ports 4321 and 4322.
- `cod-astro/sellercove/.dev.vars`: the same `STORE_API_KEY` and
  `COD_SERVER_URL=http://localhost:8787` for server-side storefront calls.
- `cod-client-astro/.dev.vars`: a preserved/generated local
  `BETTER_AUTH_SECRET`, `PUBLIC_APP_URL` and `PUBLIC_TRUSTED_ORIGINS`
  for port 4321, plus `PUBLIC_API_URL` for port 8787.

The script never changes port visibility. Keep ports 4321, 4322 and 8787
private. The browser-facing origins are derived from Codespaces; internal
server-to-server calls continue to use localhost. **Do not use `*`** for
credentialed CORS. If you run the configurator manually while the API is
already running, restart the API once so Wrangler reloads the updated
`ALLOWED_ORIGINS`. A normal Codespace restart runs configuration before
starting the services.

The dashboard signs users in at `/sign-in`. The dashboard obtains a short-lived
JWT from its own same-origin auth endpoint, then the browser sends that JWT to
the API at `PUBLIC_API_URL`. The API validates it against the dashboard JWKS
at `BETTER_AUTH_URL=http://localhost:4321/api/auth` from inside Codespaces.
The storefront runs its server-side API calls against
`COD_SERVER_URL=http://localhost:8787`; this internal localhost URL is correct
for the server process and is intentionally different from the phone-facing
dashboard API URL.

## Start from a clean local database

Run from the repository root:

```bash
npm ci
```

Then, in the `cod-server` directory:

```bash
npm run db:setup:local
npm run db:seed:sellercove:local
npm run dev
```

The first command applies migrations to local D1 and runs the existing
idempotent store seed. The second adds the two synthetic sellers and products.
Neither command has a remote mode in this preview workflow. The API listens on
port 8787.

In a second terminal, from `cod-client-astro`:

```bash
npm ci
npm run dev -- --host 0.0.0.0 --port 4321
```

The dashboard listens on port 4321. Open its forwarded URL on the phone, sign in
at `/sign-in` as `seller-a@example.test` or
`seller-b@example.test`, then open `/seller/orders`.

In a third terminal, from `cod-astro/sellercove`:

```bash
npm ci
npm run dev -- --host 0.0.0.0 --port 4322
```

The storefront listens on port 4322. Open its forwarded URL on the phone and
visit `/products/demo-seller-a-product`. Use synthetic buyer details and an
Algerian wilaya/commune that is offered by the local seeded shipping profile.
Place one order for Seller A, then refresh the Seller A portal. Seller B's
portal must not show Seller A's order. The cart pilot rejects a basket mixing
Seller A and Seller B products.

## Synthetic account credentials

The fixture's default passwords are intentionally public local-test values:

- Seller A: `seller-a@example.test` / `SellerA-local-only-2026!`
- Seller B: `seller-b@example.test` / `SellerB-local-only-2026!`

Override them before running the seed with
`SELLERCOVE_SELLER_A_PASSWORD` and `SELLERCOVE_SELLER_B_PASSWORD`.
Never reuse these credentials outside the isolated local D1 database.

## Important limitations

- The fixture contains no real seller, customer, carrier, payment, or production
  data. It does not create a carrier integration or a settlement ledger.
- Product images are intentionally omitted; the product cards use the theme's
  empty-image treatment.
- A fresh local database is required for the default shipping seed to create its
  default profile. The setup is additive and does not delete existing rows.
- The first real phone test still needs to verify the forwarded port URL,
  Better Auth sign-in, checkout, stock decrement, and seller isolation. CI cannot
  prove those interactive network paths.
