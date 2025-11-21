# Production Deployment Guide

## Overview

This guide covers deploying the Brex-Cliq integration from Development to Production environment in Zoho Catalyst.

**Project:** zohocliq26  
**Project ID:** 54012000000013052  
**Dev Environment:** https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction  
**Prod Environment:** https://zohocliq-906503047.production.catalystserverless.com/server/zohofunction (to be confirmed after deployment)

---

## Environment Separation

### Development vs Production

| Component | Development | Production |
|-----------|-------------|------------|
| **Function URL** | `...development.catalystserverless.com/...` | `...production.catalystserverless.com/...` |
| **Brex Secrets** | `BREX_CLIENT_ID_DEV`, `BREX_CLIENT_SECRET_DEV`, `BREX_WEBHOOK_SECRET_DEV` | `BREX_CLIENT_ID_PROD`, `BREX_CLIENT_SECRET_PROD`, `BREX_WEBHOOK_SECRET_PROD` |
| **Cliq Secrets** | `CLIQ_WEBHOOK_URL_DEV`, `CLIQ_BOT_TOKEN_DEV` | `CLIQ_WEBHOOK_URL_PROD`, `CLIQ_BOT_TOKEN_PROD` |
| **Cliq Channel** | `brex-dev` (test channel) | `brex-finance` (production channel) |
| **Email Prefix** | `[zohocliq26] [DEV]` | `[zohocliq26] [PROD]` |
| **Brex Webhook** | Dev webhook → Dev URL | Prod webhook → Prod URL |
| **Brex OAuth** | Dev OAuth app → Dev callback | Prod OAuth app → Prod callback |

---

## Stage 1: Development Deployment (Already Complete)

✅ Functions deployed to Development  
✅ Tables created in Development  
✅ Secrets configured in Development  
✅ Brex webhook registered to Dev URL  
✅ Cliq extension configured for Dev  

---

## Stage 2: Production Deployment

### Step 1: Switch to Production Environment

1. Go to Catalyst Console: https://console.catalyst.zoho.com/baas/906503047/project/54012000000013052
2. Switch environment dropdown to **Production**
3. Verify you're in Production environment

### Step 2: Create Production Tables

Create the same tables in Production Data Store:

- `brex_transactions`
- `sync_state`
- `accounts`
- `event_store`
- `users`
- `analytics_cache`

**Note:** Use the same schema as Development. See `catalyst/db/migrations/` for SQL.

### Step 3: Configure Production Secrets

Add these secrets in **Production** Catalyst Secrets:

#### Brex Secrets (Production)
```
BREX_CLIENT_ID_PROD=<BREX_CLIENT_ID_PROD>
BREX_CLIENT_SECRET_PROD=<BREX_CLIENT_SECRET_PROD>
BREX_WEBHOOK_SECRET_PROD=<BREX_WEBHOOK_SECRET_PROD>
BREX_OAUTH_REDIRECT_PROD=<will be set after deployment>
```

#### Cliq Secrets (Production)
```
CLIQ_WEBHOOK_URL_PROD=<production_cliq_webhook_url>
CLIQ_BOT_TOKEN_PROD=<production_cliq_bot_token>
```

#### Optional
```
ALERT_ADMIN_EMAILS=purushothamt044@gmail.com,tejasiddha1729@gmail.com
OCR_API_KEY=<if using Google Vision>
```

**⚠️ CRITICAL:** Use different secret names (`_PROD` suffix) to prevent accidental mixing of Dev and Prod credentials.

### Step 4: Deploy Functions to Production

#### Option A: Using Catalyst CLI

```bash
# Set environment
export NODE_ENV=production

# Navigate to catalyst directory
cd catalyst

# Deploy to Production
zcli catalyst:deploy --env production
```

#### Option B: Manual ZIP Upload

```bash
# Package functions
npm run package

# Upload deploy/artifact.zip via Catalyst Console:
# 1. Go to Functions → Deploy (in Production environment)
# 2. Upload the ZIP file
# 3. Set entry point: index.handler
```

### Step 5: Update Production Function URL

After deployment, get the Production function URL from Catalyst Console:

1. Go to Functions → Your Function → Details
2. Copy the Production function URL
3. Update `config/prod.json`:

```json
{
  "baseUrl": "https://zohocliq-906503047.production.catalystserverless.com/server/zohofunction",
  "brex": {
    "webhookUrl": "https://zohocliq-906503047.production.catalystserverless.com/server/zohofunction/webhook/receive",
    "oauthRedirectUrl": "https://zohocliq-906503047.production.catalystserverless.com/server/zohofunction/oauth/callback"
  }
}
```

### Step 6: Configure Production Scheduler

1. In Catalyst Console (Production), go to Scheduler
2. Create new schedule: `brex-transaction-sync-prod`
3. Set cron: `*/5 * * * *`
4. Set endpoint: `/sync/run`
5. Enable scheduler

### Step 7: Register Brex Production Webhook

1. Go to Brex Developer Portal
2. Create **new webhook** for Production (or use existing Prod webhook)
3. Set webhook URL: `<PROD_FUNCTION_URL>/webhook/receive`
4. Subscribe to events:
   - PENDING_CARD_TRANSACTION_CREATED
   - PENDING_CARD_TRANSACTION_UPDATED
   - CARD_TRANSACTION_SETTLED
   - EXPENSE_CREATED
   - EXPENSE_UPDATED
   - REIMBURSEMENT_CREATED
   - REIMBURSEMENT_UPDATED
