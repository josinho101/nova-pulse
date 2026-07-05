CREATE FUNCTION sp_list_users()
RETURNS SETOF users
LANGUAGE sql
AS $$
  SELECT * FROM users WHERE status = 1 ORDER BY id;
$$;

CREATE FUNCTION sp_get_user(p_id UUID)
RETURNS SETOF users
LANGUAGE sql
AS $$
  SELECT * FROM users WHERE id = p_id AND status = 1;
$$;

CREATE FUNCTION sp_find_user_by_email(p_email TEXT, p_exclude_id UUID DEFAULT NULL)
RETURNS SETOF users
LANGUAGE sql
AS $$
  SELECT * FROM users
  WHERE status = 1
    AND email = p_email
    AND (p_exclude_id IS NULL OR id <> p_exclude_id);
$$;

CREATE FUNCTION sp_create_user(
  p_first_name TEXT,
  p_last_name TEXT,
  p_middle_name TEXT,
  p_dob DATE,
  p_address TEXT,
  p_email TEXT,
  p_type_id INT,
  p_created_by TEXT DEFAULT 'system'
)
RETURNS SETOF users
LANGUAGE sql
AS $$
  INSERT INTO users (first_name, last_name, middle_name, dob, address, email, type_id, created_by, updated_by)
  VALUES (p_first_name, p_last_name, p_middle_name, p_dob, p_address, p_email, p_type_id, p_created_by, p_created_by)
  RETURNING *;
$$;

CREATE FUNCTION sp_update_user(
  p_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_middle_name TEXT,
  p_dob DATE,
  p_address TEXT,
  p_email TEXT,
  p_type_id INT,
  p_updated_by TEXT DEFAULT 'system'
)
RETURNS SETOF users
LANGUAGE sql
AS $$
  UPDATE users
  SET first_name = p_first_name,
      last_name = p_last_name,
      middle_name = p_middle_name,
      dob = p_dob,
      address = p_address,
      email = p_email,
      type_id = p_type_id,
      updated_by = p_updated_by,
      updated_at = now()
  WHERE id = p_id AND status = 1
  RETURNING *;
$$;

CREATE FUNCTION sp_delete_user(p_id UUID, p_updated_by TEXT DEFAULT 'system')
RETURNS SETOF users
LANGUAGE sql
AS $$
  UPDATE users
  SET status = 2,
      updated_by = p_updated_by,
      updated_at = now()
  WHERE id = p_id AND status = 1
  RETURNING *;
$$;
