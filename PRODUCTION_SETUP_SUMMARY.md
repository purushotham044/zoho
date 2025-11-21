# Production Setup Summary

## Overview

This document summarizes the environment configuration system and production deployment setup.

## Configuration Files Created

### 1. `config/dev.json`
Development environment configuration with:
- Base URL: Development function URL
- Secret names: `_DEV` suffix
- Cliq channel: `brex-dev`
- Email prefix: `[DEV]`

### 2. `config/prod.json`
Production environment configuration with:
- Base URL: Production function URL (placeholder - update after deployment)
- Secret names: `_PROD` suffix
- Cliq channel: `brex-finance`
- Email prefix: `[PROD]`

### 3. `config/index.js`
Configuration loader that:
- Reads environment from `NODE_ENV` or `--env` CLI arg
- Loads appropriate config file
- Provides helper functions

## Updated Scripts

### `scripts/validate-deployment.js`
Now reads environment config:
```javascript
const config = require('../config');
const envConfig = config.loadConfig();
const env = config.getEnvironment();
```

**Usage:**
```bash
# Development (default)
npm run validate:dev
# or
node scripts/validate-deployment.js --env=dev

# Production
npm run validate:prod
# or
node scripts/validate-deployment.js --env=prod
```

### `scripts/test-webhook-signature.js`
Now uses environment-specific config:
```javascript
const config = require('../config');
const envConfig = config.loadConfig();
const webhookSecretEnvVar = envConfig.brex.webhookSecretSecretName;
```

**Usage:**
```bash
# Development
npm run test:webhook:dev

# Production
npm run test:webhook:prod
```

### `scripts/deploy-env.sh` (New)
Environment-aware deployment script:
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

## Updated Code Modules

### `catalyst/lib/email-alerts.js`
- Detects environment from `ENVIRONMENT` or `NODE_ENV`
- Uses `[DEV]` or `[PROD]` prefix in email subjects
- All email alerts include environment tag

### `catalyst/lib/secrets.js`
- Environment-aware secret resolution:
  - Dev: `BREX_CLIENT_ID_DEV` → falls back to `BREX_CLIENT_ID`
  - Prod: `BREX_CLIENT_ID_PROD` → falls back to `BREX_CLIENT_ID`
- Same pattern for all Brex secrets

### `catalyst/lib/cliq.js`
- Environment-aware Cliq webhook/token resolution:
  - Dev: `CLIQ_WEBHOOK_URL_DEV` → falls back to `CLIQ_WEBHOOK_URL`
  - Prod: `CLIQ_WEBHOOK_URL_PROD` → falls back to `CLIQ_WEBHOOK_URL`

### `catalyst/functions/actions.js`
- Logs environment in event_store for all actions
- Environment included in approval/flag event payloads

## Updated Documentation

1. **PRODUCTION_DEPLOYMENT_GUIDE.md** - Complete production deployment guide
2. **PROJECT_CONFIG.md** - Added "Dev vs Prod URLs & Channels" section
3. **README.md** - Added environment information and production guide link
4. **DEPLOYMENT_CHECKLIST.md** - Added production deployment checklist
5. **MIGRATION_GUIDE.md** - Added "Promote from Dev to Prod" section
6. **ENVIRONMENT_CONFIG_SUMMARY.md** - Detailed environment config documentation
7. **config/README.md** - Configuration directory documentation

## NPM Scripts Added

```json
{
  "deploy:dev": "bash scripts/deploy-env.sh dev",
  "deploy:prod": "bash scripts/deploy-env.sh prod",
  "validate:dev": "node scripts/validate-deployment.js --env=dev",
  "validate:prod": "node scripts/validate-deployment.js --env=prod",
  "test:webhook:dev": "node scripts/test-webhook-signature.js --env=dev",
  "test:webhook:prod": "node scripts/test-webhook-signature.js --env=prod"
}
```

## Makefile Updates

Added `deploy-prod` target:
```makefile
deploy-prod: package
	@if command -v zcli >/dev/null 2>&1; then \
		cd catalyst && zcli catalyst:deploy --env production; \
	fi
```

