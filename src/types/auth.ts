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
  resetPasswordToken: string;
  resetPasswordExpire: Date;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  generateResetPasswordToken(): string;
}

export interface MulterFiles {
  avatar?: Express.Multer.File[];
}
