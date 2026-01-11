export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error(`Vector length mismatch: ${vecA.length} vs ${vecB.length}`);
    }
  
    // Calculate dot product and magnitudes
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
  
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }
  
    // Avoid division by zero
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }
  
    // Cosine similarity formula: dot(A,B) / (||A|| * ||B||)
    const similarity = dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
  
    // Normalize to 0-100 scale
    // Cosine similarity returns -1 to 1, but for text it's usually 0 to 1
    const normalized = Math.max(0, Math.min(1, similarity));
    
    return normalized * 100;
  }