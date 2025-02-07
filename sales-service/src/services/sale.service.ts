import { Sale, ISale, SaleStatus, ISaleNote } from '../models/sale.model';
import { CustomError } from '../utils/custom-error';

export class SaleService {
  async createSale(saleData: Partial<ISale>): Promise<ISale> {
    const sale = new Sale(saleData);
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
    
    const query = Sale.find(filters)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const [sales, total] = await Promise.all([
      query.exec(),
      Sale.countDocuments(filters)
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
    return await Sale.find({ customerId }).sort({ updatedAt: -1 });
  }

  async getSalesByAssignee(assignedTo: string): Promise<ISale[]> {
    return await Sale.find({ assignedTo }).sort({ updatedAt: -1 });
  }

  async getSalesByStatus(status: SaleStatus): Promise<ISale[]> {
    return await Sale.find({ status }).sort({ updatedAt: -1 });
  }
}
