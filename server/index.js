import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// .env file ke variables load karne ke liye
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(cors()); // Frontend ko allow karega
app.use(express.json()); // Incoming JSON data ko padhne ke liye

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "SyncHire Backend is running!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import connectDB from "./config/db.js"; // Top par imports ke saath

// dotenv.config(); ke neeche:
connectDB();