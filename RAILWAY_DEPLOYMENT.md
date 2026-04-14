# Railway Deployment Guide

This project is configured for monorepo deployment on Railway.

## 1. Connect Repository

1. Push code to GitHub.
2. In Railway, create a new project from this repository.
3. Use the repository root as the service root.

## 2. Service Commands

- Build Command: npm run build
- Start Command: npm start

`npm start` now runs a strict environment preflight before booting the API.

## 3. Required Environment Variables

Set these in Railway service variables:

- NODE_ENV=production
- PORT=5000 (Railway usually injects PORT automatically)
- MONGO_URI
- JWT_SECRET
- JWT_EXPIRE=30d
- FRONTEND_URL=https://<your-railway-domain>
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- EMAIL_USER
- EMAIL_PASS
- STORE_OWNER_EMAIL
- REACT_APP_API_URL=https://<your-railway-domain>/api
- REACT_APP_BACKEND_URL=https://<your-railway-domain>
- REACT_APP_STRIPE_PUBLISHABLE_KEY=<stripe-publishable-key>

## 4. Stripe Webhook

Create webhook endpoint in Stripe Dashboard:

- URL: https://<your-railway-domain>/api/payment/webhook
- Events: payment_intent.succeeded, payment_intent.payment_failed

Use signing secret as STRIPE_WEBHOOK_SECRET.

## 5. Atlas and Network

- Allow Railway outbound IPs or use 0.0.0.0/0 with strong DB credentials.
- Use a least-privileged DB user.

## 6. Smoke Tests After Deploy

Run these checks:

1. GET /api/health returns 200 JSON
2. Register/login works
3. Product listing works
4. Admin image upload works
5. Guest order + COD works
6. Stripe payment + order state is marked paid
7. Webhook updates are accepted

## 7. CI Recommendation

Before each deploy, run:

- npm run build
- npm run preflight (with production-like env vars)

## 8. Security Checklist

- Rotate any previously exposed secrets
- Keep only .env.example in git
- Enable branch protection and required checks
