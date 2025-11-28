/**
 * Unit tests for idempotent upsert logic
 */

const { upsertTransaction } = require('../../catalyst/lib/db');

// Mock Catalyst SDK
jest.mock('zoho-catalyst-sdk', () => {
  const getRowMock = jest.fn();
  const insertRowMock = jest.fn();
  const updateRowMock = jest.fn();

  return {
    initialize: jest.fn(() => ({
      datastore: jest.fn(() => ({
        table: jest.fn(() => ({
          getRow: getRowMock,
          insertRow: insertRowMock,
          updateRow: updateRowMock,
        }))
      }))
    })),
    __mocks: {
      getRowMock,
      insertRowMock,
      updateRowMock,
    }
  };
});

describe('Idempotent Upsert', () => {
  const mockTransaction = {
    id: 'txn_123',
    account_id: 'acc_123',
    amount: { amount: 100.50, currency: 'USD' },
    merchant: { name: 'Test Merchant' },
    status: 'pending',
    created_at: '2024-01-01T00:00:00Z'
  };

  let catalystSDK;
  let mocks;

  beforeEach(() => {
    catalystSDK = require('zoho-catalyst-sdk');
    mocks = catalystSDK.__mocks;
    mocks.getRowMock.mockReset();
    mocks.insertRowMock.mockReset();
    mocks.updateRowMock.mockReset();
  });

  test('should insert new transaction', async () => {
    mocks.getRowMock.mockResolvedValue(null);
    mocks.insertRowMock.mockResolvedValue({});

    const result = await upsertTransaction(mockTransaction);

    expect(result.isNew).toBe(true);
    expect(mocks.insertRowMock).toHaveBeenCalled();
    expect(mocks.updateRowMock).not.toHaveBeenCalled();
  });

  test('should update existing transaction', async () => {
    const existing = {
      transaction_id: 'txn_123',
      status: 'pending',
      created_at: '2024-01-01T00:00:00Z'
    };

    mocks.getRowMock.mockResolvedValue(existing);
    mocks.updateRowMock.mockResolvedValue({});

    const updatedTransaction = {
      ...mockTransaction,
      status: 'approved'
    };

    const result = await upsertTransaction(updatedTransaction);

    expect(result.isNew).toBe(false);
    expect(result.statusChanged).toBe(true);
    expect(mocks.updateRowMock).toHaveBeenCalled();
    expect(mocks.insertRowMock).not.toHaveBeenCalled();
  });

  test('should not mark as changed if status unchanged', async () => {
    const existing = {
      transaction_id: 'txn_123',
      status: 'pending',
      created_at: '2024-01-01T00:00:00Z'
    };

    mocks.getRowMock.mockResolvedValue(existing);
    mocks.updateRowMock.mockResolvedValue({});

    const result = await upsertTransaction(mockTransaction);

    expect(result.isNew).toBe(false);
    expect(result.statusChanged).toBe(false);
  });
});

