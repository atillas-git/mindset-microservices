import { PrismaClient, Customer, Note, Tag } from '@prisma/client';
import { CustomError } from '../utils/custom-error';

const prisma = new PrismaClient();

export class CustomerService {
  async createCustomer(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    createdBy: string;
    tags?: string[];
  }): Promise<Customer> {
    const { tags: tagNames, ...customerData } = data;

    try {
      return await prisma.customer.create({
        data: {
          ...customerData,
          tags: tagNames ? {
            connectOrCreate: tagNames.map(name => ({
              where: { name },
              create: { name }
            }))
          } : undefined
        },
        include: {
          tags: true,
          notes: true
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new CustomError('Email already exists', 400);
      }
      throw error;
    }
  }

  async getCustomer(id: string): Promise<Customer> {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        tags: true,
        notes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      throw new CustomError('Customer not found', 404);
    }

    return customer;
  }

  async updateCustomer(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      company?: string;
      tags?: string[];
    }
  ): Promise<Customer> {
    const { tags: tagNames, ...updateData } = data;

    try {
      return await prisma.customer.update({
        where: { id },
        data: {
          ...updateData,
          tags: tagNames ? {
            set: [],
            connectOrCreate: tagNames.map(name => ({
              where: { name },
              create: { name }
            }))
          } : undefined
        },
        include: {
          tags: true,
          notes: true
        }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new CustomError('Customer not found', 404);
      }
      if (error.code === 'P2002') {
        throw new CustomError('Email already exists', 400);
      }
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      await prisma.customer.delete({
        where: { id }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new CustomError('Customer not found', 404);
      }
      throw error;
    }
  }

  async listCustomers(params: {
    search?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<{ customers: Customer[]; total: number }> {
    const { search, tags, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          name: {
            in: tags
          }
        }
      };
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          tags: true,
          notes: {
            orderBy: { createdAt: 'desc' },
            take: 5 // Only get the 5 most recent notes
          }
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    return { customers, total };
  }

  async addNote(data: {
    customerId: string;
    content: string;
    createdBy: string;
  }): Promise<Note> {
    try {
      return await prisma.note.create({
        data
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new CustomError('Customer not found', 404);
      }
      throw error;
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      await prisma.note.delete({
        where: { id }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new CustomError('Note not found', 404);
      }
      throw error;
    }
  }

  async listTags(): Promise<Tag[]> {
    return await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });
  }
}
