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





-- end








-- For dashboard/reviews: Get reviews for projects managed by the agency with filtering, sorting, and pagination
CREATE OR REPLACE FUNCTION get_agency_reviews(
  agency_id UUID,
  rating_filter INTEGER DEFAULT NULL,
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 10
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_count INTEGER;
  filtered_count INTEGER;
BEGIN
  -- Get total count of all reviews for this agency
  SELECT COUNT(*) INTO total_count
  FROM reviews r
  JOIN project p ON r.project_id = p.id
  WHERE p.agency_id = get_agency_reviews.agency_id;
  
  -- Get filtered count if rating filter is applied
  IF rating_filter IS NOT NULL THEN
    SELECT COUNT(*) INTO filtered_count
    FROM reviews r
    JOIN project p ON r.project_id = p.id
    WHERE p.agency_id = get_agency_reviews.agency_id AND r.stars = rating_filter;
  ELSE
    filtered_count := total_count;
  END IF;
  
  -- Get paginated reviews
  WITH agency_reviews AS (
    SELECT 
      r.id,
      r.stars,
      r.review,
      r.created_at,
      r.milestone_id,
      p.name as project_name,
      p.type as project_type,
      p.client_name,
      ROW_NUMBER() OVER (ORDER BY r.created_at DESC) as row_num
    FROM reviews r
    JOIN project p ON r.project_id = p.id
    WHERE p.agency_id = get_agency_reviews.agency_id
    AND (get_agency_reviews.rating_filter IS NULL OR r.stars = get_agency_reviews.rating_filter)
  )
  SELECT json_build_object(
    'reviews', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', ar.id,
        'stars', ar.stars,
        'review', ar.review,
        'created_at', ar.created_at,
        'milestone_id', ar.milestone_id,
        'project_name', ar.project_name,
        'project_type', ar.project_type,
        'client_name', ar.client_name
      )), '[]'::json)
      FROM agency_reviews ar
      WHERE ar.row_num BETWEEN (get_agency_reviews.page_number - 1) * get_agency_reviews.page_size + 1 
      AND get_agency_reviews.page_number * get_agency_reviews.page_size
    ),
    'pagination', json_build_object(
      'current_page', get_agency_reviews.page_number,
      'total_pages', CASE WHEN get_agency_reviews.page_size > 0 THEN CEIL(filtered_count::FLOAT / get_agency_reviews.page_size) ELSE 1 END,
      'total_reviews', filtered_count,
      'has_next', get_agency_reviews.page_number * get_agency_reviews.page_size < filtered_count,
      'has_prev', get_agency_reviews.page_number > 1
    ),
    'stats', (
      SELECT json_build_object(
        'total', total_count,
        'averageRating', COALESCE(ROUND(AVG(r.stars)::NUMERIC, 1), 0),
        'fiveStars', COUNT(*) FILTER (WHERE r.stars = 5),
        'thisMonth', COUNT(*) FILTER (
          WHERE r.created_at >= date_trunc('month', CURRENT_DATE)
          AND r.created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
        )
      )
      FROM reviews r
      JOIN project p ON r.project_id = p.id
      WHERE p.agency_id = get_agency_reviews.agency_id
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;







-- end





-- For project rjections
CREATE OR REPLACE FUNCTION reject_milestone_with_message(
  p_milestone_id UUID,
  p_project_id UUID,
  p_revision_notes TEXT,
  p_current_used_revisions INTEGER,
  p_free_revisions INTEGER,
  p_revision_rate NUMERIC(10,2),
  p_current_milestone_price NUMERIC(10,2)
)
RETURNS TABLE (
  has_free_revisions BOOLEAN,
  revision_charge NUMERIC(10,2),
  new_milestone_price NUMERIC(10,2),
  new_project_price NUMERIC(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_free_revisions BOOLEAN;
  v_revision_charge NUMERIC(10,2) := 0;
  v_new_milestone_price NUMERIC(10,2);
  v_new_project_price NUMERIC(10,2);
  v_current_project_price NUMERIC(12,2);
BEGIN
  -- Verify milestone belongs to project
  PERFORM 1 FROM milestones 
  WHERE id = p_milestone_id AND project_id = p_project_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Milestone not found in project';
  END IF;

  -- Get current project price
  SELECT project_price INTO v_current_project_price
  FROM project WHERE id = p_project_id;

  -- Check if free revisions are available
  v_has_free_revisions := (p_current_used_revisions < p_free_revisions);
  
  -- Calculate revision charge if no free revisions left
  IF NOT v_has_free_revisions AND p_revision_rate > 0 THEN
    v_revision_charge := p_revision_rate;
    v_new_milestone_price := p_current_milestone_price + v_revision_charge;
    v_new_project_price := v_current_project_price + v_revision_charge;
  ELSE
    v_revision_charge := 0;
    v_new_milestone_price := p_current_milestone_price;
    v_new_project_price := v_current_project_price;
  END IF;

  -- Update milestone status, revisions, and price if applicable
  UPDATE milestones 
  SET 
    status = 'rejected',
    used_revisions = p_current_used_revisions + 1,
    milestone_price = CASE 
      WHEN NOT v_has_free_revisions AND p_revision_rate > 0 
      THEN v_new_milestone_price 
      ELSE milestone_price 
    END,
    updated_at = NOW()
  WHERE id = p_milestone_id;

  -- Update project price if revision was charged
  IF v_revision_charge > 0 THEN
    UPDATE project 
    SET 
      project_price = v_new_project_price,
      updated_at = NOW()
    WHERE id = p_project_id;
  END IF;

  -- Insert rejection message
  INSERT INTO messages (type, content, project_id, milestone_id)
  VALUES ('rejection', p_revision_notes, p_project_id, p_milestone_id);

  -- Return results
  RETURN QUERY SELECT 
    v_has_free_revisions,
    v_revision_charge,
    COALESCE(v_new_milestone_price, p_current_milestone_price),
    COALESCE(v_new_project_price, v_current_project_price);
END;
$$;