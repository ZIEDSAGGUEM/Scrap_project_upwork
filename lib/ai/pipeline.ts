import { supabaseAdmin } from '@/lib/supabase/admin';
import { cleanJobDescription, extractSkillsFromText } from './text-cleaner';
import { generateEmbedding, generateUserSkillsEmbedding } from './embeddings';
import { cosineSimilarity } from './similarity';
import { calculateJobScore } from './scoring';
import { sendTelegramNotification } from '@/lib/notifications/telegram';

export async function processJobs() {
  console.log('Starting AI processing pipeline...');

  // Step 1: Generate user skills embedding once (cached)
  console.log('Step 1: Generating user skills embedding...');
  const userSkillsEmbedding = await generateUserSkillsEmbedding();
  console.log(`✓ User skills embedding generated (${userSkillsEmbedding.length} dimensions)`);

  // Step 2: Query jobs that need processing
  console.log('Step 2: Querying jobs to process...');
  const { data: jobs, error: queryError } = await supabaseAdmin
    .from('jobs_raw')
    .select('*')
    .not('description', 'is', null);  // Must have description (scraped)

  if (queryError) {
    console.error('Error querying jobs:', queryError);
    throw queryError;
  }

  if (!jobs || jobs.length === 0) {
    console.log('No jobs to process');
    return { processed: 0, failed: 0 };
  }

  console.log(`Found ${jobs.length} scraped jobs`);

  // Step 3: Filter out already processed jobs
  const jobIds = jobs.map(j => j.id);
  const { data: alreadyProcessed } = await supabaseAdmin
    .from('jobs_processed')
    .select('id')
    .in('id', jobIds);

  const processedIds = new Set(alreadyProcessed?.map(j => j.id) || []);
  const jobsToProcess = jobs.filter(j => !processedIds.has(j.id));

  console.log(`${jobsToProcess.length} jobs need processing (${processedIds.size} already processed)`);

  let processed = 0;
  let failed = 0;

  // Step 4: Process each job
  for (const job of jobsToProcess) {
    try {
      console.log(`\nProcessing: ${job.title} (${job.upwork_job_id})`);

      // Clean description text
      const cleanText = cleanJobDescription(job.description || '');
      console.log(`  - Cleaned text length: ${cleanText.length} chars`);

      // Extract skills from description
      const extractedSkills = extractSkillsFromText(cleanText);
      console.log(`  - Extracted skills: ${extractedSkills.join(', ')}`);

      // Generate job embedding
      console.log(`  - Generating embedding...`);
      const jobEmbedding = await generateEmbedding(cleanText);
      console.log(`  - ✓ Embedding generated (${jobEmbedding.length} dimensions)`);

      // Calculate similarity with user skills
      const similarity = cosineSimilarity(jobEmbedding, userSkillsEmbedding);
      console.log(`  - Embedding similarity: ${similarity.toFixed(2)}`);

      // Calculate all scores
      const scores = await calculateJobScore(job, similarity);
      console.log(`  - Budget: ${scores.budget_score}, Client: ${scores.client_score}, Skills: ${scores.skills_score}`);
      console.log(`  - 🎯 Final relevance score: ${scores.relevance_score}`);

      // 📱 Send Telegram notification if high score
      if (scores.relevance_score >= 65) {
        console.log('  - 📱 High score! Sending Telegram notification...');
        try {
          await sendTelegramNotification({
            title: job.title,
            url: job.url,
            budget: job.budget,
            skills: job.skills,
            client_country: job.client_country
          }, scores.relevance_score);
        } catch (notifError) {
          console.error('  - ⚠️ Notification failed (continuing):', notifError);
          // Don't stop pipeline if notification fails
        }
      }

      // Insert into jobs_processed
      const { error: insertError } = await supabaseAdmin
        .from('jobs_processed')
        .insert({
          id: job.id,  // Same UUID as jobs_raw
          clean_text: cleanText,
          extracted_skills: extractedSkills,
          metadata: {
            original_description_length: job.description?.length || 0,
            processing_timestamp: new Date().toISOString(),
            model: 'sentence-transformers/all-MiniLM-L6-v2',
          },
          embedding: jobEmbedding,
          embedding_similarity: scores.embedding_similarity,
          budget_score: scores.budget_score,
          client_score: scores.client_score,
          skills_score: scores.skills_score,
          relevance_score: scores.relevance_score,
        });

      if (insertError) {
        console.error(`  ✗ Failed to insert:`, insertError);
        failed++;
      } else {
        console.log(`  ✓ Successfully processed and saved`);
        processed++;
      }

      // Delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 sec delay

    } catch (error) {
      console.error(`Failed to process job ${job.id}:`, error);
      failed++;
    }
  }

  console.log(`\nProcessing complete: ${processed} successful, ${failed} failed`);
  return { processed, failed };
}