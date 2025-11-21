# Migration Guide

## Promote from Dev to Prod

See [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md) for complete production deployment steps.

### Quick Migration Steps

1. **Deploy to Production:**
   ```bash
   npm run deploy:prod
   # or manually via Catalyst Console
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

---

# Migration Guide (Original)

Step-by-step guide for migrating to the Brex-Cliq integration or recovering from failures.

## Initial Migration

### Phase 1: Preparation (Day 1)

1. **Set up Catalyst Project**
   - Create new Catalyst project
   - Note project ID and base URL
   - Create all required tables (see README)

2. **Configure Secrets**
   - Add all secrets to Catalyst Secrets
   - Verify no typos in secret names
   - Test secret retrieval (use test endpoint)

3. **Deploy Functions**
   - Deploy all Catalyst functions
   - Verify all endpoints accessible
   - Test health endpoint

### Phase 2: OAuth Setup (Day 1)

1. **Authorize Brex Account**
   ```
   GET https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/oauth/authorize
   ```
   - Complete OAuth flow
   - Verify account saved in `accounts` table
   - Verify refresh token in Secrets

2. **Test Token Refresh**
   ```
   GET https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/oauth/refresh?account_id=<id>
   ```
   - Should return new access token
   - Verify token_expires_at updated

### Phase 3: Initial Backfill (Day 1-2)

1. **Run One-Click Backfill**
   ```bash
   curl -X GET "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/sync/run?account_id=<id>"
   ```

2. **Monitor Progress**
   - Check response for `total_processed`
   - Monitor `sync_state` table
   - Watch for errors in `error_count`

3. **Verify Data**
   ```bash
   curl https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/dashboard
   ```
   - Check `total_transactions` count
   - Verify transactions in `brex_transactions` table

4. **Expected Timeline**
   - Small accounts (< 1000 txns): 5-10 minutes
   - Medium accounts (1000-10000 txns): 30-60 minutes
   - Large accounts (> 10000 txns): 2-4 hours

### Phase 4: Webhook Setup (Day 2)

1. **Register Webhook in Brex**
   - URL: `https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/webhook/receive`
   - Events: `transaction.created`, `transaction.updated`
   - Save webhook secret

2. **Test Webhook**
   ```bash
   curl -X POST "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/dev/test-webhook?account_id=<id>"
   ```
   - Verify signature verification
   - Check transaction in database
   - Verify Cliq card appears

3. **Verify Real Webhook**
   - Create test transaction in Brex (if possible)
   - Or wait for next real transaction
   - Verify webhook received and processed

### Phase 5: Cliq Integration (Day 2)

1. **Configure Cliq Bot**
   - Create/configure bot in Cliq
   - Get bot token and webhook URL
   - Add to Catalyst Secrets

2. **Install Extension**
   - Upload `cliq/manifest.json`
   - Register slash command `/brex`
   - Test command: `/brex tx 10`

3. **Test Card Actions**
   - Trigger test webhook
   - Click "Approve" on card
   - Verify confirmation message
   - Test other actions

### Phase 6: Enable Scheduled Sync (Day 2)

1. **Configure Scheduler**
   - Create schedule in Catalyst Console
   - Set cron: `*/10 * * * *` (every 10 minutes)
   - Enable scheduler

2. **Monitor First Sync**
   - Wait 10 minutes
   - Check `last_sync_time` in `sync_state`
   - Verify `last_sync_status` is "success"

## Data Recovery Scenarios

### Scenario 1: Re-sync from Specific Date

**Problem**: Need to re-sync transactions from a specific date forward.

**Solution**:
1. Find cursor for that date (may require manual lookup or API call)
2. Run backfill with cursor:
   ```bash
   curl -X GET "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/sync/run?account_id=<id>&cursor=<cursor_value>"
   ```

**Note**: Brex API doesn't support date-based cursors directly. You may need to:
- Fetch transactions and filter by date
- Or start from beginning and let upsert handle duplicates

### Scenario 2: Complete Re-sync

**Problem**: Need to re-sync all transactions from scratch.

**Solution**:
1. Clear sync state (optional, upsert prevents duplicates):
   ```sql
   UPDATE sync_state SET last_cursor = NULL WHERE account_id = '<id>';
   ```
2. Run backfill:
   ```bash
   curl -X GET "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/sync/run?account_id=<id>"
   ```

**Result**: All transactions re-processed, but no duplicates created (idempotent upsert).

### Scenario 3: Fix Corrupted Sync State

**Problem**: `sync_state` has wrong cursor or error state.

**Solution**:
1. Check current state:
   ```bash
   curl https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/dashboard
   ```
2. Reset cursor:
   - Set `last_cursor` to `null` in `sync_state` table
   - Or delete row and let it recreate
3. Re-run sync:
   ```bash
   curl -X GET "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/sync/run?account_id=<id>"
   ```

### Scenario 4: Token Expiry Recovery

**Problem**: Access token expired and refresh failed.

**Solution**:
1. Check token status:
   - Query `accounts` table for `token_expires_at`
   - Check if refresh token exists in Secrets
2. Manual refresh:
   ```bash
   curl -X GET "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/oauth/refresh?account_id=<id>"
   ```
3. If refresh fails, re-authorize:
   ```bash
   GET https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/oauth/authorize
   ```

### Scenario 5: Webhook Secret Rotation

**Problem**: Need to rotate webhook secret for security.

**Solution**:
1. Generate new secret in Brex Developer Portal
2. Update `BREX_WEBHOOK_SECRET` in Catalyst Secrets
3. Update webhook in Brex with new secret
4. Test webhook:
   ```bash
   curl -X POST "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/dev/test-webhook"
   ```

## Validation Steps

After migration, verify:

1. **Data Integrity**
   - [ ] Transaction count matches Brex dashboard (approximately)
   - [ ] No duplicate transactions (check unique constraint)
   - [ ] All transactions have required fields

2. **Sync Functionality**
   - [ ] Scheduled sync running (check after 10 min)
   - [ ] `last_sync_time` updating
   - [ ] `last_sync_status` is "success"
   - [ ] `error_count` is 0 or low

3. **Webhook Functionality**
   - [ ] Test webhook succeeds
   - [ ] Real webhooks received and processed
   - [ ] Cliq cards appear for new transactions

4. **Cliq Integration**
   - [ ] Slash command works
   - [ ] Card actions work (Approve, Flag, Add Receipt)
   - [ ] Confirmations appear in Cliq

5. **Monitoring**
   - [ ] Health endpoint returns "ok"
   - [ ] Dashboard shows correct metrics
   - [ ] Logs accessible in Catalyst Console

## Rollback Procedure

If migration fails:

1. **Stop Scheduled Sync**
   - Disable scheduler in Catalyst Console

2. **Disable Webhook**
   - Disable webhook in Brex Developer Portal

3. **Preserve Data** (optional)
   - Export transactions from `brex_transactions` table
   - Export sync state

4. **Clean Up** (if needed)
   - Delete functions (or deploy previous version)
   - Clear secrets (or update to previous values)

5. **Investigate**
   - Review logs in Catalyst Console
   - Check error messages
   - Verify configuration

## Post-Migration Checklist

- [ ] All transactions synced
- [ ] Webhooks receiving events
- [ ] Cliq cards appearing
- [ ] Scheduled sync running
- [ ] Health endpoint healthy
- [ ] Team trained on usage
- [ ] Documentation shared
- [ ] Support contacts known

## Support Contacts

- **Catalyst Issues**: Zoho Catalyst Support
- **Brex API Issues**: Brex Developer Support
- **Cliq Issues**: Zoho Cliq Support
- **Integration Issues**: Your team's contact

## Timeline Estimate

- **Small Setup** (< 1000 transactions): 2-4 hours
- **Medium Setup** (1000-10000 transactions): 1-2 days
- **Large Setup** (> 10000 transactions): 2-3 days

Allow extra time for:
- Testing and validation
- Team training
- Documentation review

