const cron = require('node-cron');
const moment = require('moment');
const OctavApiService = require('./octavApi');
const ReportGenerator = require('./reportGenerator');
const config = require('../config/config');

class Scheduler {
  constructor() {
    this.octavApi = new OctavApiService();
    this.reportGenerator = new ReportGenerator();
    this.jobs = new Map();
  }

  /**
   * Start the automated reporting scheduler
   */
  start() {
    console.log('🚀 Starting automated transaction reporting scheduler...');
    
    // Schedule daily reports
    this.scheduleDailyReports();
    
    // Schedule weekly reports
    this.scheduleWeeklyReports();
    
    // Schedule monthly reports
    this.scheduleMonthlyReports();
    
    console.log('✅ Scheduler started successfully');
  }

  /**
   * Schedule daily reports
   */
  scheduleDailyReports() {
    const job = cron.schedule('0 9 * * *', async () => {
      console.log('📊 Generating daily transaction report...');
      await this.generateReport('daily');
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set('daily', job);
    console.log('📅 Daily reports scheduled for 9:00 AM UTC');
  }

  /**
   * Schedule weekly reports
   */
  scheduleWeeklyReports() {
    const job = cron.schedule('0 10 * * 1', async () => {
      console.log('📊 Generating weekly transaction report...');
      await this.generateReport('weekly');
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set('weekly', job);
    console.log('📅 Weekly reports scheduled for Monday 10:00 AM UTC');
  }

  /**
   * Schedule monthly reports
   */
  scheduleMonthlyReports() {
    const job = cron.schedule('0 11 1 * *', async () => {
      console.log('📊 Generating monthly transaction report...');
      await this.generateReport('monthly');
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set('monthly', job);
    console.log('📅 Monthly reports scheduled for 1st of month 11:00 AM UTC');
  }

  /**
   * Generate report based on type
   * @param {string} reportType - Type of report (daily, weekly, monthly)
   */
  async generateReport(reportType) {
    try {
      const startTime = Date.now();
      console.log(`🔄 Starting ${reportType} report generation...`);

      // Get date range based on report type
      const dateRange = this.getDateRange(reportType);
      
      // Fetch data for all configured wallets
      const data = await this.fetchReportData(dateRange);
      
      // Generate reports
      const report = await this.reportGenerator.generateTransactionReport(data, reportType);
      
      const duration = Date.now() - startTime;
      console.log(`✅ ${reportType} report generated successfully in ${duration}ms`);
      console.log(`📈 Summary: ${report.summary.totalTransactions} transactions, ${report.summary.totalVolume.toFixed(2)} volume`);
      
      // Send notifications if configured
      await this.sendNotifications(report, reportType);
      
    } catch (error) {
      console.error(`❌ Error generating ${reportType} report:`, error);
      await this.sendErrorNotification(error, reportType);
    }
  }

  /**
   * Get date range for report type
   * @param {string} reportType - Type of report
   * @returns {Object} Date range object
   */
  getDateRange(reportType) {
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
      default:
        return {
          start: now.clone().subtract(1, 'day').startOf('day').toISOString(),
          end: now.clone().subtract(1, 'day').endOf('day').toISOString(),
        };
    }
  }

  /**
   * Fetch data for report generation
   * @param {Object} dateRange - Date range for the report
   * @returns {Object} Combined transaction and portfolio data
   */
  async fetchReportData(dateRange) {
    const wallets = config.wallets.addresses;
    
    if (wallets.length === 0) {
      throw new Error('No wallet addresses configured');
    }

    console.log(`📡 Fetching data for ${wallets.length} wallets...`);

    // Fetch transactions and portfolios in parallel
    const [transactions, portfolios] = await Promise.all([
      this.octavApi.getBatchTransactions(wallets, {
        startDate: dateRange.start,
        endDate: dateRange.end,
      }),
      this.octavApi.getBatchPortfolios(wallets),
    ]);

    return {
      transactions,
      portfolios,
      dateRange,
      fetchedAt: new Date().toISOString(),
    };
  }

  /**
   * Send notifications for completed reports
   * @param {Object} report - Generated report
   * @param {string} reportType - Type of report
   */
  async sendNotifications(report, reportType) {
    const notifications = [];

    // Slack notification
    if (config.notifications.slack.webhookUrl) {
      notifications.push(this.sendSlackNotification(report, reportType));
    }

    // Email notification
    if (config.notifications.email.smtpHost) {
      notifications.push(this.sendEmailNotification(report, reportType));
    }

    if (notifications.length > 0) {
      await Promise.allSettled(notifications);
    }
  }

  /**
   * Send Slack notification
   * @param {Object} report - Generated report
   * @param {string} reportType - Type of report
   */
  async sendSlackNotification(report, reportType) {
    try {
      const { summary } = report;
      const message = {
        text: `📊 ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Transaction Report Generated`,
        attachments: [
          {
            color: '#36a64f',
            fields: [
              {
                title: 'Total Transactions',
                value: summary.totalTransactions.toString(),
                short: true,
              },
              {
                title: 'Total Volume',
                value: summary.totalVolume.toFixed(2),
                short: true,
              },
              {
                title: 'Unique Tokens',
                value: summary.uniqueTokens.toString(),
                short: true,
              },
              {
                title: 'Chains',
                value: summary.chains.length.toString(),
                short: true,
              },
            ],
          },
        ],
      };

      // In a real implementation, you would use a Slack SDK
      console.log('📤 Slack notification would be sent:', JSON.stringify(message, null, 2));
    } catch (error) {
      console.error('Error sending Slack notification:', error);
    }
  }

  /**
   * Send email notification
   * @param {Object} report - Generated report
   * @param {string} reportType - Type of report
   */
  async sendEmailNotification(report, reportType) {
    try {
      // In a real implementation, you would use a mail library like nodemailer
      console.log(`📧 Email notification would be sent for ${reportType} report`);
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  /**
   * Send error notifications
   * @param {Error} error - Error that occurred
   * @param {string} reportType - Type of report that failed
   */
  async sendErrorNotification(error, reportType) {
    try {
      const message = {
        text: `❌ Error generating ${reportType} report`,
        attachments: [
          {
            color: '#ff0000',
            fields: [
              {
                title: 'Error',
                value: error.message,
                short: false,
              },
              {
                title: 'Timestamp',
                value: new Date().toISOString(),
                short: true,
              },
            ],
          },
        ],
      };

      console.log('📤 Error notification would be sent:', JSON.stringify(message, null, 2));
    } catch (notificationError) {
      console.error('Error sending error notification:', notificationError);
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    console.log('🛑 Stopping scheduler...');
    
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`⏹️  Stopped ${name} job`);
    }
    
    this.jobs.clear();
    console.log('✅ Scheduler stopped');
  }

  /**
   * Get status of all jobs
   * @returns {Object} Job status information
   */
  getStatus() {
    const status = {};
    
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        nextDate: job.nextDate(),
      };
    }
    
    return status;
  }

  /**
   * Manually trigger a report generation
   * @param {string} reportType - Type of report to generate
   */
  async triggerReport(reportType = 'daily') {
    console.log(`🔧 Manually triggering ${reportType} report...`);
    await this.generateReport(reportType);
  }
}

module.exports = Scheduler;
