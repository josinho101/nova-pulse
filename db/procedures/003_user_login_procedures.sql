CREATE FUNCTION sp_find_user_login_by_username(p_username TEXT)
RETURNS SETOF user_login
LANGUAGE sql
AS $$
  SELECT * FROM user_login WHERE username = p_username AND status = 1;
$$;

CREATE FUNCTION sp_get_user_login_by_user(p_user_id UUID)
RETURNS SETOF user_login
LANGUAGE sql
AS $$
  SELECT * FROM user_login WHERE user_id = p_user_id AND status = 1;
$$;

CREATE FUNCTION sp_create_user_login(
  p_user_id UUID,
  p_username TEXT,
  p_password_hash TEXT,
  p_force_password_change BOOLEAN DEFAULT false,
  p_created_by TEXT DEFAULT 'system'
)
RETURNS SETOF user_login
LANGUAGE sql
AS $$
  INSERT INTO user_login (user_id, username, password_hash, force_password_change, created_by, updated_by)
  VALUES (p_user_id, p_username, p_password_hash, p_force_password_change, p_created_by, p_created_by)
  RETURNING *;
$$;

CREATE FUNCTION sp_update_user_login(
  p_id UUID,
  p_username TEXT,
  p_password_hash TEXT,
  p_force_password_change BOOLEAN,
  p_updated_by TEXT DEFAULT 'system'
)
RETURNS SETOF user_login
LANGUAGE sql
AS $$
  UPDATE user_login
  SET username = p_username,
      password_hash = COALESCE(p_password_hash, password_hash),
      force_password_change = p_force_password_change,
      updated_by = p_updated_by,
      updated_at = now()
  WHERE id = p_id AND status = 1
  RETURNING *;
$$;

CREATE FUNCTION sp_set_user_login_status(
  p_id UUID,
  p_status SMALLINT,
  p_updated_by TEXT DEFAULT 'system'
)
RETURNS SETOF user_login
LANGUAGE sql
AS $$
  UPDATE user_login
  SET status = p_status,
      updated_by = p_updated_by,
      updated_at = now()
  WHERE id = p_id
  RETURNING *;
$$;

CREATE FUNCTION sp_delete_user_login_by_user(p_user_id UUID, p_updated_by TEXT DEFAULT 'system')
RETURNS SETOF user_login
LANGUAGE sql
AS $$
  UPDATE user_login
  SET status = 2,
      updated_by = p_updated_by,
      updated_at = now()
  WHERE user_id = p_user_id AND status = 1
  RETURNING *;
$$;
