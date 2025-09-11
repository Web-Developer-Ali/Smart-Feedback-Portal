// app/api/dashboard/reviews/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Review, ReviewsResponse, ReviewStats, SupabaseReview } from "@/types/dashboard";

// Query validation schema
const querySchema = z.object({
  statsOnly: z.enum(['true', 'false']).optional().default('false'),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  rating: z.string().optional(),
});

// Cache for statistics (5 minutes)
const statsCache = new Map<string, { data: ReviewStats; timestamp: number }>();
const STATS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  const supabase = createClient();
  
  try {
    const { searchParams } = new URL(request.url);
    const statsOnly = searchParams.get('statsOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const ratingFilter = searchParams.get('rating');

    // Validate query params
    const validated = querySchema.safeParse({
      statsOnly: statsOnly ? 'true' : 'false',
      page: page.toString(),
      limit: limit.toString(),
      rating: ratingFilter,
    });

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get review statistics (with caching)
    const cacheKey = `stats-${user.id}`;
    const cachedStats = statsCache.get(cacheKey);
    
    let stats: ReviewStats;
    if (cachedStats && Date.now() - cachedStats.timestamp < STATS_CACHE_TTL) {
      stats = cachedStats.data;
    } else {
      stats = await getReviewStats(supabase, user.id);
      statsCache.set(cacheKey, { data: stats, timestamp: Date.now() });
    }

    if (statsOnly) {
      return NextResponse.json({ stats });
    }

    // Get detailed reviews with pagination and filtering
    const { reviews, totalCount } = await getReviewDetails(
      supabase, 
      user.id, 
      page, 
      limit,
      ratingFilter
    );

    const totalPages = Math.ceil(totalCount / limit);

    const response: ReviewsResponse = {
      stats,
      reviews,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_reviews: totalCount,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });

  } catch (error: unknown) {
    console.error('Reviews API Error:', error);
    
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// Get review statistics (optimized with single query)
async function getReviewStats(supabase: ReturnType<typeof createClient>, userId: string): Promise<ReviewStats> {
  // Get current month start and end dates
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  // Single optimized query for all statistics
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      stars,
      created_at,
      project:project_id (
        agency_id
      )
    `)
    .eq('project.agency_id', userId);

  if (error) {
    console.error('Error fetching reviews for stats:', error);
    throw new Error('Failed to fetch review statistics');
  }

  if (!data || data.length === 0) {
    return {
      total: 0,
      averageRating: '0.0',
      fiveStars: 0,
      thisMonth: 0,
    };
  }

  // Calculate statistics in a single pass
  let totalStars = 0;
  let fiveStars = 0;
  let thisMonth = 0;

  data.forEach((review: any) => {
    totalStars += review.stars;
    if (review.stars === 5) fiveStars++;
    
    const reviewDate = new Date(review.created_at);
    if (reviewDate >= new Date(monthStart) && reviewDate <= new Date(monthEnd)) {
      thisMonth++;
    }
  });

  const total = data.length;
  const averageRating = total > 0 ? (totalStars / total).toFixed(1) : '0.0';

  return {
    total,
    averageRating,
    fiveStars,
    thisMonth,
  };
}

// Get detailed reviews with pagination and filtering
async function getReviewDetails(
  supabase: ReturnType<typeof createClient>, 
  userId: string, 
  page: number, 
  limit: number,
  ratingFilter?: string | null
): Promise<{ reviews: Review[]; totalCount: number }> {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  // Build the query
  let query = supabase
    .from('reviews')
    .select(`
      id,
      stars,
      review,
      created_at,
      project:project_id (
        name,
        type,
        client_name
      )
    `, { count: 'exact' })
    .eq('project.agency_id', userId)
    .order('created_at', { ascending: false });

  // Apply rating filter only
  if (ratingFilter && ratingFilter !== 'all') {
    query = query.eq('stars', parseInt(ratingFilter));
  }

  // Execute the query
  const { data, count, error } = await query.range(start, end);

  if (error) {
    console.error('Error fetching review details:', error);
    throw new Error('Failed to fetch review details');
  }

  if (!data) {
    return { reviews: [], totalCount: 0 };
  }

  // Transform the data
  const reviewsData = data as unknown as SupabaseReview[];
  const reviews = transformReviews(reviewsData);

  return {
    reviews,
    totalCount: count || 0,
  };
}

// Helper function to transform reviews data
function transformReviews(reviewsData: SupabaseReview[]): Review[] {
  return reviewsData.map(review => ({
    id: review.id,
    stars: review.stars,
    review: review.review,
    created_at: new Date(review.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    client_name: review.project?.client_name || 'Unknown Client',
    project_name: review.project?.name || 'Unknown Project',
    project_type: review.project?.type || 'Unknown Type',
  }));
}