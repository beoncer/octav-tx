#!/usr/bin/env node

const OctavApiService = require('./services/octavApi');
const ReportGenerator = require('./services/reportGenerator');
const config = require('./config/config');
const moment = require('moment');
const path = require('path');

class OnChainReportGenerator {
  constructor() {
    this.octavApi = new OctavApiService();
    this.reportGenerator = new ReportGenerator();
  }

  async generateOnChainReport(options = {}) {
    const {
      startDate,
      endDate,
      wallets = config.wallets.addresses,
      outputDir = config.reporting.outputDir
    } = options;

    console.log('🚀 Starting On-Chain Transactions Report Generation...');
    console.log(`📅 Date Range: ${startDate || 'All time'} to ${endDate || 'All time'}`);
    console.log(`👛 Wallets: ${wallets.length} addresses`);
    console.log(`📊 Report Type: On-Chain (Bridge In/Out, Claim transactions)`);
    console.log('');

    try {
      // Fetch transactions for all wallets
      console.log('📡 Fetching transaction data from Octav API...');
      const transactionsData = await this.octavApi.getBatchTransactions(wallets, {
        startDate,
        endDate,
        limit: 250
      });

      // Check if we have any data
      const totalTransactions = Object.values(transactionsData).reduce((sum, txs) => {
        return sum + (Array.isArray(txs) ? txs.length : 0);
      }, 0);

      if (totalTransactions === 0) {
        console.log('⚠️  No transactions found for the specified criteria.');
        return null;
      }

      console.log(`✅ Found ${totalTransactions} total transactions across all wallets`);

      // Filter for on-chain transactions only
      const onChainTransactions = {};
      const onChainTypes = ['BRIDGEIN', 'BRIDGEOUT', 'CLAIM'];
      
      Object.entries(transactionsData).forEach(([wallet, txs]) => {
        if (Array.isArray(txs)) {
          const filtered = txs.filter(tx => onChainTypes.includes(tx.type?.toUpperCase()));
          if (filtered.length > 0) {
            onChainTransactions[wallet] = filtered;
          }
        }
      });

      const onChainCount = Object.values(onChainTransactions).reduce((sum, txs) => sum + txs.length, 0);
      console.log(`🔗 Found ${onChainCount} on-chain transactions (Bridge In/Out, Claim)`);

      if (onChainCount === 0) {
        console.log('⚠️  No on-chain transactions found for the specified criteria.');
        return null;
      }

      // Generate timestamp for filename
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      const dateRange = startDate && endDate ? 
        `${moment(startDate).format('YYYY-MM-DD')}_to_${moment(endDate).format('YYYY-MM-DD')}` : 
        'all_time';
      
      const filename = path.join(outputDir, `onchain_transactions_${dateRange}_${timestamp}.csv`);

      // Generate CSV report
      console.log('📝 Generating on-chain CSV report...');
      const reportPath = await this.reportGenerator.generateOnChainCsvReport(
        { transactions: onChainTransactions },
        filename,
        { startDate, endDate }
      );

      console.log('');
      console.log('✅ On-Chain Report Generation Complete!');
      console.log(`📄 Report saved to: ${reportPath}`);
      console.log(`📊 Total on-chain transactions: ${onChainCount}`);
      
      // Show breakdown by type
      const typeBreakdown = {};
      Object.values(onChainTransactions).forEach(txs => {
        txs.forEach(tx => {
          const type = tx.type?.toUpperCase() || 'UNKNOWN';
          typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
        });
      });
      
      console.log('📈 Transaction type breakdown:');
      Object.entries(typeBreakdown).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} transactions`);
      });

      return reportPath;

    } catch (error) {
      console.error('❌ Error generating on-chain report:', error.message);
      throw error;
    }
  }

  showUsage() {
    console.log(`
🔗 Octav On-Chain Transactions Report Generator

USAGE:
  node src/generateOnChainReport.js [options]

DESCRIPTION:
  Generates CSV reports for on-chain transactions (Bridge In/Out, Claim).
  This report specifically includes transaction types that are excluded 
  from the main transactions report.

OPTIONS:
  --start-date YYYY-MM-DD    Start date for transaction filtering (optional)
  --end-date YYYY-MM-DD      End date for transaction filtering (optional)
  --help                     Show this help message

EXAMPLES:
  # Generate on-chain report for all time
  node src/generateOnChainReport.js

  # Generate on-chain report for specific date range
  node src/generateOnChainReport.js --start-date 2025-10-01 --end-date 2025-10-15

  # Generate on-chain report for last 7 days
  node src/generateOnChainReport.js --start-date $(date -d '7 days ago' +%Y-%m-%d)

ON-CHAIN TRANSACTION TYPES:
  - BRIDGEIN: Assets received from another chain
  - BRIDGEOUT: Assets sent to another chain  
  - CLAIM: Reward/token claims from protocols

CSV OUTPUT COLUMNS:
  - Field no: Sequential numbering (1, 2, 3...)
  - Transaction hash: Blockchain transaction hash
  - Wallet address: Source wallet address
  - Timestamp: Transaction date/time (MM/DD/YYYY HH:mm:ss)
  - Quantity: Amount of tokens involved
  - Wallet to: Destination wallet address
  - Wallet from: Source wallet address
  - Currency: Token symbol/name
  - Transaction type: BRIDGEIN/BRIDGEOUT/CLAIM

CONFIGURATION:
  Wallet addresses are configured in .env file (WALLET_ADDRESSES)
  Output directory is configured in .env file (OUTPUT_DIR)

NOTES:
  - This report complements the main transactions report
  - On-chain transactions are typically cross-chain or protocol interactions
  - All timestamps are in MM/DD/YYYY format for Excel compatibility
  - Wallet addresses are extracted from assetsIn/assetsOut arrays for accurate tracking
`);
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    const generator = new OnChainReportGenerator();
    generator.showUsage();
    process.exit(0);
  }

  // Parse command line arguments
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--start-date' && args[i + 1]) {
      options.startDate = args[i + 1];
      i++; // Skip next argument
    } else if (args[i] === '--end-date' && args[i + 1]) {
      options.endDate = args[i + 1];
      i++; // Skip next argument
    }
  }

  // Validate date format
  if (options.startDate && !moment(options.startDate, 'YYYY-MM-DD', true).isValid()) {
    console.error('❌ Invalid start date format. Use YYYY-MM-DD');
    process.exit(1);
  }
  
  if (options.endDate && !moment(options.endDate, 'YYYY-MM-DD', true).isValid()) {
    console.error('❌ Invalid end date format. Use YYYY-MM-DD');
    process.exit(1);
  }

  // Generate report
  const generator = new OnChainReportGenerator();
  generator.generateOnChainReport(options)
    .then(reportPath => {
      if (reportPath) {
        console.log(`\n🎉 On-chain report successfully generated: ${reportPath}`);
      } else {
        console.log('\n⚠️  No on-chain transactions found to report.');
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Failed to generate on-chain report:', error.message);
      process.exit(1);
    });
}

module.exports = OnChainReportGenerator;
