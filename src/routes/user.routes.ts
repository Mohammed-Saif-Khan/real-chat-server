import { Router } from "express";
import { login, logout, register } from "../controller/auth.controller";
import { upload } from "../middleware/multer.middleware";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();

router.route("/signup").post(upload.single("avatar"), register);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout);

export default router;
