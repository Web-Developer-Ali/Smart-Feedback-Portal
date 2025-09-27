CREATE OR REPLACE FUNCTION get_complete_user_stats(p_agency_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
    current_month_count INTEGER := 0;
    last_month_count INTEGER := 0;
BEGIN
    -- Current month count
    SELECT COUNT(*) 
    INTO current_month_count
    FROM project p 
    WHERE p.agency_id = p_agency_id
      AND p.created_at >= date_trunc('month', CURRENT_DATE);

    -- Last month count
    SELECT COUNT(*) 
    INTO last_month_count
    FROM project p 
    WHERE p.agency_id = p_agency_id
      AND p.created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
      AND p.created_at < date_trunc('month', CURRENT_DATE);

    WITH 
    project_stats AS (
        SELECT 
            p.id,
            p.name,
            p.created_at,
            p.status,
            p.type,
            p.project_price AS price,
            p.project_duration_days AS duration,
            COUNT(r.id) AS total_reviews,
            COALESCE(AVG(r.stars), 0) AS avg_rating
        FROM project p
        LEFT JOIN reviews r ON r.project_id = p.id
        WHERE p.agency_id = p_agency_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT 3
    ),
    total_counts AS (
        SELECT 
            COUNT(DISTINCT p.id) AS total_projects,
            COUNT(r.id) AS total_reviews,
            COALESCE(AVG(r.stars), 0) AS overall_avg_rating
        FROM project p
        LEFT JOIN reviews r ON r.project_id = p.id
        WHERE p.agency_id = p_agency_id
    )
    SELECT json_build_object(
        'total_projects', tc.total_projects,
        'total_reviews', tc.total_reviews,
        'avg_rating', ROUND(tc.overall_avg_rating::numeric, 1),
        'growth_this_month', 
            CASE 
                WHEN last_month_count = 0 
                    THEN CASE WHEN current_month_count > 0 THEN 100 ELSE 0 END
                ELSE ROUND(((current_month_count - last_month_count) * 100.0) / last_month_count, 1)
            END,
        'recent_projects', (
            SELECT COALESCE(
                json_agg(
                    json_build_object(
                        'id', ps.id,
                        'name', ps.name,
                        'created_at', ps.created_at,
                        'status', ps.status,
                        'type', ps.type,
                        'price', ps.price,
                        'duration', ps.duration,
                        'total_reviews', ps.total_reviews,
                        'avg_rating', ROUND(ps.avg_rating::numeric, 1)
                    )
                ), '[]'::json
            )
            FROM project_stats ps
        )
    )
    INTO result
    FROM total_counts tc;

    RETURN result;
END;
$$;