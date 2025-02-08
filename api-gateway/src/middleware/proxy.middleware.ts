import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request, Response, NextFunction } from 'express';
import services from '../config/services.config';
import { logger } from '../utils/logger';

// Helper to determine which service should handle the request
const getServiceForPath = (path: string) => {
  // Remove /api prefix for matching
  const pathWithoutApi = path.replace(/^\/api/, '');
  
  for (const [serviceName, config] of Object.entries(services)) {
    console.log(`Checking ${serviceName} service for path: ${pathWithoutApi}`);
    console.log('Routes:', config.routes);
    
    const matchingRoute = config.routes.find(route => 
      pathWithoutApi.startsWith(route) || 
      new RegExp(`^${route.replace(/\//g, '\\/')}(?:\\/|$)`).test(pathWithoutApi)
    );
    
    if (matchingRoute) {
      console.log(`Found matching route: ${matchingRoute} for service: ${serviceName}`);
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
    pathRewrite: (path: string) => path.replace(/^\/api/, ''),
    logLevel: 'debug',
    onProxyReq: (proxyReq, req) => {
      // Log the incoming request
      const targetPath = req.path.replace(/^\/api/, '');
      logger.info(`Proxying ${req.method} ${req.path} to ${serviceName} service at ${config.url}${targetPath}`);
      
      // If it's a POST/PUT/PATCH request with a body, we need to restream the body
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Received response from ${serviceName} service with status ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${req.method} ${req.path}: ${err.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Service temporarily unavailable',
        error: err.message
      });
    }
  });
};

// Middleware to route requests to appropriate service
export const routeRequest = (req: Request, res: Response, next: NextFunction) => {
  const service = getServiceForPath(req.path);
  
  if (!service) {
    logger.error(`No service found for path: ${req.path}`);
    return res.status(404).json({
      status: 'error',
      message: 'Service not found',
      path: req.path
    });
  }
  
  const { serviceName, config } = service;
  logger.info(`Routing request to ${serviceName} service`);
  
  // Create and cache proxy middleware for the service
  const proxy = createServiceProxy(serviceName, config);
  
  return proxy(req, res, next);
};
