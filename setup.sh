#!/bin/bash

echo "🚀 Octav Transaction Reporting System Setup"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo ""
    echo "📦 Please install Node.js first:"
    echo "   Option 1: Download from https://nodejs.org/"
    echo "   Option 2: Using Homebrew: brew install node"
    echo "   Option 3: Using nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo ""
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Octav API Configuration
OCTAV_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbInVzZXIiXSwieC1oYXN1cmEtdXNlci1pZCI6InBhdmVscmFpZG1hMjUwNzgifX0.pnjtcjx22XLGksewXPqafiXc9zYn_zLSDdnfKQrwcSI
OCTAV_BASE_URL=https://api.octav.fi

# Application Configuration
PORT=3000
NODE_ENV=development

# Reporting Configuration
REPORT_SCHEDULE="0 9 * * *"  # Daily at 9 AM
REPORT_OUTPUT_DIR=./reports
LOG_LEVEL=info
HIDE_SPAM=true  # Filter out spam transactions

# Wallet Addresses to Monitor (comma-separated)
# Add your wallet addresses here, for example:
# WALLET_ADDRESSES=0x1234567890abcdef,0xabcdef1234567890
WALLET_ADDRESSES=

# Notification Configuration (optional)
SLACK_WEBHOOK_URL=
EMAIL_SMTP_HOST=
EMAIL_SMTP_PORT=
EMAIL_USERNAME=
EMAIL_PASSWORD=
EOF
    echo "✅ .env file created with your API key"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create reports directory
echo ""
echo "📁 Creating reports directory..."
mkdir -p reports

# Test API connection
echo ""
echo "🔍 Testing Octav API connection..."
node -e "
const axios = require('axios');

async function testConnection() {
    try {
        const response = await axios.get('https://api.octav.fi/status', {
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbInVzZXIiXSwieC1oYXN1cmEtdXNlci1pZCI6InBhdmVscmFpZG1hMjUwNzgifX0.pnjtcjx22XLGksewXPqafiXc9zYn_zLSDdnfKQrwcSI',
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ API connection successful!');
        console.log('📊 API Status:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('❌ API connection failed:', error.message);
        if (error.response) {
            console.log('📋 Response:', error.response.data);
        }
    }
}

testConnection();
"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file and add your wallet addresses to WALLET_ADDRESSES"
echo "2. Test the system: npm run report:type swap daily"
echo "3. Start the full system: npm start"
echo ""
echo "📚 For more information, see README.md"
