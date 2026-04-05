import express from "express";
import cors from "cors";
import sandRoutes from "./routes/sandRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import albumRoutes from "./routes/albumRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

const app = express();

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

//Routes
app.use("/api/creations", sandRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/comments", commentRoutes);

//Check
app.get("/check", (req, res) => {
  res.json({ message: "Server is running" });
});

export default app;
