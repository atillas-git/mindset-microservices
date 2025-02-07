# Sales Service

This microservice is part of the CRM system and handles all sales-related operations including sales pipeline management, tracking, and reporting.

## Features

- Sales Pipeline Management (NEW, IN_CONTACT, NEGOTIATION, CLOSED, LOST)
- Sales Notes and History Tracking
- Status Change Tracking with Timestamps
- Role-based Access Control
- RESTful API with Swagger Documentation

## Prerequisites

- Node.js 18 or higher
- MongoDB
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
- `PORT`: Service port (default: 3003)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication

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

## API Endpoints

### Sales Management
- `POST /api/sales` - Create a new sale
- `GET /api/sales` - List all sales (with filters)
- `GET /api/sales/:id` - Get sale details
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale (admin only)

### Sales Pipeline
- `PATCH /api/sales/:id/status` - Update sale status
- `POST /api/sales/:id/notes` - Add note to sale

## Authentication

The service uses JWT for authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Role-Based Access

- `admin`: Full access to all endpoints
- `sales_rep`: Can create and manage their own sales
- All roles can view sales data

## Docker

Build the image:
```bash
docker build -t sales-service .
```

Run the container:
```bash
docker run -p 3003:3003 sales-service
```

## Testing

Run the tests:
```bash
npm test
```
