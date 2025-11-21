# Quick Deployment Guide

## Fast Track Deployment (30 minutes)

### Step 1: Catalyst Setup (10 min)

1. **Create Tables** (Catalyst Console → Data Store)
   - Run `scripts/setup-tables.sql` or create manually
   - Verify: 6 tables exist

2. **Add Secrets** (Catalyst Console → Secrets)
   ```
   BREX_CLIENT_ID=<from_brex>
   BREX_CLIENT_SECRET=<from_brex>
   BREX_WEBHOOK_SECRET=<from_brex>
   CLIQ_BOT_TOKEN=<from_cliq>
   ALERT_ADMIN_EMAILS=purushothamt044@gmail.com,tejasiddha1729@gmail.com
   ```

3. **Deploy Functions**
   ```powershell
   cd catalyst
   # Option A: CLI
   zcli catalyst:deploy
   
   # Option B: Manual
   # Package and upload via Console
   ```

4. **Configure Scheduler**
   - Endpoint: `/sync/run`
   - Cron: `*/5 * * * *`
   - Enabled: Yes

### Step 2: Brex Setup (5 min)

1. **OAuth Redirect:** `<CATALYST_URL>/oauth/callback`
2. **Webhook URL:** `<CATALYST_URL>/webhook/receive`
3. **Events:** All 7 event types
4. **Store secrets** in Catalyst Secrets

### Step 3: Cliq Setup (5 min)

1. Upload `cliq/manifest.json`
2. Configure `/brex tx` command
3. Set action endpoints

### Step 4: Initialize (5 min)

```powershell
# Seed data
node scripts/seed-demo-data.js --count 100 --org alpha01

# Backfill
Invoke-WebRequest -Uri "<CATALYST_URL>/sync/run?account_id=acc_alpha01&backfill=30d"
```

### Step 5: Test (5 min)

```powershell
# Health check
Invoke-WebRequest -Uri "<CATALYST_URL>/health"

# Test notification
$body = '{"admin_email":"purushothamt044@gmail.com"}'
Invoke-WebRequest -Uri "<CATALYST_URL>/admin/notify-admins-test" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body

# Generate webhook test
node scripts/test-webhook-signature.js
```

---

## Verification

✅ All endpoints respond  
✅ Demo data seeded (100 transactions)  
✅ Backfill completed  
✅ Admin emails receive notifications  
✅ Webhook test ready  

**Status: DEPLOYED AND READY** 🚀

