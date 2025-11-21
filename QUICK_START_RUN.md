# Quick Start: How to Run the Integration

## Prerequisites

Before running, ensure you have:

1. ✅ **Node.js** (v18 or higher) installed
2. ✅ **Zoho Catalyst** account and project created
3. ✅ **Brex Developer** account with API access
4. ✅ **Zoho Cliq** workspace access
5. ✅ All credentials ready (Client IDs, Secrets, Tokens)

---

## Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install Catalyst function dependencies
cd catalyst
npm install
cd ..
```

**Note:** If you're on Windows, use PowerShell or Git Bash for commands.

---

## Step 2: Set Up Catalyst (Development)

**Note for Windows Users:** Use PowerShell commands or `npm run` scripts. See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for Windows-specific instructions.

### 2.1 Create Database Tables

Go to Catalyst Console → Data Store → Create Tables:

1. Create `brex_transactions` table
2. Create `sync_state` table
3. Create `accounts` table
4. Create `event_store` table
5. Create `users` table
6. Create `analytics_cache` table

**Or use SQL migrations:**
- See `catalyst/db/migrations/` for SQL files
- Run them in Catalyst Console → Data Store → SQL Editor

### 2.2 Add Secrets to Catalyst

Go to Catalyst Console → Secrets → Add Secrets:

**Development Secrets:**
```
BREX_CLIENT_ID_DEV=<your-brex-client-id>
BREX_CLIENT_SECRET_DEV=<your-brex-client-secret>
BREX_WEBHOOK_SECRET_DEV=<your-brex-webhook-secret>
CLIQ_WEBHOOK_URL_DEV=<your-cliq-webhook-url>
CLIQ_BOT_TOKEN_DEV=<your-cliq-bot-token>
```

**Optional:**
```
ALERT_ADMIN_EMAILS=purushothamt044@gmail.com,tejasiddha1729@gmail.com
OCR_API_KEY=<if-using-google-vision>
```

### 2.3 Deploy Functions

**Option A: Using NPM Script (Recommended - Cross-platform)**
```bash
# Windows PowerShell
npm run deploy:dev

# Linux/Mac
npm run deploy:dev
```

**Option B: Manual ZIP Upload**
```bash
# Package functions (works on Windows, Linux, Mac)
npm run package

# Then:
# 1. Go to Catalyst Console → Functions → Deploy
# 2. Upload: deploy/artifact.zip (Windows: deploy\artifact.zip)
# 3. Set entry point: index.handler
```

**Option C: Using Catalyst CLI**
```bash
# Install CLI
npm install -g zcli

# Login
zcli login

# Deploy
cd catalyst
zcli catalyst:deploy --env development
cd ..
```

**Windows Users:** If bash scripts don't work, use PowerShell:
```powershell
.\scripts\deploy-env.ps1 dev
# or
.\scripts\package.ps1
```

### 2.4 Set Environment Variables

In Catalyst Console → Functions → Environment Variables:

```
ENVIRONMENT=development
CATALYST_BASE_URL=https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction
```

### 2.5 Configure Scheduler

Go to Catalyst Console → Scheduler → Create Schedule:

- **Name:** `brex-transaction-sync`
- **Cron:** `*/5 * * * *` (every 5 minutes)
- **Endpoint:** `/sync/run`
- **Method:** GET
- **Enable:** Yes

---

## Step 3: Configure Brex

### 3.1 Register OAuth Application

1. Go to Brex Developer Portal
2. Create OAuth Application
3. Set Redirect URI: `https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/oauth/callback`
4. Copy Client ID → Store as `BREX_CLIENT_ID_DEV` in Catalyst Secrets
5. Copy Client Secret → Store as `BREX_CLIENT_SECRET_DEV` in Catalyst Secrets

### 3.2 Register Webhook

1. In Brex Developer Portal, create Webhook
2. Set Webhook URL: `https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/webhook/receive`
3. Subscribe to events:
   - `PENDING_CARD_TRANSACTION_CREATED`
   - `PENDING_CARD_TRANSACTION_UPDATED`
   - `CARD_TRANSACTION_SETTLED`
   - `EXPENSE_CREATED`
   - `EXPENSE_UPDATED`
   - `REIMBURSEMENT_CREATED`
   - `REIMBURSEMENT_UPDATED`
4. Copy Webhook Secret → Store as `BREX_WEBHOOK_SECRET_DEV` in Catalyst Secrets

### 3.3 Authorize Brex Account

```bash
# Open in browser:
https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/oauth/authorize

