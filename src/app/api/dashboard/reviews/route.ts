import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Review, ReviewsResponse } from "@/types/dashboard";

// Query validation schema
const querySchema = z.object({
  statsOnly: z.enum(['true', 'false']).optional().default('false'),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  rating: z.string().optional(),
});

// Cache for statistics (5 minutes)
const statsCache = new Map<string, { data:unknown; timestamp: number }>();
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

    // Get user's profile to ensure they're an agency
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    if (!profile.id) {
      return NextResponse.json(
        { error: "User is not registered as an agency" },
        { status: 403 }
      );
    }

    // Use the user's ID as agency_id
    const agencyId = user.id;

    // Check cache first for stats-only requests
    if (statsOnly) {
      const cacheKey = `stats-${agencyId}`;
      const cachedStats = statsCache.get(cacheKey);
      
      if (cachedStats && Date.now() - cachedStats.timestamp < STATS_CACHE_TTL) {
        return NextResponse.json({ stats: cachedStats.data });
      }
    }

    // Parse rating filter
    const ratingParam = ratingFilter && ratingFilter !== 'all' 
      ? parseInt(ratingFilter) 
      : null;

    // Call the PostgreSQL function
    const { data, error } = await supabase.rpc('get_agency_reviews', {
      agency_id: agencyId,
      rating_filter: ratingParam,
      page_number: page,
      page_size: limit
    });

    if (error) {
      console.error('RPC error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({
        stats: { total: 0, averageRating: '0.0', fiveStars: 0, thisMonth: 0 },
        reviews: [],
        pagination: { current_page: 1, total_pages: 0, total_reviews: 0, has_next: false, has_prev: false }
      });
    }

    // Transform dates in the response
    const transformedReviews = data.reviews.map((review:Review) => ({
      ...review,
      created_at: new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }));

    // Cache the stats for future requests
    if (data.stats) {
      const cacheKey = `stats-${agencyId}`;
      statsCache.set(cacheKey, { data: data.stats, timestamp: Date.now() });
    }

    // Prepare the response
    const response: ReviewsResponse = {
      stats: data.stats || { total: 0, averageRating: '0.0', fiveStars: 0, thisMonth: 0 },
      reviews: transformedReviews,
      pagination: data.pagination || { 
        current_page: page, 
        total_pages: 0, 
        total_reviews: 0, 
        has_next: false, 
        has_prev: false 
      }
    };

    // Return only stats if requested
    if (statsOnly) {
      return NextResponse.json({ stats: response.stats });
    }

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