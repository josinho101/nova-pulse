CREATE TABLE user_group_members (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id),
  group_id INT NOT NULL REFERENCES user_groups (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users (id)
);

CREATE UNIQUE INDEX user_group_members_user_group_key
  ON user_group_members (user_id, group_id);

CREATE INDEX user_group_members_group_id_idx ON user_group_members (group_id);
CREATE INDEX user_group_members_user_id_idx ON user_group_members (user_id);
