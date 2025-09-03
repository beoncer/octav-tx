#!/usr/bin/env node

// Set wallet addresses for this run
process.env.WALLET_ADDRESSES = '0x6c441a03b149f4cd73eaec31f10a0f3c952f0df2,0xbb8de087dd10e68af0249fc4ad83e31a78e7100d,0x99ad5b1f77c4652fba35f9de8fa13dfd331e64e4,0x6f0F6dD537250352B3ae1443459a642fC89A0277,0x45AD14f314b579560e6d9136F707633D00A88CE0,0x3122d26bc093712B6941e413B575E14C6C721B6a,0x30C6a0D4c26e883A873852fdE2475A90EE7Dbfcf';

// Import and run the report generation
require('./src/generateTypeFilteredReport.js');
