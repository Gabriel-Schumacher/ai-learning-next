/**
 * Chunks text into smaller segments by paragraphs
 */
export function chunkTextByParagraphs(text: string, maxLength = 1500): string[] {
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  for (let para of paragraphs) {
    para = para.trim();
    if (!para) continue;
    
    if ((current + para).length > maxLength) {
      if (current) chunks.push(current.trim());
      
      // Handle paragraphs that are longer than maxLength
      if (para.length > maxLength) {
        // Split long paragraph by sentences
        const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
        let sentenceChunk = "";
        
        for (const sentence of sentences) {
          if ((sentenceChunk + sentence).length > maxLength) {
            if (sentenceChunk) chunks.push(sentenceChunk.trim());
            sentenceChunk = sentence;
          } else {
            sentenceChunk += " " + sentence;
          }
        }
        
        if (sentenceChunk) chunks.push(sentenceChunk.trim());
        current = "";
      } else {
        current = para;
      }
    } else {
      current += (current ? "\n" + para : para);
    }
  }

  if (current) chunks.push(current.trim());
  return chunks;
}

/**
 * Calculates cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("Vectors must be of same length");
  
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  
  return dot / (magA * magB);
}
