// Same limits as the server (UserAccountApiLogic): new passwords set from the web need at least 8 characters, and the
// procedures that hash them take VARCHAR(50).
export const USER_PASSWORD_MIN_LENGTH = 8;
export const USER_PASSWORD_MAX_LENGTH = 50;
