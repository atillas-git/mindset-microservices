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
    await user.save();
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new CustomError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return { user, token };
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await User.findById(id);
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    return user;
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const result = await User.findByIdAndDelete(id);
    if (!result) {
      throw new CustomError('User not found', 404);
    }
  }

  async listUsers(filters: Record<string, any> = {}, options: { page?: number; limit?: number; }): Promise<IUser[]> {
    const { page, limit } = options;
    const query = User.find(filters)
    if(page && limit){
      query.skip((page - 1) * limit).limit(limit);
    }
    const users = await query.exec();
    return users;
  }
}