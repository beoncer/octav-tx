const express = require('express');
const cors = require('cors');
const Scheduler = require('./services/scheduler');
const OctavApiService = require('./services/octavApi');
const ReportGenerator = require('./services/reportGenerator');
const config = require('./config/config');

class TransactionReportingApp {
  constructor() {
    this.app = express();
    this.scheduler = new Scheduler();
    this.octavApi = new OctavApiService();
    this.reportGenerator = new ReportGenerator();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      });
    });

    // API status endpoint
    this.app.get('/api/status', async (req, res) => {
      try {
        const apiStatus = await this.octavApi.getStatus();
        const schedulerStatus = this.scheduler.getStatus();
        
        res.json({
          api: apiStatus,
          scheduler: schedulerStatus,
          config: {
            wallets: config.wallets.addresses.length,
            outputDir: config.reporting.outputDir,
          },
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Manual report generation endpoint
    this.app.post('/api/reports/generate', async (req, res) => {
      try {
        const { reportType = 'daily', dateRange } = req.body;
        
        console.log(`🔧 Manual report generation requested: ${reportType}`);
        
        if (dateRange) {
          // Custom date range report
          const data = await this.scheduler.fetchReportData(dateRange);
          const report = await this.reportGenerator.generateTransactionReport(data, reportType);
          res.json({ success: true, report });
        } else {
          // Standard report
          await this.scheduler.triggerReport(reportType);
          res.json({ success: true, message: `${reportType} report generation started` });
        }
      } catch (error) {
        console.error('Error in manual report generation:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Type-filtered report generation endpoint
    this.app.post('/api/reports/generate-type-filtered', async (req, res) => {
      try {
        const { transactionTypes, reportType = 'daily', dateRange, reportName } = req.body;
        
        if (!transactionTypes) {
          return res.status(400).json({ error: 'transactionTypes is required' });
        }
        
        console.log(`🔧 Type-filtered report generation requested: ${transactionTypes.join(', ')}`);
        
        // Fetch data
        let data;
        if (dateRange) {
          data = await this.scheduler.fetchReportData(dateRange);
        } else {
          const dateRangeObj = this.scheduler.getDateRange(reportType);
          data = await this.scheduler.fetchReportData(dateRangeObj);
        }
        
        // Generate type-filtered CSV report
        const summary = await this.reportGenerator.generateTypeFilteredCsvReport(
          data, 
          transactionTypes, 
          reportName || `type_filtered_${transactionTypes.join('_')}`
        );
        
        res.json({ 
          success: true, 
          summary,
          message: `Type-filtered CSV report generated successfully` 
        });
      } catch (error) {
        console.error('Error in type-filtered report generation:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get wallet transactions endpoint
    this.app.get('/api/wallets/:address/transactions', async (req, res) => {
      try {
        const { address } = req.params;
        const { startDate, endDate, limit = 100 } = req.query;
        
        const options = { limit: parseInt(limit) };
        if (startDate) options.startDate = startDate;
        if (endDate) options.endDate = endDate;
        
        const transactions = await this.octavApi.getTransactions(address, options);
        res.json(transactions);
      } catch (error) {
        console.error('Error fetching wallet transactions:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get wallet portfolio endpoint
    this.app.get('/api/wallets/:address/portfolio', async (req, res) => {
      try {
        const { address } = req.params;
        const portfolio = await this.octavApi.getPortfolio(address);
        res.json(portfolio);
      } catch (error) {
        console.error('Error fetching wallet portfolio:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get supported chains endpoint
    this.app.get('/api/chains', async (req, res) => {
      try {
        const chains = await this.octavApi.getSupportedChains();
        res.json(chains);
      } catch (error) {
        console.error('Error fetching supported chains:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Scheduler control endpoints
    this.app.post('/api/scheduler/start', (req, res) => {
      try {
        this.scheduler.start();
        res.json({ success: true, message: 'Scheduler started' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/scheduler/stop', (req, res) => {
      try {
        this.scheduler.stop();
        res.json({ success: true, message: 'Scheduler stopped' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/scheduler/status', (req, res) => {
      try {
        const status = this.scheduler.getStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Error handling middleware
    this.app.use((error, req, res, next) => {
      console.error('Unhandled error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
  }

  async start() {
    try {
      // Test API connection
      console.log('🔍 Testing Octav API connection...');
      await this.octavApi.getStatus();
      console.log('✅ Octav API connection successful');

      // Start the scheduler
      this.scheduler.start();

      // Start the web server
      const port = config.app.port;
      this.server = this.app.listen(port, () => {
        console.log(`🚀 Transaction reporting system started on port ${port}`);
        console.log(`📊 API available at http://localhost:${port}`);
        console.log(`🔍 Health check: http://localhost:${port}/health`);
        console.log(`📈 Scheduler status: http://localhost:${port}/api/scheduler/status`);
      });

    } catch (error) {
      console.error('❌ Failed to start application:', error);
      process.exit(1);
    }
  }

  async stop() {
    console.log('🛑 Shutting down application...');
    
    if (this.scheduler) {
      this.scheduler.stop();
    }
    
    if (this.server) {
      this.server.close();
    }
    
    console.log('✅ Application stopped');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  if (global.app) {
    await global.app.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  if (global.app) {
    await global.app.stop();
  }
  process.exit(0);
});

// Start the application
if (require.main === module) {
  const app = new TransactionReportingApp();
  global.app = app;
  app.start();
}

module.exports = TransactionReportingApp;
