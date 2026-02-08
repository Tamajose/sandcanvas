import express from "express";
import { saveCanvas } from "../controllers/sandController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, saveCanvas);

export default router;