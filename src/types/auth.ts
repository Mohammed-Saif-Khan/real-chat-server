import { Document } from "mongoose";

export interface IUser extends Document {
  avatar: string;
  full_name: string;
  email: string;
  bio: string;
  country: string;
  password: string;
  provider: string;
  refreshToken: string;
  isVerified: boolean;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}
