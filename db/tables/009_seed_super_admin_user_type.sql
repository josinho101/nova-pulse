ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ALTER COLUMN dob DROP NOT NULL;

INSERT INTO user_types (id, name, created_by, updated_by)
OVERRIDING SYSTEM VALUE
VALUES (0, 'Super Admin', 'system', 'system')
ON CONFLICT (id) DO NOTHING;
