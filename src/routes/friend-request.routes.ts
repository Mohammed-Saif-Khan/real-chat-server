import { Router } from "express";
import {
  acceptFriendRequest,
  getAcceptedRequest,
  getPendingRequests,
  rejectFriendRequest,
  sendFriendRequest,
} from "../controller/friend-request.controller";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();

router.use(verifyJWT);

router.route("/send").post(sendFriendRequest);
router.route("/accept/:id").post(acceptFriendRequest);
router.route("/reject/:id").post(rejectFriendRequest);
router.route("/pending").get(getPendingRequests);
router.route("/aceepted").get(getAcceptedRequest);

export default router;
