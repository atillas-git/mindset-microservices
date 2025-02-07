import { z } from 'zod';

export const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  company: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdBy: z.string()
});

export const updateCustomerSchema = customerSchema
  .partial()
  .omit({ createdBy: true });

export const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required')
});
