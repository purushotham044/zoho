/**
 * Integration test for webhook endpoint
 * Simulates Brex webhook payload
 */

const crypto = require('crypto');

/**
 * Test webhook payload
 */
function createTestWebhookPayload(transaction, secret) {
  const event = {
    type: 'transaction.created',
    data: transaction
  };

  const payload = JSON.stringify(event);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const signature = `sha256=${hmac.digest('hex')}`;

  return {
    payload: event,
    rawBody: payload,
    signature
  };
}

/**
 * Example test transaction
 */
const testTransaction = {
  id: 'txn_test_123',
  account_id: 'acc_test_123',
  amount: {
    amount: 150.75,
    currency: 'USD'
  },
  merchant: {
    name: 'Test Restaurant'
  },
  status: 'pending',
  category: 'Food & Dining',
  created_at: new Date().toISOString(),
  card: {
    owner: {
      name: 'Test User'
    }
  }
};

/**
 * Example curl command to test webhook
 */
const curlExample = `
# Test webhook endpoint
curl -X POST https://your-app.catalystapps.com/webhook/brex \\
  -H "Content-Type: application/json" \\
  -H "X-Brex-Signature: sha256=<calculated_signature>" \\
  -d '{
    "type": "transaction.created",
    "data": ${JSON.stringify(testTransaction, null, 2)}
  }'
`;

console.log('Webhook Test Example:');
console.log(curlExample);

describe('Webhook Integration Tests', () => {
  test('placeholder', () => {
    expect(true).toBe(true);
  });
});

module.exports = {
  createTestWebhookPayload,
  testTransaction
};

