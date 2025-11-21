# Deployment Execution Checklist

## Pre-Deployment Verification

### ✅ Step 1: Verify Project Configuration

- [ ] Project Name: `zohocliq26`
- [ ] Catalyst Project URL: https://console.catalyst.zoho.com/baas/906503047/project/54012000000013052/Development
- [ ] Cliq Workspace: `Cliqtrix-26`
- [ ] Brex Org: `alpha01`
- [ ] Admin Emails: `purushothamt044@gmail.com`, `tejasiddha1729@gmail.com`

### ✅ Step 2: Install Dependencies

```powershell
# In PowerShell
cd D:\zoho
npm install
cd catalyst
npm install
cd ..
```

### ✅ Step 3: Verify Secrets in Catalyst Secrets

Go to Catalyst Console → Secrets and verify:

- [ ] `BREX_CLIENT_ID` - Set
- [ ] `BREX_CLIENT_SECRET` - Set
- [ ] `BREX_WEBHOOK_SECRET` - Set
- [ ] `CLIQ_BOT_TOKEN` or `CLIQ_WEBHOOK_URL` - Set
- [ ] `ALERT_ADMIN_EMAILS` (optional) - Set to: `purushothamt044@gmail.com,tejasiddha1729@gmail.com`

### ✅ Step 4: Create Database Tables

**Option A: Using SQL Script**
1. Open Catalyst Console → Data Store
2. Run `scripts/setup-tables.sql` (create tables manually via UI)
3. Verify all 6 tables exist:
   - [ ] `brex_transactions`
   - [ ] `sync_state`
   - [ ] `accounts`
   - [ ] `users` (with admin users)
   - [ ] `event_store`
   - [ ] `analytics_cache`

**Option B: Manual Creation**
- Use Catalyst Console UI to create each table per schema in `scripts/setup-tables.sql`

### ✅ Step 5: Deploy Catalyst Functions

**Option A: Using Catalyst CLI**
```powershell
cd catalyst
zcli catalyst:deploy
```

**Option B: Manual ZIP Upload**
```powershell
# Package functions
cd catalyst
Compress-Archive -Path * -DestinationPath ..\deploy\brex-cliq-integration.zip -Force
cd ..

# Then upload via Catalyst Console → Functions → Deploy
# Entry point: index.handler
```

**Verify endpoints:**
- [ ] `/health` - Accessible
- [ ] `/oauth/authorize` - Accessible
- [ ] `/webhook/receive` - Accessible
- [ ] `/sync/run` - Accessible
- [ ] `/actions/approve` - Accessible
- [ ] `/actions/flag` - Accessible
- [ ] `/actions/add-receipt` - Accessible
- [ ] `/admin/notify-admins-test` - Accessible

### ✅ Step 6: Configure Scheduler

In Catalyst Console → Scheduler:
- [ ] Create schedule: `brex-transaction-sync`
- [ ] Cron: `*/5 * * * *` (every 5 minutes)
- [ ] Endpoint: `/sync/run`
- [ ] Method: `GET`
- [ ] Query params: `account_id=acc_alpha01`
- [ ] Enabled: `true`

---

## BREX SETUP

### ✅ Step 7: Register OAuth Redirect

In Brex Developer Portal:
- [ ] OAuth Application created
- [ ] Redirect URI: `<CATALYST_URL>/oauth/callback`
- [ ] Client ID stored in Catalyst Secrets as `BREX_CLIENT_ID`
- [ ] Client Secret stored in Catalyst Secrets as `BREX_CLIENT_SECRET`

### ✅ Step 8: Register Webhooks

In Brex Developer Portal → Webhooks:
- [ ] Webhook URL: `<CATALYST_URL>/webhook/receive`
- [ ] Events subscribed:
  - [ ] PENDING_CARD_TRANSACTION_CREATED
  - [ ] PENDING_CARD_TRANSACTION_UPDATED
  - [ ] CARD_TRANSACTION_SETTLED
  - [ ] EXPENSE_CREATED
  - [ ] EXPENSE_UPDATED
  - [ ] REIMBURSEMENT_CREATED
  - [ ] REIMBURSEMENT_UPDATED
- [ ] Webhook Secret stored in Catalyst Secrets as `BREX_WEBHOOK_SECRET`

---

## INITIALIZATION

### ✅ Step 9: Seed Demo Data

```powershell
node scripts/seed-demo-data.js --count 100 --org alpha01
```

**Verify:**
- [ ] 100 transactions in `brex_transactions` table
- [ ] All transactions have `account_id = 'acc_alpha01'`
- [ ] No duplicate `transaction_id` values

### ✅ Step 10: Trigger Backfill

```powershell
# Replace <CATALYST_URL> with your actual URL
$url = "https://your-app.catalystapps.com/sync/run?account_id=acc_alpha01&backfill=30d"
Invoke-WebRequest -Uri $url -Method GET
```

**Or using curl:**
```powershell
curl "https://your-app.catalystapps.com/sync/run?account_id=acc_alpha01&backfill=30d"
```

**Verify:**
- [ ] Response shows `"success": true`
- [ ] `sync_state` table has entry for `acc_alpha01`
- [ ] `last_cursor` is set
- [ ] `last_sync_time` is recent

---

## TESTING

### ✅ Step 11: Test Health Endpoint

