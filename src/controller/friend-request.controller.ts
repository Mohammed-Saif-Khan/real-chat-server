import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { Friend } from "../models/friend-request.model";
import { ApiResponse } from "../utils/ApiResponse";

const sendFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const { receiverId } = req.body;
  const senderId = req.user?._id;

  if (senderId === receiverId) {
    return res.json(new ApiError(400, "You can't add yourself"));
  }

  const existing = await Friend.findOne({
    sender: senderId,
    receiver: receiverId,
    status: "pending",
  });

  if (existing) return res.json(new ApiError(400, "Already sent."));

  const request = await Friend.create({
    sender: senderId,
    receiver: receiverId,
  });

  return res.status(200).json(new ApiResponse(200, request, "Request Send"));
});

const acceptFriendRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(404, "Request Id not found");
    }

    const request = await Friend.findById(id);
    if (!request) throw new ApiError(404, "Request not found");

    request.status = "accepted";
    await request.save();

    return res.status(200).json(new ApiResponse(200, "Request Accept"));
  }
);

const rejectFriendRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(404, "Request ID not found");
    }

    const request = await Friend.findById(id);
    if (!request) throw new ApiError(404, "Request not found");

    request.status = "rejected";
    await request.save();

    return res
      .status(200)
      .json(new ApiResponse(200, request, "Request rejected"));
  }
);

const getPendingRequests = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  const request = await Friend.find({
    receiver: userId,
    status: "pending",
  }).populate("sender", "avatar full_name country");

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, request, "Pending request fetched successfully")
    );
});

const getAcceptedRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  const request = await Friend.find({
    receiver: userId,
    status: "accepted",
  }).populate("sender", "avatar full_name country");

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, request, "Accepted request fetched successfully")
    );
});

export {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests,
  getAcceptedRequest,
};
