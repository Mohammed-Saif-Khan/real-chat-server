import { Router } from "express";
import {
  login,
  logout,
  profile,
  register,
} from "../controller/auth.controller";
import { upload } from "../middleware/multer.middleware";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();

router.route("/signup").post(upload.single("avatar"), register);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout);
router.route("/profile").post(verifyJWT, profile);

export default router;
