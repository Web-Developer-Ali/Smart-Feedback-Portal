CREATE OR REPLACE FUNCTION get_agency_analytics(p_agency_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  /*
    OPTIMIZATION STRATEGY:
    1. Avoid multiple scans of the same table — instead, aggregate once using CTEs.
    2. Use COALESCE on all aggregations to avoid nulls.
    3. Push filters into joins where possible.
    4. Keep last 6 months scope for performance in large datasets.
  */

  WITH 
  -- Aggregate project-level stats
  project_base AS (
    SELECT p.id, p.type, p.created_at, p.client_email
    FROM project p
    WHERE p.agency_id = p_agency_id
  ),

  -- Total projects + current month count
  project_stats AS (
    SELECT
      COUNT(*) AS total_projects,
      COUNT(*) FILTER (
        WHERE date_trunc('month', created_at) = date_trunc('month', now())
      ) AS projects_this_month
    FROM project_base
  ),

  -- Revenue (only cleared payments)
  revenue_stats AS (
    SELECT
      COALESCE(SUM(m.milestone_price), 0) AS total_revenue
    FROM milestones m
    JOIN project_base p ON p.id = m.project_id
    WHERE m.is_payment_cleared = true
  ),

  -- Ratings overview - FIXED: Count distinct projects for happy_clients
  rating_stats AS (
    SELECT
      COALESCE(ROUND(AVG(r.stars)::NUMERIC,1),0) AS avg_rating,
      COUNT(DISTINCT p.id) FILTER (WHERE r.stars >= 4) AS happy_clients,
      COUNT(*) AS total_ratings
    FROM reviews r
    JOIN project_base p ON p.id = r.project_id
  ),

  -- Rating distribution (per star level)
  rating_dist AS (
    SELECT
      r.stars,
      COUNT(*) AS count
    FROM reviews r
    JOIN project_base p ON p.id = r.project_id
    GROUP BY r.stars
  ),

  -- Project types (last 6 months only, with non-null type)
  project_types AS (
    SELECT 
      p.type, 
      COUNT(*) AS count
    FROM project_base p
    WHERE p.created_at >= now() - interval '6 months'
      AND p.type IS NOT NULL
    GROUP BY p.type
  ),

  -- Monthly performance (last 6 months)
  monthly AS (
    SELECT
      to_char(date_trunc('month', p.created_at), 'YYYY-MM') AS month,
      COUNT(DISTINCT p.id) AS projects,
      COALESCE(SUM(m.milestone_price) FILTER (WHERE m.is_payment_cleared),0) AS revenue,
      COALESCE(ROUND(AVG(r.stars)::NUMERIC,1), 0) AS avg_rating
    FROM project_base p
    LEFT JOIN milestones m ON m.project_id = p.id
    LEFT JOIN reviews r ON r.project_id = p.id
    WHERE p.created_at >= now() - interval '6 months'
    GROUP BY date_trunc('month', p.created_at)
    ORDER BY month
  )

  SELECT jsonb_build_object(
    'total_projects', ps.total_projects,
    'growth_percentage', 
      CASE 
        WHEN ps.total_projects = 0 THEN 0
        ELSE ROUND((ps.projects_this_month::NUMERIC / ps.total_projects) * 100, 1)
      END,
    'total_revenue', rs.total_revenue,
    'avg_rating', rt.avg_rating,
    'happy_clients', rt.happy_clients,
    'rating_distribution', (
      SELECT jsonb_object_agg(
        stars, 
        jsonb_build_object(
          'count', count, 
          'percentage', ROUND((count::NUMERIC / NULLIF(rt.total_ratings,0)) * 100, 1)
        )
      )
      FROM rating_dist
    ),
    'project_types', (
      SELECT COALESCE(jsonb_object_agg(type, count), '{}'::jsonb) 
      FROM project_types
    ),
    'monthly_performance', (
      SELECT COALESCE(jsonb_agg(row_to_json(monthly)), '[]'::jsonb) 
      FROM monthly
    )
  )
  INTO result
  FROM project_stats ps, revenue_stats rs, rating_stats rt;

  RETURN result;
END;
$$;