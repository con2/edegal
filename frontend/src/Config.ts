export default {
  backend: {
    baseUrl: process.env.REACT_APP_EDEGAL_BACKEND_URL || '',
    apiPrefix: '/api/v3',
  },
  loginUrl: process.env.REACT_APP_EDEGAL_LOGIN_URL || '/admin/oauth2/login/?next=/admin/',
};
