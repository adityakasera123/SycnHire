import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper function: User ke liye VIP Pass (JWT Token) banane ke liye
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Yeh pass 7 din tak valid rahega
  });
};

// 1. SIGNUP (Naya Interviewer Account banana)
export const registerUser = async (req, res) => {
  try {
    // Step 1: Frontend se aaya hua naam, email, password nikalo
    const { name, email, password } = req.body;

    // Check karo kahin koi dabba khali toh nahi chhod diya
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // Step 2: Check karo kya is email se pehle se koi account hai?
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Step 3: Password ko mixer-grinder (bcrypt) se encrypt karo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step 4: MongoDB mein naya user save karo
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Step 5: Success! User ka data + VIP Pass (token) wapas bhejo
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. LOGIN (Purane Interviewer ko andar aane dena)
export const loginUser = async (req, res) => {
  try {
    // Step 1: Frontend se email aur password nikalo
    const { email, password } = req.body;

    // Step 2: Check karo kya yeh email hamare database mein hai?
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Step 3: Password match karo (Typed password vs DB ka encrypted password)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Step 4: Sab sahi hai! User ka data + naya VIP Pass (token) bhejo
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. GET CURRENT USER (Logged-in user ki profile dekhna)
export const getMe = async (req, res) => {
  // Security Guard (protect) ne req.user mein pehle hi user ka data daal diya hai
  res.status(200).json(req.user);
};