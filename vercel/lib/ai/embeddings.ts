import { pipeline, env } from '@xenova/transformers';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Disable local model downloads (use cached models)
env.allowLocalModels = false;
env.allowRemoteModels = true;

// Cache the pipeline (load model once)
let embedder: any = null;

async function getEmbedder() {
  if (!embedder) {
    console.log('Loading local embedding model (first time only, ~109MB download)...');
    embedder = await pipeline('feature-extraction', 'Xenova/bge-base-en-v1.5');
    console.log('✓ Model loaded and ready!');
  }
  return embedder;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Get or load the model
    const model = await getEmbedder();
    
    // Generate embedding
    const output = await model(text, { pooling: 'mean', normalize: true });

    // Convert to regular array
    const embedding = Array.from(output.data) as number[];

    if (embedding.length !== 768) {
      console.warn(`Warning: Expected 768 dimensions, got ${embedding.length}`);
    }

    return embedding;

  } catch (error) {
    console.error('Local embedding generation error:', error);
    throw error;
  }
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