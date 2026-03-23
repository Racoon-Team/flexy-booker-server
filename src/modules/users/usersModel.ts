export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  user_type?: string;
  address?: string;
  phone_number?: string;
}
export interface SignUpDataTransferObject {
  userName: string;
  email: string;
  password: string;
  address?: string;
  phoneNumber?: string;
  userType?: string;
}

export interface SignInDataTransferObject {
  email: string;
  password: string;
}
export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  userType: string;
  address?: string;
  phoneNumber?: string;
}
