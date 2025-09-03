#!/usr/bin/env node

const axios = require('axios');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbInVzZXIiXSwieC1oYXN1cmEtdXNlci1pZCI6InBhdmVscmFpZG1hMjUwNzgifX0.pnjtcjx22XLGksewXPqafiXc9zYn_zLSDdnfKQrwcSI';
const WALLET_ADDRESS = '0x6c441a03b149f4cd73eaec31f10a0f3c952f0df2';

console.log('🔍 Quick test - trying different parameter combinations...');

async function quickTest() {
  // Test 1: Without hideSpam filter
  console.log('\n📡 Test 1: Without hideSpam filter');
  try {
    const response = await axios.get('https://api.octav.fi/v1/transactions', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        addresses: WALLET_ADDRESS,
        limit: 10,
        offset: 0,
        // No hideSpam parameter
      }
    });
    console.log('✅ Success! Status:', response.status);
    console.log('📊 Data length:', response.data?.length || 'No data');
    if (response.data && response.data.length > 0) {
      console.log('📋 Sample transaction:', JSON.stringify(response.data[0], null, 2));
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.status || error.message);
  }

  // Test 2: Try with different date format (YYYY-MM-DD)
  console.log('\n📡 Test 2: With YYYY-MM-DD date format');
  try {
    const response = await axios.get('https://api.octav.fi/v1/transactions', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        addresses: WALLET_ADDRESS,
        limit: 10,
        offset: 0,
        startDate: '2025-08-01',
        endDate: '2025-08-31',
      }
    });
    console.log('✅ Success! Status:', response.status);
    console.log('📊 Data length:', response.data?.length || 'No data');
    if (response.data && response.data.length > 0) {
      console.log('📋 Sample transaction:', JSON.stringify(response.data[0], null, 2));
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.status || error.message);
  }
}

quickTest();
