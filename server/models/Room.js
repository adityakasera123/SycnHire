import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Please add an interview title"],
      trim: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // User model se link karega
      required: true,
    },
    language: {
      type: String,
      enum: ["javascript", "python", "cpp", "java"],
      default: "javascript",
    },
    code: {
      type: String,
      default: "// Write your code here...\n",
    },
    notes: {
      type: String,
      default: "",
    },
    messages: [
      {
        id: Number,
        message: String,
        senderName: String,
        senderRole: String,
        timestamp: String,
      },
    ],
    status: {
      type: String,
      enum: ["active", "ended"],
      default: "active",
    },
  },
  {
    timestamps: true, // createdAt aur updatedAt apne aap add ho jayenge
  }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;