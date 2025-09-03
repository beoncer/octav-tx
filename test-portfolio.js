#!/usr/bin/env node

const axios = require('axios');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbInVzZXIiXSwieC1oYXN1cmEtdXNlci1pZCI6InBhdmVscmFpZG1hMjUwNzgifX0.pnjtcjx22XLGksewXPqafiXc9zYn_zLSDdnfKQrwcSI';
const WALLET_ADDRESS = '0x6c441a03b149f4cd73eaec31f10a0f3c952f0df2';

console.log('🔍 Testing Portfolio endpoint...');
console.log('📋 Wallet Address:', WALLET_ADDRESS);

async function testPortfolio() {
  try {
    console.log('\n📡 Testing Portfolio endpoint');
    const response = await axios.get(`https://api.octav.fi/v1/portfolio/${WALLET_ADDRESS}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    console.log('✅ Success! Status:', response.status);
    console.log('📊 Portfolio data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.response?.status || error.message);
    console.log('📋 Error details:', error.response?.data || 'No details');
  }
}

testPortfolio();
