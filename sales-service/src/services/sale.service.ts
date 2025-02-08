import { Sale, ISale, SaleStatus, ISaleNote } from '../models/sale.model';
import { CustomError } from '../utils/custom-error';

export class SaleService {
  async createSale(saleData: Partial<ISale>): Promise<ISale> {
    const sale = new Sale({
      ...saleData,
      status: SaleStatus.NEW,
      notes: [],
      statusHistory: []
    });
    return await sale.save();
  }

  async getSale(id: string): Promise<ISale> {
    const sale = await Sale.findById(id);
    if (!sale) {
      throw new CustomError('Sale not found', 404);
    }
    return sale;
  }

  async updateSale(id: string, updateData: Partial<ISale>): Promise<ISale> {
    const sale = await Sale.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!sale) {
      throw new CustomError('Sale not found', 404);
    }
    return sale;
  }

  async deleteSale(id: string): Promise<void> {
    const result = await Sale.findByIdAndDelete(id);
    if (!result) {
      throw new CustomError('Sale not found', 404);
    }
  }

  async listSales(filters: Record<string, any> = {}, page: number = 1, limit: number = 10): Promise<{ sales: ISale[]; total: number; }> {
    const skip = (page - 1) * limit;
    
    const [sales, total] = await Promise.all([
      Sale.find(filters)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Sale.countDocuments(filters).exec()
    ]);

    return { sales, total };
  }

  async addNote(saleId: string, note: ISaleNote): Promise<ISale> {
    const sale = await Sale.findByIdAndUpdate(
      saleId,
      { $push: { notes: note } },
      { new: true, runValidators: true }
    );
    
    if (!sale) {
      throw new CustomError('Sale not found', 404);
    }
    
    return sale;
  }

  async updateStatus(
    saleId: string, 
    status: SaleStatus, 
    userId: string,
    note?: string
  ): Promise<ISale> {
    const sale = await Sale.findById(saleId);
    
    if (!sale) {
      throw new CustomError('Sale not found', 404);
    }

    sale.status = status;
    sale.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: userId,
      note
    });

    return await sale.save();
  }

  async getSalesByCustomer(customerId: string): Promise<ISale[]> {
    const query = Sale.find({ customerId });
    return await query.sort({ updatedAt: -1 }).lean();
  }

  async getSalesByAssignee(assignedTo: string): Promise<ISale[]> {
    const query = Sale.find({ assignedTo });
    return await query.sort({ updatedAt: -1 }).lean();
  }

  async getSalesByStatus(status: SaleStatus): Promise<ISale[]> {
    const query = Sale.find({ status });
    return await query.sort({ updatedAt: -1 }).lean();
  }
}
