interface Config {
  backend: {
    baseUrl: string;
    apiPrefix: string;
  };
}


const Config = {
  backend: {
    baseUrl: process.env.REACT_APP_EDEGAL_BACKEND_URL || '',
    apiPrefix: '/api/v3',
  },
  loginUrl: process.env.REACT_APP_EDEGAL_LOGIN_URL || 'http://localhost:8000/admin/',
};


export default Config;
