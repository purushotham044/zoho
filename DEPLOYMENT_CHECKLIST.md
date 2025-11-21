# Deployment Checklist

Use this checklist to ensure complete deployment of the Brex-Cliq integration.

## Pre-Deployment

- [ ] Node.js >= 18 installed
- [ ] Zoho Catalyst account created
- [ ] Brex Developer account and API access
- [ ] Zoho Cliq workspace access
- [ ] All credentials collected (Client IDs, Secrets, Tokens)

## Catalyst Setup

### Tables
- [ ] `brex_transactions` table created with all columns
- [ ] Unique index on `transaction_id` created
- [ ] `sync_state` table created
- [ ] `accounts` table created

### Secrets
- [ ] `BREX_CLIENT_ID` added to Catalyst Secrets
- [ ] `BREX_CLIENT_SECRET` added to Catalyst Secrets
- [ ] `BREX_WEBHOOK_SECRET` added to Catalyst Secrets
- [ ] `CLIQ_WEBHOOK_URL` added to Catalyst Secrets
- [ ] `CLIQ_BOT_TOKEN` added to Catalyst Secrets

### Functions
- [ ] All functions deployed to Catalyst
- [ ] Entry point set to `index.handler`
- [ ] Environment variables configured (if any)
- [ ] Function URLs noted

### Scheduler
- [ ] Scheduler created: `brex-transaction-sync`
- [ ] Cron expression set: `*/10 * * * *`
- [ ] Endpoint configured: `/sync`
- [ ] Query params set: `account_id`
- [ ] Scheduler enabled

## Brex Configuration

- [ ] OAuth application created in Brex Developer Portal
- [ ] Redirect URI configured: `https://your-app.catalystapps.com/oauth/callback`
- [ ] OAuth scopes selected (transactions:read, accounts:read, webhooks:read)
- [ ] Client ID and Secret obtained
- [ ] Webhook created in Brex
- [ ] Webhook URL configured: `https://your-app.catalystapps.com/webhook/brex`
- [ ] Webhook events selected: `transaction.created`, `transaction.updated`
- [ ] Webhook secret obtained

## Zoho Cliq Configuration

- [ ] Cliq bot created or existing bot identified
- [ ] Bot token obtained
- [ ] Webhook URL for channel obtained
- [ ] Cliq extension manifest uploaded
- [ ] Slash command `/brex` registered
- [ ] Bot permissions verified (channels:read, channels:write, messages:write)

## Initial Setup

- [ ] OAuth flow completed: Visit `/oauth/authorize`
- [ ] Account saved in `accounts` table
- [ ] Refresh token stored in Catalyst Secrets
- [ ] Access token expiry verified

## Testing

- [ ] Health endpoint working: `GET /health`
- [ ] Dashboard accessible: `GET /dashboard`
- [ ] Test webhook successful: `POST /dev/test-webhook`
- [ ] Real webhook from Brex received and verified
- [ ] Cliq card appears for new transaction
- [ ] Approve action works
- [ ] Flag action works
- [ ] Add Receipt action works
- [ ] Slash command `/brex tx 10` works
- [ ] Search command `/brex tx search <query>` works

## Sync & Backfill

- [ ] Manual sync works: `GET /sync?account_id=<id>`
- [ ] Backfill completes: `GET /backfill?account_id=<id>`
- [ ] No duplicate transactions created
- [ ] Last cursor saved correctly
- [ ] Scheduled sync running (check after 10 minutes)

## Monitoring

- [ ] Health endpoint shows sync status
- [ ] Dashboard shows transaction counts
- [ ] Error logs accessible in Catalyst Console
- [ ] Sync state table updated correctly

## Security Verification

- [ ] Webhook signature verification working
- [ ] Invalid signatures rejected (401)
- [ ] Secrets not logged anywhere
- [ ] HTTPS enforced on all endpoints
- [ ] Token refresh working automatically

## Documentation

- [ ] README.md reviewed
- [ ] API endpoints documented
- [ ] Demo script prepared
- [ ] Postman collection ready
- [ ] Troubleshooting guide reviewed

## Production Readiness

- [ ] All tests passing
- [ ] Error handling verified
- [ ] Rate limiting tested
- [ ] Token expiry handling tested
- [ ] Failure recovery procedures documented
- [ ] Monitoring alerts configured (if available)

## Post-Deployment

- [ ] Initial backfill completed
- [ ] Webhook receiving events
- [ ] Cliq cards appearing
- [ ] Scheduled sync running
- [ ] Team trained on usage
- [ ] Support contacts documented
- [ ] **Admin email notifications tested**: Run test notification endpoint
  ```bash
  curl -X POST "https://your-app.catalystapps.com/admin/notify-admins-test" \
    -H "Content-Type: application/json" \
    -d '{"admin_email": "purushothamt044@gmail.com"}'
  ```
  Verify both admin emails (purushothamt044@gmail.com, tejasiddha1729@gmail.com) receive test notification

## Production Deployment

See [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md) for detailed production deployment steps.

### Quick Production Checklist

- [ ] Switch to Production environment in Catalyst Console
- [ ] Create Production tables (same schema as Dev)
- [ ] Configure Production secrets with `_PROD` suffix:
  - [ ] `BREX_CLIENT_ID_PROD`
  - [ ] `BREX_CLIENT_SECRET_PROD`
  - [ ] `BREX_WEBHOOK_SECRET_PROD`
  - [ ] `CLIQ_WEBHOOK_URL_PROD` or `CLIQ_BOT_TOKEN_PROD`
- [ ] Deploy functions to Production
- [ ] Update `config/prod.json` with actual Production function URL
- [ ] Set `ENVIRONMENT=production` in Production environment variables
- [ ] Register Brex Production webhook → Prod URL
- [ ] Register Brex Production OAuth → Prod callback URL
- [ ] Configure Cliq Production extension → Prod URLs
- [ ] Run production smoke tests: `npm run validate:prod`

## Rollback Plan

- [ ] Backup of current state
- [ ] Rollback procedure documented
- [ ] Data export capability verified

---

## Quick Verification Commands

```bash
# Health check
curl https://your-app.catalystapps.com/health

# Test webhook
curl -X POST "https://your-app.catalystapps.com/dev/test-webhook?account_id=acc_123"

# Manual sync
curl -X GET "https://your-app.catalystapps.com/sync?account_id=acc_123"

# Dashboard
curl https://your-app.catalystapps.com/dashboard
```

---

**Deployment Date**: _______________

**Deployed By**: _______________

**Verified By**: _______________

**Notes**: 
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

