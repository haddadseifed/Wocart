# SellerCove storefront theme

Independent SellerCove storefront built on Wocart's published `@wocart/storefront` and `@wocart/theme` SDKs.

## Brand
- Obsidian #050505
- Warm ivory #F7F5EF
- Metallic gold #D4AF37
- Arabic, French and English
- Mobile-first, restrained editorial design

## Scope and launch gates
This is an initial storefront shell. Product cards, prices, stock, and reviews must come from the connected store data. No sample products, fake prices, fabricated reviews, or unverified delivery claims are added. Wocart's current order and delivery model is Algeria-focused; international checkout and fulfilment must not be presented as available until separately supported and configured.

## Local development
Requires Node.js 22.12+ and a configured Wocart API.

```sh
npm ci
cp .dev.vars.example .dev.vars
npm run dev
```

Set `STORE_API_KEY` and `COD_SERVER_URL` in the ignored `.dev.vars` file. Never commit credentials.

## Verification

```sh
npm test
npx astro check
npm run build
```

Deployment is not configured or run in this initial branch.
