/**
 * Unit tests for cursor pagination logic
 */

const { fetchTransactions } = require('../../catalyst/lib/brex');

// Mock axios completely
jest.mock('axios');
const axios = require('axios');

// Mock secrets module to avoid dependency issues
jest.mock('../../catalyst/lib/secrets', () => ({
  getBrexClientId: jest.fn().mockResolvedValue('test_client_id'),
  getBrexClientSecret: jest.fn().mockResolvedValue('test_client_secret')
}));

describe('Cursor Pagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset axios mock to be a function that returns a promise
    axios.mockReset();
  });

  test('should fetch first page with null cursor', async () => {
    const mockResponse = {
      items: [
        { id: 'txn_1', amount: { amount: 100 } },
        { id: 'txn_2', amount: { amount: 200 } }
      ],
      next_cursor: 'cursor_123'
    };

    // Mock axios to return immediately (no retries)
    axios.mockResolvedValue({
      data: mockResponse,
      headers: {
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 60),
        'x-ratelimit-remaining': '100'
      }
    });

    const result = await fetchTransactions('access_token', null);

    expect(result.items).toHaveLength(2);
    expect(result.next_cursor).toBe('cursor_123');
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://platform.brex.com/v2/transactions',
        params: { limit: 100 }
      })
    );
  });

  test('should fetch next page with cursor', async () => {
    const mockResponse = {
      items: [{ id: 'txn_3' }],
      next_cursor: null
    };

    // Mock axios to return immediately (no retries)
    axios.mockResolvedValue({
      data: mockResponse,
      headers: {
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 60),
        'x-ratelimit-remaining': '100'
      }
    });

    const result = await fetchTransactions('access_token', 'cursor_123');

    expect(result.next_cursor).toBeNull();
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://platform.brex.com/v2/transactions',
        params: expect.objectContaining({
          cursor: 'cursor_123',
          limit: 100
        })
      })
    );
  });

  test('should handle empty response', async () => {
    // Mock axios to return immediately (no retries)
    axios.mockResolvedValue({
      data: { items: [], next_cursor: null },
      headers: {
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 60),
        'x-ratelimit-remaining': '100'
      }
    });

    const result = await fetchTransactions('access_token', null);

    expect(result.items).toHaveLength(0);
    expect(result.next_cursor).toBeNull();
  });
});

