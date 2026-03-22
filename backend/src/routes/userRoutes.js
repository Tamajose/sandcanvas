import express from "express";
import {
  updateProfilePicture,
  removeProfilePicture,
  updateUser,
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

router.put("/", protect, updateUser);

export default router;
