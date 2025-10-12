CREATE OR REPLACE FUNCTION get_complete_user_stats(p_agency_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
    current_month_start DATE := date_trunc('month', CURRENT_DATE);
    last_month_start DATE := date_trunc('month', CURRENT_DATE - INTERVAL '1 month');
BEGIN
    WITH 
    -- Project counts (simple aggregate)
    project_counts AS (
        SELECT 
            COUNT(*) AS total_projects,
            COUNT(*) FILTER (WHERE status IN ('completed', 'approved')) AS completed_projects,
            COUNT(*) FILTER (WHERE created_at >= current_month_start) AS current_month_projects,
            COUNT(*) FILTER (WHERE created_at >= last_month_start AND created_at < current_month_start) AS last_month_projects
        FROM project 
        WHERE agency_id = p_agency_id
    ),
    -- Review counts (separate query)
    review_counts AS (
        SELECT 
            COUNT(*) AS total_reviews,
            COALESCE(AVG(stars), 0) AS avg_rating,
            COUNT(*) FILTER (WHERE stars >= 4) AS happy_reviews
        FROM reviews r
        INNER JOIN project p ON p.id = r.project_id
        WHERE p.agency_id = p_agency_id
    ),
    -- Recent projects with proper grouping
    recent_projects_data AS (
        SELECT json_agg(
            json_build_object(
                'id', p.id,
                'name', p.name,
                'created_at', p.created_at,
                'status', p.status,
                'type', p.type,
                'price', p.project_price,
                'duration', p.project_duration_days,
                'total_reviews', COALESCE(rc.review_count, 0),
                'avg_rating', ROUND(COALESCE(rc.avg_stars, 0)::numeric, 1)
            )
        ) AS projects_json
        FROM (
            SELECT 
                p.id,
                p.name,
                p.created_at,
                p.status,
                p.type,
                p.project_price,
                p.project_duration_days
            FROM project p
            WHERE p.agency_id = p_agency_id
            ORDER BY p.created_at DESC
            LIMIT 3
        ) p
        LEFT JOIN LATERAL (
            SELECT 
                COUNT(*) AS review_count,
                AVG(stars) AS avg_stars
            FROM reviews r 
            WHERE r.project_id = p.id
        ) rc ON true
    )
    SELECT json_build_object(
        'total_projects', pc.total_projects,
        'total_reviews', COALESCE(rc.total_reviews, 0),
        'avg_rating', ROUND(COALESCE(rc.avg_rating, 0)::numeric, 1),
        'growth_this_month', 
            CASE 
                WHEN pc.last_month_projects = 0 
                    THEN CASE WHEN pc.current_month_projects > 0 THEN 100.0 ELSE 0.0 END
                ELSE ROUND(
                    ((pc.current_month_projects - pc.last_month_projects) * 100.0) / 
                    GREATEST(pc.last_month_projects, 1), 1
                )
            END,
        'completion_rate',
            CASE 
                WHEN pc.total_projects = 0 THEN 0
                ELSE LEAST(ROUND(
                    (pc.completed_projects::numeric / pc.total_projects) * 100, 1
                ), 100.0)
            END,
        'client_satisfaction',
            CASE 
                WHEN COALESCE(rc.total_reviews, 0) = 0 THEN 0
                ELSE ROUND(
                    (rc.happy_reviews::numeric / GREATEST(rc.total_reviews, 1)) * 100, 1
                )
            END,
        'recent_projects', COALESCE(rpd.projects_json, '[]'::json)
    )
    INTO result
    FROM project_counts pc
    CROSS JOIN review_counts rc
    CROSS JOIN recent_projects_data rpd;

    RETURN result;
END;
$$;