#!/usr/bin/env node

const OctavApiService = require('./services/octavApi');
const ReportGenerator = require('./services/reportGenerator');
const config = require('./config/config');
const moment = require('moment');

/**
 * Standalone script for generating transaction reports
 * Usage: node src/generateReport.js [reportType] [startDate] [endDate]
 * 
 * Examples:
 *   node src/generateReport.js daily
 *   node src/generateReport.js weekly
 *   node src/generateReport.js custom 2024-01-01 2024-01-31
 */

async function generateReport() {
  try {
    const args = process.argv.slice(2);
    const reportType = args[0] || 'daily';
    const startDate = args[1];
    const endDate = args[2];

    console.log('🚀 Starting manual report generation...');
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
      dateRange = {
        start: moment(startDate).startOf('day').toISOString(),
        end: moment(endDate).endOf('day').toISOString(),
      };
      console.log(`📅 Custom date range: ${startDate} to ${endDate}`);
    } else {
      dateRange = getDateRange(reportType);
      console.log(`📅 Date range: ${moment(dateRange.start).format('YYYY-MM-DD')} to ${moment(dateRange.end).format('YYYY-MM-DD')}`);
    }

    // Fetch data
    console.log('📡 Fetching transaction data...');
    const transactions = await octavApi.getBatchTransactions(wallets, {
      startDate: dateRange.start,
      endDate: dateRange.end,
    });

    console.log('📡 Fetching portfolio data...');
    const portfolios = await octavApi.getBatchPortfolios(wallets);

    const data = {
      transactions,
      portfolios,
      dateRange,
      fetchedAt: new Date().toISOString(),
    };

    // Generate report
    console.log('📊 Generating report...');
    const report = await reportGenerator.generateTransactionReport(data, reportType);

    // Display summary
    console.log('\n📈 Report Summary:');
    console.log(`   Total Transactions: ${report.summary.totalTransactions}`);
    console.log(`   Total Volume: ${report.summary.totalVolume.toFixed(2)}`);
    console.log(`   Unique Tokens: ${report.summary.uniqueTokens}`);
    console.log(`   Chains: ${report.summary.chains.join(', ')}`);
    console.log(`   Report Type: ${report.metadata.reportType}`);
    console.log(`   Generated: ${new Date(report.metadata.generatedAt).toLocaleString()}`);

    console.log('\n✅ Report generation completed successfully!');
    console.log(`📁 Reports saved to: ${config.reporting.outputDir}`);

  } catch (error) {
    console.error('❌ Error generating report:', error.message);
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
    case 'yesterday':
      return {
        start: now.clone().subtract(1, 'day').startOf('day').toISOString(),
        end: now.clone().subtract(1, 'day').endOf('day').toISOString(),
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

// Show usage if no arguments provided
if (process.argv.length === 2) {
  console.log(`
📊 Octav Transaction Report Generator

Usage: node src/generateReport.js [reportType] [startDate] [endDate]

Report Types:
  daily        - Yesterday's transactions
  weekly       - Last week's transactions
  monthly      - Last month's transactions
  yesterday    - Yesterday's transactions (same as daily)
  last7days    - Last 7 days of transactions
  last30days   - Last 30 days of transactions
  custom       - Custom date range (requires startDate and endDate)

Examples:
  node src/generateReport.js daily
  node src/generateReport.js weekly
  node src/generateReport.js custom 2024-01-01 2024-01-31
  node src/generateReport.js last7days

Environment Variables:
  OCTAV_API_KEY        - Your Octav API key (required)
  WALLET_ADDRESSES     - Comma-separated wallet addresses (required)
  REPORT_OUTPUT_DIR    - Output directory for reports (default: ./reports)
`);
  process.exit(0);
}

// Run the report generation
generateReport();
