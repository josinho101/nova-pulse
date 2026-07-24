CREATE FUNCTION sp_list_user_groups()
RETURNS SETOF user_groups
LANGUAGE sql
AS $$
  SELECT * FROM user_groups WHERE status = 1 ORDER BY id;
$$;

CREATE FUNCTION sp_get_user_group(p_id INT)
RETURNS SETOF user_groups
LANGUAGE sql
AS $$
  SELECT * FROM user_groups WHERE id = p_id AND status = 1;
$$;

CREATE FUNCTION sp_find_user_group_by_name(p_name TEXT, p_exclude_id INT DEFAULT NULL)
RETURNS SETOF user_groups
LANGUAGE sql
AS $$
  SELECT * FROM user_groups
  WHERE status = 1
    AND name = p_name
    AND (p_exclude_id IS NULL OR id <> p_exclude_id);
$$;

CREATE FUNCTION sp_create_user_group(p_name TEXT, p_created_by UUID)
RETURNS SETOF user_groups
LANGUAGE sql
AS $$
  INSERT INTO user_groups (name, created_by, updated_by)
  VALUES (p_name, p_created_by, p_created_by)
  RETURNING *;
$$;

CREATE FUNCTION sp_update_user_group(p_id INT, p_name TEXT, p_updated_by UUID)
RETURNS SETOF user_groups
LANGUAGE sql
AS $$
  UPDATE user_groups
  SET name = p_name,
      updated_by = p_updated_by,
      updated_at = now()
  WHERE id = p_id AND status = 1
  RETURNING *;
$$;

CREATE FUNCTION sp_delete_user_group(p_id INT, p_updated_by UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM user_group_members WHERE group_id = p_id) THEN
    RAISE EXCEPTION 'UserGroup % is referenced by one or more members', p_id
      USING ERRCODE = 'NP002';
  END IF;

  UPDATE user_groups
  SET status = 2,
      updated_by = p_updated_by,
      updated_at = now()
  WHERE id = p_id AND status = 1;
END;
$$;

CREATE FUNCTION sp_set_user_group_actor(p_id INT, p_actor UUID)
RETURNS SETOF user_groups
LANGUAGE sql
AS $$
  UPDATE user_groups
  SET created_by = p_actor,
      updated_by = p_actor
  WHERE id = p_id
  RETURNING *;
$$;
