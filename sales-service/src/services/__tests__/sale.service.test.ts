import { SaleService } from '../sale.service';
import { Sale, SaleStatus } from '../../models/sale.model';
import { CustomError } from '../../utils/custom-error';

// Mock the Sale model
jest.mock('../../models/sale.model', () => {
  const mockSale = jest.fn().mockImplementation((data: any) => {
    const instance = {
      ...data,
      id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn()
    };
    instance.save.mockResolvedValue(instance);
    return instance;
  });

  Object.assign(mockSale, {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn()
  });

  return {
    Sale: mockSale,
    SaleStatus: {
      NEW: 'NEW',
      IN_CONTACT: 'IN_CONTACT',
      NEGOTIATION: 'NEGOTIATION',
      CLOSED: 'CLOSED',
      LOST: 'LOST'
    }
  };
});

// Helper function to create a mock query chain
const createMockQueryChain = (finalResult: any) => {
  const mockExec = jest.fn().mockResolvedValue(finalResult);
  const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
  const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
  const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });

  return {
    mockSort,
    mockSkip,
    mockLimit,
    mockExec,
    query: { sort: mockSort }
  };
};

describe('SaleService', () => {
  let saleService: SaleService;
  const mockSale = {
    id: '1',
    title: 'Test Sale',
    description: 'Test Description',
    value: 1000,
    status: SaleStatus.NEW,
    customerId: 'customer123',
    assignedTo: 'user123',
    notes: [],
    statusHistory: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    saleService = new SaleService();
  });

  describe('createSale', () => {
    it('should create a new sale successfully', async () => {
      const saleData = {
        title: 'Test Sale',
        description: 'Test Description',
        value: 1000,
        customerId: 'customer123',
        assignedTo: 'user123'
      };

      const result = await saleService.createSale(saleData);
      expect(result).toMatchObject({
        ...saleData,
        status: SaleStatus.NEW,
        notes: [],
        statusHistory: [],
        id: '1'
      });
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('getSale', () => {
    it('should return sale by id', async () => {
      const Sale = require('../../models/sale.model').Sale;
      Sale.findById.mockResolvedValue(mockSale);

      const result = await saleService.getSale('1');
      expect(result).toEqual(mockSale);
      expect(Sale.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error if sale not found', async () => {
      const Sale = require('../../models/sale.model').Sale;
      Sale.findById.mockResolvedValue(null);

      await expect(saleService.getSale('1'))
        .rejects
        .toThrow(new CustomError('Sale not found', 404));
    });
  });

  describe('updateSale', () => {
    it('should update sale successfully', async () => {
      const updateData = { title: 'Updated Sale' };
      const updatedSale = { ...mockSale, ...updateData };
      const Sale = require('../../models/sale.model').Sale;
      Sale.findByIdAndUpdate.mockResolvedValue(updatedSale);

      const result = await saleService.updateSale('1', updateData);
      expect(result).toEqual(updatedSale);
      expect(Sale.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { $set: updateData },
        { new: true, runValidators: true }
      );
    });

    it('should throw error if sale not found for update', async () => {
      const Sale = require('../../models/sale.model').Sale;
      Sale.findByIdAndUpdate.mockResolvedValue(null);

      await expect(saleService.updateSale('1', { title: 'Updated Sale' }))
        .rejects
        .toThrow(new CustomError('Sale not found', 404));
    });
  });

  describe('deleteSale', () => {
    it('should delete sale successfully', async () => {
      const Sale = require('../../models/sale.model').Sale;
      Sale.findByIdAndDelete.mockResolvedValue(mockSale);

      await saleService.deleteSale('1');
      expect(Sale.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('should throw error if sale not found for deletion', async () => {
      const Sale = require('../../models/sale.model').Sale;
      Sale.findByIdAndDelete.mockResolvedValue(null);

      await expect(saleService.deleteSale('1'))
        .rejects
        .toThrow(new CustomError('Sale not found', 404));
    });
  });

  describe('listSales', () => {
    it('should list sales with pagination', async () => {
      const mockTotal = 20;
      const mockSales = [mockSale];
      const { mockSort, mockSkip, mockLimit, mockExec } = createMockQueryChain(mockSales);
      
      const Sale = require('../../models/sale.model').Sale;
      Sale.find.mockReturnValue({ sort: mockSort });
      Sale.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockTotal) });

      const result = await saleService.listSales({}, 1, 10);
      
      expect(result).toEqual({ sales: mockSales, total: mockTotal });
      expect(Sale.find).toHaveBeenCalledWith({});
      expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(mockExec).toHaveBeenCalled();
    });
  });

  describe('addNote', () => {
    it('should add note to sale successfully', async () => {
      const note = {
        content: 'Test note',
        createdBy: 'user123',
        createdAt: new Date()
      };
      const updatedSale = {
        ...mockSale,
        notes: [note]
      };
      const Sale = require('../../models/sale.model').Sale;
      Sale.findByIdAndUpdate.mockResolvedValue(updatedSale);

      const result = await saleService.addNote('1', note);
      expect(result).toEqual(updatedSale);
      expect(Sale.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { $push: { notes: note } },
        { new: true, runValidators: true }
      );
    });

    it('should throw error if sale not found for adding note', async () => {
      const Sale = require('../../models/sale.model').Sale;
      Sale.findByIdAndUpdate.mockResolvedValue(null);

      await expect(saleService.addNote('1', { content: 'Test note', createdBy: 'user123', createdAt: new Date() }))
        .rejects
        .toThrow(new CustomError('Sale not found', 404));
    });
  });

  describe('updateStatus', () => {
    it('should update sale status successfully', async () => {
      const newStatus = SaleStatus.IN_CONTACT;
      const userId = 'user123';
      const note = 'Status update note';
      
      const sale = {
        ...mockSale,
        status: SaleStatus.NEW,
        statusHistory: [],
        save: jest.fn()
      };

      const updatedSale = {
        ...sale,
        status: newStatus,
        statusHistory: [{
          status: newStatus,
          changedBy: userId,
          note,
          changedAt: expect.any(Date)
        }]
      };

      const Sale = require('../../models/sale.model').Sale;
      Sale.findById.mockResolvedValue(sale);
      sale.save.mockResolvedValue(updatedSale);

      const result = await saleService.updateStatus('1', newStatus, userId, note);
      expect(result.status).toBe(newStatus);
      expect(result.statusHistory).toHaveLength(1);
      expect(result.statusHistory[0]).toMatchObject({
        status: newStatus,
        changedBy: userId,
        note
      });
      expect(sale.save).toHaveBeenCalled();
    });

    it('should throw error if sale not found for status update', async () => {
      const Sale = require('../../models/sale.model').Sale;
      Sale.findById.mockResolvedValue(null);

      await expect(saleService.updateStatus('1', SaleStatus.IN_CONTACT, 'user123'))
        .rejects
        .toThrow(new CustomError('Sale not found', 404));
    });
  });

  describe('getSalesByCustomer', () => {
    it('should return sales for specific customer', async () => {
      const mockSales = [mockSale];
      const Sale = require('../../models/sale.model').Sale;
      const mockLean = jest.fn().mockResolvedValue(mockSales);
      const mockSort = jest.fn().mockReturnValue({ lean: mockLean });
      Sale.find.mockReturnValue({ sort: mockSort });

      const result = await saleService.getSalesByCustomer('customer123');
      expect(result).toEqual(mockSales);
      expect(Sale.find).toHaveBeenCalledWith({ customerId: 'customer123' });
      expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(mockLean).toHaveBeenCalled();
    });
  });

  describe('getSalesByAssignee', () => {
    it('should return sales for specific assignee', async () => {
      const mockSales = [mockSale];
      const Sale = require('../../models/sale.model').Sale;
      const mockLean = jest.fn().mockResolvedValue(mockSales);
      const mockSort = jest.fn().mockReturnValue({ lean: mockLean });
      Sale.find.mockReturnValue({ sort: mockSort });

      const result = await saleService.getSalesByAssignee('user123');
      expect(result).toEqual(mockSales);
      expect(Sale.find).toHaveBeenCalledWith({ assignedTo: 'user123' });
      expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(mockLean).toHaveBeenCalled();
    });
  });

  describe('getSalesByStatus', () => {
    it('should return sales with specific status', async () => {
      const mockSales = [mockSale];
      const Sale = require('../../models/sale.model').Sale;
      const mockLean = jest.fn().mockResolvedValue(mockSales);
      const mockSort = jest.fn().mockReturnValue({ lean: mockLean });
      Sale.find.mockReturnValue({ sort: mockSort });

      const result = await saleService.getSalesByStatus(SaleStatus.NEW);
      expect(result).toEqual(mockSales);
      expect(Sale.find).toHaveBeenCalledWith({ status: SaleStatus.NEW });
      expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(mockLean).toHaveBeenCalled();
    });
  });
});
