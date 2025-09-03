# Type-Filtered Transaction Report Examples

This document shows how to generate CSV reports filtered by specific transaction types using the Octav API integration.

## 🚀 Quick Start Examples

### 1. Generate Swap Transaction Report (Yesterday)
```bash
npm run report:type swap daily
```

### 2. Generate Transfer Transaction Report (Last Week)
```bash
npm run report:type transfer weekly
```

### 3. Generate Multiple Transaction Types (Last 7 Days)
```bash
npm run report:type "swap,transfer,deposit" last7days
```

### 4. Generate Custom Date Range Report
```bash
npm run report:type "stake,unstake" custom 2024-01-01 2024-01-31
```

## 📊 Supported Transaction Types

Based on the Octav API, you can filter by these transaction types:

| Type | Description | Example Use Cases |
|------|-------------|-------------------|
| `swap` | Token swaps and exchanges | DEX trades, token conversions |
| `transfer` | Token transfers | Sending/receiving tokens |
| `deposit` | Deposits to protocols | Adding liquidity, staking deposits |
| `withdraw` | Withdrawals from protocols | Removing liquidity, unstaking |
| `stake` | Staking transactions | Staking tokens for rewards |
| `unstake` | Unstaking transactions | Unstaking tokens |
| `claim` | Reward claims | Claiming staking rewards |
| `mint` | NFT/token minting | Minting new tokens or NFTs |
| `burn` | Token burning | Burning tokens |
| `approve` | Token approvals | Approving spending allowances |

## 🔧 API Usage Examples

### Using the Web API

```bash
# Generate swap transactions report for yesterday
curl -X POST http://localhost:3000/api/reports/generate-type-filtered \
  -H "Content-Type: application/json" \
  -d '{
    "transactionTypes": ["swap"],
    "reportType": "daily"
  }'

# Generate multiple transaction types for custom date range
curl -X POST http://localhost:3000/api/reports/generate-type-filtered \
  -H "Content-Type: application/json" \
  -d '{
    "transactionTypes": ["swap", "transfer", "deposit"],
    "dateRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    },
    "reportName": "december_trading_activity"
  }'
```

### Using the Standalone Script

```bash
# Basic usage
node src/generateTypeFilteredReport.js swap daily

# Multiple transaction types
node src/generateTypeFilteredReport.js "swap,transfer" weekly

# Custom date range
node src/generateTypeFilteredReport.js deposit custom 2024-01-01 2024-01-31

# Last 30 days of staking activity
node src/generateTypeFilteredReport.js "stake,unstake,claim" last30days
```

## 📁 CSV Output Format

The generated CSV files include these columns:

| Column | Description | Example |
|--------|-------------|---------|
| Wallet Address | The monitored wallet address | `0x1234...abcd` |
| Timestamp | Transaction timestamp | `2024-01-15T10:30:00Z` |
| Transaction Type | Type of transaction | `swap` |
| Chain | Blockchain network | `ethereum` |
| Token | Token symbol/name | `USDC` |
| Value | Transaction value | `1000.50` |
| Transaction Hash | Blockchain transaction hash | `0xabcd...1234` |
| From Address | Sender address | `0x1234...abcd` |
| To Address | Recipient address | `0x5678...efgh` |
| Gas Used | Gas consumed | `21000` |
| Gas Price | Gas price in wei | `20000000000` |
| Status | Transaction status | `success` |

## 🎯 Real-World Use Cases

### 1. Trading Activity Analysis
```bash
# Get all swap transactions for trading analysis
npm run report:type swap last30days
```

### 2. DeFi Protocol Usage
```bash
# Monitor deposits and withdrawals from DeFi protocols
npm run report:type "deposit,withdraw" weekly
```

### 3. Staking Activity Tracking
```bash
# Track staking, unstaking, and reward claims
npm run report:type "stake,unstake,claim" monthly
```

### 4. Token Transfer Monitoring
```bash
# Monitor all token transfers for compliance
npm run report:type transfer daily
```

### 5. NFT Activity
```bash
# Track NFT minting and transfers
npm run report:type "mint,transfer" last7days
```

## ⚙️ Configuration

### Environment Variables
```env
# Required
OCTAV_API_KEY=your_octav_api_key_here
WALLET_ADDRESSES=0x1234567890abcdef,0xabcdef1234567890

# Optional
REPORT_OUTPUT_DIR=./reports
```

### Custom Report Names
You can specify custom report names for better organization:

```bash
# Using the script
node src/generateTypeFilteredReport.js swap daily

# Using the API
curl -X POST http://localhost:3000/api/reports/generate-type-filtered \
  -H "Content-Type: application/json" \
  -d '{
    "transactionTypes": ["swap"],
    "reportType": "daily",
    "reportName": "daily_trading_report"
  }'
```

## 🔍 Troubleshooting

### No Transactions Found
If you get 0 transactions in your report:

1. **Check transaction types**: Verify the transaction types exist in your data
2. **Expand date range**: Try a longer time period
3. **Verify wallet activity**: Ensure the wallet addresses have recent activity
4. **Check API limits**: Ensure you haven't exceeded API rate limits

### Common Issues
```bash
# Error: No wallet addresses configured
# Solution: Set WALLET_ADDRESSES in your .env file

# Error: Invalid API key
# Solution: Verify your OCTAV_API_KEY is correct

# Error: No transactions found
# Solution: Try different transaction types or date ranges
```

## 📈 Advanced Usage

### Automated Type-Filtered Reports
You can integrate type-filtered reports into your automated workflow:

```javascript
// Example: Generate daily swap reports automatically
const cron = require('node-cron');

cron.schedule('0 9 * * *', async () => {
  // Generate daily swap transaction report
  await generateTypeFilteredReport(['swap'], 'daily');
});
```

### Batch Processing Multiple Types
```bash
# Generate separate reports for each transaction type
for type in swap transfer deposit withdraw; do
  npm run report:type $type last7days
done
```

This type-filtered reporting system gives you precise control over which transactions to include in your CSV reports, making it perfect for compliance, analysis, and monitoring specific types of blockchain activity.
