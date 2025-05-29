import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/auth.model";
import { MulterFiles } from "../types/auth";
import { uploadOnCloudinary } from "../utils/cloudnary";
import { ApiResponse } from "../utils/ApiResponse";

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

export { register };
