import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// user registration
export const registerUser = async (req, res) => {
    try{
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({
                message: "Email and Password required!"
            });
        }

        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({
                message: "User already exists!"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({ email, passwordHash });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d"}
        );

        res.status(201).json({
            message: "User registered successfully!",
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch(error){
        console.log("Registration Error: ", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// user login
export const loginUser = async (req, res) => {
    try{
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({
                message: "Email and Password required!"
            });
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({
                message: "Invalid Credentials!"
            });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch){
            return res.status(400).json({
                message: "Invalid Credentials!"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d"}
        );

        res.status(200).json({
            message: "User logged in successfully!",
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch(error){
        console.log("Login Error: ", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

export const googleLogin = async (req, res) => {
    try{
        const { credentials } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: credentials,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, sub } = payload;

        let user = await User.findOne({ email });

        if(!user){
            user = await User.create({
                email,
                googleId: sub
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d"}
        );

        res.status(200).json({
            message: "Google login successfully!",
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch(error){
        console.log("Google Auth Error: ", error);
        res.status(401).json({
            message: "Google Authentication Failed"
        });
    }
}