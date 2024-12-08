export const baseUrl =
  process.env.NEXT_PUBLIC_EDEGAL_BACKEND_URL || "http://localhost:8000";
export const apiUrl = baseUrl + "/api/v3";
export const loginUrl =
  process.env.NEXT_PUBLIC_EDEGAL_LOGIN_URL ||
  baseUrl + "/admin/oauth2/login/?next=/admin/";
