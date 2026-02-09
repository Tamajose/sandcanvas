import express from "express";
import { saveCanvas, getUserCreations } from "../controllers/sandController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("image"), saveCanvas);
router.get("/", protect, getUserCreations);

export default router;
