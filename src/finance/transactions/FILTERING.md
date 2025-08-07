# Transaction Filtering Endpoints

This document describes the new filtering capabilities for transaction endpoints.

## Available Filters

### Currency
- `USD` - US Dollar
- `NGN` - Nigerian Naira
- `EUR` - Euro
- `GBP` - British Pound

### Entry Type
- `credit` - Credit transactions
- `debit` - Debit transactions

### Source Type
- `Card` - Card payments
- `Wallet` - Wallet transactions
- `Bank` - Bank transfers
- `Transfer` - Internal transfers
- `Payment` - Payment transactions
- `External` - External transactions
- `MyStash` - MyStash transactions

### Status
- `success` - Successful transactions
- `pending` - Pending transactions
- `failed` - Failed transactions

## Endpoints

### 1. Get All Transactions with Filters
**Endpoint:** `GET /transactions/filtered`

**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 20)
- `currency` (optional, string): Filter by currency (USD, NGN, EUR, GBP)
- `entry` (optional, string): Filter by entry type (credit, debit)
- `sourceType` (optional, string): Filter by source type (Card, Wallet, Bank, etc.)
- `status` (optional, string): Filter by status (success, pending, failed)
- `authId` (optional, string): Filter by user auth ID
- `email` (optional, string): Filter by user email
- `startDate` (optional, string): Start date (YYYY-MM-DD)
- `endDate` (optional, string): End date (YYYY-MM-DD)
- `reference` (optional, string): Filter by transaction reference (partial match)
- `destinationType` (optional, string): Filter by destination type

**Example Requests:**
```bash
# Get all USD credit transactions
GET /transactions/filtered?currency=USD&entry=credit

# Get all successful card transactions in the last month
GET /transactions/filtered?status=success&sourceType=Card&startDate=2025-07-01&endDate=2025-07-31

# Get all transactions for a specific user with pagination
GET /transactions/filtered?authId=507f1f77bcf86cd799439011&page=1&limit=10

# Get all failed transactions with specific reference
GET /transactions/filtered?status=failed&reference=REF123
```

### 2. Get User Transactions with Filters
**Endpoint:** `GET /transactions/user/:authId/filtered`

**Path Parameters:**
- `authId` (required, string): User's auth ID

**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 20)
- `currency` (optional, string): Filter by currency
- `entry` (optional, string): Filter by entry type
- `sourceType` (optional, string): Filter by source type
- `status` (optional, string): Filter by status
- `startDate` (optional, string): Start date (YYYY-MM-DD)
- `endDate` (optional, string): End date (YYYY-MM-DD)
- `reference` (optional, string): Filter by transaction reference
- `destinationType` (optional, string): Filter by destination type

**Example Requests:**
```bash
# Get all NGN credit transactions for a specific user
GET /transactions/user/507f1f77bcf86cd799439011/filtered?currency=NGN&entry=credit

# Get all successful transactions for a user in a date range
GET /transactions/user/507f1f77bcf86cd799439011/filtered?status=success&startDate=2025-07-01&endDate=2025-07-31

# Get all card transactions for a user
GET /transactions/user/507f1f77bcf86cd799439011/filtered?sourceType=Card
```

## Response Format

All filtered endpoints return the same response format as the original endpoints:

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "publicId": "TXN_123456789",
      "auth": "507f1f77bcf86cd799439012",
      "profile": "507f1f77bcf86cd799439013",
      "currency": "USD",
      "entry": "credit",
      "destination": "wallet",
      "destinationType": "wallet",
      "source": "card",
      "sourceType": "Card",
      "amount": 100.00,
      "balance": 1100.00,
      "fee": 2.50,
      "narration": "Card funding",
      "reference": "REF_ABC123",
      "tRef": "TXN_DEF456",
      "status": "success",
      "completedAt": "2025-08-07T10:30:00.000Z",
      "processor": "mystash",
      "currencyPair": "USD-NGN",
      "createdAt": "2025-08-07T10:28:00.000Z",
      "updatedAt": "2025-08-07T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Backward Compatibility

The original endpoints remain unchanged and will continue to work:
- `GET /transactions` - Get all transactions (no filters)
- `GET /transactions/user/:authId` - Get user transactions (no filters)

## Error Handling

- Invalid filter values will be ignored
- Invalid date formats will cause the filter to be ignored
- Missing required parameters (like authId for user endpoints) will return an error
- Database errors will return appropriate error messages

## Performance Considerations

- Date range filters are indexed for better performance
- Email filters require a database join and may be slower for large datasets
- Consider using pagination for large result sets
- Combine multiple filters to narrow down results effectively
