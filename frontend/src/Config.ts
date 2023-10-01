const config = {
  backend: {
    baseUrl: "" + (process.env.EDEGAL_BACKEND_URL || ""),
    apiPrefix: "/api/v3",
  },
  loginUrl:
    "" +
    (process.env.EDEGAL_LOGIN_URL ||
      "/admin/oauth2/login/?next=/admin/"),
};

export default config;
