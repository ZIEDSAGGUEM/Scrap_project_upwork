import * as cheerio from 'cheerio';

export interface ScrapedJobDetails {
  title: string;
  description: string;
  budget: {
    type: 'fixed' | 'hourly';
    amount?: number;
    hourly_min?: number;
    hourly_max?: number;
  } | null;
  job_type: string | null;
  experience_level: string | null;
  skills: string[];
  connects_required: number | null;
  client: {
    name?: string;
    country?: string;
    total_spent?: number;
    hire_rate?: number;
    jobs_posted?: number;
    verified?: boolean;
  };
}

export function parseJobHTML(html: string): ScrapedJobDetails {
  const $ = cheerio.load(html);

  // Extract title
  let title = '';
  const titleText = $('h1.m-0, h1.h4, h1').first().text().trim();
  if (titleText) {
    // Clean up HTML artifacts and extra spaces
    title = titleText
      .replace(/<[^>]*>/g, '') // Remove any HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Extract description from the correct selector
  let description = '';
  const descText = $('div[data-test="Description"] p.multiline-text').text().trim();
  if (descText.length > 20) {
    description = descText;
  } else {
    // Fallback: try text-body-sm or any p tag
    const fallbackText = $('div[data-test="Description"] p').text().trim();
    if (fallbackText.length > 20) {
      description = fallbackText;
    } else {
      // Last fallback: entire Description div
      const lastFallback = $('div[data-test="Description"]').text().trim().replace(/^Summary\s+/, '');
      if (lastFallback.length > 20) {
        description = lastFallback;
      }
    }
  }

  // Extract skills ONLY from the "Skills and Expertise" section
  const skills: string[] = [];
  
  // Find the skills section specifically
  const skillsSection = $('section:has(h5:contains("Skills and Expertise"))').first();
  
  if (skillsSection.length > 0) {
    // Get visible skills from badges
    skillsSection.find('.air3-badge-highlight .air3-line-clamp').each((_, el) => {
      const skill = $(el).text().trim();
      if (skill && skill.length > 0 && skill.length < 100 && !skill.includes('+') && !skill.includes('more')) {
        skills.push(skill);
      }
    });

    // Get hidden skills from popover
    skillsSection.find('.air3-popover .air3-line-clamp').each((_, el) => {
      const skill = $(el).text().trim();
      if (skill && skill.length > 0 && skill.length < 100) {
        skills.push(skill);
      }
    });
  }

  // Extract features from the features list
  let experience_level: string | null = null;
  let job_type: string | null = null;
  let budget: ScrapedJobDetails['budget'] = null;
  let duration: string | null = null;
  let projectType: string | null = null;

  $('ul.features li').each((_, li) => {
    const $li = $(li);
    const descriptionText = $li.find('.description').text().trim();
    const strongText = $li.find('strong').first().text().trim();

    // Experience Level
    if (descriptionText === 'Experience Level') {
      experience_level = strongText;
    }

    // Duration
    if (descriptionText === 'Duration') {
      duration = strongText;
    }

    // Project Type
    if (descriptionText === 'Project Type') {
      projectType = strongText;
    }

    // Job Type & Budget (Hourly)
    if (descriptionText === 'Hourly') {
      // Check if this li contains budget info (has clock-timelog icon)
      const hasBudgetIcon = $li.find('[data-cy="clock-timelog"]').length > 0;
      
      if (hasBudgetIcon) {
        job_type = 'hourly';
        
        // Extract budget range - look for all text with $ signs
        const allText = $li.text();
        const priceMatches = allText.match(/\$(\d+\.?\d*)/g);
        
        if (priceMatches && priceMatches.length >= 2) {
          const prices = priceMatches.map(p => parseFloat(p.replace('$', '')));
          budget = {
            type: 'hourly',
            hourly_min: prices[0],
            hourly_max: prices[1],
          };
        }
      } else if (strongText.includes('hrs/week') || strongText.includes('Less than') || strongText.includes('More than')) {
        // This is hourly commitment info, not budget
        job_type = 'hourly';
      }
    }

    // Fixed budget - check for various formats
    if (descriptionText === 'Fixed-price' || descriptionText === 'Fixed Price' || descriptionText === 'Budget') {
      job_type = 'fixed';
      
      // Check if this li has the fixed-price icon
      const hasFixedIcon = $li.find('[data-cy="fixed-price"]').length > 0;
      
      if (hasFixedIcon) {
        // Extract amount from the strong tag or any text with $
        const amountText = $li.find('strong').text().trim();
        const fixedMatch = amountText.match(/\$([0-9,]+(?:\.\d{2})?)/);
        if (fixedMatch) {
          budget = {
            type: 'fixed',
            amount: parseFloat(fixedMatch[1].replace(/,/g, '')),
          };
        }
      }
    }
  });

  // Extract connects required
  let connects_required: number | null = null;
  const bodyText = $('body').text();
  const connectsMatch = bodyText.match(/(\d+)\s+Connects?(?:\s+Required)?/i);
  if (connectsMatch) {
    connects_required = parseInt(connectsMatch[1]);
  }

  // Extract client info from the "About the client" section
  const client: ScrapedJobDetails['client'] = {};
  
  // Client country - extract ONLY country name, not time
  const clientLocationStrong = $('li[data-qa="client-location"] strong').first().text().trim();
  if (clientLocationStrong) {
    client.country = clientLocationStrong;
  }

  // Client total spent - use data-qa attribute
  const clientSpendElement = $('[data-qa="client-spend"]').text().trim();
  if (clientSpendElement) {
    const spendMatch = clientSpendElement.match(/\$([0-9,]+[KkMm]?)/);
    if (spendMatch) {
      let spendValue = spendMatch[1].replace(/,/g, '');
      // Handle K (thousands) and M (millions)
      if (spendValue.match(/k$/i)) {
        client.total_spent = parseFloat(spendValue) * 1000;
      } else if (spendValue.match(/m$/i)) {
        client.total_spent = parseFloat(spendValue) * 1000000;
      } else {
        client.total_spent = parseFloat(spendValue);
      }
    }
  }

  // Client hires - extract from data-qa="client-hires"
  const clientHiresText = $('[data-qa="client-hires"]').text().trim();
  const hiresMatch = clientHiresText.match(/(\d+)\s+hires?/i);
  if (hiresMatch) {
    // Store in jobs_posted since it's similar information
    client.jobs_posted = parseInt(hiresMatch[1]);
  }

  // Alternative: look for "X jobs posted" in text
  const aboutClientText = $('h5:contains("About the client")').parent().text();
  if (!client.jobs_posted) {
    const jobsPostedMatch = aboutClientText.match(/(\d+)\s+jobs?\s+posted/i);
    if (jobsPostedMatch) {
      client.jobs_posted = parseInt(jobsPostedMatch[1]);
    }
  }

  // Client hire rate (if available in text)
  const hireRateMatch = aboutClientText.match(/(\d+)%\s+hire\s+rate/i);
  if (hireRateMatch) {
    client.hire_rate = parseInt(hireRateMatch[1]);
  }

  // Payment verified
  client.verified = $('body').text().includes('Payment verified') ||
                    $('body').text().includes('Payment method verified') ||
                    $('.payment-verified, [data-test="payment-verified"]').length > 0;

  return {
    title: title || 'Untitled Job',
    description: description || 'No description available',
    budget,
    job_type,
    experience_level,
    skills: [...new Set(skills)], // Remove duplicates
    connects_required,
    client,
  };
}