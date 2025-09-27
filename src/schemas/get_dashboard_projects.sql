CREATE OR REPLACE FUNCTION get_dashboard_projects(p_user_id UUID)
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
    COALESCE(ROUND(AVG(r.stars)::NUMERIC, 1), 0) AS average_rating,
    COUNT(r.id) AS total_reviews
  FROM project p
  LEFT JOIN reviews r 
    ON p.id = r.project_id
  WHERE p.agency_id = p_user_id  -- Use prefixed parameter
  GROUP BY p.id
  ORDER BY p.created_at DESC;
END;
$$;