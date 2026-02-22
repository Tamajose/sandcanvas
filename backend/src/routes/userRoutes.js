import express from "express";
import {
  updateProfilePicture,
  removeProfilePicture,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/profile-picture",
  protect,
  upload.single("image"),
  updateProfilePicture,
);

router.delete("/profile-picture", protect, removeProfilePicture);

export default router;
