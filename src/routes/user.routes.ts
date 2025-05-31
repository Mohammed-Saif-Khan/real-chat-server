import { Router } from "express";
import {
  login,
  logout,
  profile,
  register,
  updateAvatar,
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
router.route("/profile/avatar").put(verifyJWT, updateAvatar);

export default router;
