import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { loginSchema, registerSchema, updateSchema, validateUser } from '../validators/user.validator';
import { CustomError, AuthenticationError } from '../utils/custom-error';

const userService = new UserService();

export const UserController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      const user = await userService.createUser(validatedData);
      
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const { email, password } = validatedData;
      const { user, token } = await userService.authenticateUser(email, password);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        message: 'Login successful',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError('User not authenticated');
      }

      const user = await userService.getUserById(req.user.userId);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        throw new AuthenticationError('User not authenticated');
      }

      const validatedData = updateSchema.parse(req.body);
      
      const updatedUser = await userService.updateUser(req.user.userId, validatedData);
      
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json({
        message: 'Profile updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  },

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, search, page = 1, limit = 10 } = req.query;
      
      const filters: Record<string, any> = {};
      
      if (role) {
        filters.role = role;
      }
      // Add search filter if provided
      if (search) {
        filters.$or = [
          { firstName: new RegExp(String(search), 'i') },
          { lastName: new RegExp(String(search), 'i') },
          { email: new RegExp(String(search), 'i') }
        ];
      }

      const users = await userService.listUsers(filters, {
        page: Number(page),
        limit: Number(limit)
      });
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json({
        users: usersWithoutPasswords,
        page: Number(page),
        limit: Number(limit)
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      if (req.user?.userId === id) {
        throw new CustomError('Cannot delete your own account', 400);
      }
      
      await userService.deleteUser(id);
      
      res.json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};