## Safety Guards Implemented

1. **Secret Name Separation:** Different secret names (`_DEV` vs `_PROD`) prevent accidental mixing
2. **Email Subject Tags:** `[DEV]` vs `[PROD]` clearly identify environment
3. **Event Logging:** All actions log environment in event_store
4. **URL Validation:** Scripts validate URLs match expected environment pattern
5. **Environment Variable:** `ENVIRONMENT` must be set in Production

## Next Steps for Production Deployment

1. **Deploy to Production:**
   ```bash
   npm run deploy:prod
   ```

2. **Update Production Config:**
   - Get Production function URL from Catalyst Console
   - Update `config/prod.json` with actual URLs

3. **Configure Production Secrets:**
   - Use `_PROD` suffix for all secrets
   - Set `ENVIRONMENT=production` in Production env vars

4. **Register Production Webhooks:**
   - Brex: Point to Production function URL
   - Cliq: Point to Production function URL

5. **Validate Production:**
   ```bash
   npm run validate:prod
   ```

## File Snippets

### config/dev.json (Key Sections)
```json
{
  "environment": "development",
  "baseUrl": "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction",
  "brex": {
    "webhookUrl": "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/webhook/receive",
    "secretPrefix": "BREX_DEV_",
    "clientIdSecretName": "BREX_CLIENT_ID_DEV"
  },
  "cliq": {
    "channelName": "brex-dev",
    "webhookUrlSecretName": "CLIQ_WEBHOOK_URL_DEV"
  },
  "email": {
    "subjectPrefix": "[zohocliq26] [DEV]"
  }
}
```

### config/prod.json (Key Sections)
```json
{
  "environment": "production",
  "baseUrl": "https://zohocliq-906503047.production.catalystserverless.com/server/zohofunction",
  "brex": {
    "webhookUrl": "https://zohocliq-906503047.production.catalystserverless.com/server/zohofunction/webhook/receive",
    "secretPrefix": "BREX_PROD_",
    "clientIdSecretName": "BREX_CLIENT_ID_PROD"
  },
  "cliq": {
    "channelName": "brex-finance",
    "webhookUrlSecretName": "CLIQ_WEBHOOK_URL_PROD"
  },
  "email": {
    "subjectPrefix": "[zohocliq26] [PROD]"
  },
  "note": "⚠️ IMPORTANT: Update baseUrl, brex.webhookUrl, and brex.oauthRedirectUrl with the actual Production function URL after first deployment"
}
```

### scripts/validate-deployment.js (Entry Point)
```javascript
const config = require('../config');

// Load environment-specific config
const envConfig = config.loadConfig();
const env = config.getEnvironment();

const CATALYST_BASE_URL = envConfig.baseUrl;
const PROJECT_NAME = envConfig.projectName;
const ADMIN_EMAILS = envConfig.adminEmails;

async function validateDeployment() {
  console.log(`🔍 Validating Deployment for ${PROJECT_NAME} (${env.toUpperCase()})`);
  console.log(`Environment: ${envConfig.environment}`);
  console.log(`Base URL: ${CATALYST_BASE_URL}`);
  // ... rest of validation logic
}
```

## Exact NPM Commands

### Development Validation
```bash
npm run validate:dev
# or
node scripts/validate-deployment.js --env=dev
```

### Production Validation
```bash
npm run validate:prod
# or
node scripts/validate-deployment.js --env=prod
```

### Development Webhook Test
```bash
npm run test:webhook:dev
# or
node scripts/test-webhook-signature.js --env=dev
```

### Production Webhook Test
```bash
npm run test:webhook:prod
# or
node scripts/test-webhook-signature.js --env=prod
```

### Development Deployment
```bash
npm run deploy:dev
# or
bash scripts/deploy-env.sh dev
```

### Production Deployment
```bash
npm run deploy:prod
# or
bash scripts/deploy-env.sh prod
```

---

**Last Updated:** 2024-12-19  
**Status:** Ready for Production Deployment

