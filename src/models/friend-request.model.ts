import mongoose, { Model, Schema } from "mongoose";
import { IFriendRequest } from "../types/friend-request";

const friendRequestSchema = new Schema<IFriendRequest>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
    },
  },
  { timestamps: true, versionKey: false }
);

export const Friend: Model<IFriendRequest> = mongoose.model<IFriendRequest>(
  "FriendRequest",
  friendRequestSchema
);
