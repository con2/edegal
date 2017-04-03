interface Config {
  backend: {
    baseUrl: string;
    apiPrefix: string;
  };
}


const Config = {
  backend: {
    baseUrl: process.env.EDEGAL_BACKEND_URL || '',
    apiPrefix: '/api/v2',
  },
};


export default Config;
