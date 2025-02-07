import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { customerSchema, updateCustomerSchema } from '../validators/customer.validator';
import { CustomError } from '../utils/custom-error';

const customerService = new CustomerService();

export const CustomerController = {
  async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = customerSchema.parse({
        ...req.body,
        createdBy: req.user!.userId
      });
      
      const customer = await customerService.createCustomer(validatedData);
      
      res.status(201).json({
        message: 'Customer created successfully',
        customer
      });
    } catch (error) {
      next(error);
    }
  },

  async getCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomer(id);
      
      res.json({ customer });
    } catch (error) {
      next(error);
    }
  },

  async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateCustomerSchema.parse(req.body);
      
      const customer = await customerService.updateCustomer(id, validatedData);
      
      res.json({
        message: 'Customer updated successfully',
        customer
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      await customerService.deleteCustomer(id);
      
      res.json({
        message: 'Customer deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async listCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        search,
        tags,
        page = 1,
        limit = 10
      } = req.query;
      
      const { customers, total } = await customerService.listCustomers({
        search: search as string,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) as string[] : undefined,
        page: Number(page),
        limit: Number(limit)
      });
      
      res.json({
        customers,
        total,
        page: Number(page),
        limit: Number(limit)
      });
    } catch (error) {
      next(error);
    }
  },

  async addNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: customerId } = req.params;
      const { content } = req.body;
      
      if (!content) {
        throw new CustomError('Note content is required', 400);
      }
      
      const note = await customerService.addNote({
        customerId,
        content,
        createdBy: req.user!.userId
      });
      
      res.status(201).json({
        message: 'Note added successfully',
        note
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { noteId } = req.params;
      
      await customerService.deleteNote(noteId);
      
      res.json({
        message: 'Note deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async listTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await customerService.listTags();
      
      res.json({ tags });
    } catch (error) {
      next(error);
    }
  }
};
