CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  middle_name VARCHAR,
  dob DATE,
  address VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  type_id INT NOT NULL REFERENCES user_types (id),
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users (id),
  updated_by UUID REFERENCES users (id)
);

CREATE UNIQUE INDEX users_active_email_key
  ON users (email)
  WHERE status = 1;

CREATE INDEX users_type_id_idx ON users (type_id);

ALTER TABLE user_types
  ADD CONSTRAINT user_types_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id),
  ADD CONSTRAINT user_types_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users (id);
