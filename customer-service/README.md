# Customer Service

This microservice is part of the CRM system and handles all customer-related operations including customer management, notes, and tagging.

## Features

- Complete Customer Management (CRUD operations)
- Customer Notes System
- Customer Tagging System
- Role-based Access Control
- RESTful API with Swagger Documentation
- PostgreSQL Database with Prisma ORM

## Prerequisites

- Node.js 18 or higher
- PostgreSQL
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
- `PORT`: Service port (default: 3002)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT authentication

5. Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

6. Build the project:
```bash
npm run build
```

7. Start the service:
```bash
npm start
```

For development:
```bash
npm run dev
```

## API Endpoints

### Customer Management
- `POST /api/customers` - Create a new customer
- `GET /api/customers` - List all customers (with filters)
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (admin only)

### Customer Notes
- `POST /api/customers/:id/notes` - Add note to customer
- `DELETE /api/customers/:id/notes/:noteId` - Delete note

### Tags
- `GET /api/customers/tags/list` - List all tags

## Authentication

The service uses JWT for authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Role-Based Access

- `admin`: Full access to all endpoints
- `sales_rep`: Can create and manage customers
- All roles can view customer data

## Database Schema

The service uses PostgreSQL with Prisma ORM. The main entities are:
- `Customer`: Core customer information
- `Note`: Customer-related notes
- `Tag`: Tags for categorizing customers

## Docker

Build the image:
```bash
docker build -t customer-service .
```

Run the container:
```bash
docker run -p 3002:3002 customer-service
```

## Development Tools

- Prisma Studio (database management):
```bash
npm run prisma:studio
```

## Testing

Run the tests:
```bash
npm test
```
