const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const config = require('../config/config');

class ReportGenerator {
  constructor() {
    this.outputDir = config.reporting.outputDir;
    this.ensureOutputDir();
  }

  async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating output directory:', error);
    }
  }

  /**
   * Extract token and value information from transaction assets
   * @param {Object} tx - Transaction object
   * @returns {Object} Token and value information
   */
  extractTokenInfo(tx) {
    let token = 'N/A';
    let value = '0';
    let valueFiat = '0';
    
    // Check assetsIn first (what the wallet received)
    if (tx.assetsIn && tx.assetsIn.length > 0) {
      const asset = tx.assetsIn[0];
      token = asset.symbol || asset.name || 'N/A';
      value = asset.balance || '0';
      valueFiat = asset.value || '0'; // The 'value' field in assets is the fiat value
    }
    // Check assetsOut (what the wallet sent)
    else if (tx.assetsOut && tx.assetsOut.length > 0) {
      const asset = tx.assetsOut[0];
      token = asset.symbol || asset.name || 'N/A';
      value = asset.balance || '0';
      valueFiat = asset.value || '0'; // The 'value' field in assets is the fiat value
    }
    
    return { token, value, valueFiat };
  }

  /**
   * Convert Unix timestamp to readable format
   * @param {string|number} timestamp - Unix timestamp
   * @returns {string} Formatted timestamp
   */
  formatTimestamp(timestamp) {
    if (!timestamp || timestamp === 'N/A') return 'N/A';
    const unixTime = parseInt(timestamp);
    if (isNaN(unixTime)) return 'N/A';
    return moment.unix(unixTime).format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   * Generate status-filtered CSV report
   * @param {Object} data - Transaction and portfolio data
   * @param {string} statusFilter - Status filter ('validated', 'pending', 'failed', 'all')
   * @param {string} reportName - Custom name for the report
   * @returns {Promise<Object>} Report summary
   */
  async generateStatusFilteredCsvReport(data, statusFilter = 'all', reportName = 'status_filtered') {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    
    console.log(`🔍 Filtering transactions by status: ${statusFilter}`);
    console.log(`🚫 Excluding transaction types: ${config.reporting.excludedTransactionTypes.join(', ')}`);
    
    const filename = `${reportName}_${timestamp}.csv`;
    const filepath = path.join(this.outputDir, filename);
    
    try {
      const csvWriter = createCsvWriter({
        path: filepath,
        header: [
          { id: 'field_no', title: 'Field no' },
          { id: 'trading_capacity', title: 'Trading capacity' },
          { id: 'transaction_status', title: 'Transaction_status' },
          { id: 'wallet', title: 'Wallet Address' },
          { id: 'timestamp', title: 'Timestamp' },
          { id: 'type', title: 'Transaction Type' },
          { id: 'chain', title: 'Chain' },
          { id: 'protocol', title: 'Protocol' },
          { id: 'token', title: 'Token' },
          { id: 'value', title: 'Value' },
          { id: 'value_fiat', title: 'Value (Fiat)' },
          { id: 'fees', title: 'Fees' },
          { id: 'hash', title: 'Transaction Hash' },
          { id: 'from', title: 'From Address' },
          { id: 'to', title: 'To Address' },
          { id: 'block_number', title: 'Block Number' },
        ],
      });

      const records = [];
      let totalFilteredTransactions = 0;
      let recordCounter = 0;
      let statusCounts = {
        validated: 0,
        pending: 0,
        failed: 0,
        unknown: 0
      };
      
      Object.entries(data.transactions || {}).forEach(([wallet, txs]) => {
        if (Array.isArray(txs)) {
          txs.forEach(tx => {
            // Check if transaction type should be excluded
            const txType = (tx.type || 'unknown').toUpperCase();
            if (config.reporting.excludedTransactionTypes.includes(txType)) {
              return; // Skip this transaction
            }
            
            // Determine validation status
            const status = tx.status || 'success';
            const confirmed = tx.confirmed || tx.confirmations > 0 || status === 'success';
            const blockNumber = tx.blockNumber || tx.block_number || 'N/A';
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
            
            // Count statuses
            statusCounts[statusCategory]++;
            
            // Apply status filter
            let includeTransaction = false;
            switch (statusFilter) {
              case 'validated':
                includeTransaction = isValidated;
                break;
              case 'pending':
                includeTransaction = statusCategory === 'pending';
                break;
              case 'failed':
                includeTransaction = statusCategory === 'failed';
                break;
              case 'all':
              default:
                includeTransaction = true;
                break;
            }
            
            if (includeTransaction) {
              totalFilteredTransactions++;
              recordCounter++;
              
              // Extract token and value information
              const { token, value, valueFiat } = this.extractTokenInfo(tx);
              
              records.push({
                field_no: recordCounter,
                trading_capacity: 'DEAL',
                transaction_status: 'NEWT',
                wallet,
                timestamp: this.formatTimestamp(tx.timestamp || tx.date),
                type: tx.type || 'unknown',
                chain: tx.chain?.name || tx.chain?.key || 'unknown',
                protocol: tx.protocol?.name || 'N/A',
                token: token,
                value: value,
                value_fiat: valueFiat,
                fees: tx.fees || '0',
                hash: tx.hash || tx.transactionHash || 'N/A',
                from: tx.from || 'N/A',
                to: tx.to || 'N/A',
                block_number: blockNumber,
              });
            }
          });
        }
      });

      await csvWriter.writeRecords(records);
      
      const summary = {
        totalFilteredTransactions,
        statusFilter,
        statusCounts,
        wallets: Object.keys(data.transactions || {}).length,
        dateRange: data.dateRange,
        generatedAt: new Date().toISOString(),
      };
      
      console.log(`✅ Status-filtered CSV report generated: ${filename}`);
      console.log(`📊 Filtered ${totalFilteredTransactions} transactions with status: ${statusFilter}`);
      console.log(`📈 Status breakdown:`, statusCounts);
      
      return summary;
    } catch (error) {
      console.error('Error generating status-filtered CSV report:', error);
      throw error;
    }
  }

  /**
   * Generate type-filtered CSV report
   * @param {Object} data - Transaction and portfolio data
   * @param {string|Array} transactionTypes - Specific transaction types to filter by
   * @param {string} reportName - Custom name for the report
   * @returns {Promise<Object>} Report summary
   */
  async generateTypeFilteredCsvReport(data, transactionTypes, reportName = 'type_filtered') {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const reportDate = moment().format('YYYY-MM-DD');
    
    // Normalize transaction types to array
    const typesToFilter = Array.isArray(transactionTypes) ? transactionTypes : [transactionTypes];
    
    console.log(`🔍 Filtering transactions by types: ${typesToFilter.join(', ')}`);
    console.log(`🚫 Excluding transaction types: ${config.reporting.excludedTransactionTypes.join(', ')}`);
    
    const filename = `${reportName}_${timestamp}.csv`;
    const filepath = path.join(this.outputDir, filename);
    
    try {
      const csvWriter = createCsvWriter({
        path: filepath,
        header: [
          { id: 'field_no', title: 'Field no' },
          { id: 'trading_capacity', title: 'Trading capacity' },
          { id: 'transaction_status', title: 'Transaction_status' },
          { id: 'wallet', title: 'Wallet Address' },
          { id: 'timestamp', title: 'Timestamp' },
          { id: 'type', title: 'Transaction Type' },
          { id: 'chain', title: 'Chain' },
          { id: 'protocol', title: 'Protocol' },
          { id: 'token', title: 'Token' },
          { id: 'value', title: 'Value' },
          { id: 'value_fiat', title: 'Value (Fiat)' },
          { id: 'fees', title: 'Fees' },
          { id: 'hash', title: 'Transaction Hash' },
          { id: 'from', title: 'From Address' },
          { id: 'to', title: 'To Address' },
          { id: 'block_number', title: 'Block Number' },
        ],
      });

      const records = [];
      let totalFilteredTransactions = 0;
      let recordCounter = 0;
      
      Object.entries(data.transactions || {}).forEach(([wallet, txs]) => {
        if (Array.isArray(txs)) {
          txs.forEach(tx => {
            // Filter by transaction type
            const txType = tx.type || 'unknown';
            
            // Check if transaction type should be excluded
            if (config.reporting.excludedTransactionTypes.includes(txType.toUpperCase())) {
              return; // Skip this transaction
            }
            
            if (typesToFilter.includes(txType)) {
              totalFilteredTransactions++;
              recordCounter++;
              
              // Determine validation status
              const status = tx.status || 'success';
              const confirmed = tx.confirmed || tx.confirmations > 0 || status === 'success';
              const blockNumber = tx.blockNumber || tx.block_number || 'N/A';
              const isValidated = confirmed && status === 'success';
              
              // Extract token and value information
              const { token, value, valueFiat } = this.extractTokenInfo(tx);
              
              records.push({
                field_no: recordCounter,
                trading_capacity: 'DEAL',
                transaction_status: 'NEWT',
                wallet,
                timestamp: this.formatTimestamp(tx.timestamp || tx.date),
                type: txType,
                chain: tx.chain?.name || tx.chain?.key || 'unknown',
                protocol: tx.protocol?.name || 'N/A',
                token: token,
                value: value,
                value_fiat: valueFiat,
                fees: tx.fees || '0',
                hash: tx.hash || tx.transactionHash || 'N/A',
                from: tx.from || 'N/A',
                to: tx.to || 'N/A',
                block_number: blockNumber,
              });
            }
          });
        }
      });

      await csvWriter.writeRecords(records);
      
      const summary = {
        totalFilteredTransactions,
        transactionTypes: typesToFilter,
        wallets: Object.keys(data.transactions || {}).length,
        dateRange: data.dateRange,
        generatedAt: new Date().toISOString(),
      };
      
      console.log(`✅ Type-filtered CSV report generated: ${filename}`);
      console.log(`📊 Filtered ${totalFilteredTransactions} transactions of types: ${typesToFilter.join(', ')}`);
      
      return summary;
    } catch (error) {
      console.error('Error generating type-filtered CSV report:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive transaction report
   * @param {Object} data - Transaction and portfolio data
   * @param {string} reportType - Type of report (daily, weekly, monthly)
   * @returns {Promise<Object>} Report summary
   */
  async generateTransactionReport(data, reportType = 'daily') {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const reportDate = moment().format('YYYY-MM-DD');
    
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        reportType,
        reportDate,
        totalWallets: Object.keys(data.transactions || {}).length,
      },
      summary: this.generateSummary(data),
      details: data,
    };

    // Generate different report formats
    await Promise.all([
      this.generateJsonReport(report, timestamp),
      this.generateCsvReport(report, timestamp),
      this.generateHtmlReport(report, timestamp),
    ]);

    return report;
  }

  /**
   * Generate summary statistics from transaction data
   * @param {Object} data - Transaction and portfolio data
   * @returns {Object} Summary statistics
   */
  generateSummary(data) {
    const summary = {
      totalTransactions: 0,
      totalVolume: 0,
      uniqueTokens: new Set(),
      chains: new Set(),
      transactionTypes: {},
      topTokens: {},
      topChains: {},
    };

    // Process transactions
    Object.values(data.transactions || {}).forEach(walletTxs => {
      if (Array.isArray(walletTxs)) {
        walletTxs.forEach(tx => {
          // Check if transaction type should be excluded
          const txType = (tx.type || 'unknown').toUpperCase();
          if (config.reporting.excludedTransactionTypes.includes(txType)) {
            return; // Skip this transaction
          }
          
          summary.totalTransactions++;
          
          // Track transaction types
          const txTypeOriginal = tx.type || 'unknown';
          summary.transactionTypes[txTypeOriginal] = (summary.transactionTypes[txTypeOriginal] || 0) + 1;
          
          // Track tokens
          if (tx.token) {
            summary.uniqueTokens.add(tx.token.address);
            summary.topTokens[tx.token.symbol] = (summary.topTokens[tx.token.symbol] || 0) + 1;
          }
          
          // Track chains
          if (tx.chain) {
            summary.chains.add(tx.chain);
            summary.topChains[tx.chain] = (summary.topChains[tx.chain] || 0) + 1;
          }
          
          // Track volume
          if (tx.value) {
            summary.totalVolume += parseFloat(tx.value) || 0;
          }
        });
      }
    });

    return {
      ...summary,
      uniqueTokens: summary.uniqueTokens.size,
      chains: Array.from(summary.chains),
      topTokens: this.sortByValue(summary.topTokens, 10),
      topChains: this.sortByValue(summary.topChains, 5),
    };
  }

  /**
   * Sort object by values and return top N entries
   * @param {Object} obj - Object to sort
   * @param {number} limit - Number of top entries to return
   * @returns {Object} Sorted object
   */
  sortByValue(obj, limit = 10) {
    return Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
  }

  /**
   * Generate JSON report
   * @param {Object} report - Report data
   * @param {string} timestamp - Timestamp for filename
   */
  async generateJsonReport(report, timestamp) {
    const filename = `transaction_report_${timestamp}.json`;
    const filepath = path.join(this.outputDir, filename);
    
    try {
      await fs.writeFile(filepath, JSON.stringify(report, null, 2));
      console.log(`✅ JSON report generated: ${filename}`);
    } catch (error) {
      console.error('Error generating JSON report:', error);
    }
  }

  /**
   * Generate CSV report
   * @param {Object} report - Report data
   * @param {string} timestamp - Timestamp for filename
   */
  async generateCsvReport(report, timestamp) {
    const filename = `transaction_report_${timestamp}.csv`;
    const filepath = path.join(this.outputDir, filename);
    
    try {
      const csvWriter = createCsvWriter({
        path: filepath,
        header: [
          { id: 'field_no', title: 'Field no' },
          { id: 'trading_capacity', title: 'Trading capacity' },
          { id: 'transaction_status', title: 'Transaction_status' },
          { id: 'wallet', title: 'Wallet Address' },
          { id: 'timestamp', title: 'Timestamp' },
          { id: 'type', title: 'Transaction Type' },
          { id: 'chain', title: 'Chain' },
          { id: 'protocol', title: 'Protocol' },
          { id: 'token', title: 'Token' },
          { id: 'value', title: 'Value' },
          { id: 'value_fiat', title: 'Value (Fiat)' },
          { id: 'fees', title: 'Fees' },
          { id: 'hash', title: 'Transaction Hash' },
          { id: 'from', title: 'From Address' },
          { id: 'to', title: 'To Address' },
          { id: 'block_number', title: 'Block Number' },
        ],
      });

      const records = [];
      let recordCounter = 0;
      
      Object.entries(report.details.transactions || {}).forEach(([wallet, txs]) => {
        if (Array.isArray(txs)) {
          txs.forEach(tx => {
            // Check if transaction type should be excluded
            const txType = (tx.type || 'unknown').toUpperCase();
            if (config.reporting.excludedTransactionTypes.includes(txType)) {
              return; // Skip this transaction
            }
            
            recordCounter++;
            
            // Extract token and value information
            const { token, value, valueFiat } = this.extractTokenInfo(tx);
            
            records.push({
              field_no: recordCounter,
              trading_capacity: 'DEAL',
              transaction_status: 'NEWT',
              wallet,
              timestamp: this.formatTimestamp(tx.timestamp || tx.date),
              type: tx.type || 'unknown',
              chain: tx.chain?.name || tx.chain?.key || 'unknown',
              protocol: tx.protocol?.name || 'N/A',
              token: token,
              value: value,
              value_fiat: valueFiat,
              fees: tx.fees || '0',
              hash: tx.hash || tx.transactionHash || 'N/A',
              from: tx.from || 'N/A',
              to: tx.to || 'N/A',
              block_number: tx.blockNumber || tx.block_number || 'N/A',
            });
          });
        }
      });

      await csvWriter.writeRecords(records);
      console.log(`✅ CSV report generated: ${filename}`);
    } catch (error) {
      console.error('Error generating CSV report:', error);
    }
  }

  /**
   * Generate HTML report
   * @param {Object} report - Report data
   * @param {string} timestamp - Timestamp for filename
   */
  async generateHtmlReport(report, timestamp) {
    const filename = `transaction_report_${timestamp}.html`;
    const filepath = path.join(this.outputDir, filename);
    
    try {
      const html = this.generateHtmlContent(report);
      await fs.writeFile(filepath, html);
      console.log(`✅ HTML report generated: ${filename}`);
    } catch (error) {
      console.error('Error generating HTML report:', error);
    }
  }

  /**
   * Generate HTML content for the report
   * @param {Object} report - Report data
   * @returns {string} HTML content
   */
  generateHtmlContent(report) {
    const { metadata, summary } = report;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transaction Report - ${metadata.reportDate}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; }
        .summary-card h3 { margin: 0 0 10px 0; color: #007bff; }
        .summary-card p { margin: 0; font-size: 24px; font-weight: bold; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .metadata { background: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Transaction Report</h1>
            <p>Generated on ${new Date(metadata.generatedAt).toLocaleString()}</p>
        </div>
        
        <div class="metadata">
            <h3>Report Information</h3>
            <p><strong>Type:</strong> ${metadata.reportType}</p>
            <p><strong>Date:</strong> ${metadata.reportDate}</p>
            <p><strong>Wallets Monitored:</strong> ${metadata.totalWallets}</p>
        </div>
        
        <div class="section">
            <h2>Summary Statistics</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Total Transactions</h3>
                    <p>${summary.totalTransactions}</p>
                </div>
                <div class="summary-card">
                    <h3>Total Volume</h3>
                    <p>${summary.totalVolume.toFixed(2)}</p>
                </div>
                <div class="summary-card">
                    <h3>Unique Tokens</h3>
                    <p>${summary.uniqueTokens}</p>
                </div>
                <div class="summary-card">
                    <h3>Chains</h3>
                    <p>${summary.chains.length}</p>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>Transaction Types</h2>
            <table>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(summary.transactionTypes).map(([type, count]) => `
                        <tr>
                            <td>${type}</td>
                            <td>${count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>Top Tokens</h2>
            <table>
                <thead>
                    <tr>
                        <th>Token</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(summary.topTokens).map(([token, count]) => `
                        <tr>
                            <td>${token}</td>
                            <td>${count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>Top Chains</h2>
            <table>
                <thead>
                    <tr>
                        <th>Chain</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(summary.topChains).map(([chain, count]) => `
                        <tr>
                            <td>${chain}</td>
                            <td>${count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate portfolio report
   * @param {Object} portfolioData - Portfolio data
   * @returns {Promise<Object>} Portfolio report
   */
  async generatePortfolioReport(portfolioData) {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        reportType: 'portfolio',
        totalWallets: Object.keys(portfolioData).length,
      },
      portfolios: portfolioData,
      summary: this.generatePortfolioSummary(portfolioData),
    };

    const filename = `portfolio_report_${timestamp}.json`;
    const filepath = path.join(this.outputDir, filename);
    
    try {
      await fs.writeFile(filepath, JSON.stringify(report, null, 2));
      console.log(`✅ Portfolio report generated: ${filename}`);
    } catch (error) {
      console.error('Error generating portfolio report:', error);
    }

    return report;
  }

  /**
   * Generate portfolio summary
   * @param {Object} portfolioData - Portfolio data
   * @returns {Object} Portfolio summary
   */
  generatePortfolioSummary(portfolioData) {
    const summary = {
      totalValue: 0,
      totalAssets: 0,
      chains: new Set(),
      topAssets: {},
    };

    Object.values(portfolioData).forEach(portfolio => {
      if (portfolio.assets) {
        portfolio.assets.forEach(asset => {
          summary.totalAssets++;
          summary.totalValue += parseFloat(asset.value || 0);
          
          if (asset.chain) {
            summary.chains.add(asset.chain);
          }
          
          if (asset.symbol) {
            summary.topAssets[asset.symbol] = (summary.topAssets[asset.symbol] || 0) + parseFloat(asset.value || 0);
          }
        });
      }
    });

    return {
      totalValue: summary.totalValue,
      totalAssets: summary.totalAssets,
      chains: Array.from(summary.chains),
      topAssets: this.sortByValue(summary.topAssets, 10),
    };
  }
}

module.exports = ReportGenerator;
