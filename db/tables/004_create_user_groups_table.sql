CREATE TABLE user_groups (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(20) NOT NULL,
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users (id),
  updated_by UUID REFERENCES users (id)
);

CREATE UNIQUE INDEX user_groups_active_name_key
  ON user_groups (name)
  WHERE status = 1;

INSERT INTO user_groups (name)
VALUES ('Admin')
ON CONFLICT DO NOTHING;
