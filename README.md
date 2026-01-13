# Reflxy

Reflxy helps users understand the emotional impact of written messages before sending. It is a reflective decision-support tool, not a writing assistant.

## Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma ORM (Postgres)
- NextAuth (email magic link)
- Stripe subscriptions
- OpenAI API

## Local setup

### Requirements

- Node.js 18.19+
- npm 9+

### Install

```bash
npm install
```

### Environment

```bash
cp .env.example .env
```

Fill in:

- `OPENAI_API_KEY` for live analysis.
- `NEXTAUTH_URL` and `NEXTAUTH_SECRET`.
- `EMAIL_SERVER` and `EMAIL_FROM` for magic-link email sign-in.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_YEARLY_PRICE_ID`.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` for Stripe Checkout.
- `NEXT_PUBLIC_SITE_URL` for SEO URLs.
- `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` for error monitoring (optional).
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` for rate limiting (recommended).

### Database

Start Postgres locally:

```bash
docker compose up -d
```

```bash
npx prisma migrate dev
npx prisma db seed
```

### Run the app

```bash
npm run dev
```

Open `http://localhost:3011`.

If you need to reset the build cache, stop the dev server first and run:

```bash
npm run dev:clean
```

## Stripe setup

1. Create monthly and yearly subscription prices in Stripe.
2. Set the price IDs in `.env`.
3. Add a webhook endpoint for `POST /api/stripe/webhook`.
4. Subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## Email auth

Use any SMTP provider. Example format:

```
EMAIL_SERVER="smtp://USER:PASSWORD@smtp.provider.com:587"
EMAIL_FROM="Reflxy <no-reply@yourdomain.com>"
```

## Rate limiting (recommended for production)

Reflxy uses Upstash Redis when credentials are present. Without it, the app falls
back to a memory limiter (single instance only).

## Error monitoring

Set `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` to enable Sentry in production.

## Production build

```bash
npm run build
npm run start
```

## Notes

- Free tier: 5 analyses per day, last 10 saved analyses.
- Premium tier: unlimited analyses, scenario mode, PDF export, impact timeline.
