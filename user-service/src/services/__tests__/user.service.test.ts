import { UserService } from '../user.service';
import { User } from '../../models/user.model';
import { CustomError } from '../../utils/custom-error';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock the dependencies
jest.mock('../../models/user.model');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('UserService', () => {
  let userService: UserService;
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    save: jest.fn().mockResolvedValue({
      toObject: () => ({
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      })
    }),
    toObject: () => ({
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    })
  };

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User as unknown as jest.Mock).mockImplementation(() => mockUser);

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const result = await userService.createUser(userData);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(result).toMatchObject({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: ''
      });
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      await expect(userService.createUser(userData)).rejects.toThrow(
        new CustomError('Email already exists', 400)
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById('1');

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(result).toMatchObject({
        id: '1',
        email: 'test@example.com'
      });
    });

    it('should throw error if user not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getUserById('1')).rejects.toThrow(
        new CustomError('User not found', 404)
      );
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updatedMockUser = {
        ...mockUser,
        firstName: 'Updated',
        lastName: 'Name',
        toObject: () => ({
          id: '1',
          email: 'test@example.com',
          firstName: 'Updated',
          lastName: 'Name',
          role: 'user',
          password: 'hashedPassword'
        })
      };

      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedMockUser);

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const result = await userService.updateUser('1', updateData);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { $set: updateData },
        { new: true, runValidators: true }
      );
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'Name',
        role: 'user',
        password: ''
      });
    });

    it('should throw error if user not found for update', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(userService.updateUser('1', { firstName: 'Updated' })).rejects.toThrow(
        new CustomError('User not found', 404)
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);

      await userService.deleteUser('1');

      expect(User.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('should throw error if user not found for deletion', async () => {
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(userService.deleteUser('1')).rejects.toThrow(
        new CustomError('User not found', 404)
      );
    });
  });

  describe('listUsers', () => {
    it('should list users with pagination', async () => {
      const mockUsers = [
        { ...mockUser, toObject: () => ({ ...mockUser, password: '' }) },
        { ...mockUser, id: '2', toObject: () => ({ ...mockUser, id: '2', password: '' }) }
      ];
      const mockExec = jest.fn().mockResolvedValue(mockUsers);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });

      (User.find as jest.Mock).mockReturnValue({ skip: mockSkip });
      (User.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await userService.listUsers({}, { page: 1, limit: 10 });

      expect(User.find).toHaveBeenCalledWith({});
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(mockExec).toHaveBeenCalled();
      expect(result).toEqual({
        users: mockUsers.map(user => user.toObject()),
        total: 2,
        page: 1,
        totalPages: 1
      });
    });

    it('should list users without pagination', async () => {
      const mockUsers = [
        { ...mockUser, toObject: () => ({ ...mockUser, password: '' }) }
      ];
      const mockExec = jest.fn().mockResolvedValue(mockUsers);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });

      (User.find as jest.Mock).mockReturnValue({ skip: mockSkip });
      (User.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await userService.listUsers();

      expect(User.find).toHaveBeenCalledWith({});
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(mockExec).toHaveBeenCalled();
      expect(result).toEqual({
        users: mockUsers.map(user => user.toObject()),
        total: 1,
        page: 1,
        totalPages: 1
      });
    });
  });
});
