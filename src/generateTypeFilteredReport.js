#!/usr/bin/env node

const OctavApiService = require('./services/octavApi');
const ReportGenerator = require('./services/reportGenerator');
const config = require('./config/config');
const moment = require('moment');

/**
 * Generate type-filtered transaction reports in CSV format
 * Usage: node src/generateTypeFilteredReport.js [transactionType] [reportType] [startDate] [endDate]
 * 
 * Examples:
 *   node src/generateTypeFilteredReport.js swap daily
 *   node src/generateTypeFilteredReport.js transfer weekly
 *   node src/generateTypeFilteredReport.js "swap,transfer" custom 2024-01-01 2024-01-31
 *   node src/generateTypeFilteredReport.js deposit last7days
 */

async function generateTypeFilteredReport() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      showUsage();
      return;
    }

    const transactionTypes = args[0].split(',').map(type => type.trim());
    const reportType = args[1] || 'daily';
    const startDate = args[2];
    const endDate = args[3];

    console.log('🚀 Starting type-filtered report generation...');
    console.log(`🔍 Transaction Types: ${transactionTypes.join(', ')}`);
    console.log(`📊 Report Type: ${reportType}`);

    // Initialize services
    const octavApi = new OctavApiService();
    const reportGenerator = new ReportGenerator();

    // Validate wallet addresses
    const wallets = config.wallets.addresses;
    if (wallets.length === 0) {
      throw new Error('No wallet addresses configured. Please set WALLET_ADDRESSES in your environment.');
    }

    console.log(`📡 Monitoring ${wallets.length} wallet(s):`);
    wallets.forEach((wallet, index) => {
      console.log(`   ${index + 1}. ${wallet}`);
    });

    // Determine date range
    let dateRange;
    if (reportType === 'custom' && startDate && endDate) {
      // Enhanced date parsing for custom ranges
      const startMoment = parseCustomDate(startDate);
      const endMoment = parseCustomDate(endDate);
      
      if (!startMoment || !endMoment) {
        throw new Error('Invalid date format. Use YYYY-MM-DD, YYYY-MM-DD HH:mm:ss, or ISO format');
      }
      
      dateRange = {
        start: startMoment.toISOString(),
        end: endMoment.toISOString(),
      };
      console.log(`📅 Custom date range: ${startMoment.format('YYYY-MM-DD HH:mm:ss')} to ${endMoment.format('YYYY-MM-DD HH:mm:ss')}`);
    } else {
      dateRange = getDateRange(reportType);
      console.log(`📅 Date range: ${moment(dateRange.start).format('YYYY-MM-DD HH:mm:ss')} to ${moment(dateRange.end).format('YYYY-MM-DD HH:mm:ss')}`);
    }

    // Fetch transaction data
    console.log('📡 Fetching transaction data...');
    const transactions = await octavApi.getBatchTransactions(wallets, {
      startDate: dateRange.start,
      endDate: dateRange.end,
    });

    const data = {
      transactions,
      dateRange,
      fetchedAt: new Date().toISOString(),
    };

    // Generate type-filtered CSV report
    console.log('📊 Generating type-filtered CSV report...');
    const reportName = `type_filtered_${transactionTypes.join('_')}_${reportType}`;
    const summary = await reportGenerator.generateTypeFilteredCsvReport(data, transactionTypes, reportName);

    // Display summary
    console.log('\n📈 Type-Filtered Report Summary:');
    console.log(`   Transaction Types: ${summary.transactionTypes.join(', ')}`);
    console.log(`   Total Filtered Transactions: ${summary.totalFilteredTransactions}`);
    console.log(`   Wallets Monitored: ${summary.wallets}`);
    console.log(`   Date Range: ${moment(summary.dateRange.start).format('YYYY-MM-DD')} to ${moment(summary.dateRange.end).format('YYYY-MM-DD')}`);
    console.log(`   Generated: ${new Date(summary.generatedAt).toLocaleString()}`);

    if (summary.totalFilteredTransactions === 0) {
      console.log('\n⚠️  No transactions found for the specified types in the given date range.');
      console.log('💡 Try:');
      console.log('   - Checking if the transaction types are correct');
      console.log('   - Expanding the date range');
      console.log('   - Verifying wallet addresses have activity');
    } else {
      console.log('\n✅ Type-filtered CSV report generated successfully!');
      console.log(`📁 Report saved to: ${config.reporting.outputDir}`);
    }

  } catch (error) {
    console.error('❌ Error generating type-filtered report:', error.message);
    process.exit(1);
  }
}

/**
 * Parse custom date formats with enhanced support for time components
 * @param {string} dateString - Date string in various formats
 * @returns {moment.Moment|null} Parsed moment object or null if invalid
 */
