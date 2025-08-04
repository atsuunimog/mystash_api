# MyStash Admin API v2

## Description
This is a comprehensive REST API built with NestJS that provides endpoints for managing users, financial transactions, payments, stashes, wallets, and administrative operations for the MyStash platform. The API supports both new user systems and legacy user data management.

## Architecture

- **Framework**: NestJS (Node.js framework)
- **Database**: MongoDB with Mongoose ODM
- **Multi-Database Support**: Connects to three separate MongoDB databases
  - `mysh-auth`: User authentication and management
  - `mysh-service`: Financial services and transactions
  - `server-3-dev-db`: Payment processing and legacy data
- **Response Format**: Standardized JSON responses with pagination support

## Database Setup

This project uses MongoDB with Mongoose ODM and connects to multiple databases for different services. Before running the application, you'll need to:

1. **Install MongoDB** locally or set up a MongoDB Atlas cluster
2. **Create a `.env` file** with the required database connection strings
3. **Start the application** - Mongoose will automatically connect to the databases

### Environment Variables
Create a `.env` file in the root directory with the following database connections:

```bash
# Auth service database
AUTH_DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/mysh-auth?retryWrites=true&w=majority"

# Service/Finance database  
SERVICE_DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/mysh-service?retryWrites=true&w=majority"

# Payment service database
DEV_DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/server-3-dev-db?retryWrites=true&w=majority"
```

**Database Names:**
- `mysh-auth` - Authentication and user management
- `mysh-service` - Financial services 
- `server-3-dev-db` - Payment processing, transactions and development data

## Project Structure

```
src/
├── auth/                    # Authentication module (future use)
├── common/                  # Shared utilities and interfaces
│   ├── config/             # Database and logging configuration
│   ├── filters/            # Exception filters
│   ├── interceptors/       # Request/response interceptors
│   ├── interfaces/         # TypeScript interfaces
│   └── middleware/         # Custom middleware
├── dashboard/              # Dashboard analytics endpoints
├── finance/                # Financial services modules
│   ├── accounts/          # Account management
│   ├── interests/         # Interest rate management
│   ├── old_transaction/   # Legacy transaction data
│   ├── payments/          # Payment processing
│   ├── rates/             # Exchange rates
│   ├── stashes/           # Savings stash management
│   ├── transactions/      # Transaction management
│   ├── transfers/         # Transfer operations
│   └── wallets/           # Wallet management
├── health/                 # Health check endpoints
├── integrations/           # Third-party integrations
├── old_user/              # Legacy user management
└── user/                  # New user system management
```

Replace `username`, `password`, and `cluster.mongodb.net` with your actual MongoDB Atlas credentials and cluster URL.

## API Endpoints

This API provides comprehensive endpoints for managing users and financial services. All endpoints return JSON responses and support proper error handling.

**Base URL**: `http://localhost:3000`

### Root & Health Check Endpoints
```
GET /                           # Welcome message and API information
GET /health                     # Basic health check
GET /health/detailed            # Detailed system health information  
GET /health/database            # Database connection health check
```

### User Management

#### New User System (Auth Database) - Read-Only
```
GET /users                      # Get all users with pagination
GET /users/email/:email         # Get user by email address  
GET /users/:authId/stashes      # Get user stashes by auth ID
GET /users/:authId/stash-stats  # Get user stash statistics
GET /users/:authId/wallets      # Get user wallets by auth ID
GET /users/aggregate/balances   # Get aggregate user balances
GET /users/:authId/aggregate    # Get user aggregate data by auth ID
GET /users/:authId/balances     # Get user balances by auth ID
```

#### Legacy User System (Dev Database)
```
GET /old-users                  # Get all old users with pagination
GET /old-users/email/:email     # Get old user by email address
GET /old-users/uid/:uid         # Get old user by unique ID
GET /old-users/statistics/:uid  # Get old user statistics
GET /old-users/transactions/:uid # Get old user transactions
GET /old-users/payments/:uid    # Get old user payments
GET /old-users/payment-stats/:uid # Get old user payment statistics
```

