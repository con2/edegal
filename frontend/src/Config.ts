const config = {
  backend: {
    baseUrl: "https://conikuvat.fi",
    apiPrefix: "/api/v3",
  },
  loginUrl:
    "" +
    (process.env.EDEGAL_LOGIN_URL ||
      "/admin/oauth2/login/?next=/admin/"),
};

export default config;
