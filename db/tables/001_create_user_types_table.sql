CREATE TABLE user_types (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(20) NOT NULL,
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

CREATE UNIQUE INDEX user_types_active_name_key
  ON user_types (name)
  WHERE status = 1;

INSERT INTO user_types (id, name)
OVERRIDING SYSTEM VALUE
VALUES (0, 'Super Admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_types (name)
VALUES ('Admin')
ON CONFLICT DO NOTHING;