### Financial Services

#### Accounts
```
GET /accounts                   # Get all accounts with pagination
```

#### Payments
```
GET /payments                   # Get all payments with pagination
GET /payments/stats             # Get payment statistics
GET /payments/by-reference/:reference    # Get payment by reference
GET /payments/by-status/:status          # Get payments by status
GET /payments/by-type/:type              # Get payments by type
GET /payments/by-category/:category      # Get payments by category
GET /payments/date-range                 # Get payments within date range
GET /payments/:id                        # Get payment by ID
```

#### Transactions
```
GET /transactions               # Get all transactions with pagination
GET /transactions/tnx/:id       # Get transaction by ID
GET /transactions/reference/:reference   # Get transaction by reference
GET /transactions/recent-tnx/:authId     # Get recent transactions by auth ID
GET /transactions/user/:authId           # Get transactions by auth ID
GET /transactions/stats/:authId          # Get transaction statistics by auth ID
GET /transactions/date-range             # Get transactions within date range
GET /transactions/email/:email           # Get transactions by user email
```

#### Old Transactions (Legacy)
```
GET /old-transactions           # Get all old transactions with pagination
GET /old-transactions/tnx/:id   # Get old transaction by ID
GET /old-transactions/recent/:uid        # Get recent old transactions by UID
GET /old-transactions/user/email/:email  # Get old transactions by user email
GET /old-transactions/date-range         # Get old transactions within date range
```

#### Stashes
```
GET /stashes                    # Get all stashes with pagination
GET /stashes/stash/:id          # Get stash by ID
GET /stashes/auth/:authId       # Get stashes by auth ID
GET /stashes/save-type/:saveType # Get stashes by save type
GET /stashes/active             # Get active stashes
GET /stashes/stats              # Get stash statistics
GET /stashes/detailed           # Get all stashes with user details
GET /stashes/detailed/auth/:authId # Get stashes by auth ID with user details
```

#### Transfers & Wallets
```
GET /transfers                  # Get all transfers with pagination
GET /wallets                    # Get all wallets with pagination
GET /wallets/:id               # Get wallet by ID
```

#### Exchange Rates
```
GET /rates                      # Get all exchange rates
GET /rates/active               # Get active exchange rates
GET /rates/currency-pair        # Get rates for currency pair
GET /rates/public/:publicId     # Get rate by public ID
GET /rates/:id                  # Get rate by ID
```

#### Interest Rates
```
GET /interests                  # Get all interest rates
GET /interests/active           # Get active interest rates
GET /interests/currency/:currency        # Get interest rates by currency
GET /interests/auth/:authId              # Get interest rates by auth ID
GET /interests/profile/:profileId        # Get interest rates by profile ID
GET /interests/public/:publicId          # Get interest rate by public ID
GET /interests/:id                       # Get interest rate by ID
POST /interests                          # Create new interest rate
PUT /interests/:id                       # Update interest rate
DELETE /interests/:id                    # Soft delete interest rate
```

### Dashboard Endpoints
```
GET /dashboard/aggregate                # Get dashboard aggregates
GET /dashboard/chart/signups            # Get user signup chart data (with optional year query)
GET /dashboard/chart/signups/all-years  # Get all years signup data
GET /dashboard/savings/aggregate        # Get savings aggregates
```

**Total**: 60 endpoints (57 GET, 1 POST, 1 PUT, 1 DELETE)

### API Documentation
For detailed parameter descriptions, request/response formats, and examples, see [API Documentation](./api_docs.md).

### Response Format
All endpoints return standardized JSON responses with consistent error handling and pagination support where applicable.

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
# Start in development mode with auto-reload
npm run start:dev

# Start in debug mode
npm run start:debug

# Start in production mode
npm run start:prod

# Build the application
npm run build
```

### Code Quality
```bash
# Format code with Prettier
npm run format

# Lint and fix code issues
npm run lint
```

### Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Generate test coverage report
npm run test:cov

# Run tests in debug mode
npm run test:debug
```
