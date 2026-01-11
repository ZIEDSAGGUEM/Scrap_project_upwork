export function cleanJobDescription(description: string): string {
    if (!description) return '';
  
    // Remove HTML tags
    let cleaned = description.replace(/<[^>]*>/g, '');
  
    // Decode HTML entities
    cleaned = cleaned
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
  
    // Remove extra whitespace
    cleaned = cleaned
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  
    // Limit length (embedding models have token limits)
    if (cleaned.length > 5000) {
      cleaned = cleaned.substring(0, 5000) + '...';
    }
  
    return cleaned;
  }
  
  export function extractSkillsFromText(text: string): string[] {
    // Common tech skills to detect
    const skillPatterns = [
      'React', 'Next.js', 'Next', 'Node.js', 'Node', 'TypeScript', 'JavaScript', 'JS',
      'Python', 'Django', 'FastAPI', 'Flask',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQL',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
      'GraphQL', 'REST API', 'API',
      'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'SCSS', 'Sass',
      'Vue', 'Vue.js', 'Angular', 'Svelte',
      'Express', 'NestJS', 'Prisma', 'Supabase', 'Firebase',
      'Git', 'GitHub', 'GitLab', 'CI/CD',
      'TDD', 'Testing', 'Jest', 'Cypress', 'Playwright',
      'Figma', 'UI/UX', 'Design',
      'Stripe', 'Payment', 'E-commerce',
      'Vercel', 'Netlify', 'Heroku',
      'Redux', 'Zustand', 'Context API',
      'Webpack', 'Vite', 'ESBuild',
    ];
  
    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();
  
    for (const skill of skillPatterns) {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowerText)) {
        foundSkills.push(skill);
      }
    }
  
    return [...new Set(foundSkills)]; // Remove duplicates
  }