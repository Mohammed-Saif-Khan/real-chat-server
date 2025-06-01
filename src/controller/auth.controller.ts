import crypto from "crypto";
import { Request, Response } from "express";
import { User } from "../models/auth.model";
import { MulterFiles } from "../types/auth";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudnary";
import { sendResetPasswordEmail } from "../utils/mail";

const generateAccessAndRefereshTokens = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user?.generateAccessToken();
    const refreshToken = user?.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(
      "Something went wrong while generating referesh and access token",
      error
    );
  }
};

const register = asyncHandler(async (req: Request, res: Response) => {
  const { full_name, email, bio, country, password } = req.body;

  if (
    [full_name, email, country, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const file = req.files as MulterFiles;
  const avatarLocalPath = file.avatar?.[0]?.path;

  const avatar = avatarLocalPath
    ? await uploadOnCloudinary(avatarLocalPath, "real-chat/profile")
    : null;

  const user = await User.create({
    avatar: avatar?.url,
    full_name,
    email,
    bio,
    country,
    password,
  });

  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "User registered Successfully"));
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!(email || password)) {
    throw new ApiError(400, "Email and Password is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const token = await generateAccessAndRefereshTokens(user?._id as string);

  if (!token) {
    throw new ApiError(500, "Failed to generate access and refresh tokens");
  }

  const { accessToken, refreshToken } = token;

  const loginUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  user.isVerified = true;
  await user.save();

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          data: loginUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logout = asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: -1 } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const profile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(404, "User ID not found");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User data fetch successfully"));
});

const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { full_name, email, bio, country } = req.body;
  const userId = req.user._id;

  if ([full_name, email, country, bio].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        full_name,
        email,
        country,
        bio,
      },
    },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(500, "Something went wrong while updating profile");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User Updated Successfully"));
});

const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const avatarLocalPath = req.file?.path;

  if (!userId) {
    throw new ApiError(404, "User ID is not found");
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  if (existingUser.avatar) {
    await deleteFromCloudinary(existingUser.avatar);
  }

  const upload = await uploadOnCloudinary(avatarLocalPath);
  const avatarUrl = upload?.url;

  if (!avatarUrl) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary");
  }

  const updatedProfile = await User.findByIdAndUpdate(
    userId,
    { $set: { avatar: avatarUrl } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { data: updatedProfile },
        "Avatar updated successfully"
      )
    );
});

const requestPasswordReset = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(404, "Email is not found");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "No user found with this email");
    }

    const resetToken = user.generateResetPasswordToken();
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    await sendResetPasswordEmail(user.email, resetUrl);

    return res
      .status(200)
      .json(new ApiResponse(200, "Reset link sent to your email"));
  }
);

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, "Token is invalid or has expired");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password has been reset successfully"));
});

const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?._id;

  if ([oldPassword, newPassword].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All field is required");
  }

  if (!userId) {
    throw new ApiError(404, "User ID not found");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(newPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password updated successfully"));
});

export {
  register,
  login,
  logout,
  profile,
  updateAvatar,
  updateProfile,
  requestPasswordReset,
  resetPassword,
  updatePassword,
};
