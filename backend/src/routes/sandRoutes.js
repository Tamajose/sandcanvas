import express from "express";
import { saveCanvas } from "../controllers/sandController.js";

const router = express.Router();

router.post("/", saveCanvas);

export default router;