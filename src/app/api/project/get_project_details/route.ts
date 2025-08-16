import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId parameter' },
        { status: 400 }
      );
    }

    // Validate UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        projectId
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid project ID format' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Execute all queries in parallel
    const [projectQuery, milestonesQuery, reviewsQuery] = await Promise.all([
      supabase
        .from('project')
        .select(
          'id,name,type,created_at,client_name,client_email,project_duration_days'
        )
        .eq('id', projectId)
        .single(),

      supabase
        .from('milestones')
        .select(`
          milestone_price,
          duration_days,
          free_revisions,
          title,
          description,
          status,
          revision_rate,
          used_revisions,
          id
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true }),

      supabase
        .from('reviews')
        .select('stars,review,created_at,milestone_id')
        .eq('project_id', projectId),
    ]);

    // Error handling
    if (projectQuery.error) {
      console.error('Project query error:', projectQuery.error);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (milestonesQuery.error || reviewsQuery.error) {
      console.error('Query errors:', {
        milestones: milestonesQuery.error,
        reviews: reviewsQuery.error,
      });
      return NextResponse.json(
        { error: 'Failed to fetch project data' },
        { status: 500 }
      );
    }

    // Transform reviews into map
    const reviewsByMilestone = new Map<string, any>();
    reviewsQuery.data?.forEach((review) => {
      if (review.milestone_id) {
        const existing = reviewsByMilestone.get(review.milestone_id) || [];
        reviewsByMilestone.set(review.milestone_id, [
          ...existing,
          {
            stars: review.stars,
            review: review.review,
            created_at: review.created_at,
          },
        ]);
      }
    });

    // Construct response
    const response = {
      ...projectQuery.data,
      milestones:
        milestonesQuery.data?.map((milestone) => ({
          milestone_price: milestone.milestone_price,
          duration_days: milestone.duration_days,
          free_revisions: milestone.free_revisions,
          title: milestone.title,
          description: milestone.description || '',
          status: milestone.status,
          revision_rate: milestone.revision_rate || 0,
          used_revisions: milestone.used_revisions,
          reviews: reviewsByMilestone.get(milestone.id) || [],
        })) || [],
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
