export interface ServiceConfig {
  url: string;
  routes: string[];
}

export interface ServicesConfig {
  [key: string]: ServiceConfig;
}

const services: ServicesConfig = {
  user: {
    url: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    routes: [
      '/auth/register',
      '/auth/login',
      '/users/profile',
      '/users'
    ]
  },
  customer: {
    url: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3002',
    routes: [
      '/customers'
    ]
  },
  sales: {
    url: process.env.SALES_SERVICE_URL || 'http://localhost:3003',
    routes: [
      '/sales'
    ]
  }
};

export default services;