```powershell
Invoke-WebRequest -Uri "https://your-app.catalystapps.com/health" -Method GET
```

**Expected:** HTTP 200 with sync status

### ✅ Step 12: Generate Webhook Test

```powershell
node scripts/test-webhook-signature.js
```

This outputs a curl command with proper signature.

### ✅ Step 13: Test Webhook Reception

Use the generated command from Step 12, or manually:

```powershell
# First, get the signature (run test-webhook-signature.js to see how)
$body = '{"type":"PENDING_CARD_TRANSACTION_CREATED","data":{"id":"txn_test_001","account_id":"acc_alpha01","amount":{"amount":-125.50,"currency":"USD"},"merchant":{"name":"Test Merchant"},"status":"pending","created_at":"2024-01-15T10:30:00Z"}}'
$signature = "sha256=<calculated>"  # Calculate using BREX_WEBHOOK_SECRET

Invoke-WebRequest -Uri "https://your-app.catalystapps.com/webhook/receive" `
  -Method POST `
  -Headers @{"X-Brex-Signature"=$signature; "Content-Type"="application/json"} `
  -Body $body
```

**Verify:**
- [ ] HTTP 200 OK
- [ ] Transaction created in `brex_transactions`
- [ ] Event logged in `event_store`
- [ ] Cliq card posted (check Cliq channel)

### ✅ Step 14: Test Admin Notification

```powershell
$body = '{"admin_email":"purushothamt044@gmail.com"}'
Invoke-WebRequest -Uri "https://your-app.catalystapps.com/admin/notify-admins-test" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Verify:**
- [ ] HTTP 200 OK
- [ ] Both admin emails receive test notification
- [ ] Event logged in `event_store`

### ✅ Step 15: Test Approve Action (Admin)

```powershell
Invoke-WebRequest -Uri "https://your-app.catalystapps.com/actions/approve?txn_id=txn_test_001&user_email=purushothamt044@gmail.com" -Method GET
```

**Verify:**
- [ ] HTTP 200 OK
- [ ] Transaction status = `approved` in DB

### ✅ Step 16: Test Approve Action (Non-Admin - Should Fail)

```powershell
Invoke-WebRequest -Uri "https://your-app.catalystapps.com/actions/approve?txn_id=txn_test_001&user_email=viewer@example.com" -Method GET
```

**Verify:**
- [ ] HTTP 403 Forbidden
- [ ] Error message indicates admin role required

### ✅ Step 17: Test Sync Loop

```powershell
Invoke-WebRequest -Uri "https://your-app.catalystapps.com/sync/run?account_id=acc_alpha01" -Method GET
```

**Verify:**
- [ ] HTTP 200 OK
- [ ] `sync_state.last_sync_time` updated
- [ ] No duplicate transactions

### ✅ Step 18: Verify Scheduler

Wait 5 minutes, then check:
```sql
SELECT last_sync_time, last_sync_status 
FROM sync_state 
WHERE account_id = 'acc_alpha01';
```

**Verify:**
- [ ] `last_sync_time` updated within last 5 minutes
- [ ] `last_sync_status` = "success"

---

## CLIQ TESTING

### ✅ Step 19: Test Slash Command

In Cliq channel (Cliqtrix-26):
- [ ] Type: `/brex tx 10`
- [ ] Verify: 10 transaction cards appear
- [ ] Verify: Cards show merchant, amount, status

### ✅ Step 20: Test Card Actions

- [ ] Click "Approve" button → Transaction approved
- [ ] Click "Flag" button → Transaction flagged
- [ ] Click "Add Receipt" → Upload form works
- [ ] Upload receipt image → OCR runs and auto-fills if confidence >= 0.75

---

## FINAL VALIDATION

### ✅ Step 21: Run Full Test Pipeline

```powershell
# Run validation
node scripts/validate-deployment.js

# Check all endpoints
# Verify database integrity
# Verify event store logging
```

### ✅ Step 22: Verify All Criteria

- [ ] All endpoints reachable
- [ ] Webhook signature verification works
- [ ] Cursor sync runs manually + via scheduler
- [ ] Admin-only approval enforced (403 for non-admin)
- [ ] Cliq card actions work end-to-end
- [ ] OCR performs with confidence >= 0.75
- [ ] Email alerts trigger after 3 failures
- [ ] Test endpoint sends test alert emails
- [ ] No duplicate transactions (idempotency)
- [ ] Event store logs all events

---

## Deployment Complete ✅

**Deployment Date:** _______________

**Deployed By:** _______________

**Verified By:** _______________

**Notes:**
_________________________________________________________________
_________________________________________________________________

---

## Quick Reference Commands

### Health Check
```powershell
Invoke-WebRequest -Uri "https://your-app.catalystapps.com/health"
```

### Seed Demo Data
```powershell
node scripts/seed-demo-data.js --count 100 --org alpha01
```

### Trigger Backfill
```powershell
Invoke-WebRequest -Uri "https://your-app.catalystapps.com/sync/run?account_id=acc_alpha01&backfill=30d"
```

### Test Admin Notification
```powershell
$body = '{"admin_email":"purushothamt044@gmail.com"}'
Invoke-WebRequest -Uri "https://your-app.catalystapps.com/admin/notify-admins-test" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

### Generate Webhook Test
```powershell
node scripts/test-webhook-signature.js
```

