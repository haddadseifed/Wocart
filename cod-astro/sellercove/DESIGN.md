# SellerCove — design system

## Direction

Premium, restrained, mobile-first commerce. The interface should feel deliberate and trustworthy rather than promotional or crowded. Prioritize legibility, clear product information, and a short path to a real decision.

## Brand palette

| Role | Value |
| --- | --- |
| Obsidian | #050505 |
| Warm ivory | #F7F5EF |
| Metallic gold | #D4AF37 |

The palette is expressed through Wocart color schemes in `src/theme/appearance.ts`. Keep component colors token-driven; do not introduce one-off hex values in component styles.

## Composition

- Use an editorial hierarchy with clear headings and generous spacing.
- Keep the mobile layout readable at narrow widths and on low-bandwidth connections.
- Avoid decorative gradients, neon colors, excessive cards, and false urgency.
- Product photography and factual product details should carry the catalogue when real inventory is connected.
- Keep Arabic RTL, French and English layouts equally deliberate.

## Trust

Only display claims that the store can fulfil. Do not imply global delivery, universal cash-on-delivery, verified reviews, or warranties without evidence and operational support.
