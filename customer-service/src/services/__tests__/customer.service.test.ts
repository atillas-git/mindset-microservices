import { PrismaClient, Customer, Note, Tag } from '@prisma/client';
import { CustomerService } from '../customer.service';
import { CustomError } from '../../utils/custom-error';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    customer: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn()
    },
    note: {
      create: jest.fn(),
      delete: jest.fn()
    },
    tag: {
      findMany: jest.fn()
    }
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

describe('CustomerService', () => {
  let customerService: CustomerService;
  let prisma: jest.Mocked<PrismaClient>;

  const mockCustomer: Customer = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    company: 'ACME Inc',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user123'
  };

  const mockNote: Note = {
    id: '1',
    content: 'Test note',
    customerId: '1',
    createdBy: 'user123',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockTag: Tag = {
    id: '1',
    name: 'VIP',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    customerService = new CustomerService();
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  describe('createCustomer', () => {
    const createCustomerData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      company: 'ACME Inc',
      createdBy: 'user123',
      tags: ['VIP', 'Enterprise']
    };

    it('should create a customer successfully', async () => {
      const mockCreatedCustomer = {
        ...mockCustomer,
        tags: [mockTag],
        notes: []
      };

      (prisma.customer.create as jest.Mock).mockResolvedValue(mockCreatedCustomer);

      const result = await customerService.createCustomer(createCustomerData);

      expect(result).toEqual(mockCreatedCustomer);
      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: {
          ...createCustomerData,
          tags: {
            connectOrCreate: createCustomerData.tags?.map(name => ({
              where: { name },
              create: { name }
            }))
          }
        },
        include: {
          tags: true,
          notes: true
        }
      });
    });

    it('should throw error if email already exists', async () => {
      (prisma.customer.create as jest.Mock).mockRejectedValue({ code: 'P2002' });

      await expect(customerService.createCustomer(createCustomerData))
        .rejects
        .toThrow(new CustomError('Email already exists', 400));
    });
  });

  describe('getCustomer', () => {
    it('should return customer by id', async () => {
      const mockCustomerWithRelations = {
        ...mockCustomer,
        tags: [mockTag],
        notes: [mockNote]
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomerWithRelations);

      const result = await customerService.getCustomer('1');

      expect(result).toEqual(mockCustomerWithRelations);
      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          tags: true,
          notes: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    });

    it('should throw error if customer not found', async () => {
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(customerService.getCustomer('1'))
        .rejects
        .toThrow(new CustomError('Customer not found', 404));
    });
  });

  describe('updateCustomer', () => {
    const updateData = {
      firstName: 'John Updated',
      lastName: 'Doe Updated',
      tags: ['VIP']
    };

    it('should update customer successfully', async () => {
      const mockUpdatedCustomer = {
        ...mockCustomer,
        ...updateData,
        tags: [mockTag],
        notes: []
      };

      (prisma.customer.update as jest.Mock).mockResolvedValue(mockUpdatedCustomer);

      const result = await customerService.updateCustomer('1', updateData);

      expect(result).toEqual(mockUpdatedCustomer);
      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          ...updateData,
          tags: {
            set: [],
            connectOrCreate: updateData.tags?.map(name => ({
              where: { name },
              create: { name }
            }))
          }
        },
        include: {
          tags: true,
          notes: true
        }
      });
    });

    it('should throw error if customer not found', async () => {
      (prisma.customer.update as jest.Mock).mockRejectedValue({ code: 'P2025' });

      await expect(customerService.updateCustomer('1', updateData))
        .rejects
        .toThrow(new CustomError('Customer not found', 404));
    });

    it('should throw error if email already exists', async () => {
      (prisma.customer.update as jest.Mock).mockRejectedValue({ code: 'P2002' });

      await expect(customerService.updateCustomer('1', { ...updateData, email: 'existing@example.com' }))
        .rejects
        .toThrow(new CustomError('Email already exists', 400));
    });
  });

  describe('deleteCustomer', () => {
    it('should delete customer successfully', async () => {
      (prisma.customer.delete as jest.Mock).mockResolvedValue(mockCustomer);

      await customerService.deleteCustomer('1');

      expect(prisma.customer.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });

    it('should throw error if customer not found', async () => {
      (prisma.customer.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });

      await expect(customerService.deleteCustomer('1'))
        .rejects
        .toThrow(new CustomError('Customer not found', 404));
    });
  });

  describe('listCustomers', () => {
    const mockCustomers = [mockCustomer];
    const mockTotal = 1;

    it('should list customers with default pagination', async () => {
      (prisma.customer.findMany as jest.Mock).mockResolvedValue(mockCustomers);
      (prisma.customer.count as jest.Mock).mockResolvedValue(mockTotal);

      const result = await customerService.listCustomers({});

      expect(result).toEqual({ customers: mockCustomers, total: mockTotal });
      expect(prisma.customer.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          tags: true,
          notes: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        skip: 0,
        take: 10,
        orderBy: { updatedAt: 'desc' }
      });
    });

    it('should list customers with search', async () => {
      const search = 'john';
      (prisma.customer.findMany as jest.Mock).mockResolvedValue(mockCustomers);
      (prisma.customer.count as jest.Mock).mockResolvedValue(mockTotal);

      const result = await customerService.listCustomers({ search });

      expect(result).toEqual({ customers: mockCustomers, total: mockTotal });
      expect(prisma.customer.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } }
          ]
        },
        include: {
          tags: true,
          notes: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        skip: 0,
        take: 10,
        orderBy: { updatedAt: 'desc' }
      });
    });

    it('should list customers with tag filter', async () => {
      const tags = ['VIP'];
      (prisma.customer.findMany as jest.Mock).mockResolvedValue(mockCustomers);
      (prisma.customer.count as jest.Mock).mockResolvedValue(mockTotal);

      const result = await customerService.listCustomers({ tags });

      expect(result).toEqual({ customers: mockCustomers, total: mockTotal });
      expect(prisma.customer.findMany).toHaveBeenCalledWith({
        where: {
          tags: {
            some: {
              name: {
                in: tags
              }
            }
          }
        },
        include: {
          tags: true,
          notes: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        skip: 0,
        take: 10,
        orderBy: { updatedAt: 'desc' }
      });
    });
  });

  describe('addNote', () => {
    const noteData = {
      customerId: '1',
      content: 'Test note',
      createdBy: 'user123'
    };

    it('should add note successfully', async () => {
      (prisma.note.create as jest.Mock).mockResolvedValue(mockNote);

      const result = await customerService.addNote(noteData);

      expect(result).toEqual(mockNote);
      expect(prisma.note.create).toHaveBeenCalledWith({
        data: noteData
      });
    });

    it('should throw error if customer not found', async () => {
      (prisma.note.create as jest.Mock).mockRejectedValue({ code: 'P2003' });

      await expect(customerService.addNote(noteData))
        .rejects
        .toThrow(new CustomError('Customer not found', 404));
    });
  });

  describe('deleteNote', () => {
    it('should delete note successfully', async () => {
      (prisma.note.delete as jest.Mock).mockResolvedValue(mockNote);

      await customerService.deleteNote('1');

      expect(prisma.note.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });

    it('should throw error if note not found', async () => {
      (prisma.note.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });

      await expect(customerService.deleteNote('1'))
        .rejects
        .toThrow(new CustomError('Note not found', 404));
    });
  });

  describe('listTags', () => {
    it('should list all tags', async () => {
      const mockTags = [mockTag];
      (prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags);

      const result = await customerService.listTags();

      expect(result).toEqual(mockTags);
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' }
      });
    });
  });
});
