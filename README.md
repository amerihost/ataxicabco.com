# ataxicabco.com

Reviewed rebuild for A Happy Taxi Cab Co. in Beaufort, South Carolina.

## Cloudflare Pages

Build command:

```bash
PORT=4173 BASE_PATH=/ pnpm --filter @workspace/ataxicabco run build
```

Output directory: `artifacts/ataxicabco/dist/public`

The reservation endpoint is a Cloudflare Pages Function at `functions/api/reservation.js`. Configure the Resend and optional Turnstile environment variables in Cloudflare; no credential values belong in this repository.
