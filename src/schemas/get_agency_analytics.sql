CREATE OR REPLACE FUNCTION get_agency_analytics(p_agency_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
  total_projects INT;
  total_potential_revenue NUMERIC;
  total_actual_revenue NUMERIC;
  projects_with_payments INT;
  avg_rating NUMERIC;
  happy_clients INT;
  monthly_data JSONB;
  project_types_data JSONB;
BEGIN
  -- Single query for project stats (uses idx_project_agency_id)
  SELECT 
    COUNT(*),
    COALESCE(SUM(project_price), 0)
  INTO total_projects, total_potential_revenue
  FROM project 
  WHERE agency_id = p_agency_id 
    AND is_archived = false;

  -- Single query for revenue stats (uses idx_milestones_payment_cleared)
  SELECT 
    COALESCE(SUM(milestone_price), 0),
    COUNT(DISTINCT project_id)
  INTO total_actual_revenue, projects_with_payments
  FROM milestones 
  WHERE is_payment_cleared = true
    AND project_id IN (SELECT id FROM project WHERE agency_id = p_agency_id AND is_archived = false);

  -- Single query for rating stats (uses idx_reviews_project_id)
  SELECT 
    COALESCE(ROUND(AVG(stars)::NUMERIC, 1), 0),
    COUNT(DISTINCT project_id) FILTER (WHERE stars >= 4)
  INTO avg_rating, happy_clients
  FROM reviews 
  WHERE project_id IN (SELECT id FROM project WHERE agency_id = p_agency_id AND is_archived = false);

  -- Get monthly performance data (last 6 months)
  WITH monthly_stats AS (
    SELECT 
      DATE_TRUNC('month', p.created_at) AS month,
      COUNT(p.id) AS projects,
      COALESCE(SUM(m.milestone_price), 0) AS revenue,
      COALESCE(ROUND(AVG(r.stars)::NUMERIC, 1), 0) AS avg_rating
    FROM project p
    LEFT JOIN milestones m ON p.id = m.project_id AND m.is_payment_cleared = true
    LEFT JOIN reviews r ON p.id = r.project_id
    WHERE p.agency_id = p_agency_id 
      AND p.is_archived = false
      AND p.created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
    GROUP BY DATE_TRUNC('month', p.created_at)
  ),
  all_months AS (
    SELECT DATE_TRUNC('month', generate_series) AS month
    FROM generate_series(
      DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months',
      DATE_TRUNC('month', CURRENT_DATE),
      '1 month'
    ) AS generate_series
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'month', TO_CHAR(am.month, 'YYYY-MM'),
      'projects', COALESCE(ms.projects, 0),
      'revenue', COALESCE(ms.revenue, 0),
      'avg_rating', COALESCE(ms.avg_rating, 0)
    )
    ORDER BY am.month DESC
  )
  INTO monthly_data
  FROM all_months am
  LEFT JOIN monthly_stats ms ON am.month = ms.month;

  -- Get project types distribution 
  WITH project_categories AS (
    SELECT 
      COALESCE(NULLIF(TRIM(type), ''), 'Other') AS project_type,
      COUNT(*) AS count,
      ROUND((COUNT(*) * 100.0 / total_projects), 2) AS percentage
    FROM project 
    WHERE agency_id = p_agency_id 
      AND is_archived = false
    GROUP BY COALESCE(NULLIF(TRIM(type), ''), 'Other')
  )
  SELECT jsonb_object_agg(
    project_type,
    jsonb_build_object(
      'count', count,
      'percentage', percentage
    )
  )
  INTO project_types_data
  FROM project_categories
  WHERE count > 0;

  -- If no project types found, return empty object
  IF project_types_data IS NULL THEN
    project_types_data := '{}'::jsonb;
  END IF;

  -- Build result
  SELECT jsonb_build_object(
    'total_projects', total_projects,
    'revenue_metrics', jsonb_build_object(
      'total_actual_revenue', total_actual_revenue,
      'total_potential_revenue', total_potential_revenue,
      'projects_with_cleared_payments', projects_with_payments,
      'avg_revenue_per_project', 
        CASE 
          WHEN projects_with_payments > 0 
          THEN ROUND(total_actual_revenue / projects_with_payments, 2)
          ELSE 0 
        END
    ),
    'avg_rating', avg_rating,
    'happy_clients', happy_clients,
    'monthly_performance', COALESCE(monthly_data, '[]'::jsonb),
    'project_types', project_types_data
  ) INTO result;

  RETURN result;
END;
$$;