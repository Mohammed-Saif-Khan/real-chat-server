import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Friend } from "../models/friends.model";

const sendRequest = asyncHandler(async (req: Request, res: Response) => {
  const senderUser = req.user._id;
  const { receiverId } = req.params;

  if (!receiverId) {
    return res
      .status(404)
      .json({ success: false, message: "Receiver Id not found" });
  }

  const existingRequest = await Friend.findOne({
    $or: [
      { sender: senderUser, receiver: receiverId },
      { sender: receiverId, receiver: senderUser },
    ],
  });

  if (existingRequest) {
    await Friend.findByIdAndDelete(existingRequest._id);
    return res
      .status(200)
      .json({ success: true, message: "Request Cancelled" });
  } else {
    await Friend.create({
      sender: senderUser,
      receiver: receiverId,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Friend Request Sent Successfully",
    });
  }
});

const getPendingRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;

  const pendingRequest = await Friend.find({
    receiver: userId,
    status: "pending",
  })
    .populate("sender", "avatar full_name country")
    .populate("receiver", "avatar full_name country");

  return res.status(200).json({
    pendingRequest,
    success: true,
    message: "Fetched All Pending Request",
  });
});

const acceptRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { requestId } = req.params;

  if (!requestId) {
    return res
      .status(400)
      .json({ success: false, message: "Request Id not found" });
  }

  const request = await Friend.findOneAndUpdate(
    { _id: requestId, receiver: userId, status: "pending" },
    { status: "accepted" },
    { new: true }
  )
    .populate("sender", "full_name avatar country")
    .populate("receiver", "full_name avatar country");

  if (!request) {
    return res.status(404).json({
      success: false,
      message: "Friend request not found or already handled",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Friend request accepted successfully",
    request,
  });
});

const rejectRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { requestId } = req.params;

  if (!requestId) {
    return res
      .status(400)
      .json({ success: false, message: "Request Id not found" });
  }

  const request = await Friend.findOneAndUpdate(
    { _id: requestId, receiver: userId, status: "pending" },
    { status: "rejected" },
    { new: true }
  )
    .populate("sender", "full_name avatar country")
    .populate("receiver", "full_name avatar country");

  if (!request) {
    return res.status(404).json({
      success: false,
      message: "Friend request not found or already handled",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Friend request rejected successfully",
    request,
  });
});

const getFriends = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;

  const friends = await Friend.find({
    $or: [{ sender: userId }, { receiver: userId }],
    status: "accepted",
  })
    .populate("sender", "full_name avatar country")
    .populate("receiver", "full_name avatar country");

  const friendList = friends.map((f) => {
    const isSender = f.sender._id.toString() === userId.toString();
    return isSender ? f.receiver : f.sender;
  });

  return res
    .status(200)
    .json({ friendList, success: true, message: "Fetched Friends" });
});

export {
  sendRequest,
  getPendingRequest,
  acceptRequest,
  rejectRequest,
  getFriends,
};
