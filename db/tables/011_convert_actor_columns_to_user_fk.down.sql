ALTER TABLE user_types DROP COLUMN created_by;
ALTER TABLE user_types DROP COLUMN updated_by;
ALTER TABLE user_types ADD COLUMN created_by VARCHAR(100) NOT NULL DEFAULT 'system';
ALTER TABLE user_types ADD COLUMN updated_by VARCHAR(100) NOT NULL DEFAULT 'system';

ALTER TABLE users DROP COLUMN created_by;
ALTER TABLE users DROP COLUMN updated_by;
ALTER TABLE users ADD COLUMN created_by VARCHAR(100) NOT NULL DEFAULT 'system';
ALTER TABLE users ADD COLUMN updated_by VARCHAR(100) NOT NULL DEFAULT 'system';
