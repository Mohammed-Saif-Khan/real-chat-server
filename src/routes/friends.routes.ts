import { Router } from "express";
import {
  acceptRequest,
  getFriends,
  getPendingRequest,
  rejectRequest,
  sendRequest,
} from "../controller/friends.controller";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();

router.route("/friend-request/:receiverId").post(verifyJWT, sendRequest);
router.route("/friend-request").get(verifyJWT, getPendingRequest);
router.route("/friend-request/:requestId/accept").put(verifyJWT, acceptRequest);
router.route("/friend-request/:requestId/reject").put(verifyJWT, rejectRequest);
router.route("/friends").get(verifyJWT, getFriends);

export default router;
