const axios = require('axios');
const config = require('../config/config');

class OctavApiService {
  constructor() {
    this.apiKey = config.octav.apiKey;
    this.baseUrl = config.octav.baseUrl;
    
    if (!this.apiKey) {
      throw new Error('Octav API key is required');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Get transactions for a specific address
   * @param {string} address - Wallet address
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Transaction data
   */
  async getTransactions(address, options = {}) {
    try {
      const params = {
        addresses: address, // API expects 'addresses' (plural)
        limit: 250, // Default to max limit
        offset: 0, // Start from beginning
        hideSpam: config.reporting.hideSpam, // Use config setting for spam filtering
        ...options,
      };

      // Debug logging
      console.log('🔍 API Call Parameters:', JSON.stringify(params, null, 2));

      const response = await this.client.get('/v1/transactions', { params });
      // API returns { transactions: [...] } format, not just array
      return response.data.transactions || response.data;
    } catch (error) {
      console.error(`Error fetching transactions for ${address}:`, error.message);
      throw error;
    }
  }

  /**
   * Get current portfolio for an address
   * @param {string} address - Wallet address
   * @returns {Promise<Object>} Portfolio data
   */
  async getPortfolio(address) {
    try {
      const response = await this.client.get(`/v1/portfolio/${address}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching portfolio for ${address}:`, error.message);
      throw error;
    }
  }

  /**
   * Get historical portfolio data
   * @param {string} address - Wallet address
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Historical portfolio data
   */
  async getHistoricalPortfolio(address, options = {}) {
    try {
      const params = {
        address,
        ...options,
      };

      const response = await this.client.get('/v1/historical-portfolio', { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching historical portfolio for ${address}:`, error.message);
      throw error;
    }
  }

  /**
   * Get token overview and details
   * @param {string} tokenAddress - Token contract address
   * @param {string} chain - Blockchain network
   * @returns {Promise<Object>} Token details
   */
  async getTokenOverview(tokenAddress, chain) {
    try {
      const response = await this.client.get(`/token/${chain}/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching token overview for ${tokenAddress}:`, error.message);
      throw error;
    }
  }

  /**
   * Get supported chains
   * @returns {Promise<Array>} Supported chains
   */
  async getSupportedChains() {
    try {
      const response = await this.client.get('/chains');
      return response.data;
    } catch (error) {
      console.error('Error fetching supported chains:', error.message);
      throw error;
    }
  }

  /**
   * Get API status and credits
   * @returns {Promise<Object>} API status
   */
  async getStatus() {
    try {
      const response = await this.client.get('/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching API status:', error.message);
      throw error;
    }
  }

  /**
   * Batch fetch transactions for multiple addresses
   * @param {Array<string>} addresses - Array of wallet addresses
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Transactions grouped by address
   */
  async getBatchTransactions(addresses, options = {}) {
    const results = {};
    
    // Ensure hideSpam setting is applied
    const defaultOptions = {
      hideSpam: config.reporting.hideSpam,
      ...options,
    };
    
    for (const address of addresses) {
      try {
        results[address] = await this.getTransactions(address, defaultOptions);
      } catch (error) {
        console.error(`Failed to fetch transactions for ${address}:`, error.message);
        results[address] = { error: error.message };
      }
    }
    
    return results;
  }

  /**
   * Batch fetch portfolios for multiple addresses
   * @param {Array<string>} addresses - Array of wallet addresses
   * @returns {Promise<Object>} Portfolios grouped by address
   */
  async getBatchPortfolios(addresses) {
    const results = {};
    
    for (const address of addresses) {
      try {
        results[address] = await this.getPortfolio(address);
      } catch (error) {
        console.error(`Failed to fetch portfolio for ${address}:`, error.message);
        results[address] = { error: error.message };
      }
    }
    
    return results;
  }
}

module.exports = OctavApiService;
