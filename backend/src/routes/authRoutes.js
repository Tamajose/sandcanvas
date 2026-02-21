import express from "express";
import { registerUser, loginUser, googleLogin } from "../controllers/authController.js";

const router = express.Router();

// register
router.post("/register", registerUser);

// login
router.post("/login", loginUser);
router.post("/google", googleLogin);

export default router;