-- For dashboard/projects: Get projects created by the user (agency) with average ratings and total reviews
CREATE OR REPLACE FUNCTION get_dashboard_projects(user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  status TEXT,
  client_name TEXT,
  project_price NUMERIC(12,2),
  project_duration_days INTEGER,
  created_at TIMESTAMPTZ,
  average_rating NUMERIC(3,1),
  total_reviews BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.type,
    p.status,
    p.client_name,
    p.project_price,
    p.project_duration_days,
    p.created_at,
    ROUND(AVG(r.stars)::NUMERIC, 1) as average_rating,
    COUNT(r.id) as total_reviews
  FROM project p
  LEFT JOIN reviews r ON p.id = r.project_id
  WHERE p.agency_id = user_id
  GROUP BY p.id, p.name, p.type, p.status, p.client_name, p.project_price, p.project_duration_days, p.created_at
  ORDER BY p.created_at DESC;
END;
$$;



-- end




-- For analytics: Get overall page data
CREATE OR REPLACE FUNCTION get_agency_analytics(agency_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  WITH 
  -- Total projects + growth
  project_stats AS (
    SELECT
      COUNT(*) AS total_projects,
      COUNT(*) FILTER (WHERE date_trunc('month', created_at) = date_trunc('month', now())) AS projects_this_month
    FROM project
    WHERE project.agency_id = get_agency_analytics.agency_id  -- Fixed: explicitly specify table
  ),

  -- Revenue
  revenue_stats AS (
    SELECT
      COALESCE(SUM(m.milestone_price),0) AS total_revenue
    FROM milestones m
    JOIN project p ON p.id = m.project_id
    WHERE p.agency_id = get_agency_analytics.agency_id  -- Fixed: explicitly specify table
      AND m.is_payment_cleared = true
  ),

  -- Ratings
  rating_stats AS (
    SELECT
      ROUND(AVG(r.stars)::NUMERIC,1) AS avg_rating,
      COUNT(*) FILTER (WHERE r.stars >= 4) AS happy_clients,
      COUNT(*) AS total_ratings
    FROM reviews r
    JOIN project p ON p.id = r.project_id
    WHERE p.agency_id = get_agency_analytics.agency_id  -- Fixed: explicitly specify table
  ),

  -- Rating distribution
  rating_dist AS (
    SELECT
      stars,
      COUNT(*) AS count
    FROM reviews r
    JOIN project p ON p.id = r.project_id
    WHERE p.agency_id = get_agency_analytics.agency_id  -- Fixed: explicitly specify table
    GROUP BY stars
  ),

  -- Project types last 6 months
  project_types AS (
    SELECT type, COUNT(*) AS count
    FROM project
    WHERE project.agency_id = get_agency_analytics.agency_id  -- Fixed: explicitly specify table
      AND created_at >= now() - interval '6 months'
      AND type IS NOT NULL
    GROUP BY type
  ),

  -- Monthly performance (last 6 months)
  monthly AS (
    SELECT
      to_char(date_trunc('month', p.created_at), 'YYYY-MM') AS month,
      COUNT(DISTINCT p.id) AS projects,
      COALESCE(SUM(m.milestone_price) FILTER (WHERE m.is_payment_cleared),0) AS revenue,
      ROUND(AVG(r.stars)::NUMERIC,1) AS avg_rating
    FROM project p
    LEFT JOIN milestones m ON m.project_id = p.id
    LEFT JOIN reviews r ON r.project_id = p.id
    WHERE p.agency_id = get_agency_analytics.agency_id  -- Fixed: explicitly specify table
      AND p.created_at >= now() - interval '6 months'
    GROUP BY date_trunc('month', p.created_at)
    ORDER BY month
  )

  SELECT jsonb_build_object(
    'total_projects', ps.total_projects,
    'growth_percentage', 
      CASE WHEN ps.total_projects = 0 THEN 0
           ELSE ROUND((ps.projects_this_month::NUMERIC / ps.total_projects)*100,1)
      END,
    'total_revenue', rs.total_revenue,
    'avg_rating', COALESCE(rt.avg_rating,0),
    'happy_clients', COALESCE(rt.happy_clients,0),
    'rating_distribution', (
      SELECT jsonb_object_agg(stars, jsonb_build_object('count', count, 'percentage',
        ROUND((count::NUMERIC / NULLIF(rt.total_ratings,0))*100,1)))
      FROM rating_dist
    ),
    'project_types', (SELECT COALESCE(jsonb_object_agg(type, count), '{}'::jsonb) FROM project_types),
    'monthly_performance', (SELECT COALESCE(jsonb_agg(row_to_json(monthly)), '[]'::jsonb) FROM monthly)
  )
  INTO result
  FROM project_stats ps, revenue_stats rs, rating_stats rt;

  RETURN result;
END;
$$;






-- end




-- user-stats for dashboard main page
CREATE OR REPLACE FUNCTION get_complete_user_stats(agency_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    current_month_count INTEGER;
    last_month_count INTEGER;
BEGIN
    -- Get current month count
    SELECT COUNT(*) INTO current_month_count
    FROM project
    WHERE project.agency_id = $1
    AND created_at >= date_trunc('month', CURRENT_DATE);
    
    -- Get last month count
    SELECT COUNT(*) INTO last_month_count
    FROM project
    WHERE project.agency_id = $1
    AND created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
    AND created_at < date_trunc('month', CURRENT_DATE);
    
    WITH project_stats AS (
        SELECT 
            p.id,
            p.name,
            p.created_at,
            p.status,
            p.type,
            p.project_price as price,
            p.project_duration_days as duration,
            COUNT(r.id) as total_reviews,
            COALESCE(AVG(r.stars), 0) as avg_rating
        FROM project p
        LEFT JOIN reviews r ON r.project_id = p.id
        WHERE p.agency_id = $1
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT 3
    ),
    total_counts AS (
        SELECT 
            COUNT(DISTINCT p.id) as total_projects,
            COUNT(r.id) as total_reviews,
            COALESCE(AVG(r.stars), 0) as overall_avg_rating
        FROM project p
        LEFT JOIN reviews r ON r.project_id = p.id
        WHERE p.agency_id = $1
    )
    SELECT json_build_object(
        'total_projects', (SELECT total_projects FROM total_counts),
        'total_reviews', (SELECT total_reviews FROM total_counts),
        'avg_rating', ROUND((SELECT overall_avg_rating FROM total_counts)::numeric, 1),
        'growth_this_month', CASE 
            WHEN last_month_count = 0 THEN 
                CASE WHEN current_month_count > 0 THEN 100 ELSE 0 END
            ELSE 
                ROUND((current_month_count - last_month_count) * 100.0 / last_month_count)
        END,
        'recent_projects', (SELECT COALESCE(json_agg(json_build_object(
            'id', ps.id,
            'name', ps.name,
            'created_at', ps.created_at,
            'status', ps.status,
            'type', ps.type,
            'price', ps.price,
            'duration', ps.duration,
            'total_reviews', ps.total_reviews,
            'avg_rating', ROUND(ps.avg_rating::numeric, 1)
        )), '[]'::json) FROM project_stats ps)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
