import express from "express";
import {
  createRoom,
  getMyRooms,
  getRoomById,
  endRoom,
} from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes (Sirf logged-in interviewer ke liye)
router.post("/", protect, createRoom);
router.get("/", protect, getMyRooms);
router.patch("/:roomId/end", protect, endRoom);

// Public route (Candidate invite link se bina login kiye check/join kar sakega)
router.get("/:roomId", getRoomById);

export default router;