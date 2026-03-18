import express from "express";
import {
  createAlbum,
  getUserAlbums,
  addImageToAlbum,
  removeImageFromAlbum,
  updateAlbum,
  deleteAlbum,
} from "../controllers/albumController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createAlbum);
router.get("/", protect, getUserAlbums);

router.post("/add-image", protect, addImageToAlbum);
router.post("/remove-image", protect, removeImageFromAlbum);

router.put("/:id", protect, updateAlbum);

router.delete("/:id", protect, deleteAlbum);

export default router;