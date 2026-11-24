import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Yeh hamara Security Guard hai
export const protect = async (req, res, next) => {
  try {
    let token;

    // Step 1: Check karo kya request ke header mein "Bearer <token>" aaya hai?
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // "Bearer eyJhbG..." mein se sirf token wala hissa nikalo
      token = req.headers.authorization.split(" ")[1];
    }

    // Agar token mila hi nahi, toh gate par hi rok do
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Step 2: Check karo kya token par hamara asli JWT_SECRET thappa laga hai?
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 3: Database se us user ki details nikalo (password chhod kar)
    req.user = await User.findById(decoded.id).select("-password");

    // Step 4: Sab sahi hai! Agle step (Controller) par jaane do
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};