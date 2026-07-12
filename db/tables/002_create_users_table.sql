CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  middle_name VARCHAR,
  dob DATE,
  address VARCHAR NOT NULL,
  email VARCHAR,
  type_id INT NOT NULL REFERENCES user_types (id),
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(100) NOT NULL DEFAULT 'system',
  updated_by VARCHAR(100) NOT NULL DEFAULT 'system'
);

CREATE UNIQUE INDEX users_active_email_key
  ON users (email)
  WHERE status = 1;

CREATE INDEX users_type_id_idx ON users (type_id);
