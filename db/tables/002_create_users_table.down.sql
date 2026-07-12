ALTER TABLE user_types
  DROP CONSTRAINT IF EXISTS user_types_created_by_fkey,
  DROP CONSTRAINT IF EXISTS user_types_updated_by_fkey;

DROP TABLE IF EXISTS users;
