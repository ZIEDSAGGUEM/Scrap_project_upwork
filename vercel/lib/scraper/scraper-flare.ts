/**
 * Upwork Scraper using FlareSolverr
 * 
 * Scrapes Upwork job listings using FlareSolverr to bypass Cloudflare
 */

import * as cheerio from 'cheerio';
import { solveCloudflare, createSession, destroySession } from './flaresolverr';
import { parseJobHTML, ScrapedJobDetails } from './parser';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { randomDelay, smartPageDelay } from './delay';

interface ScrapeResult {
  success: boolean;
  jobsScraped: number;
  errors: string[];
}

/**
 * Extract job URLs from Upwork search results page
 * @param html - HTML content of search results page
 * @returns Array of job URLs
 */
function extractJobUrls(html: string): string[] {
  const $ = cheerio.load(html);
  const jobUrls: string[] = [];
  const seenUrls = new Set<string>();

  // Find all links that contain '/jobs/'
  $('a[href*="/jobs/"]').each((_, el) => {
    const href = $(el).attr('href');
    
    if (!href) return;

    // Skip search pages (path starts with /nx/search or /search)
    if (href.startsWith('/nx/search') || href.startsWith('/search')) {
      return;
    }

    // Must start with /jobs/ (actual job posting)
    if (!href.startsWith('/jobs/')) {
      return;
    }
    
    // Build full URL
    const fullUrl = href.startsWith('http') 
      ? href 
      : `https://www.upwork.com${href}`;
    
    // Remove query params for clean URL
    const cleanUrl = fullUrl.split('?')[0];
    
    // Only add if we haven't seen it yet
    if (!seenUrls.has(cleanUrl)) {
      seenUrls.add(cleanUrl);
      jobUrls.push(cleanUrl);
    }
  });

  console.log(`🔗 Extracted ${jobUrls.length} unique job URLs`);
  return jobUrls;
}

/**
 * Scrape Upwork jobs by search query
 * @param query - Search query (e.g., "next.js react")
 * @param maxJobs - Maximum number of jobs to scrape (default: 10)
 * @returns Scrape result with success status and count
 */
export async function scrapeUpworkJobs(
  query: string,
  maxJobs: number = 10
): Promise<ScrapeResult> {
  console.log(`🔍 Starting Upwork scraper for query: "${query}"`);
  
  const result: ScrapeResult = {
    success: false,
    jobsScraped: 0,
    errors: [],
  };

  let sessionId: string | undefined;

  try {
    // Step 1: Create a session for faster scraping
    sessionId = `upwork-${Date.now()}`;
    await createSession(sessionId);

    // Step 2: Fetch search results with pagination (if needed for >50 jobs)
    const jobUrls: string[] = [];
    const perPage = 50; // Upwork max per page
    const pagesToFetch = Math.ceil(maxJobs / perPage);
    
    console.log(`📄 Fetching up to ${pagesToFetch} page(s) of search results...`);

    for (let page = 1; page <= pagesToFetch; page++) {
      const searchUrl = `https://www.upwork.com/nx/search/jobs/?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
      console.log(`\n📄 Page ${page}/${pagesToFetch}: ${searchUrl}`);

      try {
        const searchHtml = await solveCloudflare(searchUrl, sessionId, 60000);
        const pageJobUrls = extractJobUrls(searchHtml);
        console.log(`✅ Found ${pageJobUrls.length} job URLs on page ${page}`);
        
        jobUrls.push(...pageJobUrls);
        
        // Stop if we have enough URLs or no more results
        if (jobUrls.length >= maxJobs || pageJobUrls.length === 0) {
          break;
        }

        // Add delay between pages if fetching multiple
        if (page < pagesToFetch && pageJobUrls.length > 0) {
          await smartPageDelay(); // 3-6 seconds with jitter
        }
      } catch (error) {
        console.error(`❌ Error fetching page ${page}:`, error);
        result.errors.push(`Failed to fetch page ${page}`);
        break;
      }
    }

    console.log(`\n✅ Total URLs collected: ${jobUrls.length}`);

    if (jobUrls.length === 0) {
      result.errors.push('No job URLs found in search results');
      return result;
    }

    // Step 5: Scrape individual job pages (up to maxJobs)
    const urlsToScrape = jobUrls.slice(0, maxJobs);
    
    for (let i = 0; i < urlsToScrape.length; i++) {
      const jobUrl = urlsToScrape[i];
      console.log(`\n📋 [${i + 1}/${urlsToScrape.length}] Scraping: ${jobUrl}`);

      try {
        // Fetch job page HTML
        const jobHtml = await solveCloudflare(jobUrl, sessionId, 60000);

        // Parse job details
        const jobDetails = parseJobHTML(jobHtml);

        // Extract Upwork Job ID from URL
        const jobIdMatch = jobUrl.match(/~(\w+)/);
        const upwork_job_id = jobIdMatch ? jobIdMatch[1] : jobUrl.split('/').pop() || 'unknown';

        // Insert into database (matching schema: budget and client as JSONB)
        const { error: insertError } = await supabaseAdmin
          .from('jobs_raw')
          .insert({
            upwork_job_id: upwork_job_id,
            url: jobUrl,
            title: jobDetails.title,
            description: jobDetails.description,
            budget: jobDetails.budget || null,
            job_type: jobDetails.job_type,
            experience_level: jobDetails.experience_level,
            skills: jobDetails.skills,
            connects_required: jobDetails.connects_required,
            client: jobDetails.client || null,
            client_country: jobDetails.client?.country || null,
            client_spend: jobDetails.client?.total_spent || null,
            client_hire_rate: jobDetails.client?.hire_rate || null,
            posted_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          console.error(`❌ Database insert failed:`, insertError.message);
          result.errors.push(`Failed to insert ${jobUrl}: ${insertError.message}`);
          continue;
        }

        console.log(`✅ Job saved to database`);
        result.jobsScraped++;

        // Add random delay between requests (10-20 seconds with jitter)
        if (i < urlsToScrape.length - 1) {
          await randomDelay(10000, 20000);
        }

      } catch (jobError) {
        const errorMsg = jobError instanceof Error ? jobError.message : 'Unknown error';
        console.error(`❌ Failed to scrape ${jobUrl}:`, errorMsg);
        result.errors.push(`Failed to scrape ${jobUrl}: ${errorMsg}`);
        continue;
      }
    }

    // Set success if at least one job was scraped
    result.success = result.jobsScraped > 0;

    console.log(`\n🎉 Scraping complete! Scraped ${result.jobsScraped}/${urlsToScrape.length} jobs`);

    return result;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Scraper failed:`, errorMsg);
    result.errors.push(errorMsg);
    return result;

  } finally {
    // Clean up session
    if (sessionId) {
      await destroySession(sessionId);
    }
  }
}

