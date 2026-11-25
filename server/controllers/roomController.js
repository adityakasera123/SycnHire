import crypto from "crypto";
import Room from "../models/Room.js";

// 1. CREATE ROOM (POST /api/rooms) - Protected
export const createRoom = async (req, res) => {
  try {
    const { title, language } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Interview title is required" });
    }

    // Unique short Room ID banana (e.g., "sync-a1b2c3")
    const roomId = `sync-${crypto.randomBytes(3).toString("hex")}`;

    const room = await Room.create({
      roomId,
      title,
      language: language || "javascript",
      host: req.user._id, // Security Guard (protect) se mila user ID
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. GET ALL MY ROOMS (GET /api/rooms) - Protected
export const getMyRooms = async (req, res) => {
  try {
    // Sirf logged-in interviewer ke rooms, newest first
    const rooms = await Room.find({ host: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. GET SINGLE ROOM BY ROOM ID (GET /api/rooms/:roomId) - Public (for candidates)
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId }).populate(
      "host",
      "name"
    );

    if (!room) {
      return res.status(404).json({ message: "Interview room not found" });
    }

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. END ROOM (PATCH /api/rooms/:roomId/end) - Protected (Host only)
export const endRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ message: "Interview room not found" });
    }

    // Check karo ki kya yahi user is room ka host hai?
    if (room.host.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the host can end this interview" });
    }

    room.status = "ended";
    await room.save();

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};