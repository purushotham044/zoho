# Brex ⇄ Zoho Cliq Integration

Production-ready integration between Brex and Zoho Cliq using Zoho Catalyst as middleware. Provides real-time transaction notifications, reliable cursor-based synchronization, and secure OAuth2 token management.

## Project Info

- **Project:** zohocliq26
- **Project ID:** 54012000000013052
- **Catalyst Project:** [Development Console](https://console.catalyst.zoho.com/baas/906503047/project/54012000000013052/Development) | [Production Console](https://console.catalyst.zoho.com/baas/906503047/project/54012000000013052/Production)
- **Cliq Workspace:** Cliqtrix-26
- **Brex Org:** alpha01
- **Admin Emails:** purushothamt044@gmail.com, tejasiddha1729@gmail.com

### Environments

- **Development:** https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction
- **Production:** https://zohocliq-906503047.production.catalystserverless.com/server/zohofunction *(URL confirmed after deployment)*

## Features

- ✅ **Real-time Notifications**: Transaction webhooks from Brex appear as interactive cards in Zoho Cliq
- ✅ **Cursor-based Sync**: Reliable, resumable transaction synchronization with pagination (every 5 minutes)
- ✅ **OAuth2 Security**: Secure token handling with automatic refresh
- ✅ **Webhook Verification**: HMAC SHA256 signature verification for webhook security
- ✅ **Idempotent Upserts**: Prevents duplicate transactions
- ✅ **One-click Backfill**: Easy migration and data recovery (30-day window)
- ✅ **Interactive Cards**: Approve, Flag, and Add Receipt actions directly from Cliq
- ✅ **OCR Receipt Parsing**: Auto-fills merchant/amount when confidence >= 0.75
- ✅ **RBAC**: Role-based access control (admin/approver/viewer)
- ✅ **Event Store**: Immutable audit log for compliance
- ✅ **Analytics Dashboard**: Spend by category and top merchants
- ✅ **Notification Batching**: Prevents spam with configurable batching
- ✅ **Monitoring**: Health endpoints and sync status tracking

## Quick Start

### 1. Prerequisites

- Node.js >= 18
- Zoho Catalyst account and project
- Brex API credentials (Client ID, Client Secret)
- Zoho Cliq workspace with bot/webhook access

### 2. Setup Catalyst Tables

Create the following tables in Catalyst Data Store:

- `brex_transactions` - Transaction records
- `sync_state` - Sync state and cursor tracking
- `accounts` - Account configurations
- `event_store` - Immutable event log
- `users` - RBAC user management
- `analytics_cache` - Analytics result caching

See `catalyst/db/migrations/` for SQL schemas.

### 3. Configure Secrets

Add secrets in Catalyst Secrets:

```
BREX_CLIENT_ID=your_brex_client_id
BREX_CLIENT_SECRET=your_brex_client_secret
BREX_WEBHOOK_SECRET=your_webhook_secret
BREX_OAUTH_REDIRECT=https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/oauth/callback
CLIQ_WEBHOOK_URL=https://cliq.zoho.com/api/v2/channelsbyname/your_channel/message
CLIQ_BOT_TOKEN=your_cliq_bot_token
```

### 4. Deploy Functions

```bash
# Install dependencies
npm install
cd catalyst && npm install

# Deploy
make deploy
# or
npm run deploy
```

### 5. Register OAuth & Webhooks

1. **OAuth Redirect:** In Brex dev console, set redirect URI to:
   ```
   https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/oauth/callback
   ```

2. **Webhooks:** Register webhooks in Brex console pointing to:
   ```
   https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/webhook/receive
   ```
   
   Subscribe to events:
   - PENDING_CARD_TRANSACTION_CREATED
   - PENDING_CARD_TRANSACTION_UPDATED
   - CARD_TRANSACTION_SETTLED
   - EXPENSE_CREATED
   - EXPENSE_UPDATED
   - REIMBURSEMENT_CREATED
   - REIMBURSEMENT_UPDATED

### 6. Seed Demo Data

```bash
npm run seed:demo
```

### 7. Run Backfill

```bash
curl "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/sync/run?account_id=acc_alpha01&backfill=30d"
```

## API Endpoints

### OAuth
- `GET /oauth/authorize` - Initiate OAuth flow
- `GET /oauth/callback` - OAuth callback handler
- `GET /oauth/refresh?account_id=<id>` - Manual token refresh

### Webhooks
- `POST /webhook/receive` - Brex webhook receiver

### Sync
- `GET /sync/run?account_id=<id>` - Trigger sync
- `GET /sync/run?account_id=<id>&backfill=30d` - One-click backfill

### Actions
- `GET /actions/approve?txn_id=<id>&user_email=<email>` - Approve transaction (admin only)
- `GET /actions/flag?txn_id=<id>` - Flag transaction
- `GET /actions/add-receipt?txn_id=<id>` - Receipt upload form
- `POST /actions/upload-receipt?txn_id=<id>` - Upload receipt (multipart)

### Monitoring
- `GET /health` - Health check with sync status
- `GET /dashboard` - Sync metrics dashboard
- `GET /analytics/summary` - Analytics dashboard

### Cliq
- `POST /cliq/command` - Slash command handler (`/brex tx [n|search]`)

## Cliq Integration

### Slash Command

In any Cliq channel:
```
/brex tx 10          # Show last 10 transactions
/brex tx 25          # Show last 25 transactions
/brex tx search coffee  # Search transactions
```

### Card Actions

When a transaction card appears:
- **Approve**: Updates status to `approved` (admin only)
- **Flag**: Updates status to `flagged` for review
- **Add Receipt**: Opens upload form to attach receipt image (OCR auto-fills if confidence >= 0.75)

## Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Postman Collection

Import `tests/postman-collection.json` into Postman for API testing.

## Monitoring

### Health Check
```bash
curl https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/health
```

### Sync Status
Check `sync_state` table in Catalyst Console or use `/dashboard` endpoint.

### Email Alerts

Admins receive email alerts after 3 consecutive sync failures. Configure `ADMIN_EMAILS` environment variable.

## Documentation

- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Deployment checklist
- [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md) - **Production deployment guide**
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Migration and recovery guide
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Troubleshooting guide
- [PROJECT_CONFIG.md](PROJECT_CONFIG.md) - Project configuration (includes Dev vs Prod URLs)
- [demo/demo-script.md](demo/demo-script.md) - 2-minute demo script

## Dev vs Prod Configuration

The project uses environment-specific configuration files:

- `config/dev.json` - Development environment config
- `config/prod.json` - Production environment config

### Key Differences

| Component | Development | Production |
|-----------|-------------|------------|
| **Secret Names** | `_DEV` suffix | `_PROD` suffix |
| **Cliq Channel** | `brex-dev` | `brex-finance` |
| **Email Prefix** | `[DEV]` | `[PROD]` |
| **Brex Webhook** | Dev webhook → Dev URL | Prod webhook → Prod URL |

See [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md) for complete production deployment steps.

## Security

- **Webhook Verification**: HMAC SHA256 signature validation
- **Secrets Management**: All secrets in Catalyst Secrets (encrypted)
- **Token Auto-refresh**: Automatic token renewal on expiry
- **RBAC**: Role-based access control for actions
- **Event Store**: Immutable audit log for compliance

## License

MIT

## Support

For issues or questions:
1. Check logs in Catalyst Console
2. Review health endpoint
3. Test with `/dev/test-webhook` endpoint
4. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
