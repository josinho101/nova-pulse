CREATE TABLE user_login (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id),
  username VARCHAR NOT NULL,
  password_hash VARCHAR NOT NULL,
  force_password_change BOOLEAN NOT NULL DEFAULT false,
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(100) NOT NULL DEFAULT 'system',
  updated_by VARCHAR(100) NOT NULL DEFAULT 'system'
);

CREATE UNIQUE INDEX user_login_active_username_key
  ON user_login (username)
  WHERE status = 1;

CREATE UNIQUE INDEX user_login_active_user_id_key
  ON user_login (user_id)
  WHERE status = 1;

CREATE INDEX user_login_user_id_idx ON user_login (user_id);
