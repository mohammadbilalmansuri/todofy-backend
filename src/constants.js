export const PORT = process.env.PORT || 5000;
export const MONGODB_CONNECTION_STRING = `${process.env.MONGODB_URL}/${process.env.DB_NAME}`;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "1d";
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
export const COOKIE_OPTIONS = { httpOnly: true };
// export const COOKIE_OPTIONS = { httpOnly: true, secure: true };
