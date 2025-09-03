# 🚫 Spam Filtering Guide

This guide explains how the spam filtering works in the Octav Transaction Reporting System.

## 🎯 **What is Spam Filtering?**

Spam filtering automatically removes unwanted transactions from your reports, such as:
- **Dust attacks**: Tiny amounts of tokens sent to many addresses
- **Spam transfers**: Unwanted token transfers from unknown sources
- **Fake tokens**: Scam tokens or worthless tokens
- **Bot activity**: Automated spam transactions

## ✅ **Spam Filter Status**

**Current Status**: ✅ **ENABLED** by default

The system automatically filters out spam transactions using the Octav API's built-in spam detection.

## 🔧 **Configuration**

### **Environment Variable**
```env
HIDE_SPAM=true  # Filter out spam transactions (default)
HIDE_SPAM=false # Include all transactions including spam
```

### **Default Behavior**
- **Spam filtering is ENABLED by default**
- All API calls include `hideSpam: true` parameter
- Only legitimate transactions appear in reports

## 📊 **What Gets Filtered**

### **Filtered Out (Spam)**
- Dust attacks (tiny token amounts)
- Unknown scam tokens
- Bot-generated spam transfers
- Suspicious transaction patterns
- Fake token transfers

### **Included (Legitimate)**
- Normal token transfers
- DEX swaps and trades
- DeFi protocol interactions
- Staking and unstaking
- Known legitimate tokens
- Transactions with significant value

## 🎯 **Use Cases**

### **Clean Reports for Analysis**
```bash
# Get clean swap transactions (no spam)
npm run report:type swap daily

# Get validated transfers (spam filtered out)
npm run report:status validated weekly
```

### **Compliance Reporting**
```bash
# Only legitimate transactions for compliance
npm run report:status validated monthly
```

### **Trading Analysis**
```bash
# Focus on real trading activity
npm run report:type "swap,transfer" last7days
```

## 🔍 **How to Disable Spam Filtering**

If you need to see ALL transactions including spam:

### **Method 1: Environment Variable**
```env
HIDE_SPAM=false
```

### **Method 2: Edit .env file**
```bash
# Edit your .env file and change:
HIDE_SPAM=false
```

### **Method 3: Temporary Override**
```bash
# Set environment variable for current session
export HIDE_SPAM=false
npm run report:type swap daily
```

## 📈 **Benefits of Spam Filtering**

### **Cleaner Reports**
- Focus on legitimate transaction activity
- Reduced noise in analysis
- Better data quality

### **Improved Performance**
- Fewer transactions to process
- Faster report generation
- Less storage usage

### **Better Analysis**
- More accurate transaction patterns
- Cleaner compliance reports
- Focused trading analysis

## 🚨 **When to Disable Spam Filtering**

Consider disabling spam filtering if you need to:

1. **Audit all transactions** for security purposes
2. **Analyze spam patterns** for research
3. **Investigate suspicious activity**
4. **Include dust transactions** in analysis
5. **Debug transaction issues**

## 📊 **Spam Filter Statistics**

The system doesn't currently provide spam statistics, but you can:

1. **Run with spam filtering enabled** (default)
2. **Run with spam filtering disabled** (`HIDE_SPAM=false`)
3. **Compare the results** to see how many spam transactions were filtered

## 🔧 **Technical Details**

### **API Integration**
```javascript
// Spam filtering is applied automatically
const params = {
  address: walletAddress,
  hideSpam: config.reporting.hideSpam, // true by default
  ...otherOptions
};
```

### **Configuration Source**
```javascript
// From config/config.js
reporting: {
  hideSpam: process.env.HIDE_SPAM !== 'false', // true by default
}
```

## 📚 **Best Practices**

### **For Most Use Cases**
- ✅ **Keep spam filtering enabled** (default)
- ✅ **Use for compliance reporting**
- ✅ **Use for trading analysis**
- ✅ **Use for portfolio monitoring**

### **For Special Cases**
- ⚠️ **Disable only when needed** for specific analysis
- ⚠️ **Re-enable after analysis** to maintain clean reports
- ⚠️ **Document when disabled** for audit purposes

## 🎉 **Summary**

The spam filtering feature ensures your transaction reports focus on legitimate activity by automatically removing:
- Dust attacks
- Spam transfers
- Fake tokens
- Bot activity

**Default**: ✅ **ENABLED** for clean, focused reports
**Configurable**: Set `HIDE_SPAM=false` when you need to see all transactions

This provides cleaner, more actionable transaction data for your analysis and reporting needs!
