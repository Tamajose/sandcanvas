import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
  getUserInfo,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// register
router.post("/register", registerUser);

// login
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.get("/info", protect, getUserInfo);

export default router;
