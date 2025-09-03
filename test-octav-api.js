#!/usr/bin/env node

const axios = require('axios');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbInVzZXIiXSwieC1oYXN1cmEtdXNlci1pZCI6InBhdmVscmFpZG1hMjUwNzgifX0.pnjtcjx22XLGksewXPqafiXc9zYn_zLSDdnfKQrwcSI';
const WALLET_ADDRESS = '0x6c441a03b149f4cd73eaec31f10a0f3c952f0df2';

console.log('🔍 Testing Octav API with correct parameters...');
console.log('📋 Wallet Address:', WALLET_ADDRESS);

async function testOctavAPI() {
  // Test 1: Basic transaction request with correct parameters
  console.log('\n📡 Test 1: Basic transaction request with correct parameters');
  try {
    const response1 = await axios.get('https://api.octav.fi/v1/transactions', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        addresses: WALLET_ADDRESS,
        limit: 10,
        offset: 0,
        hideSpam: true,
      }
    });
    console.log('✅ Success! Status:', response1.status);
    console.log('📊 Data length:', response1.data?.length || 'No data');
    if (response1.data && response1.data.length > 0) {
      console.log('📋 Sample transaction:', JSON.stringify(response1.data[0], null, 2));
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.status || error.message);
    console.log('📋 Error details:', error.response?.data || 'No details');
  }
  
  // Test 2: Try with date range
  console.log('\n📡 Test 2: With date range (August 2025)');
  try {
    const response2 = await axios.get('https://api.octav.fi/v1/transactions', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        addresses: WALLET_ADDRESS,
        limit: 250,
        offset: 0,
        hideSpam: true,
        startDate: '2025-08-01T00:00:00Z',
        endDate: '2025-08-31T23:59:59Z',
      }
    });
    console.log('✅ Success! Status:', response2.status);
    console.log('📊 Data length:', response2.data?.length || 'No data');
    if (response2.data && response2.data.length > 0) {
      console.log('📋 Sample transaction:', JSON.stringify(response2.data[0], null, 2));
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.status || error.message);
    console.log('📋 Error details:', error.response?.data || 'No details');
  }
  
  // Test 3: Try with different transaction types
  console.log('\n📡 Test 3: With transaction types filter');
  try {
    const response3 = await axios.get('https://api.octav.fi/v1/transactions', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        addresses: WALLET_ADDRESS,
        limit: 250,
        offset: 0,
        hideSpam: true,
        txTypes: 'swap,transfer,deposit,withdraw,stake,unstake,claim,mint,burn,approve,lend',
      }
    });
    console.log('✅ Success! Status:', response3.status);
    console.log('📊 Data length:', response3.data?.length || 'No data');
    if (response3.data && response3.data.length > 0) {
      console.log('📋 Sample transaction:', JSON.stringify(response3.data[0], null, 2));
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.status || error.message);
    console.log('📋 Error details:', error.response?.data || 'No details');
  }
}

testOctavAPI();
