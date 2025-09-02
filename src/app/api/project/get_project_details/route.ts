import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { Milestone, Review } from '@/types/ProjectDetailPage';

// Dynamic rendering and cache bypass
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Input validation schema
const querySchema = z.object({
  projectId: z.string().uuid({ message: 'Invalid project ID format' }),
});

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    // Validate query param
    const validated = querySchema.safeParse({ projectId });
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch project and verify ownership
    const { data: project, error: projectError } = await supabase
      .from('project')
      .select(
        'id, name, type, created_at, client_name, client_email, project_duration_days, jwt_token, agency_id'
      )
      .eq('id', validated.data.projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.agency_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to project' },
        { status: 403 }
      );
    }

    // Fetch milestones and reviews in parallel
    const [milestonesQuery, reviewsQuery] = await Promise.all([
      supabase
        .from('milestones')
        .select(
          'id, milestone_price, duration_days, free_revisions, title, description, status, revision_rate, used_revisions'
        )
        .eq('project_id', project.id)
        .order('created_at', { ascending: true }),

      supabase
        .from('reviews')
        .select('stars, review, created_at, milestone_id')
        .eq('project_id', project.id),
    ]);

    if (milestonesQuery.error || reviewsQuery.error) {
      return NextResponse.json(
        { error: 'Failed to fetch project data' },
        { status: 500 }
      );
    }

    // Map reviews to milestones
    const reviewsByMilestone = new Map<string, Review[]>();
    for (const review of reviewsQuery.data ?? []) {
      const existing = reviewsByMilestone.get(review.milestone_id) ?? [];
      reviewsByMilestone.set(review.milestone_id, [...existing, review]);
    }

    // Shape response
    const response = {
      id: project.id,
      name: project.name,
      type: project.type,
      created_at: project.created_at,
      client_name: project.client_name,
      client_email: project.client_email,
      project_duration_days: project.project_duration_days,
      jwt_token: project.jwt_token,
      milestones: (milestonesQuery.data ?? []).map((m: Milestone) => ({
        milestone_id: m.id,
        milestone_price: m.milestone_price,
        duration_days: m.duration_days,
        free_revisions: m.free_revisions,
        title: m.title,
        description: m.description ?? '',
        status: m.status,
        revision_rate: m.revision_rate ?? 0,
        used_revisions: m.used_revisions,
        reviews: reviewsByMilestone.get(m.id) ?? [],
      })),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        error: message,
        ...(process.env.NODE_ENV === 'development' &&
          error instanceof Error && { stack: error.stack }),
      },
      { status: 500 }
    );
  }
}