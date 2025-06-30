import { Router } from "express";
import {
  acceptFriendRequest,
  getAcceptedRequest,
  getPendingRequests,
  rejectFriendRequest,
  sendFriendRequest,
} from "../controller/friend-request.controller";

const router = Router();

router.route("/send").post(sendFriendRequest);
router.route("/accept/:id").post(acceptFriendRequest);
router.route("/reject/:id").post(rejectFriendRequest);
router.route("/pending").get(getPendingRequests);
router.route("/aceepted").get(getAcceptedRequest);

export default router;
