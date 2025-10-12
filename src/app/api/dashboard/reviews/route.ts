import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { query } from "@/lib/db";
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
const statsCache = new Map<string, { data: unknown; timestamp: number }>();
const STATS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
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

    // Authenticate user using NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's profile to ensure they're an agency
    const profileResult = await query(
      'SELECT id, is_agency FROM users WHERE id = $1',
      [userId]
    );

    if (!profileResult.rows.length) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Use the user's ID as agency_id
    const agencyId = userId;

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

    // Call the PostgreSQL function (typed to ReviewsResponse so `data.reviews` is recognized)
    const { data, error } = await callRpcFunction<ReviewsResponse>('get_agency_reviews', {
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
    const transformedReviews = data.reviews?.map((review: Review) => ({
      ...review,
      created_at: new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    })) || [];

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

// Helper function to call PostgreSQL RPC functions with multiple parameters
async function callRpcFunction<T>(
  functionName: string,
  params: Record<string, unknown>
): Promise<{ data: T | null; error: unknown }> {
  try {
    // Build parameter placeholders and values array
    const paramNames = Object.keys(params);
    const paramValues = paramNames.map((key) => params[key]);
    const placeholders = paramNames.map((_, index) => `$${index + 1}`).join(", ");

    const result = await query(
      `SELECT * FROM ${functionName}(${placeholders})`,
      paramValues
    );

    if (result.rows.length > 0) {
      const functionResult = result.rows[0];

      if (functionResult[functionName]) {
        return { data: functionResult[functionName] as T, error: null };
      } else if (functionResult.json_build_object || functionResult.row_to_json) {
        return { data: functionResult as T, error: null };
      } else {
        return { data: functionResult as T, error: null };
      }
    }

    return { data: null, error: null };
  } catch (error: unknown) {
    console.error("RPC call error:", error);
    return { data: null, error };
  }
}
