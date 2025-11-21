# Testing Checklist - Admin Emails Update

## Pre-Testing Setup

- [ ] Verify `PROJECT_CONFIG.md` has correct admin emails:
  - purushothamt044@gmail.com
  - tejasiddha1729@gmail.com

- [ ] Set environment variable (optional):
  ```bash
  export ALERT_ADMIN_EMAILS=purushothamt044@gmail.com,tejasiddha1729@gmail.com
  ```

- [ ] Ensure Catalyst email service is configured (or mock SMTP for testing)

## Unit Tests

```bash
npm run test:unit -- email-alerts
```

**Expected Results:**
- ✅ `getAdminEmails` returns correct default emails
- ✅ Environment variable override works
- ✅ Email trimming and filtering works
- ✅ All email functions are callable

## Integration Tests

```bash
npm run test:integration -- admin_notify
```

**Expected Results:**
- ✅ Test notification sends to both admin emails
- ✅ Admin authentication enforced
- ✅ Events logged to event_store

## Manual Testing

### 1. Test Notification Endpoint

```bash
curl -X POST "https://your-app.catalystapps.com/admin/notify-admins-test" \
  -H "Content-Type: application/json" \
  -d '{"admin_email": "purushothamt044@gmail.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test notification sent successfully",
  "correlation_id": "<uuid>",
  "recipients": 2,
  "admin_emails": [
    "purushothamt044@gmail.com",
    "tejasiddha1729@gmail.com"
  ]
}
```

**Verify:**
- [ ] Both admin emails receive test notification
- [ ] Email subject includes: `[zohocliq26] [DEVELOPMENT] Test Notification`
- [ ] Email includes correlation ID
- [ ] Event logged in `event_store` table

### 2. Test Non-Admin Access (Should Fail)

```bash
curl -X POST "https://your-app.catalystapps.com/admin/notify-admins-test" \
  -H "Content-Type: application/json" \
  -d '{"admin_email": "viewer@example.com"}'
```

**Expected Response:**
```json
{
  "error": "Forbidden",
  "message": "Admin role required"
}
```

### 3. Test Sync Failure Alert (Trigger 3+ Errors)

1. Cause sync failures (e.g., invalid token, network issues)
2. Wait for 3 consecutive failures
3. Check admin emails for alert

**Verify:**
- [ ] Alert email received by both admins
- [ ] Subject: `[zohocliq26] [DEVELOPMENT] Sync Failure Alert - Account <id>`
- [ ] Email includes error count, sync status, cursor info

### 4. Test Secret Rotation Notification

```bash
curl -X POST "https://your-app.catalystapps.com/admin/rotate-secrets" \
  -H "Content-Type: application/json" \
  -H "X-User-Email: purushothamt044@gmail.com" \
  -d '{
    "new_client_secret": "test_secret",
    "re_register_webhooks": false
  }'
```

**Verify:**
- [ ] Rotation notification email sent to both admins
- [ ] Email includes rotation results
- [ ] Event logged in `event_store`

## Verification Steps

### Check Event Store

```sql
-- Query event_store for notification events
SELECT * FROM event_store 
WHERE source = 'action' 
AND payload LIKE '%notify%' OR payload LIKE '%rotation%'
ORDER BY received_at DESC
LIMIT 10;
```

### Check Logs

Look for email alert logs in Catalyst Console:
- `Email alert sent successfully [correlation-id] to 2 recipient(s)`
- Or: `EMAIL ALERT [MOCK]:` (if email service not configured)

### Verify Email Content

Check received emails for:
- ✅ Project name: `zohocliq26`
- ✅ Environment: `DEVELOPMENT`/`STAGING`/`PRODUCTION`
- ✅ Correlation ID present
- ✅ Timestamp included
- ✅ Proper formatting

## Known Issues / Notes

1. **Email Service**: If Catalyst email service is not configured, emails will be logged to console (mock mode). This is expected in development.

2. **Environment Variable**: `ALERT_ADMIN_EMAILS` takes precedence over `PROJECT_CONFIG.md` defaults.

3. **Testing in Staging**: Use mock SMTP (e.g., Mailhog) to avoid spamming production inboxes during CI.

## Success Criteria

- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ Test notification endpoint works and sends to both emails
- ✅ Non-admin users get 403 error
- ✅ Sync failure alerts trigger after 3+ errors
- ✅ Rotation notifications sent on secret rotation
- ✅ All events logged to event_store
- ✅ No secrets or tokens in logs

## Ready for Production?

- [ ] All tests passing
- [ ] Manual testing completed
- [ ] Both admin emails verified receiving notifications
- [ ] Event store logging verified
- [ ] Email service configured (if not using mock)
- [ ] Documentation reviewed

---

**Test Date**: _______________

**Tested By**: _______________

**Results**: _______________

