import { Router } from "express";
import { register } from "../controller/auth.controller";
import { upload } from "../middleware/multer.middleware";

const router = Router();

router.route("/signup").post(upload.single("avatar"), register);

export default router;
