export interface IUser {
    id: string;
    email: string;
    password: string;
    role: 'admin' | 'sales_rep' | 'user';
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
}