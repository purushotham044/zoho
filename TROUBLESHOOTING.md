# Troubleshooting Guide

Common issues and solutions for the Brex-Cliq integration.

## Webhook Issues

### Webhook Signature Verification Fails

**Symptoms**: 401 Unauthorized errors, webhooks rejected

**Causes**:
- Incorrect `BREX_WEBHOOK_SECRET` in Catalyst Secrets
- Raw body not used for signature calculation
- Missing `X-Brex-Signature` header

**Solutions**:
1. Verify webhook secret matches Brex Developer Portal
2. Ensure function receives raw request body (not parsed JSON)
3. Check that Brex is sending signature header
4. Test with `/dev/test-webhook` endpoint

**Debug**:
```bash
# Test webhook with correct signature
curl -X POST "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/dev/test-webhook?account_id=<id>"
```

### Webhooks Not Received

**Symptoms**: No webhooks arriving at endpoint

**Causes**:
- Webhook not registered in Brex
- Incorrect webhook URL
- Webhook disabled in Brex

**Solutions**:
1. Check Brex Developer Portal → Webhooks
2. Verify webhook URL: `https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/webhook/receive`
3. Ensure webhook is enabled
4. Test webhook delivery in Brex console

## Sync Issues

### Sync Not Running

**Symptoms**: `last_sync_time` not updating, scheduled sync not executing

**Causes**:
- Scheduler not enabled
- Incorrect scheduler configuration
- Function endpoint error

**Solutions**:
1. Check Catalyst Console → Scheduler
2. Verify schedule is enabled
3. Check cron expression: `*/10 * * * *`
4. Verify endpoint: `/sync?account_id=<id>`
5. Check function logs for errors

**Debug**:
```bash
# Manual sync trigger
curl -X GET "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/sync?account_id=<id>"
```

### Sync Failing with Errors

**Symptoms**: `last_sync_status` = "error", `error_count` > 0

**Causes**:
- Expired access token
- Rate limiting
- Network issues
- Invalid cursor

**Solutions**:
1. Check token expiry: `GET /oauth/refresh?account_id=<id>`
2. Review error logs in Catalyst Console
3. Check rate limit headers in Brex API responses
4. Reset cursor if corrupted: set `last_cursor` to `null` in `sync_state`

**Debug**:
```bash
# Check sync status
curl https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/dashboard

# Refresh token
curl -X GET "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/oauth/refresh?account_id=<id>"
```

### Duplicate Transactions

**Symptoms**: Same transaction appears multiple times

**Causes**:
- Missing unique index on `transaction_id`
- Upsert logic not working
- Concurrent webhook and sync processing

**Solutions**:
1. Verify unique index on `brex_transactions.transaction_id`
2. Check upsert logic in `catalyst/lib/db.js`
3. Idempotent upsert should prevent duplicates - verify it's working

**Debug**:
```bash
# Check for duplicates
# Query brex_transactions table for duplicate transaction_id values
```

## Token Issues

### Token Expired

**Symptoms**: API calls failing with 401, sync failing

**Causes**:
- Access token expired
- Refresh token invalid
- Auto-refresh not working

**Solutions**:
1. Manual refresh: `GET /oauth/refresh?account_id=<id>`
2. Re-authorize if refresh fails: `GET /oauth/authorize`
3. Check `token_expires_at` in accounts table
4. Verify refresh token exists in Secrets

**Debug**:
```bash
# Check token expiry
curl https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/dashboard

# Manual refresh
curl -X GET "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/oauth/refresh?account_id=<id>"
```

### Refresh Token Invalid

**Symptoms**: Refresh endpoint returns error

**Causes**:
- Refresh token revoked in Brex
- Token not saved correctly
- Account disconnected

**Solutions**:
1. Re-authorize: `GET /oauth/authorize`
2. Verify refresh token in Catalyst Secrets: `BREX_REFRESH_TOKEN_<account_id>`
3. Check Brex Developer Portal for token status

## Cliq Integration Issues

### Cards Not Appearing in Cliq

**Symptoms**: Webhooks processed but no Cliq cards

**Causes**:
- Incorrect `CLIQ_WEBHOOK_URL`
- Invalid `CLIQ_BOT_TOKEN`
- Bot permissions insufficient
- Channel not accessible

**Solutions**:
1. Verify `CLIQ_WEBHOOK_URL` format: `https://cliq.zoho.com/api/v2/channelsbyname/<channel>/message`
2. Check bot token is valid and not expired
3. Verify bot has `channels:write` and `messages:write` permissions
4. Test webhook URL with curl:
   ```bash
   curl -X POST "<CLIQ_WEBHOOK_URL>" \
     -H "Authorization: Zoho-oauthtoken <CLIQ_BOT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"text": "Test message"}'
   ```

