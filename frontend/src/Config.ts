export default {
  backend: {
    baseUrl: '' + (import.meta.env.VITE_EDEGAL_BACKEND_URL || ''),
    apiPrefix: '/api/v3',
  },
  loginUrl: '' + (import.meta.env.VITE_EDEGAL_LOGIN_URL || '/admin/oauth2/login/?next=/admin/'),
};