function parseCustomDate(dateString) {
  // Remove quotes if present
  const cleanDate = dateString.replace(/['"]/g, '');
  
  // Try different date formats
  const formats = [
    'YYYY-MM-DD HH:mm:ss',     // 2024-01-15 14:30:00
    'YYYY-MM-DD HH:mm',        // 2024-01-15 14:30
    'YYYY-MM-DD',              // 2024-01-15
    'YYYY-MM-DDTHH:mm:ssZ',    // 2024-01-15T14:30:00Z
    'YYYY-MM-DDTHH:mm:ss.SSSZ', // 2024-01-15T14:30:00.000Z
    'YYYY-MM-DDTHH:mm:ss.SSS', // 2024-01-15T14:30:00.000
    'YYYY-MM-DDTHH:mm:ss',     // 2024-01-15T14:30:00
    'YYYY-MM-DDTHH:mmZ',       // 2024-01-15T14:30Z
    'YYYY-MM-DDTHH:mm',        // 2024-01-15T14:30
  ];
  
  for (const format of formats) {
    const parsed = moment(cleanDate, format, true);
    if (parsed.isValid()) {
      return parsed;
    }
  }
  
  // Try parsing as ISO string
  const isoParsed = moment(cleanDate);
  if (isoParsed.isValid()) {
    return isoParsed;
  }
  
  return null;
}

/**
 * Get date range for report type
 * @param {string} reportType - Type of report
 * @returns {Object} Date range object
 */
function getDateRange(reportType) {
  const now = moment();
  
  switch (reportType) {
    case 'daily':
    case 'yesterday':
      return {
        start: now.clone().subtract(1, 'day').startOf('day').toISOString(),
        end: now.clone().subtract(1, 'day').endOf('day').toISOString(),
      };
    case 'weekly':
      return {
        start: now.clone().subtract(1, 'week').startOf('week').toISOString(),
        end: now.clone().subtract(1, 'week').endOf('week').toISOString(),
      };
    case 'monthly':
      return {
        start: now.clone().subtract(1, 'month').startOf('month').toISOString(),
        end: now.clone().subtract(1, 'month').endOf('month').toISOString(),
      };
    case 'last7days':
      return {
        start: now.clone().subtract(7, 'days').startOf('day').toISOString(),
        end: now.clone().subtract(1, 'day').endOf('day').toISOString(),
      };
    case 'last30days':
      return {
        start: now.clone().subtract(30, 'days').startOf('day').toISOString(),
        end: now.clone().subtract(1, 'day').endOf('day').toISOString(),
      };
    default:
      return {
        start: now.clone().subtract(1, 'day').startOf('day').toISOString(),
        end: now.clone().subtract(1, 'day').endOf('day').toISOString(),
      };
  }
}

/**
 * Show usage information
 */
function showUsage() {
  console.log(`
🔍 Octav Type-Filtered Transaction Report Generator

Generate CSV reports filtered by specific transaction types.

Usage: node src/generateTypeFilteredReport.js [transactionTypes] [reportType] [startDate] [endDate]

Transaction Types (comma-separated for multiple):
  swap         - Token swaps and exchanges
  transfer     - Token transfers
  deposit      - Deposits to protocols
  withdraw     - Withdrawals from protocols
  stake        - Staking transactions
  unstake      - Unstaking transactions
  claim        - Reward claims
  mint         - NFT/token minting
  burn         - Token burning
  approve      - Token approvals
  custom       - Custom transaction types

Report Types:
  daily        - Yesterday's transactions
  weekly       - Last week's transactions
  monthly      - Last month's transactions
  last7days    - Last 7 days of transactions
  last30days   - Last 30 days of transactions
  custom       - Custom date range (requires startDate and endDate)

Custom Date Formats Supported:
  YYYY-MM-DD                    - 2024-01-15
  YYYY-MM-DD HH:mm              - 2024-01-15 14:30
  YYYY-MM-DD HH:mm:ss           - 2024-01-15 14:30:00
  YYYY-MM-DDTHH:mm:ssZ          - 2024-01-15T14:30:00Z
  YYYY-MM-DDTHH:mm:ss.SSSZ      - 2024-01-15T14:30:00.000Z

Examples:
  # Get all swap transactions from yesterday
  node src/generateTypeFilteredReport.js swap daily

  # Get transfer transactions from last week
  node src/generateTypeFilteredReport.js transfer weekly

  # Get both swap and transfer transactions from last 7 days
  node src/generateTypeFilteredReport.js "swap,transfer" last7days

  # Get deposit transactions for custom date range (date only)
  node src/generateTypeFilteredReport.js deposit custom 2024-01-01 2024-01-31

  # Get transactions for specific time range (with time)
  node src/generateTypeFilteredReport.js swap custom "2024-01-15 09:30:00" "2024-01-15 18:45:00"

  # Get transactions using ISO format
  node src/generateTypeFilteredReport.js transfer custom "2024-01-15T09:30:00Z" "2024-01-20T18:45:00Z"

  # Get multiple transaction types for a specific period
  node src/generateTypeFilteredReport.js "swap,transfer,deposit" last30days

Environment Variables:
  OCTAV_API_KEY        - Your Octav API key (required)
  WALLET_ADDRESSES     - Comma-separated wallet addresses (required)
  REPORT_OUTPUT_DIR    - Output directory for reports (default: ./reports)

CSV Output Columns:
  - Field no (sequential numbering: 1, 2, 3, ...)
  - Trading capacity (constant: DEAL)
  - Transaction_status (constant: NEWT)
  - Direction (IN/OUT - for swaps creates 2 rows)
  - Wallet Address
  - Timestamp
  - Transaction Type
  - Chain
  - Protocol (DeFi protocol name)
  - Token
  - Value
  - Value (Fiat) (transaction value in fiat currency)
  - Fees (fees paid in native asset)
  - Transaction Hash
  - From Address
  - To Address
  - Block Number

Note: SWAP and similar transactions create TWO rows:
  - Row 1: OUT - token sent (with fees)
  - Row 2: IN - token received (fees = 0)
`);
}

// Run the type-filtered report generation
generateTypeFilteredReport();