### Slash Command Not Working

**Symptoms**: `/brex tx 10` returns error or no response

**Causes**:
- Command not registered in Cliq
- Handler endpoint incorrect
- Account ID not found

**Solutions**:
1. Verify extension manifest uploaded to Cliq
2. Check command handler URL: `https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/cliq/command`
3. Ensure account exists in `accounts` table
4. Check function logs for errors

**Debug**:
```bash
# Test command endpoint directly
curl -X POST "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/cliq/command" \
  -H "Content-Type: application/json" \
  -d '{"text": "10", "user_id": "test", "channel_id": "test"}'
```

### Card Actions Not Working

**Symptoms**: Approve/Flag buttons don't work

**Causes**:
- Action URLs incorrect
- Thread ID missing
- Function endpoint error

**Solutions**:
1. Verify action URLs in card JSON
2. Ensure `thread_id` is passed in action URL
3. Check action endpoints are accessible
4. Review function logs for errors

**Debug**:
```bash
# Test approve action
curl -X GET "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/actions/approve?txn_id=<id>&thread_id=<thread_id>"
```

## Database Issues

### Table Not Found

**Symptoms**: Errors about missing tables

**Causes**:
- Tables not created
- Incorrect table names
- Permissions issue

**Solutions**:
1. Verify tables exist in Catalyst Console → Data Store
2. Check table names match code: `brex_transactions`, `sync_state`, `accounts`
3. Verify function has access to Data Store

### Query Errors

**Symptoms**: Database queries failing

**Causes**:
- Incorrect query syntax
- Missing columns
- Data type mismatches

**Solutions**:
1. Review Catalyst Tables API documentation
2. Verify column names and types match schema
3. Check query syntax in `catalyst/lib/db.js`
4. Test queries in Catalyst Console

## Rate Limiting

### Brex API Rate Limits

**Symptoms**: 429 Too Many Requests errors

**Causes**:
- Too many API calls
- Not respecting rate limits
- Concurrent requests

**Solutions**:
1. Implementation includes automatic rate limit handling
2. Check `Retry-After` headers
3. Reduce sync frequency if needed
4. Monitor rate limit headers in logs

**Debug**:
- Check Brex API rate limit documentation
- Review rate limit tracking in `catalyst/lib/brex.js`

## General Debugging

### Check Health Status

```bash
curl https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/health
```

### View Dashboard

```bash
curl https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/dashboard
```

### Check Function Logs

1. Go to Catalyst Console → Functions → Logs
2. Filter by function name
3. Look for error messages

### Test Individual Components

```bash
# Test webhook
curl -X POST "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/dev/test-webhook?account_id=<id>"

# Test sync
curl -X GET "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/sync?account_id=<id>"

# Test health
curl https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/health
```

## Email Alert Issues

### Admin Emails Not Receiving Alerts

**Symptoms**: Sync failures occur but no email alerts sent

**Causes**:
- Admin emails not configured correctly
- Email service not available
- Environment variable `ALERT_ADMIN_EMAILS` not set

**Solutions**:
1. Verify admin emails in `PROJECT_CONFIG.md`: purushothamt044@gmail.com, tejasiddha1729@gmail.com
2. Check environment variable `ALERT_ADMIN_EMAILS` is set (comma-separated)
3. Test notification endpoint: `POST /admin/notify-admins-test`
4. Check Catalyst email service is configured
5. Review email logs in function console

**Debug**:
```bash
# Test admin notification
curl -X POST "https://zohocliq-906503047.development.catalystserverless.com/server/zohofunction/admin/notify-admins-test" \
  -H "Content-Type: application/json" \
  -d '{"admin_email": "purushothamt044@gmail.com"}'
```

**Note**: Admin emails are configured in `PROJECT_CONFIG.md` and can be overridden via `ALERT_ADMIN_EMAILS` environment variable.

## Getting Help

1. **Check Logs**: Catalyst Console → Functions → Logs
2. **Review Documentation**: README.md, MIGRATION_GUIDE.md
3. **Test Endpoints**: Use Postman collection or curl
4. **Verify Configuration**: Use DEPLOYMENT_CHECKLIST.md
5. **Contact Admins**: purushothamt044@gmail.com, tejasiddha1729@gmail.com

## Common Error Codes

- **401 Unauthorized**: Token expired or invalid, webhook signature invalid
- **404 Not Found**: Table/row not found, endpoint incorrect
- **429 Too Many Requests**: Rate limited, wait and retry
- **500 Internal Server Error**: Check function logs for details

