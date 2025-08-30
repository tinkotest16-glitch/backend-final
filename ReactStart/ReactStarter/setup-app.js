
const { spawn } = require('child_process');

console.log('🚀 Setting up EdgeMarket...');

// Check environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'SESSION_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('⚠️  Missing environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📝 Please add these to your Replit Secrets or .env file');
} else {
  console.log('✅ All environment variables configured');
}

console.log('\n🔧 Starting EdgeMarket server...');
