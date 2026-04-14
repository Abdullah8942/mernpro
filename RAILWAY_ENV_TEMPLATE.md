# Railway Environment Template

Use this as your copy-paste source for Railway service variables.

Important:
- Replace all angle-bracket placeholders with real values.
- Keep NODE_ENV as production.
- Do not wrap values in quotes in Railway UI.

## Core Runtime Variables

NODE_ENV=production
PORT=5000
MONGO_URI=<mongodb+srv://username:password@cluster/dbname>
JWT_SECRET=<long-random-secret-64-plus-chars>
JWT_EXPIRE=30d
FRONTEND_URL=https://<your-railway-domain>

## Stripe Variables

STRIPE_SECRET_KEY=<sk_live_or_sk_test_key>
STRIPE_PUBLISHABLE_KEY=<pk_live_or_pk_test_key>
STRIPE_WEBHOOK_SECRET=<whsec_from_stripe_webhook>

## Email Variables

EMAIL_USER=<smtp-or-gmail-user>
EMAIL_PASS=<smtp-or-app-password>
STORE_OWNER_EMAIL=<owner-email-address>

## Frontend Build Variables (CRA)

REACT_APP_API_URL=https://<your-railway-domain>/api
REACT_APP_BACKEND_URL=https://<your-railway-domain>
REACT_APP_STRIPE_PUBLISHABLE_KEY=<pk_live_or_pk_test_key>

## Stripe Webhook Setup

Webhook endpoint URL:
https://<your-railway-domain>/api/payment/webhook

Subscribe to events:
- payment_intent.succeeded
- payment_intent.payment_failed

## Deploy Commands in Railway Service

Build Command:
npm run build

Start Command:
npm start

## Pre-Launch Checklist

1. Verify all required variables are present.
2. Ensure no placeholder values remain.
3. Trigger a fresh deploy after saving variables.
4. Confirm /api/health returns 200.
5. Complete one COD order and one Stripe order.
