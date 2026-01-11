import { supabaseAdmin } from '@/lib/supabase/admin';

// Jina AI Configuration (FREE - 1M tokens/month)
const JINA_API_KEY = process.env.JINA_API_KEY;

/**
 * Generate embedding using Jina AI Reader API (FREE & RELIABLE)
 * Uses direct fetch with correct endpoint
 * @param text - Text to generate embedding for
 * @returns 768-dimensional embedding vector  
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!JINA_API_KEY) {
    throw new Error('JINA_API_KEY environment variable is not set');
  }

  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🚀 Generating embedding via Jina AI (attempt ${attempt}/${maxRetries})...`);
      
      // Use Jina AI Embeddings endpoint with fetch (following official docs)
      const response = await fetch('https://api.jina.ai/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JINA_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'jina-embeddings-v3',
          task: 'text-matching', // Required for Jina v3
          dimensions: 768, // Specify dimensions for v3 (supports 256-1024)
          input: [text], // Must be array as per Jina docs
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Jina AI API error (${response.status}): ${errorText}`);
        
        // Handle rate limiting
        if (response.status === 429 && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 5000;
          console.log(`⏳ Rate limited, waiting ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        
        // Retry on server errors
        if (response.status >= 500 && attempt < maxRetries) {
          console.log(`⏳ Server error, retrying in 5s...`);
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
        
        throw new Error(`Jina AI API returned ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      // Extract embedding from response
      // Jina API format: { data: [{ embedding: [...] }] }
      if (!result.data || !Array.isArray(result.data) || !result.data[0]) {
        console.error('Invalid response structure:', JSON.stringify(result).substring(0, 200));
        throw new Error('Invalid response format from Jina AI');
      }
      
      const embedding = result.data[0].embedding;
      
      if (!Array.isArray(embedding)) {
        throw new Error('Embedding is not an array');
      }

      // Verify dimension
      if (embedding.length !== 768) {
        throw new Error(`Expected 768 dimensions, got ${embedding.length}`);
    }

      console.log(`✅ Embedding generated successfully (${embedding.length} dimensions)`);

    return embedding;

    } catch (error: any) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message || error);
      
      if (attempt === maxRetries) {
        console.error('❌ Jina AI embedding generation failed after all retries');
    throw error;
  }
      
      // Exponential backoff for retries
      const delay = Math.pow(2, attempt) * 2000;
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  throw new Error('Failed to generate embedding after all retries');
}

// Generate embedding for user skills (cached)
let cachedUserSkillsEmbedding: number[] | null = null;

export async function generateUserSkillsEmbedding(): Promise<number[]> {
  // Return cached version if available
  if (cachedUserSkillsEmbedding) {
    console.log('Using cached user skills embedding');
    return cachedUserSkillsEmbedding;
  }

  // Query user preferences
  const { data: prefs, error } = await supabaseAdmin
    .from('user_preferences')
    .select('skills')
    .single();

  if (error || !prefs || !prefs.skills.length) {
    throw new Error('User preferences not set. Please configure your skills in the database.');
  }

  // Convert skills array to text
  const skillsText = prefs.skills.join(', ');
  console.log('Generating embedding for user skills:', skillsText);

  // Generate embedding
  cachedUserSkillsEmbedding = await generateEmbedding(skillsText);
  
  return cachedUserSkillsEmbedding;
}

// Clear cache (useful for testing)
export function clearUserSkillsCache() {
  cachedUserSkillsEmbedding = null;
}
