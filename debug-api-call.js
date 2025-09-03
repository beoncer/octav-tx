#!/usr/bin/env node

const axios = require('axios');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbInVzZXIiXSwieC1oYXN1cmEtdXNlci1pZCI6InBhdmVscmFpZG1hMjUwNzgifX0.pnjtcjx22XLGksewXPqafiXc9zYn_zLSDdnfKQrwcSI';
const WALLET_ADDRESS = '0x6c441a03b149f4cd73eaec31f10a0f3c952f0df2';

console.log('🔍 Debugging API call for August 2025...');
console.log('📋 Wallet Address:', WALLET_ADDRESS);

async function debugAPICall() {
  // Test 1: Check API status first
  console.log('\n📡 Test 1: Check API status');
  try {
    const response1 = await axios.get('https://api.octav.fi/v1/status', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    console.log('✅ API Status Success! Status:', response1.status);
    console.log('📊 API Response:', JSON.stringify(response1.data, null, 2));
  } catch (error) {
    console.log('❌ API Status Error:', error.response?.status || error.message);
    console.log('📋 Error details:', error.response?.data || 'No details');
  }

  // Test 2: Try without any parameters (should get all transactions)
  console.log('\n📡 Test 2: Without any parameters (all transactions)');
  try {
    const response2 = await axios.get('https://api.octav.fi/v1/transactions', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        limit: 10,
        offset: 0,
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

  // Test 3: Try with the specific wallet address
  console.log('\n📡 Test 3: With specific wallet address');
  try {
    const response3 = await axios.get('https://api.octav.fi/v1/transactions', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        addresses: WALLET_ADDRESS,
        limit: 10,
        offset: 0,
        hideSpam: false, // Try without spam filter
      }
    });
    console.log('✅ Success! Status:', response3.status);
    console.log('📊 Data length:', response3.data?.length || 'No data');
    if (response3.data && response3.data.length > 0) {
      console.log('📋 First transaction date:', response3.data[0].timestamp || response3.data[0].date);
      console.log('📋 Sample transaction:', JSON.stringify(response3.data[0], null, 2));
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.status || error.message);
    console.log('📋 Error details:', error.response?.data || 'No details');
  }

  // Test 4: Try with a different wallet address (Vitalik's address as test)
  console.log('\n📡 Test 4: With a different wallet address (Vitalik\'s)');
  try {
    const response4 = await axios.get('https://api.octav.fi/v1/transactions', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        addresses: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik's address
        limit: 10,
        offset: 0,
        hideSpam: true,
      }
    });
    console.log('✅ Success! Status:', response4.status);
    console.log('📊 Data length:', response4.data?.length || 'No data');
    if (response4.data && response4.data.length > 0) {
      console.log('📋 First transaction date:', response4.data[0].timestamp || response4.data[0].date);
      console.log('📋 Sample transaction:', JSON.stringify(response4.data[0], null, 2));
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.status || error.message);
    console.log('📋 Error details:', error.response?.data || 'No details');
  }

  // Test 5: Try with August 2025 date range
  console.log('\n📡 Test 5: With August 2025 date range');
  try {
    const params = {
      addresses: WALLET_ADDRESS,
      limit: 250,
      offset: 0,
      hideSpam: true,
      startDate: '2025-08-01T00:00:00Z',
      endDate: '2025-08-31T23:59:59Z',
    };
    
    console.log('📋 API Parameters:', JSON.stringify(params, null, 2));
    
    const response5 = await axios.get('https://api.octav.fi/v1/transactions', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: params
    });
    console.log('✅ Success! Status:', response5.status);
    console.log('📊 Data length:', response5.data?.length || 'No data');
    if (response5.data && response5.data.length > 0) {
      console.log('📋 First transaction date:', response5.data[0].timestamp || response5.data[0].date);
      console.log('📋 Sample transaction:', JSON.stringify(response5.data[0], null, 2));
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.status || error.message);
    console.log('📋 Error details:', error.response?.data || 'No details');
  }
}

debugAPICall();
