export type UserRole = 'client' | 'owner' | 'admin';
export type UserStatus = 'pending' | 'active' | 'suspended' | 'deleted';

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  city_id?: string;
  email_verified: boolean;
  phone_verified: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SignUpDataTransferObject {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

export interface SignInDataTransferObject {
  email: string;
  password: string;
}

export interface CreateUserParams {
  firstName: string;
  lastName?: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  phone?: string;
}
