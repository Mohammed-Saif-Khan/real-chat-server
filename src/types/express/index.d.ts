import { ObjectId } from "mongoose";
import { User } from "../../models/auth.model";

declare global {
  namespace Express {
    interface Request {
      user?: typeof User.prototype & { _id: ObjectId };
    }
  }
}
