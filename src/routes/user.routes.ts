import { Router } from "express";
import {
  login,
  logout,
  profile,
  register,
  requestPasswordReset,
  resetPassword,
  updateAvatar,
  updatePassword,
  updateProfile,
} from "../controller/auth.controller";
import { upload } from "../middleware/multer.middleware";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();

router.route("/signup").post(upload.single("avatar"), register);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout);
router.route("/profile").post(verifyJWT, profile);
router.route("/profile").put(verifyJWT, updateProfile);
router
  .route("/profile/avatar")
  .put(upload.single("avatar"), verifyJWT, updateAvatar);
router.route("/reset-password-request").post(requestPasswordReset);
router.route("/reset-password/:token").post(resetPassword);
router.route("/update-password").post(verifyJWT, updatePassword);

export default router;