5. Copy webhook secret → Store in Catalyst Secrets as `BREX_WEBHOOK_SECRET_PROD`

### Step 8: Register Brex Production OAuth

1. In Brex Developer Portal, create **new OAuth application** for Production
2. Set redirect URI: `<PROD_FUNCTION_URL>/oauth/callback`
3. Copy Client ID → Store as `BREX_CLIENT_ID_PROD`
4. Copy Client Secret → Store as `BREX_CLIENT_SECRET_PROD`
5. Update `BREX_OAUTH_REDIRECT_PROD` secret with the callback URL

### Step 9: Configure Cliq Production Extension

1. In Zoho Cliq, create **new channel** for production: `brex-finance`
2. Upload `cliq/manifest.json` (update URLs to Production)
3. Set action endpoints to Production function URLs:
   - Approve: `<PROD_URL>/actions/approve`
   - Flag: `<PROD_URL>/actions/flag`
   - Add Receipt: `<PROD_URL>/actions/add-receipt`
4. Get production webhook URL → Store as `CLIQ_WEBHOOK_URL_PROD`
5. Get production bot token → Store as `CLIQ_BOT_TOKEN_PROD`

### Step 10: Set Environment Variable

In Catalyst Console → Functions → Environment Variables (Production):

```
ENVIRONMENT=production
CATALYST_BASE_URL=<PROD_FUNCTION_URL>
```

### Step 11: Run Production Smoke Tests

```bash
# Validate Production deployment
npm run validate:prod

# Test webhook signature
npm run test:webhook:prod

# Test health endpoint
curl https://<PROD_FUNCTION_URL>/health

# Test sync (with account_id)
curl "https://<PROD_FUNCTION_URL>/sync/run?account_id=acc_alpha01"

# Test admin notification
curl -X POST "https://<PROD_FUNCTION_URL>/admin/notify-admins-test" \
  -H "Content-Type: application/json" \
  -d '{"admin_email": "purushothamt044@gmail.com"}'
```

---

## Configuration Files

### config/dev.json
- Contains Development environment configuration
- Base URL: Development function URL
- Secret names: `_DEV` suffix
- Email prefix: `[DEV]`

### config/prod.json
- Contains Production environment configuration
- Base URL: Production function URL (update after deployment)
- Secret names: `_PROD` suffix
- Email prefix: `[PROD]`

### Using Config in Scripts

```bash
# Use Development config (default)
node scripts/validate-deployment.js
# or
node scripts/validate-deployment.js --env=dev

# Use Production config
node scripts/validate-deployment.js --env=prod
```

---

## Safety Guards

### 1. Environment Detection

Code automatically detects environment from:
- `ENVIRONMENT` environment variable (preferred)
- `NODE_ENV` environment variable (fallback)
- Defaults to `development` if not set

### 2. Secret Name Separation

- **Dev:** `BREX_CLIENT_ID_DEV`, `BREX_CLIENT_SECRET_DEV`, etc.
- **Prod:** `BREX_CLIENT_ID_PROD`, `BREX_CLIENT_SECRET_PROD`, etc.

This prevents accidental use of Dev credentials in Prod.

### 3. Email Subject Tags

- **Dev:** `[zohocliq26] [DEV]`
- **Prod:** `[zohocliq26] [PROD]`

All email alerts include environment tag.

### 4. Event Logging

All actions log environment in `event_store`:
```json
{
  "action": "approve",
  "environment": "production",
  "timestamp": "..."
}
```

### 5. URL Validation

Scripts validate URLs match expected environment pattern:
- Dev: `...development.catalystserverless.com...`
- Prod: `...production.catalystserverless.com...`

---

## Verification Checklist

After Production deployment:

- [ ] Production function URL obtained and updated in `config/prod.json`
- [ ] All Production secrets configured with `_PROD` suffix
- [ ] Production tables created
- [ ] Production scheduler configured
- [ ] Brex Production webhook registered
- [ ] Brex Production OAuth app created
- [ ] Cliq Production extension configured
- [ ] Environment variable `ENVIRONMENT=production` set
- [ ] Health endpoint returns 200
- [ ] Sync endpoint works
- [ ] Webhook receives test payload
- [ ] Admin notification test succeeds
- [ ] Both admin emails receive test notification

---

## Rollback Plan

If Production deployment fails:

1. **Disable Production scheduler** immediately
2. **Disable Production webhook** in Brex
3. **Review logs** in Catalyst Console
4. **Fix issues** in Development first
5. **Redeploy** to Production after testing

---

## Post-Deployment

### Monitor Production

1. Check health endpoint every 5 minutes initially
2. Monitor sync status in `sync_state` table
3. Watch for email alerts
4. Review event_store for errors

### Initial Data Sync

After Production is live:

```bash
# Run backfill for Production account
curl "https://<PROD_FUNCTION_URL>/sync/run?account_id=acc_alpha01&backfill=30d"
```

---

## Support

For issues:
1. Check Catalyst Console logs (Production environment)
2. Review `event_store` for error events
3. Test with `/health` and `/admin/notify-admins-test`
4. Contact admins: purushothamt044@gmail.com, tejasiddha1729@gmail.com

---

**Last Updated:** 2024-12-19  
**Environment:** Production deployment guide