/**
 * Scrape specific job URLs (for testing or targeted scraping)
 * @param jobUrls - Array of Upwork job URLs
 * @returns Scrape result
 */
export async function scrapeSpecificJobs(jobUrls: string[]): Promise<ScrapeResult> {
  console.log(`🔍 Scraping ${jobUrls.length} specific job URLs`);
  
  const result: ScrapeResult = {
    success: false,
    jobsScraped: 0,
    errors: [],
  };

  let sessionId: string | undefined;

  try {
    sessionId = `upwork-${Date.now()}`;
    await createSession(sessionId);

    for (let i = 0; i < jobUrls.length; i++) {
      const jobUrl = jobUrls[i];
      console.log(`\n📋 [${i + 1}/${jobUrls.length}] Scraping: ${jobUrl}`);

      try {
        const jobHtml = await solveCloudflare(jobUrl, sessionId, 60000);
        const jobDetails = parseJobHTML(jobHtml);

        // Extract Upwork Job ID from URL
        const jobIdMatch = jobUrl.match(/~(\w+)/);
        const upwork_job_id = jobIdMatch ? jobIdMatch[1] : jobUrl.split('/').pop() || 'unknown';

        // Insert into database (matching schema: budget and client as JSONB)
        const { error: insertError } = await supabaseAdmin
          .from('jobs_raw')
          .insert({
            upwork_job_id: upwork_job_id,
            url: jobUrl,
            title: jobDetails.title,
            description: jobDetails.description,
            budget: jobDetails.budget || null,
            job_type: jobDetails.job_type,
            experience_level: jobDetails.experience_level,
            skills: jobDetails.skills,
            connects_required: jobDetails.connects_required,
            client: jobDetails.client || null,
            client_country: jobDetails.client?.country || null,
            client_spend: jobDetails.client?.total_spent || null,
            client_hire_rate: jobDetails.client?.hire_rate || null,
            posted_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          console.error(`❌ Database insert failed:`, insertError.message);
          result.errors.push(`Failed to insert ${jobUrl}: ${insertError.message}`);
          continue;
        }

        console.log(`✅ Job saved to database`);
        result.jobsScraped++;

        // Add random delay between requests (10-20 seconds with jitter)
        if (i < jobUrls.length - 1) {
          await randomDelay(10000, 20000);
        }

      } catch (jobError) {
        const errorMsg = jobError instanceof Error ? jobError.message : 'Unknown error';
        console.error(`❌ Failed to scrape ${jobUrl}:`, errorMsg);
        result.errors.push(`Failed to scrape ${jobUrl}: ${errorMsg}`);
        continue;
      }
    }

    result.success = result.jobsScraped > 0;
    console.log(`\n🎉 Scraping complete! Scraped ${result.jobsScraped}/${jobUrls.length} jobs`);

    return result;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Scraper failed:`, errorMsg);
    result.errors.push(errorMsg);
    return result;

  } finally {
    if (sessionId) {
      await destroySession(sessionId);
    }
  }
}


