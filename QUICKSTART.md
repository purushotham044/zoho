# Quick Start Guide

Get the Brex-Cliq integration running in 15 minutes.

## Prerequisites Check

- [ ] Zoho Catalyst account
- [ ] Brex Developer account
- [ ] Zoho Cliq workspace
- [ ] Node.js >= 18 installed

## 5-Minute Setup

### 1. Create Catalyst Tables (2 min)

In Catalyst Console → Data Store, create:

**brex_transactions**
- `transaction_id` (String, PK)
- `account_id`, `amount`, `currency`, `merchant_name`, `timestamp`, `status`, `category`, `cardholder`, `raw_payload`, `receipt_file_id`, `created_at`, `updated_at`

**sync_state**
- `account_id` (String, PK)
- `last_cursor`, `last_sync_time`, `last_sync_status`, `error_count`, `created_at`, `updated_at`

**accounts**
- `account_id` (String, PK)
- `brex_org_id`, `access_token`, `token_expires_at`, `client_id`, `created_at`, `updated_at`

### 2. Add Secrets (1 min)

In Catalyst Console → Secrets, add:

```
BREX_CLIENT_ID=<your_client_id>
BREX_CLIENT_SECRET=<your_client_secret>
BREX_WEBHOOK_SECRET=<webhook_secret>
CLIQ_WEBHOOK_URL=<cliq_webhook_url>
CLIQ_BOT_TOKEN=<cliq_bot_token>
```

### 3. Deploy Functions (2 min)

```bash
cd catalyst
zcli catalyst:deploy
```

Or upload ZIP via Catalyst Console.

## 10-Minute Configuration

### 4. Authorize Brex (2 min)

Visit: `https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/oauth/authorize`

Complete OAuth flow. Account will be saved automatically.

### 5. Register Brex Webhook (3 min)

1. Go to Brex Developer Portal → Webhooks
2. Create webhook:
   - URL: `https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/webhook/receive`
   - Events: `transaction.created`, `transaction.updated`
3. Save webhook secret → Add to Catalyst Secrets

### 6. Configure Cliq (3 min)

1. Create bot in Cliq (or use existing)
2. Get bot token and webhook URL
3. Add to Catalyst Secrets
4. Upload `cliq/manifest.json` as extension

### 7. Run Initial Backfill (2 min)

```bash
curl -X GET "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/sync/run?account_id=acc_alpha01&backfill=30d=<your_account_id>"
```

Wait for completion (check dashboard: `GET /dashboard`)

## Verify It Works

### Test Webhook
```bash
curl -X POST "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/dev/test-webhook?account_id=<id>"
```

Expected: Transaction appears in Cliq channel

### Test Cliq Command
In Cliq, type: `/brex tx 10`

Expected: Card with 10 transactions

### Check Health
```bash
curl https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/health
```

Expected: `{"status": "ok", ...}`

## Enable Scheduled Sync

1. Catalyst Console → Scheduler
2. Create schedule:
   - Name: `brex-transaction-sync`
   - Cron: `*/10 * * * *`
   - Endpoint: `/sync?account_id=<id>`
3. Enable

## You're Done! 🎉

- ✅ Real-time webhooks → Cliq cards
- ✅ Scheduled sync every 10 minutes
- ✅ Interactive card actions
- ✅ Slash commands in Cliq

## Troubleshooting

**Webhook not working?**
- Check `BREX_WEBHOOK_SECRET` in secrets
- Verify webhook URL in Brex

**No Cliq cards?**
- Check `CLIQ_WEBHOOK_URL` and `CLIQ_BOT_TOKEN`
- Verify bot permissions

**Sync failing?**
- Check token expiry: `GET /oauth/refresh?account_id=<id>`
- Review error_count in dashboard

## Next Steps

- Read full [README.md](README.md) for details
- Review [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for advanced scenarios
- Check [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for complete checklist

