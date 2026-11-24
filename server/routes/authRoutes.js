import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (Bina login ke chalenge)
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route (Pehle Security Guard 'protect' check karega, phir 'getMe' chalega)
router.get("/me", protect, getMe);

export default router;