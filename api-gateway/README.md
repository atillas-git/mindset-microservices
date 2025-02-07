# API Gateway

The API Gateway serves as the single entry point for all client requests in the CRM microservices architecture. It handles routing, rate limiting, and service discovery.

## Features

- Request routing to appropriate microservices
- Rate limiting to prevent abuse
- Health checks for all services
- Centralized error handling
- Request logging
- CORS support
- Swagger documentation

## Architecture

The API Gateway routes requests to the following services:
- User Service (Authentication & User Management) - Port 3001
- Customer Service (Customer Management) - Port 3002
- Sales Service (Sales Pipeline Management) - Port 3003

## Prerequisites

- Node.js 18 or higher
- TypeScript

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy the environment file and configure it:
```bash
cp .env.example .env
```

4. Configure the environment variables in `.env`:
- `PORT`: Gateway port (default: 3000)
- `USER_SERVICE_URL`: URL for the user service
- `CUSTOMER_SERVICE_URL`: URL for the customer service
- `SALES_SERVICE_URL`: URL for the sales service

5. Build the project:
```bash
npm run build
```

6. Start the service:
```bash
npm start
```

For development:
```bash
npm run dev
```

## API Routes

### Authentication & Users
- `POST /api/auth/register` → User Service
- `POST /api/auth/login` → User Service
- `GET /api/users/profile` → User Service
- `PUT /api/users/profile` → User Service

### Customers
- `POST /api/customers` → Customer Service
- `GET /api/customers` → Customer Service
- `GET /api/customers/:id` → Customer Service
- `PUT /api/customers/:id` → Customer Service
- `DELETE /api/customers/:id` → Customer Service
- `POST /api/customers/:id/notes` → Customer Service

### Sales
- `POST /api/sales` → Sales Service
- `GET /api/sales` → Sales Service
- `GET /api/sales/:id` → Sales Service
- `PUT /api/sales/:id` → Sales Service
- `PATCH /api/sales/:id/status` → Sales Service

### System
- `GET /health` - Health check endpoint
- `/api-docs` - Swagger documentation (development only)

## Rate Limiting

The API Gateway implements rate limiting to protect the services:
- 100 requests per 15 minutes window per IP
- Configurable through environment variables

## Error Handling

The gateway provides consistent error responses across all services:
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error message"
}
```

## Docker

Build the image:
```bash
docker build -t api-gateway .
```

Run the container:
```bash
docker run -p 3000:3000 api-gateway
```

## Monitoring

The gateway includes:
- Health check endpoints for all services
- Winston logger for request/error logging
- Service status monitoring
