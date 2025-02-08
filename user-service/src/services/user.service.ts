import { User } from '../models/user.model';
import { IUser } from '../interfaces/user.interface';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { CustomError } from '../utils/custom-error';

export class UserService {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new CustomError('Email already exists', 400);
    }
    const user = new User(userData);
    const savedUser = await user.save();
    const userObj = savedUser.toObject();
    userObj.password = "";
    return userObj;
  }

  async authenticateUser(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new CustomError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    const userObj = user.toObject();
    userObj.password = "";

    return { user: userObj, token };
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await User.findById(id);
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    const userObj = user.toObject();
    userObj.password = "";
    return userObj;
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser> {
    // Remove password from updateData if present
    if (updateData.password) {
      delete updateData.password;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const userObj = user.toObject();
    userObj.password = "";
    return userObj;
  }

  async deleteUser(id: string): Promise<void> {
    const result = await User.findByIdAndDelete(id);
    if (!result) {
      throw new CustomError('User not found', 404);
    }
  }

  async listUsers(
    filters: Record<string, any> = {},
    { page = 1, limit = 10 } = {}
  ): Promise<{
    users: IUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filters).skip(skip).limit(limit).exec(),
      User.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(total / limit);
    
    return {
      users: users.map(user => {
        const userObj = user.toObject();
        userObj.password = '';
        return userObj;
      }),
      total,
      page,
      totalPages
    };
  }
}