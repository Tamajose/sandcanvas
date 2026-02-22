import express from "express";
import cors from "cors";
import sandRoutes from "./routes/sandRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

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

//Check
app.get("/check", (req, res) => {
  res.json({ message: "Server is running" });
});

export default app;
