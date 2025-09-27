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
  -- Fetch and lock milestone + validate project
  SELECT p.project_price
  INTO v_current_project_price
  FROM project p
  WHERE p.id = p_project_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  PERFORM 1 FROM milestones 
  WHERE id = p_milestone_id AND project_id = p_project_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Milestone % not found in project %', p_milestone_id, p_project_id;
  END IF;

  -- Check free revisions
  v_has_free_revisions := (p_current_used_revisions < p_free_revisions);

  -- Apply charge if no free revisions left
  IF NOT v_has_free_revisions AND p_revision_rate > 0 THEN
    v_revision_charge := p_revision_rate;
    v_new_milestone_price := p_current_milestone_price + v_revision_charge;
    v_new_project_price := v_current_project_price + v_revision_charge;
  ELSE
    v_new_milestone_price := p_current_milestone_price;
    v_new_project_price := v_current_project_price;
  END IF;

  -- Update milestone
  UPDATE milestones 
  SET 
    status = 'rejected',
    used_revisions = p_current_used_revisions + 1,
    milestone_price = v_new_milestone_price,
    updated_at = NOW()
  WHERE id = p_milestone_id;

  -- Update project if needed
  IF v_revision_charge > 0 THEN
    UPDATE project 
    SET project_price = v_new_project_price,
        updated_at = NOW()
    WHERE id = p_project_id;
  END IF;

  -- Insert rejection message
  INSERT INTO messages (type, content, project_id, milestone_id)
  VALUES ('rejection', p_revision_notes, p_project_id, p_milestone_id);

  -- Return final values
  RETURN QUERY SELECT 
    v_has_free_revisions,
    v_revision_charge,
    v_new_milestone_price,
    v_new_project_price;
END;
$$;
