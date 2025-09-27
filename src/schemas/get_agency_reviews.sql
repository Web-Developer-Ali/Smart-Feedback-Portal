CREATE OR REPLACE FUNCTION get_agency_reviews(
  p_agency_id UUID,
  p_rating_filter INTEGER DEFAULT NULL,
  p_page_number INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  total_count INTEGER := 0;
  filtered_count INTEGER := 0;
  avg_rating NUMERIC := 0;
  five_stars INTEGER := 0;
  this_month INTEGER := 0;
  reviews_json JSON;
BEGIN
  -- Get total counts and stats
  SELECT 
    COUNT(*) AS total_reviews,
    ROUND(COALESCE(AVG(r.stars),0)::NUMERIC,1) AS avg_rating,
    COUNT(*) FILTER (WHERE r.stars = 5) AS five_stars,
    COUNT(*) FILTER (
      WHERE r.created_at >= date_trunc('month', CURRENT_DATE)
        AND r.created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
    ) AS this_month
  INTO total_count, avg_rating, five_stars, this_month
  FROM reviews r
  JOIN project p ON r.project_id = p.id
  WHERE p.agency_id = p_agency_id;

  -- Get filtered count
  SELECT COUNT(*)
  INTO filtered_count
  FROM reviews r
  JOIN project p ON r.project_id = p.id
  WHERE p.agency_id = p_agency_id
    AND (p_rating_filter IS NULL OR r.stars = p_rating_filter);

  -- Get paginated reviews
  SELECT COALESCE(json_agg(to_json(review_data)), '[]'::json)
  INTO reviews_json
  FROM (
    SELECT 
      r.id,
      r.stars,
      r.review,
      r.created_at,
      r.milestone_id,
      p.name AS project_name,
      p.type AS project_type,
      p.client_name
    FROM reviews r
    JOIN project p ON r.project_id = p.id
    WHERE p.agency_id = p_agency_id
      AND (p_rating_filter IS NULL OR r.stars = p_rating_filter)
    ORDER BY r.created_at DESC
    OFFSET (p_page_number - 1) * p_page_size
    LIMIT p_page_size
  ) AS review_data;

  -- Build the final result
  SELECT json_build_object(
    'reviews', reviews_json,
    'pagination', json_build_object(
      'current_page', p_page_number,
      'total_pages', CASE WHEN p_page_size > 0 THEN CEIL(filtered_count::FLOAT / p_page_size) ELSE 1 END,
      'total_reviews', filtered_count,
      'has_next', p_page_number * p_page_size < filtered_count,
      'has_prev', p_page_number > 1
    ),
    'stats', json_build_object(
      'total', total_count,
      'averageRating', avg_rating,
      'fiveStars', five_stars,
      'thisMonth', this_month
    )
  )
  INTO result;

  RETURN result;
END;
$$;