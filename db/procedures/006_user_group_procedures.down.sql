DROP FUNCTION IF EXISTS sp_set_user_group_actor(INT, UUID);
DROP FUNCTION IF EXISTS sp_delete_user_group(INT, UUID);
DROP FUNCTION IF EXISTS sp_update_user_group(INT, TEXT, UUID);
DROP FUNCTION IF EXISTS sp_create_user_group(TEXT, UUID);
DROP FUNCTION IF EXISTS sp_find_user_group_by_name(TEXT, INT);
DROP FUNCTION IF EXISTS sp_get_user_group(INT);
DROP FUNCTION IF EXISTS sp_list_user_groups();
