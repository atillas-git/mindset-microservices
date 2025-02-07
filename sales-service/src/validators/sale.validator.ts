import { z } from 'zod';
import { SaleStatus } from '../models/sale.model';

export const saleSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  value: z.number().min(0, 'Value must be positive'),
  status: z.enum(Object.values(SaleStatus) as [string, ...string[]]).optional(),
  expectedClosingDate: z.date().optional()
});

export const updateSaleSchema = saleSchema.partial();

export const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required')
});

export const statusUpdateSchema = z.object({
  status: z.enum(Object.values(SaleStatus) as [string, ...string[]]),
  note: z.string().optional()
});
