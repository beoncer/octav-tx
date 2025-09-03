# 🔍 Transaction Validation Status Guide

This guide explains how to work with transaction validation status in the Octav API and how to filter reports by validation status.

## 📊 **Transaction Status Types**

Based on the Octav API and blockchain standards, transactions can have the following statuses:

### **1. Validated Transactions**
- **Status**: `success`, `confirmed`
- **Description**: Transactions that have been successfully processed and confirmed on the blockchain
- **Characteristics**:
  - Included in a block
  - Has confirmations
  - Gas was consumed successfully
  - No errors or reverts occurred

### **2. Pending Transactions**
- **Status**: `pending`, `processing`, `unconfirmed`
- **Description**: Transactions that are in the mempool or being processed
- **Characteristics**:
  - Not yet included in a block
  - May be waiting for gas price
  - Could be replaced or dropped

### **3. Failed Transactions**
- **Status**: `failed`, `error`, `reverted`, `out_of_gas`
- **Description**: Transactions that failed to execute properly
- **Characteristics**:
  - May have been included in a block but reverted
  - Gas was consumed but execution failed
  - Could be due to insufficient gas, contract errors, or other issues

### **4. Unknown Status**
- **Status**: Various or missing status
- **Description**: Transactions with unclear or missing status information
- **Characteristics**:
  - Status field is missing or unclear
  - May be from older transactions or different chains

## 🎯 **Filtering by Validation Status**

### **Command Line Usage**

```bash
# Get only validated/confirmed transactions
npm run report:status validated daily

# Get only pending transactions
npm run report:status pending weekly

# Get only failed transactions
npm run report:status failed last7days

# Get all transactions regardless of status
npm run report:status all monthly

# Get validated transactions for custom date range
npm run report:status validated custom 2024-01-01 2024-01-31
```

### **Web API Usage**

```bash
curl -X POST http://localhost:3000/api/reports/generate-status-filtered \
  -H "Content-Type: application/json" \
  -d '{
    "statusFilter": "validated",
    "reportType": "daily"
  }'
```

## 📋 **CSV Output Columns for Status**

The status-filtered reports include these additional columns:

| Column | Description | Example Values |
|--------|-------------|----------------|
| **Status** | Raw transaction status | `success`, `pending`, `failed`, `error` |
| **Confirmed** | Whether transaction is confirmed | `Yes`, `No` |
| **Block Number** | Block where transaction was included | `12345678`, `N/A` |
| **Confirmations** | Number of confirmations | `12`, `0`, `N/A` |
| **Is Validated** | Final validation status | `Yes`, `No` |

## 🔍 **Status Detection Logic**

The system uses this logic to determine transaction status:

```javascript
// Determine validation status
const status = tx.status || 'success';
const confirmed = tx.confirmed || tx.confirmations > 0 || status === 'success';
const blockNumber = tx.blockNumber || tx.block_number || 'N/A';
const confirmations = tx.confirmations || tx.confirmationCount || 0;
const isValidated = confirmed && status === 'success';

// Determine transaction status category
let statusCategory = 'unknown';
if (isValidated) {
  statusCategory = 'validated';
} else if (status === 'pending' || status === 'processing') {
  statusCategory = 'pending';
} else if (status === 'failed' || status === 'error' || status === 'reverted') {
  statusCategory = 'failed';
}
```

## 🎯 **Real-World Use Cases**

### **1. Compliance Reporting**
```bash
# Get only validated transactions for compliance
npm run report:status validated monthly

# Get failed transactions for audit purposes
npm run report:status failed last30days
```

### **2. Trading Analysis**
```bash
# Analyze successful trades only
npm run report:status validated daily

# Monitor pending transactions
npm run report:status pending last7days
```

### **3. Error Analysis**
```bash
# Analyze failed transactions to identify patterns
npm run report:status failed weekly

# Get all transaction statuses for comprehensive analysis
npm run report:status all monthly
```

### **4. DeFi Protocol Monitoring**
```bash
# Monitor successful protocol interactions
npm run report:status validated last7days

# Track failed protocol calls
npm run report:status failed daily
```

## 📈 **Status Statistics**

The system provides status breakdown statistics:

```
📊 Status Breakdown:
   Validated: 45
   Pending: 3
   Failed: 2
   Unknown: 1
```

## 🔧 **Advanced Status Filtering**

### **Combining Type and Status Filters**

You can combine transaction types with status filters using the API:

```bash
curl -X POST http://localhost:3000/api/reports/generate-type-filtered \
  -H "Content-Type: application/json" \
  -d '{
    "transactionTypes": ["swap", "transfer"],
    "dateRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    },
    "statusFilter": "validated"
  }'
```

### **Custom Status Analysis**

For custom analysis, you can:

1. **Generate all transactions**: `npm run report:status all daily`
2. **Filter in Excel/CSV**: Use the "Is Validated" column
3. **Create pivot tables**: Group by status and analyze patterns

## 🚨 **Important Notes**

### **Blockchain-Specific Behavior**
- **Ethereum**: Transactions can be pending, confirmed, or failed
- **Polygon**: Faster confirmations, fewer pending transactions
- **BSC**: Very fast confirmations, minimal pending state

### **Gas and Status**
- **Out of Gas**: Transactions that fail due to insufficient gas
- **Gas Price**: Affects transaction confirmation speed
- **Gas Used**: Shows actual gas consumption (even for failed transactions)

### **Confirmation Counts**
- **0 confirmations**: Transaction in mempool
- **1+ confirmations**: Transaction included in block(s)
- **12+ confirmations**: Generally considered final (Ethereum)

## 🔍 **Troubleshooting Status Issues**

### **Common Issues**
```bash
# No validated transactions found
# Solution: Check if transactions are recent enough to be confirmed

# All transactions show as "Unknown"
# Solution: The API might not provide detailed status information

# Pending transactions not appearing
# Solution: Pending transactions may not be included in historical data
```

### **Best Practices**
1. **Use "all" status first**: To see what statuses are available
2. **Check confirmation times**: Different chains have different confirmation speeds
3. **Verify API documentation**: Status field availability may vary by endpoint
4. **Consider time ranges**: Recent transactions may still be pending

## 📚 **API Documentation Reference**

For detailed information about transaction status in the Octav API:
- [Octav API Documentation](https://api-docs.octav.fi/)
- Transaction endpoints provide status information
- Portfolio endpoints may include transaction status
- Historical data includes confirmed transaction status

This status filtering system gives you complete control over which transactions to include in your reports based on their validation status!
