import puppeteer from 'puppeteer';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { parseJobHTML } from './parser';

export async function scrapeJobDetails() {
  // Query jobs that need scraping (no description yet)
  const { data: jobs, error } = await supabaseAdmin
    .from('jobs_raw')
    .select('id, url, upwork_job_id, title')
    .is('description', null)
    .limit(10); // Process in batches

  if (error) {
    console.error('Error querying jobs:', error);
    throw error;
  }

  if (!jobs || jobs.length === 0) {
    console.log('No jobs to scrape');
    return { scraped: 0, failed: 0 };
  }

  console.log(`Found ${jobs.length} jobs to scrape`);

  let scraped = 0;
  let failed = 0;
  let browser = null;

  try {
    // Launch browser once for all jobs
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });
    console.log('✓ Browser launched');

    for (const job of jobs) {
      try {
        console.log(`\nScraping: ${job.title} (${job.upwork_job_id})`);

        // Create new page
        const page = await browser.newPage();

        // Set realistic viewport and user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Navigate to job page
        console.log(`  - Navigating to URL...`);
        await page.goto(job.url, {
          waitUntil: 'networkidle2',
          timeout: 30000, // 30 second timeout
        });
        console.log(`  - ✓ Page loaded`);

        // Get HTML content
        const html = await page.content();
        console.log(`  - ✓ HTML retrieved (${html.length} chars)`);

        // Close page to free memory
        await page.close();

        // Parse HTML to extract job details
        console.log(`  - Parsing job details...`);
        const details = parseJobHTML(html);
        console.log(`  - ✓ Parsed: ${details.skills.length} skills, ${details.description.length} chars description`);

        // Update database with scraped details
        const { error: updateError } = await supabaseAdmin
          .from('jobs_raw')
          .update({
            description: details.description,
            budget: details.budget,
            job_type: details.job_type,
            experience_level: details.experience_level,
            skills: details.skills,
            connects_required: details.connects_required,
            client: details.client,
            client_country: details.client.country || null,
            client_spend: details.client.total_spent || null,
            client_hire_rate: details.client.hire_rate || null,
          })
          .eq('id', job.id);

        if (updateError) {
          console.error(`  ✗ Failed to update database:`, updateError);
          failed++;
        } else {
          console.log(`  ✓ Successfully scraped and saved!`);
          scraped++;
        }

        // Add delay to avoid rate limiting (important!)
        console.log(`  - Waiting 3 seconds before next job...`);
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error) {
        console.error(`Failed to scrape job ${job.upwork_job_id}:`, error);
        failed++;
      }
    }
  } finally {
    // Always close browser
    if (browser) {
      console.log('\nClosing browser...');
      await browser.close();
      console.log('✓ Browser closed');
    }
  }

  console.log(`\nScraping complete: ${scraped} successful, ${failed} failed`);
  return { scraped, failed };
}
