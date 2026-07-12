CREATE FUNCTION sp_list_user_types()
RETURNS SETOF user_types
LANGUAGE sql
AS $$
  SELECT * FROM user_types WHERE status = 1 AND id <> 0 ORDER BY id;
$$;

CREATE FUNCTION sp_get_user_type(p_id INT)
RETURNS SETOF user_types
LANGUAGE sql
AS $$
  SELECT * FROM user_types WHERE id = p_id AND status = 1 AND id <> 0;
$$;

CREATE FUNCTION sp_find_user_type_by_name(p_name TEXT, p_exclude_id INT DEFAULT NULL)
RETURNS SETOF user_types
LANGUAGE sql
AS $$
  SELECT * FROM user_types
  WHERE status = 1
    AND id <> 0
    AND name = p_name
    AND (p_exclude_id IS NULL OR id <> p_exclude_id);
$$;

CREATE FUNCTION sp_create_user_type(p_name TEXT, p_created_by UUID)
RETURNS SETOF user_types
LANGUAGE sql
AS $$
  INSERT INTO user_types (name, created_by, updated_by)
  VALUES (p_name, p_created_by, p_created_by)
  RETURNING *;
$$;

CREATE FUNCTION sp_update_user_type(p_id INT, p_name TEXT, p_updated_by UUID)
RETURNS SETOF user_types
LANGUAGE sql
AS $$
  UPDATE user_types
  SET name = p_name,
      updated_by = p_updated_by,
      updated_at = now()
  WHERE id = p_id AND status = 1
  RETURNING *;
$$;

CREATE FUNCTION sp_delete_user_type(p_id INT, p_updated_by UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE type_id = p_id AND status = 1) THEN
    RAISE EXCEPTION 'UserType % is referenced by one or more active users', p_id
      USING ERRCODE = 'NP001';
  END IF;

  UPDATE user_types
  SET status = 2,
      updated_by = p_updated_by,
      updated_at = now()
  WHERE id = p_id AND status = 1;
END;
$$;

CREATE FUNCTION sp_set_user_type_actor(p_id INT, p_actor UUID)
RETURNS SETOF user_types
LANGUAGE sql
AS $$
  UPDATE user_types
  SET created_by = p_actor,
      updated_by = p_actor
  WHERE id = p_id
  RETURNING *;
$$;
