import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request, Response, NextFunction } from 'express';
import services from '../config/services.config';
import { logger } from '../utils/logger';

// Helper to determine which service should handle the request
const getServiceForPath = (path: string) => {
  for (const [serviceName, config] of Object.entries(services)) {
    const matchingRoute = config.routes.find(route => 
      path.startsWith(route) || 
      new RegExp(`^${route.replace(/\//g, '\\/')}(?:\\/|$)`).test(path)
    );
    
    if (matchingRoute) {
      return { serviceName, config };
    }
  }
  return null;
};

// Create proxy middleware for a specific service
const createServiceProxy = (serviceName: string, config: any) => {
  return createProxyMiddleware({
    target: config.url,
    changeOrigin: true,
    pathRewrite: (path: string) => path,
    logLevel: 'silent',
    onProxyReq: (proxyReq, req) => {
      // Log the incoming request
      logger.info(`Proxying ${req.method} ${req.path} to ${serviceName} service`);
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${req.method} ${req.path}: ${err.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Service temporarily unavailable'
      });
    }
  });
};

// Middleware to route requests to appropriate service
export const routeRequest = (req: Request, res: Response, next: NextFunction) => {
  const service = getServiceForPath(req.path);
  
  if (!service) {
    return res.status(404).json({
      status: 'error',
      message: 'Service not found'
    });
  }
  
  const { serviceName, config } = service;
  
  // Create and cache proxy middleware for the service
  const proxy = createServiceProxy(serviceName, config);
  
  return proxy(req, res, next);
};
