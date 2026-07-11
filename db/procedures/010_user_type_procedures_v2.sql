DROP FUNCTION IF EXISTS sp_list_user_types();
DROP FUNCTION IF EXISTS sp_get_user_type(INT);
DROP FUNCTION IF EXISTS sp_find_user_type_by_name(TEXT, INT);

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

CREATE FUNCTION sp_find_user_by_type(p_type_id INT)
RETURNS SETOF users
LANGUAGE sql
AS $$
  SELECT * FROM users WHERE type_id = p_type_id AND status = 1;
$$;
