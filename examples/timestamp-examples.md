# 🕐 Exact Timestamp Control - Complete Guide

This guide shows all the ways to specify exact timestamps for your transaction reports.

## 📅 **Method 1: Command Line with Custom Date Range**

### Basic Date Format (YYYY-MM-DD)
```bash
# Report for specific date range
npm run report:type swap custom 2024-01-15 2024-01-20

# Report for single day
npm run report:type transfer custom 2024-01-15 2024-01-15
```

### Date with Time (YYYY-MM-DD HH:mm:ss)
```bash
# Report for specific time range on same day
npm run report:type swap custom "2024-01-15 09:30:00" "2024-01-15 18:45:00"

# Report for specific time range across days
npm run report:type transfer custom "2024-01-15 14:00:00" "2024-01-16 10:00:00"
```

### ISO 8601 Format
```bash
# ISO format with timezone
npm run report:type swap custom "2024-01-15T09:30:00Z" "2024-01-20T18:45:00Z"

# ISO format with milliseconds
npm run report:type transfer custom "2024-01-15T14:30:00.000Z" "2024-01-15T16:45:00.000Z"
```

### Date with Hours and Minutes
```bash
# Date with hours and minutes
npm run report:type deposit custom "2024-01-15 14:30" "2024-01-15 16:45"
```

## 🌐 **Method 2: Web API (Most Precise Control)**

### Using curl
```bash
# Basic date range
curl -X POST http://localhost:3000/api/reports/generate-type-filtered \
  -H "Content-Type: application/json" \
  -d '{
    "transactionTypes": ["swap", "transfer"],
    "dateRange": {
      "start": "2024-01-15T09:30:00Z",
      "end": "2024-01-20T18:45:00Z"
    },
    "reportName": "custom_timeframe_report"
  }'

# Specific time range
curl -X POST http://localhost:3000/api/reports/generate-type-filtered \
  -H "Content-Type: application/json" \
  -d '{
    "transactionTypes": ["swap"],
    "dateRange": {
      "start": "2024-01-15T14:30:00.000Z",
      "end": "2024-01-15T16:45:00.000Z"
    },
    "reportName": "afternoon_trading"
  }'
```

### Using JavaScript/Node.js
```javascript
const response = await fetch('http://localhost:3000/api/reports/generate-type-filtered', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    transactionTypes: ['swap', 'transfer'],
    dateRange: {
      start: '2024-01-15T09:30:00Z',
      end: '2024-01-20T18:45:00Z'
    },
    reportName: 'custom_report'
  })
});
```

## 📊 **Method 3: Predefined Time Ranges**

### Quick Ranges
```bash
# Last 7 days
npm run report:type swap last7days

# Last 30 days
npm run report:type transfer last30days

# Yesterday
npm run report:type swap daily

# Last week
npm run report:type transfer weekly

# Last month
npm run report:type deposit monthly
```

## 🎯 **Real-World Examples**

### 1. **Trading Session Analysis**
```bash
# Get all swap transactions during market hours (9 AM - 5 PM)
npm run report:type swap custom "2024-01-15 09:00:00" "2024-01-15 17:00:00"

# Get trading activity for a specific week
npm run report:type "swap,transfer" custom "2024-01-15 00:00:00" "2024-01-21 23:59:59"
```

### 2. **DeFi Protocol Activity**
```bash
# Get deposit/withdraw activity for a specific protocol launch
npm run report:type "deposit,withdraw" custom "2024-01-15T10:00:00Z" "2024-01-16T10:00:00Z"

# Get staking activity for a specific period
npm run report:type "stake,unstake,claim" custom "2024-01-01 00:00:00" "2024-01-31 23:59:59"
```

### 3. **Compliance Reporting**
```bash
# Get all transfers for a specific month
npm run report:type transfer custom "2024-01-01 00:00:00" "2024-01-31 23:59:59"

# Get all transactions for a specific day
npm run report:type "swap,transfer,deposit,withdraw" custom "2024-01-15 00:00:00" "2024-01-15 23:59:59"
```

### 4. **Performance Analysis**
```bash
# Get activity during peak hours
npm run report:type swap custom "2024-01-15 14:00:00" "2024-01-15 16:00:00"

# Get weekend activity
npm run report:type "swap,transfer" custom "2024-01-20 00:00:00" "2024-01-21 23:59:59"
```

## 📋 **Supported Date Formats**

| Format | Example | Description |
|--------|---------|-------------|
| `YYYY-MM-DD` | `2024-01-15` | Date only |
| `YYYY-MM-DD HH:mm` | `2024-01-15 14:30` | Date with hours and minutes |
| `YYYY-MM-DD HH:mm:ss` | `2024-01-15 14:30:00` | Date with full time |
| `YYYY-MM-DDTHH:mm:ssZ` | `2024-01-15T14:30:00Z` | ISO format with timezone |
| `YYYY-MM-DDTHH:mm:ss.SSSZ` | `2024-01-15T14:30:00.000Z` | ISO format with milliseconds |

## ⚙️ **Advanced Usage**

### Multiple Time Ranges
```bash
# Generate reports for different time periods
npm run report:type swap custom "2024-01-01 00:00:00" "2024-01-07 23:59:59" && \
npm run report:type swap custom "2024-01-08 00:00:00" "2024-01-14 23:59:59" && \
npm run report:type swap custom "2024-01-15 00:00:00" "2024-01-21 23:59:59"
```

### Timezone Considerations
```bash
# UTC timezone (recommended)
npm run report:type swap custom "2024-01-15T09:30:00Z" "2024-01-15T18:45:00Z"

# Local time (system timezone)
npm run report:type swap custom "2024-01-15 09:30:00" "2024-01-15 18:45:00"
```

### Precise Time Windows
```bash
# 1-hour window
npm run report:type swap custom "2024-01-15 14:00:00" "2024-01-15 15:00:00"

# 15-minute window
npm run report:type transfer custom "2024-01-15 14:30:00" "2024-01-15 14:45:00"
```

## 🔍 **Troubleshooting**

### Common Issues
```bash
# Error: Invalid date format
# Solution: Use one of the supported formats above

# Error: End date before start date
# Solution: Ensure end date is after start date

# Error: No transactions found
# Solution: Try expanding the time range or check wallet activity
```

### Best Practices
1. **Use UTC timezone** for consistency across systems
2. **Include time components** for precise control
3. **Use quotes** around dates with spaces
4. **Test with larger ranges** first, then narrow down
5. **Verify wallet activity** exists in the specified time range

## 📈 **Output Information**

The system will show you the exact time range being used:
```
📅 Custom date range: 2024-01-15 09:30:00 to 2024-01-20 18:45:00
```

And the CSV will include precise timestamps for each transaction:
- **Timestamp column**: Exact transaction time
- **Date range in summary**: Shows the exact from/to times used
- **Report filename**: Includes the date range for easy identification

This gives you complete control over the exact time periods for your transaction analysis!
