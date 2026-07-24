CREATE FUNCTION sp_list_user_group_members(p_group_id INT)
RETURNS SETOF user_group_members
LANGUAGE sql
AS $$
  SELECT * FROM user_group_members WHERE group_id = p_group_id ORDER BY id;
$$;

CREATE FUNCTION sp_list_groups_for_user(p_user_id UUID)
RETURNS SETOF user_group_members
LANGUAGE sql
AS $$
  SELECT * FROM user_group_members WHERE user_id = p_user_id ORDER BY id;
$$;

CREATE FUNCTION sp_add_user_to_group(p_user_id UUID, p_group_id INT, p_created_by UUID)
RETURNS SETOF user_group_members
LANGUAGE sql
AS $$
  INSERT INTO user_group_members (user_id, group_id, created_by)
  VALUES (p_user_id, p_group_id, p_created_by)
  ON CONFLICT (user_id, group_id) DO NOTHING
  RETURNING *;
$$;

CREATE FUNCTION sp_remove_user_from_group(p_user_id UUID, p_group_id INT)
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM user_group_members WHERE user_id = p_user_id AND group_id = p_group_id;
$$;
