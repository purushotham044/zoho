# Project Configuration

## Project Metadata

- **ProjectName:** zohocliq26
- **CatalystProjectURL:** https://console.catalyst.zoho.com/baas/906503047/project/54012000000013052/Development
- **CliqWorkspaceName:** Cliqtrix-26
- **BrexOrgName:** alpha01
- **Timezone:** Asia/Kolkata
- **CursorSyncInterval:** 5m (every 5 minutes)
- **BackfillWindow:** 30d (30 days)
- **DemoDataSize:** 100 transactions
- **ApprovalPolicy:** A (Only admins can approve)
- **SecretStorage:** BOTH (Catalyst Secrets + GitHub Secrets)

## Admin Emails

- purushothamt044@gmail.com
- tejasiddha1729@gmail.com

**Last Updated:** 2024-12-19  
**Updated By:** System Configuration Update

## Brex Webhook Events

The following webhook events are subscribed:

1. `PENDING_CARD_TRANSACTION_CREATED`
2. `PENDING_CARD_TRANSACTION_UPDATED`
3. `CARD_TRANSACTION_SETTLED`
4. `EXPENSE_CREATED`
5. `EXPENSE_UPDATED`
6. `REIMBURSEMENT_CREATED`
7. `REIMBURSEMENT_UPDATED`

## Endpoints

### OAuth
- `GET /oauth/authorize` - Start OAuth flow
- `GET /oauth/callback` - Handle OAuth callback
- `GET /oauth/refresh` - Manual token refresh

### Webhooks
- `POST /webhook/receive` - Brex webhook receiver (public)

### Sync
- `GET /sync/run?account_id=X` - Manual sync trigger
- `GET /sync/run?account_id=X&backfill=30d` - One-click backfill

### Actions
- `GET /actions/approve?txn_id=X&user_email=Y` - Approve transaction (admin only)
- `GET /actions/flag?txn_id=X` - Flag transaction
- `GET /actions/add-receipt?txn_id=X` - Receipt upload form
- `POST /actions/upload-receipt?txn_id=X` - Upload receipt (multipart)

### Monitoring
- `GET /health` - Health check with sync status
- `GET /dashboard` - Sync metrics dashboard

### Cliq
- `POST /cliq/command` - Slash command handler (`/brex tx [n|search]`)

## Scheduled Jobs

- **Sync Job:** Runs every 5 minutes
  - Endpoint: `/sync/run`
  - Cron: `*/5 * * * *`
  - Config: `catalyst/scheduler.json`

## Dev vs Prod URLs & Channels

### Development Environment

- **Function Base URL:** https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction
- **Brex Webhook URL:** https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/webhook/receive
- **Brex OAuth Redirect:** https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/oauth/callback
- **Cliq Channel:** `brex-dev` (test channel for engineers)
- **Email Prefix:** `[zohocliq26] [DEV]`

### Production Environment

- **Function Base URL:** https://zohocliq-906503047.production.catalystserverless.com/server/zohofunction *(update after deployment)*
- **Brex Webhook URL:** https://zohocliq-906503047.production.catalystserverless.com/server/zohofunction/webhook/receive *(update after deployment)*
- **Brex OAuth Redirect:** https://zohocliq-906503047.production.catalystserverless.com/server/zohofunction/oauth/callback *(update after deployment)*
- **Cliq Channel:** `brex-finance` (production finance channel)
- **Email Prefix:** `[zohocliq26] [PROD]`

**⚠️ IMPORTANT:** After deploying to Production, update the Production URLs in `config/prod.json` with the actual function URL from Catalyst Console.

## Secrets (Catalyst Secrets)

### Development Secrets

- `BREX_CLIENT_ID_DEV`
- `BREX_CLIENT_SECRET_DEV`
- `BREX_WEBHOOK_SECRET_DEV`
- `BREX_OAUTH_REDIRECT_DEV` (Dev callback URL)
- `CLIQ_WEBHOOK_URL_DEV` or `CLIQ_BOT_TOKEN_DEV`
- `OCR_API_KEY` (optional, for Google Vision)

### Production Secrets

- `BREX_CLIENT_ID_PROD`
- `BREX_CLIENT_SECRET_PROD`
- `BREX_WEBHOOK_SECRET_PROD`
- `BREX_OAUTH_REDIRECT_PROD` (Prod callback URL - update after deployment)
- `CLIQ_WEBHOOK_URL_PROD` or `CLIQ_BOT_TOKEN_PROD`
- `OCR_API_KEY` (optional, shared or separate)

**⚠️ CRITICAL:** Dev and Prod use different secret names (`_DEV` and `_PROD` suffixes) to prevent accidental credential mixing.

## Environment Variables

### Required

- `ENVIRONMENT` - Set to `production` in Prod, `development` in Dev (defaults to `development`)
- `CATALYST_BASE_URL` - Your Catalyst app base URL (environment-specific)

### Optional

- `OCR_ADAPTER` - OCR engine (default: `tesseract`)
- `CLIQ_BATCH_WINDOW_SECONDS` - Batching window (default: 30)
- `CLIQ_BATCH_MAX_PER_CARD` - Max items per card (default: 10)
- `ANALYTICS_CACHE_TTL` - Cache TTL in seconds (default: 300)
- `REFRESH_THRESHOLD` - Token refresh threshold in seconds (default: 300)
- `DATA_RETENTION_DAYS` - GDPR retention policy
- `ALERT_ADMIN_EMAILS` - Comma-separated admin emails (optional, defaults to config)
- `DEMO_DATA_SIZE` - Demo data size (default: 100)
- `BREX_ORG_NAME` - Brex org name (default: alpha01)

## Database Tables

1. **brex_transactions**
   - Primary Key: `transaction_id`
   - Unique index on `transaction_id`

2. **sync_state**
   - Primary Key: `account_id`

3. **accounts**
   - Primary Key: `account_id`

4. **event_store**
   - Primary Key: `event_id` (UUID)

5. **users**
   - Primary Key: `user_id` (email)

6. **analytics_cache**
   - Primary Key: `cache_key`

## Deployment

1. Create tables in Catalyst Data Store
2. Add secrets to Catalyst Secrets
3. Deploy functions: `make deploy` or `npm run deploy`
4. Configure scheduler in Catalyst Console
5. Register OAuth redirect in Brex dev console
6. Register webhooks in Brex console
7. Seed demo data: `node scripts/seed-demo-data.js`
8. Run backfill: `GET /sync/run?account_id=acc_alpha01&backfill=30d`

