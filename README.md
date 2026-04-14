# Meraab & Emaan E-Commerce

MERN-stack e-commerce application with admin dashboard, product management, checkout, and order tracking.

## Tech Stack

- Frontend: React (CRA), React Router, Tailwind CSS, Axios
- Backend: Node.js, Express, MongoDB (Mongoose), JWT
- Payments: Stripe

## Local Development

1. Install dependencies:

    npm run install:all

2. Configure environment files:

- Copy backend variables from backend/.env.example into backend/.env
- Copy frontend variables from frontend/.env.example into frontend/.env

3. Run backend:

    npm run dev:backend

4. Run frontend:

    npm run dev:frontend

## Production Build

Build frontend bundle:

npm run build

Run backend server:

npm start

## Railway Deployment Notes

- Build Command: npm run build
- Start Command: npm start
- Required environment variables:
  - MONGO_URI
  - JWT_SECRET
  - JWT_EXPIRE
  - FRONTEND_URL
  - STRIPE_SECRET_KEY
  - STRIPE_PUBLISHABLE_KEY
  - STRIPE_WEBHOOK_SECRET
  - EMAIL_USER
  - EMAIL_PASS
  - STORE_OWNER_EMAIL

Detailed deploy runbook: see RAILWAY_DEPLOYMENT.md
Railway variable template: see RAILWAY_ENV_TEMPLATE.md
Post-deploy smoke script: scripts/railway-smoke-test.ps1

## Security Notes

- Never commit real secrets to git.
- Use .env.example files as templates.
- Rotate credentials immediately if they were previously exposed.
