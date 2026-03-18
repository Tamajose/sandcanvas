import express from "express";
import {
  saveCanvas,
  getUserCreations,
  deleteCreation,
  getAllCreations,
  updateCreation,
} from "../controllers/sandController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("image"), saveCanvas);
router.get("/", protect, getUserCreations);
router.delete("/:id", protect, deleteCreation);
router.put("/:id", protect, updateCreation);
router.get("/all", getAllCreations);

export default router;
