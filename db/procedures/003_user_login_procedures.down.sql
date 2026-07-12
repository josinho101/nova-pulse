DROP FUNCTION IF EXISTS sp_delete_user_login_by_user(UUID, TEXT);
DROP FUNCTION IF EXISTS sp_set_user_login_status(UUID, SMALLINT, TEXT);
DROP FUNCTION IF EXISTS sp_update_user_login(UUID, TEXT, TEXT, BOOLEAN, TEXT);
DROP FUNCTION IF EXISTS sp_create_user_login(UUID, TEXT, TEXT, BOOLEAN, TEXT);
DROP FUNCTION IF EXISTS sp_get_user_login_by_user(UUID);
DROP FUNCTION IF EXISTS sp_find_user_login_by_username(TEXT);