# Complete OAuth flow
# This will save the account and refresh token
```

---

## Step 4: Configure Cliq

### 4.1 Upload Extension Manifest

1. Go to Zoho Cliq → Extensions → Create Extension
2. Upload `cliq/manifest.json`
3. Update action URLs to point to your Catalyst function URL:
   - Approve: `https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/actions/approve`
   - Flag: `https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/actions/flag`
   - Add Receipt: `https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/actions/add-receipt`
4. Get Webhook URL → Store as `CLIQ_WEBHOOK_URL_DEV` in Catalyst Secrets
5. Get Bot Token → Store as `CLIQ_BOT_TOKEN_DEV` in Catalyst Secrets

### 4.2 Create Channel

1. In Cliq, create channel: `brex-dev`
2. Add the Brex bot to the channel
3. Test slash command: `/brex tx 5`

---

## Step 5: Validate Deployment

```bash
# Validate all endpoints
npm run validate:dev

# Test webhook signature
npm run test:webhook:dev

# Test health endpoint
curl https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/health
```

---

## Step 6: Initial Data Sync

### 6.1 Run Backfill

```bash
# Get your account_id from the accounts table after OAuth
# Then run backfill:
curl "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/sync/run?account_id=acc_alpha01&backfill=30d"
```

### 6.2 Verify Sync

```bash
# Check health endpoint
curl https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/health

# Should show sync status
```

---

## Step 7: Test the Integration

### 7.1 Test Webhook

```bash
# Generate test webhook payload
npm run test:webhook:dev

# Copy the curl command from output and run it
```

### 7.2 Test Admin Notification

```bash
curl -X POST "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/admin/notify-admins-test" \
  -H "Content-Type: application/json" \
  -d '{"admin_email": "purushothamt044@gmail.com"}'
```

### 7.3 Test Cliq Command

In Cliq channel, type:
```
/brex tx 5
```

Should show last 5 transactions.

---

## Step 8: Monitor

### 8.1 Check Health

```bash
curl https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/health
```

### 8.2 Check Sync Status

Go to Catalyst Console → Data Store → `sync_state` table

### 8.3 Check Transactions

Go to Catalyst Console → Data Store → `brex_transactions` table

---

## Common Commands Reference

```bash
# Deploy
npm run deploy:dev          # Deploy to Development
npm run deploy:prod         # Deploy to Production

# Validate
npm run validate:dev        # Validate Development
npm run validate:prod       # Validate Production

# Test
npm run test:webhook:dev    # Test webhook (Dev)
npm run test:webhook:prod   # Test webhook (Prod)
npm test                    # Run all tests

# Package
npm run package             # Create deployment ZIP
```

---

## Troubleshooting

### Functions Not Deploying

1. Check Catalyst Console for errors
2. Verify entry point is `index.handler`
3. Check function logs in Catalyst Console

### Webhooks Not Receiving

1. Verify webhook URL is correct in Brex
2. Check webhook secret matches
3. Test webhook signature: `npm run test:webhook:dev`

### OAuth Not Working

1. Verify redirect URI matches exactly
2. Check Client ID and Secret in Catalyst Secrets
3. Try OAuth flow again: `/oauth/authorize`

### Cliq Cards Not Appearing

1. Verify Cliq webhook URL and bot token
2. Check Cliq channel has bot added
3. Test webhook manually

---

## Next Steps: Production Deployment

Once Development is working:

1. See [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md)
2. Run: `npm run deploy:prod`
3. Update `config/prod.json` with Production URLs
4. Configure Production secrets with `_PROD` suffix

---

## Support

- **Documentation:** See `README.md` and other `.md` files
- **Admin Emails:** purushothamt044@gmail.com, tejasiddha1729@gmail.com
- **Troubleshooting:** See `TROUBLESHOOTING.md`

---

**Ready to start?** Begin with Step 1: Install Dependencies!

