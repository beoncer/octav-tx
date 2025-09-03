# 🚀 Quick Start Guide - Octav Transaction Reporting

Your API key is configured and ready to use! Here's how to get started:

## 📋 Prerequisites

You need Node.js installed on your system. If you don't have it:

### Option 1: Download from Node.js website
1. Go to https://nodejs.org/
2. Download the LTS version for macOS
3. Install the downloaded package

### Option 2: Using Homebrew (recommended)
```bash
brew install node
```

### Option 3: Using nvm (Node Version Manager)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc
nvm install --lts
nvm use --lts
```

## 🔧 Setup

1. **Run the setup script:**
   ```bash
   ./setup.sh
   ```
   This will:
   - Create your `.env` file with your API key
   - Install all dependencies
   - Test the API connection
   - Create the reports directory

2. **Add your wallet addresses:**
   Edit the `.env` file and add your wallet addresses:
   ```env
   WALLET_ADDRESSES=0x1234567890abcdef,0xabcdef1234567890
   ```

## 🎯 Generate Your First Report

### Type-Filtered CSV Reports

```bash
# Generate swap transactions report (yesterday)
npm run report:type swap daily

# Generate transfer transactions report (last week)
npm run report:type transfer weekly

# Generate multiple transaction types (last 7 days)
npm run report:type "swap,transfer,deposit" last7days

# Generate custom date range report
npm run report:type "stake,unstake" custom 2024-01-01 2024-01-31
```

### Available Transaction Types

- `swap` - Token swaps and exchanges
- `transfer` - Token transfers
- `deposit` - Deposits to protocols
- `withdraw` - Withdrawals from protocols
- `stake` - Staking transactions
- `unstake` - Unstaking transactions
- `claim` - Reward claims
- `mint` - NFT/token minting
- `burn` - Token burning
- `approve` - Token approvals

## 📁 Output

Reports are saved in the `./reports/` directory as CSV files:
- `type_filtered_swap_daily_2024-01-15_10-30-45.csv`
- `type_filtered_swap_transfer_last7days_2024-01-15_10-30-45.csv`

## 🔍 Test API Connection

If you want to test your API key separately:

```bash
node test-api.js
```

## 🚀 Start Full System

To start the complete system with web API:

```bash
npm start
```

Then access:
- Health check: http://localhost:3000/health
- API status: http://localhost:3000/api/status
- Generate reports via API: http://localhost:3000/api/reports/generate-type-filtered

## 📊 Example API Usage

```bash
# Generate swap transactions via API
curl -X POST http://localhost:3000/api/reports/generate-type-filtered \
  -H "Content-Type: application/json" \
  -d '{
    "transactionTypes": ["swap"],
    "reportType": "daily"
  }'
```

## 🆘 Troubleshooting

### "Node.js not found"
- Install Node.js using one of the methods above

### "API connection failed"
- Your API key is already configured correctly
- Check your internet connection
- Verify the Octav API is accessible

### "No wallet addresses configured"
- Add wallet addresses to the `WALLET_ADDRESSES` variable in `.env`

### "No transactions found"
- Try different transaction types
- Expand the date range
- Verify wallet addresses have recent activity

## 📚 More Information

- Full documentation: `README.md`
- Type-filtered examples: `examples/type-filtered-examples.md`
- API documentation: https://api-docs.octav.fi/

---

**Your API Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ✅ Configured

**Status:** Ready to generate type-filtered CSV reports! 🎉
