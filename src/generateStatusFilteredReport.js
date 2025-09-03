#!/usr/bin/env node

const OctavApiService = require('./services/octavApi');
const ReportGenerator = require('./services/reportGenerator');
const config = require('./config/config');
const moment = require('moment');

/**
 * Generate status-filtered transaction reports in CSV format
 * Usage: node src/generateStatusFilteredReport.js [statusFilter] [reportType] [startDate] [endDate]
 * 
 * Examples:
 *   node src/generateStatusFilteredReport.js validated daily
 *   node src/generateStatusFilteredReport.js pending weekly
 *   node src/generateStatusFilteredReport.js failed custom 2024-01-01 2024-01-31
 *   node src/generateStatusFilteredReport.js all last7days
 */

async function generateStatusFilteredReport() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      showUsage();
      return;
    }

    const statusFilter = args[0];
    const reportType = args[1] || 'daily';
    const startDate = args[2];
    const endDate = args[3];

    console.log('🚀 Starting status-filtered report generation...');
    console.log(`🔍 Status Filter: ${statusFilter}`);
    console.log(`📊 Report Type: ${reportType}`);

    // Validate status filter
    const validStatusFilters = ['validated', 'pending', 'failed', 'all'];
    if (!validStatusFilters.includes(statusFilter)) {
      throw new Error(`Invalid status filter. Must be one of: ${validStatusFilters.join(', ')}`);
    }

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
      dateRange = {
        start: moment(startDate).startOf('day').toISOString(),
        end: moment(endDate).endOf('day').toISOString(),
      };
      console.log(`📅 Custom date range: ${startDate} to ${endDate}`);
    } else {
      dateRange = getDateRange(reportType);
      console.log(`📅 Date range: ${moment(dateRange.start).format('YYYY-MM-DD')} to ${moment(dateRange.end).format('YYYY-MM-DD')}`);
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

    // Generate status-filtered CSV report
    console.log('📊 Generating status-filtered CSV report...');
    const reportName = `status_filtered_${statusFilter}_${reportType}`;
    const summary = await reportGenerator.generateStatusFilteredCsvReport(data, statusFilter, reportName);

    // Display summary
    console.log('\n📈 Status-Filtered Report Summary:');
    console.log(`   Status Filter: ${summary.statusFilter}`);
    console.log(`   Total Filtered Transactions: ${summary.totalFilteredTransactions}`);
    console.log(`   Wallets Monitored: ${summary.wallets}`);
    console.log(`   Date Range: ${moment(summary.dateRange.start).format('YYYY-MM-DD')} to ${moment(summary.dateRange.end).format('YYYY-MM-DD')}`);
    console.log(`   Generated: ${new Date(summary.generatedAt).toLocaleString()}`);
    
    console.log('\n📊 Status Breakdown:');
    console.log(`   Validated: ${summary.statusCounts.validated}`);
    console.log(`   Pending: ${summary.statusCounts.pending}`);
    console.log(`   Failed: ${summary.statusCounts.failed}`);
    console.log(`   Unknown: ${summary.statusCounts.unknown}`);

    if (summary.totalFilteredTransactions === 0) {
      console.log('\n⚠️  No transactions found for the specified status in the given date range.');
      console.log('💡 Try:');
      console.log('   - Using "all" status filter to see all transactions');
      console.log('   - Expanding the date range');
      console.log('   - Verifying wallet addresses have activity');
    } else {
      console.log('\n✅ Status-filtered CSV report generated successfully!');
      console.log(`📁 Report saved to: ${config.reporting.outputDir}`);
    }

  } catch (error) {
    console.error('❌ Error generating status-filtered report:', error.message);
    process.exit(1);
  }
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
🔍 Octav Status-Filtered Transaction Report Generator

Generate CSV reports filtered by transaction validation status.

Usage: node src/generateStatusFilteredReport.js [statusFilter] [reportType] [startDate] [endDate]

Status Filters:
  validated    - Only successfully validated/confirmed transactions
  pending      - Only pending/processing transactions
  failed       - Only failed/reverted transactions
  all          - All transactions regardless of status

Report Types:
  daily        - Yesterday's transactions
  weekly       - Last week's transactions
  monthly      - Last month's transactions
  last7days    - Last 7 days of transactions
  last30days   - Last 30 days of transactions
  custom       - Custom date range (requires startDate and endDate)

Examples:
  # Get all validated transactions from yesterday
  node src/generateStatusFilteredReport.js validated daily

  # Get pending transactions from last week
  node src/generateStatusFilteredReport.js pending weekly

  # Get failed transactions for custom date range
  node src/generateStatusFilteredReport.js failed custom 2024-01-01 2024-01-31

  # Get all transactions (regardless of status) for last 7 days
  node src/generateStatusFilteredReport.js all last7days

Environment Variables:
  OCTAV_API_KEY        - Your Octav API key (required)
  WALLET_ADDRESSES     - Comma-separated wallet addresses (required)
  REPORT_OUTPUT_DIR    - Output directory for reports (default: ./reports)

CSV Output Columns:
  - Wallet Address
  - Timestamp
  - Transaction Type
  - Chain
  - Token
  - Value
  - Transaction Hash
  - From Address
  - To Address
  - Gas Used
  - Gas Price
  - Status
  - Confirmed
  - Block Number
  - Confirmations
  - Is Validated

Status Definitions:
  - Validated: Transactions that are confirmed and successful
  - Pending: Transactions that are still processing or unconfirmed
  - Failed: Transactions that failed, reverted, or encountered errors
  - Unknown: Transactions with unclear status
`);
}

// Run the status-filtered report generation
generateStatusFilteredReport();
