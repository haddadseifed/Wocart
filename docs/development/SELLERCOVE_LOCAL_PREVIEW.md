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

The devcontainer installs the root workspaces and the SellerCove storefront.
For a first-time or intentionally reset local database, run once from the
repository root:

```bash
npm --prefix cod-server run db:setup:local
```

This applies migrations to local D1 and runs the idempotent base-store seed.
On Codespaces start, the unified startup script refreshes the two synthetic
SellerCove sellers and their local test products before starting Wrangler,
provided the API is not already running. The demo seed is idempotent, does not
reset existing seller passwords by default, and never uses remote D1.

Then start the complete local stack from the repository root:

```bash
bash .devcontainer/start-sellercove.sh
```

The startup script configures private Codespaces origins, starts the API
(8787), dashboard (4321) and storefront (4322), then waits for each HTTP
endpoint and prints its readiness result and log path. The devcontainer also
runs this script automatically on Codespaces start/attach, so you do not need
three terminals or three separate `npm run dev` commands.

Open the forwarded URLs for ports 4321 and 4322 from the Codespaces Ports panel.
Keep all ports private; the setup script does not change visibility. If you
pull new commits into an already-running Codespace, restart the Codespace once
(not Rebuild) so Wrangler reloads the generated local environment before the
services start.

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
