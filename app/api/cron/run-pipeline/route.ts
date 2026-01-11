import { NextRequest, NextResponse } from 'next/server';
import { scrapeUpworkJobs } from '@/lib/scraper/scraper-flare';
import { processJobs } from '@/lib/ai/pipeline';

// Security: Verify this is called by Vercel Cron or authorized source
function verifyCronRequest(request: NextRequest): boolean {
  // Allow local development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔓 Development mode: bypassing auth check');
    return true;
  }

  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set, require it in Authorization header
  if (cronSecret) {
    return authHeader === `Bearer ${cronSecret}`;
  }

  // Otherwise check if it's from Vercel Cron (has specific headers)
  const userAgent = request.headers.get('user-agent');
  return userAgent?.includes('vercel-cron') || false;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Security check
    if (!verifyCronRequest(request)) {
      console.error('❌ Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🤖 ========================================');
    console.log('🤖 CRON JOB STARTED:', new Date().toISOString());
    console.log('🤖 ========================================\n');

    // Step 1: Scrape jobs from Upwork
    console.log('📥 STEP 1: Scraping Upwork jobs...');
    
    // Get queries from env and pick random one
    const allQueries = (process.env.DEFAULT_SEARCH_QUERY || 'nextjs react').split(',');
    const randomQuery = allQueries[Math.floor(Math.random() * allQueries.length)].trim();
    
    console.log(`   Available queries: ${allQueries.length}`);
    console.log(`   Selected query: "${randomQuery}"`);
    console.log(`   Max jobs: ${process.env.MAX_JOBS_PER_RUN || '20'}\n`);

    const scrapeResult = await scrapeUpworkJobs(
      randomQuery,
      parseInt(process.env.MAX_JOBS_PER_RUN || '20', 10)
    );

    console.log(`\n✅ Scraping complete!`);
    console.log(`   Jobs scraped: ${scrapeResult.jobsScraped}`);
    console.log(`   Errors: ${scrapeResult.errors.length}`);

    // Step 2: Process jobs with AI (embeddings + scoring)
    console.log('\n🧠 STEP 2: Processing jobs with AI...');
    console.log('   Generating embeddings and calculating relevance scores...\n');

    const processResult = await processJobs();

    console.log(`\n✅ Processing complete!`);
    console.log(`   Successfully processed: ${processResult.processed}`);
    console.log(`   Failed: ${processResult.failed}`);

    // Calculate total duration
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      query: randomQuery,
      scraped: {
        jobsScraped: scrapeResult.jobsScraped,
        errors: scrapeResult.errors.length,
      },
      processed: {
        success: processResult.processed,
        failed: processResult.failed,
      },
    };

    console.log('\n🤖 ========================================');
    console.log('🤖 CRON JOB COMPLETED SUCCESSFULLY!');
    console.log('🤖 ========================================');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📊 Summary:`, JSON.stringify(summary, null, 2));

    return NextResponse.json(summary);

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error('\n❌ ========================================');
    console.error('❌ CRON JOB FAILED!');
    console.error('❌ ========================================');
    console.error('Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}s`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST (some cron services use POST)
export async function POST(request: NextRequest) {
  return GET(request);
}
