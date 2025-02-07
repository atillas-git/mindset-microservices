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
      '/api/auth/register',
      '/api/auth/login',
      '/api/users',
      '/api/users/profile'
    ]
  },
  customer: {
    url: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3002',
    routes: [
      '/api/customers',
      '/api/customers/tags'
    ]
  },
  sales: {
    url: process.env.SALES_SERVICE_URL || 'http://localhost:3003',
    routes: [
      '/api/sales'
    ]
  }
};

export default services;
