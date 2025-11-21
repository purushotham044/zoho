# Environment Configuration Summary

## Overview

The project now supports separate Development and Production environments with complete isolation.

## Configuration Files

### `config/dev.json`
Development environment configuration:
- Base URL: Development function URL (current)
- Secret names: `_DEV` suffix
- Cliq channel: `brex-dev`
- Email prefix: `[DEV]`

### `config/prod.json`
Production environment configuration:
- Base URL: Production function URL (placeholder - update after deployment)
- Secret names: `_PROD` suffix
- Cliq channel: `brex-finance`
- Email prefix: `[PROD]`

### `config/index.js`
Configuration loader that:
- Reads environment from `NODE_ENV` or `--env` CLI arg
- Loads appropriate config file
- Provides helper functions

## Usage in Scripts

### Validation Scripts

```bash
# Development (default)
node scripts/validate-deployment.js
# or
node scripts/validate-deployment.js --env=dev
npm run validate:dev

# Production
node scripts/validate-deployment.js --env=prod
npm run validate:prod
```

### Webhook Test Scripts

```bash
# Development
node scripts/test-webhook-signature.js --env=dev
npm run test:webhook:dev

# Production
node scripts/test-webhook-signature.js --env=prod
npm run test:webhook:prod
```

### Deployment Scripts

```bash
# Development
npm run deploy:dev
# or
bash scripts/deploy-env.sh dev

# Production
npm run deploy:prod
# or
bash scripts/deploy-env.sh prod
```

## Environment Detection in Code

### Runtime Environment

Code automatically detects environment from:
1. `ENVIRONMENT` environment variable (preferred)
2. `NODE_ENV` environment variable (fallback)
3. Defaults to `development` if not set

### Secret Resolution

Secrets are resolved based on environment:

**Development:**
- `BREX_CLIENT_ID_DEV` → falls back to `BREX_CLIENT_ID`
- `BREX_CLIENT_SECRET_DEV` → falls back to `BREX_CLIENT_SECRET`
- `BREX_WEBHOOK_SECRET_DEV` → falls back to `BREX_WEBHOOK_SECRET`
- `CLIQ_WEBHOOK_URL_DEV` → falls back to `CLIQ_WEBHOOK_URL`
- `CLIQ_BOT_TOKEN_DEV` → falls back to `CLIQ_BOT_TOKEN`

**Production:**
- `BREX_CLIENT_ID_PROD` → falls back to `BREX_CLIENT_ID`
- `BREX_CLIENT_SECRET_PROD` → falls back to `BREX_CLIENT_SECRET`
- `BREX_WEBHOOK_SECRET_PROD` → falls back to `BREX_WEBHOOK_SECRET`
- `CLIQ_WEBHOOK_URL_PROD` → falls back to `CLIQ_WEBHOOK_URL`
- `CLIQ_BOT_TOKEN_PROD` → falls back to `CLIQ_BOT_TOKEN`

## Safety Features

1. **Secret Name Separation:** Different secret names prevent accidental mixing
2. **Email Subject Tags:** `[DEV]` vs `[PROD]` clearly identify environment
3. **Event Logging:** All actions log environment in event_store
4. **URL Validation:** Scripts validate URLs match expected environment pattern
5. **Environment Variable:** `ENVIRONMENT` must be set in Production

## Required Environment Variables

### Development
```
ENVIRONMENT=development
CATALYST_BASE_URL=https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction
```

### Production
```
ENVIRONMENT=production
CATALYST_BASE_URL=https://zohocliq-906503047.production.catalystserverless.com/server/zohofunction
```

## Next Steps

1. **Deploy to Production** (see PRODUCTION_DEPLOYMENT_GUIDE.md)
2. **Update `config/prod.json`** with actual Production function URL
3. **Configure Production secrets** with `_PROD` suffix
4. **Set `ENVIRONMENT=production`** in Production environment variables
5. **Register Production webhooks** pointing to Production URLs
6. **Validate Production** using `npm run validate:prod`

