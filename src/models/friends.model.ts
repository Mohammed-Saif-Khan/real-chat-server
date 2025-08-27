import mongoose, { Model, Schema } from "mongoose";
import { IFriend } from "../types/friend-request";

const friendSchema = new Schema<IFriend>(
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
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false }
);

export const Friend: Model<IFriend> = mongoose.model<IFriend>(
  "Friend",
  friendSchema
);
