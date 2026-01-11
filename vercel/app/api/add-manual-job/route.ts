import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Delete old manual test job if exists
    await supabaseAdmin
      .from('jobs_raw')
      .delete()
      .eq('upwork_job_id', 'manual_test_001');

    // Insert complete job with all fields
    const { data: manualJob, error } = await supabaseAdmin
      .from('jobs_raw')
      .insert({
        upwork_job_id: 'manual_test_001',
        url: 'https://www.upwork.com/jobs/manual-test-job',
        title: 'Senior Full-Stack Developer - Next.js & React (Long-term SaaS Project)',
        description: `We are a fast-growing SaaS startup looking for an experienced Full-Stack Developer to join our team for a long-term engagement. This is an exciting opportunity to work on a modern tech stack and contribute to a product used by thousands of users.

**Required Skills:**
- 5+ years of professional experience with React and Next.js
- Strong expertise in TypeScript
- Experience with Node.js backend development
- Proficiency with PostgreSQL and Prisma ORM
- Experience with RESTful APIs and GraphQL
- Familiarity with AWS (EC2, S3, RDS)
- Understanding of modern CI/CD practices and Git workflows

**Responsibilities:**
- Design and implement new features for our web application
- Build responsive, performant UI components
- Write clean, maintainable, and well-tested code
- Collaborate with product managers and designers
- Optimize application performance and scalability
- Participate in code reviews and architecture discussions
- Mentor junior developers on the team

**Nice to Have:**
- Experience with Docker and Kubernetes
- Knowledge of microservices architecture
- Background in Tailwind CSS and modern design systems
- Experience with automated testing (Jest, Cypress)
- Previous SaaS product experience

**Project Details:**
This is a long-term contract position with potential to convert to full-time. We work in 2-week sprints with daily standups. The role requires strong communication skills and the ability to work independently.

Our tech stack: Next.js 14, React 18, TypeScript, Node.js, PostgreSQL, Prisma, AWS, Docker, GitHub Actions.

We value code quality, documentation, and collaborative problem-solving. If you're passionate about building great products and working with cutting-edge technologies, we'd love to hear from you!`,
        budget: {
          type: 'hourly',
          hourly_min: 60,
          hourly_max: 90
        },
        job_type: 'Contract to hire',
        experience_level: 'Expert',
        skills: [
          'Next.js',
          'React',
          'TypeScript',
          'Node.js',
          'PostgreSQL',
          'Prisma',
          'AWS',
          'GraphQL',
          'Docker',
          'Git',
          'RESTful API',
          'Tailwind CSS',
          'Jest',
          'CI/CD'
        ],
        connects_required: 16,
        client: {
          name: 'TechStartup Solutions Inc',
          country: 'United States',
          total_spent: 75000,
          hire_rate: 92,
          jobs_posted: 18,
          verified: true
        },
        client_country: 'United States',
        client_spend: 75000,
        client_hire_rate: 92,
        posted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '✅ Manual test job added successfully! Ready for AI processing.',
      job: {
        id: manualJob.id,
        title: manualJob.title,
        skills: manualJob.skills,
        budget: manualJob.budget,
      },
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}