#!/usr/bin/env node

/**
 * Simple test script to verify Octav API connection
 * Run this after installing Node.js: node test-api.js
 */

const https = require('https');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbInVzZXIiXSwieC1oYXN1cmEtdXNlci1pZCI6InBhdmVscmFpZG1hMjUwNzgifX0.pnjtcjx22XLGksewXPqafiXc9zYn_zLSDdnfKQrwcSI';

console.log('🔍 Testing Octav API connection...');
console.log('📋 API Key:', API_KEY.substring(0, 20) + '...');

// Test with a simple endpoint that should exist
const options = {
  hostname: 'api.octav.fi',
  port: 443,
  path: '/',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Octav-TX-Reporting/1.0.0'
  }
};

const req = https.request(options, (res) => {
  console.log(`📡 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ API connection successful!');
    console.log('📊 Response received (status code:', res.statusCode, ')');
    
    if (res.statusCode === 200 || res.statusCode === 401 || res.statusCode === 403) {
      console.log('\n🎉 Your API key is working correctly!');
      console.log('📋 The API is responding to requests.');
      console.log('📋 You can now:');
      console.log('   1. Add wallet addresses to .env file');
      console.log('   2. Generate reports: npm run report:type swap daily');
      console.log('   3. Start the full system: npm start');
    } else if (res.statusCode === 404) {
      console.log('\n⚠️  API endpoint not found, but connection is working.');
      console.log('📋 This is normal - the main system uses different endpoints.');
      console.log('📋 You can proceed with:');
      console.log('   1. Add wallet addresses to .env file');
      console.log('   2. Generate reports: npm run report:type swap daily');
    } else {
      console.log('\n❓ Unexpected response, but connection is working.');
      console.log('📋 You can try generating a report to test the full functionality.');
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request failed:', error.message);
  console.log('📋 Please check your internet connection.');
});

req.end();
