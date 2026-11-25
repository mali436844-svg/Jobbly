# Jobbly Production API Integration & Environment Setup Guide

This guide outlines how to connect **Jobbly** to live production cloud services or run in local sandbox mode.

---

## Architecture Overview

Jobbly operates on a **Dual-Mode Dynamic Architecture**:
1. **Live Production Mode**: Connects directly to Supabase PostgreSQL (with Row-Level Security), Resend transactional email API, and Lemon Squeezy subscription billing.
2. **Local Dynamic Sandbox Mode**: Enabled when keys contain `placeholder` or default mock values. It runs with an in-memory cached database engine (`mock-db.ts`) delivering sub-10ms response times, simulated email delivery, and full workflow persistence without external server dependencies.

---

## 1. Supabase (Database & Authentication)

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a new project (e.g., `jobbly-prod`).
2. Select your nearest US region (e.g., `us-east-1` or `us-west-1`).

### Step 2: Run Database Schema
1. In the Supabase Dashboard, navigate to the **SQL Editor**.
2. Open [`supabase/schema.sql`](file:///e:/Backuo/saas/jobbly/supabase/schema.sql) from this project.
3. Paste the contents into the SQL Editor and click **Run**.
4. This will create:
   - `profiles`, `clients`, `jobs`, `quotes`, `quote_items`, `invoices`, `invoice_items`, `payments`.
   - Role-Based Access Control (RBAC) with `role` column (`'admin'` vs `'user'`).
   - Complete Row-Level Security (RLS) policies ensuring users only access their own data, while verified admins have administrative oversight.
   - Triggers for automatic user profile generation upon registration (`role` defaults to `'user'`).

### Step 3: Provision Super Admin Account
1. Register your admin email address via `/register` or Supabase Auth.
2. In the Supabase SQL Editor, run:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'your-admin@jobbly.com';
   ```
3. Your admin account is now granted access to the **Admin Portal** at `/admin/login`.
   - Regular users cannot access `/admin/*` or `/api/admin/*`.
   - Unauthenticated attempts to access admin routes redirect to `/admin/login`.

### Step 4: Copy API Keys
In Supabase, navigate to **Project Settings** -> **API**:
- `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` -> `SUPABASE_SERVICE_ROLE_KEY` (kept private on server)

---

## 2. Resend (Transactional Email with PDF Attachments)

Jobbly uses **Resend** to dispatch quotes and invoices with dynamically compiled PDF attachments to client email addresses.

1. Create a free account at [https://resend.com](https://resend.com).
2. Generate an API Key under **API Keys**.
3. Verify your sending domain or use `onboarding@resend.dev` for testing.
4. Set in `.env.local`:
   ```bash
   RESEND_API_KEY=re_123456789...
   ```
*Note: In sandbox mode, if an invalid key is present, Jobbly's built-in timeout and email simulator catches the dispatch and records simulated delivery without blocking server execution.*

---

## 3. Lemon Squeezy (SaaS Subscriptions & Payments)

Jobbly features 3 subscription tiers:
- **Free Trial**: Limit 5 clients, 5 jobs, 10 invoices.
- **Starter ($29/mo)**: Unlimited clients, jobs, and invoices.
- **Pro ($79/mo)**: Unlimited access + email automation + financial analytics.

### Webhook Configuration
1. In your Lemon Squeezy dashboard, go to **Settings** -> **Webhooks**.
2. Add a new webhook pointing to:
   ```
   https://your-domain.com/api/webhooks/lemonsqueezy
   ```
3. Select events:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
4. Set your signing secret and API keys in `.env.local`:
   ```bash
   LEMONSQUEEZY_API_KEY=your_api_key
   LEMONSQUEEZY_STORE_ID=your_store_id
   LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_signing_secret
   ```

---

## 4. Environment Variables Checklist (`.env.local`)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Resend API Key
RESEND_API_KEY=re_your_api_key

# Lemon Squeezy Billing
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
