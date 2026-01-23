import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sandRoutes from "./routes/sandRoutes.js";
dotenv.config();

const app = express();

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api/creations", sandRoutes);

//Check
app.get("/check", (req, res) => {
    res.json({ message: "Server is running" });
});

export default app;