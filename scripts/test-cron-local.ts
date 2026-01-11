// Test the cron job locally before deploying to Vercel
// Usage: npm run test:cron

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file from project root
config({ path: resolve(__dirname, '../.env') });

async function testCronJob() {
  console.log('🧪 Testing cron job locally...\n');
  console.log('📍 Calling: http://localhost:3000/api/cron/run-pipeline\n');

  try {
    const response = await fetch('http://localhost:3000/api/cron/run-pipeline', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || ''}`,
        'User-Agent': 'vercel-cron/1.0', // Simulate Vercel
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ CRON JOB TEST PASSED!\n');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      console.log('\n🎉 Your cron job is working correctly!');
      console.log('\n📝 Next steps:');
      console.log('   1. Deploy to Vercel: vercel --prod');
      console.log('   2. Set environment variables in Vercel dashboard');
      console.log('   3. Check Vercel Cron Jobs tab to verify it\'s scheduled\n');
    } else {
      console.log('\n❌ CRON JOB TEST FAILED!\n');
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log('Response:', JSON.stringify(data, null, 2));
      console.log('\n💡 Troubleshooting:');
      console.log('   - Make sure your Next.js dev server is running (npm run dev)');
      console.log('   - Check that FlareSolverr is running (docker ps)');
      console.log('   - Verify all environment variables in .env');
      console.log('   - Check the terminal running npm run dev for detailed logs\n');
    }
  } catch (error) {
    console.error('\n❌ CONNECTION ERROR!\n');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.log('\n💡 Troubleshooting:');
    console.log('   - Make sure your Next.js dev server is running: npm run dev');
    console.log('   - Check that the server is running on http://localhost:3000\n');
    process.exit(1);
  }
}

testCronJob().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

