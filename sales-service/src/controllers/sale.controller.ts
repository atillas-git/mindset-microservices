import { Request, Response, NextFunction } from 'express';
import { SaleService } from '../services/sale.service';
import { saleSchema, updateSaleSchema } from '../validators/sale.validator';
import { CustomError } from '../utils/custom-error';
import { SaleStatus } from '../models/sale.model';

const saleService = new SaleService();

export const SaleController = {
  async createSale(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = saleSchema.parse(req.body);
      
      const sale = await saleService.createSale({
        ...validatedData,
        status:SaleStatus.NEW,
        assignedTo: req.user!.userId
      });
      
      res.status(201).json({
        message: 'Sale created successfully',
        sale
      });
    } catch (error) {
      next(error);
    }
  },

  async getSale(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sale = await saleService.getSale(id);
      
      res.json({ sale });
    } catch (error) {
      next(error);
    }
  },

  async updateSale(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateSaleSchema.parse(req.body);
      
      const sale = await saleService.updateSale(id, {
        ...validatedData,
        status:validatedData.status as SaleStatus,
      });
      
      res.json({
        message: 'Sale updated successfully',
        sale
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteSale(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      await saleService.deleteSale(id);
      
      res.json({
        message: 'Sale deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async listSales(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        status, 
        customerId, 
        assignedTo,
        page = 1,
        limit = 10
      } = req.query;
      
      const filters: Record<string, any> = {};
      
      if (status) {
        filters.status = status;
      }
      
      if (customerId) {
        filters.customerId = customerId;
      }
      
      if (assignedTo) {
        filters.assignedTo = assignedTo;
      }

      const { sales, total } = await saleService.listSales(
        filters, 
        Number(page), 
        Number(limit)
      );
      
      res.json({
        sales,
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
      const { id } = req.params;
      const { content } = req.body;
      
      if (!content) {
        throw new CustomError('Note content is required', 400);
      }

      if (!req.user?.userId) {
        throw new CustomError('User ID is required', 401);
      }
      
      const note = {
        content,
        createdBy: req.user!.userId,
        createdAt: new Date()
      };
      
      const sale = await saleService.addNote(id, note);
      
      res.json({
        message: 'Note added successfully',
        sale
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      
      if (!Object.values(SaleStatus).includes(status)) {
        throw new CustomError('Invalid status', 400);
      }
      
      const sale = await saleService.updateStatus(
        id,
        status,
        req.user!.userId,
        note
      );
      
      res.json({
        message: 'Sale status updated successfully',
        sale
      });
    } catch (error) {
      next(error);
    }
  }
};
