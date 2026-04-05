import express from "express";
import {
  addComment,
  getCommentsByCreation,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:creationId", getCommentsByCreation);
router.post("/:creationId", protect, addComment);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);

export default router;
