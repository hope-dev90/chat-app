import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  findUserById,
  saveOtp,
  verifyOtp,
  clearOtp,
  markEmailVerified,
  updatePassword,
  getAllUsers,
} from "../models/userModel.js";
import { sendOtpEmail } from "../utils/sendEmail.js";

// ─── Generate JWT ──────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ─── Generate OTP ──────────────────────────────────────────────
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getDatabaseErrorMessage = (error) => {
  if (error.code === "42P01") {
    return "Database tables are missing. Run npm run db:setup, then try again.";
  }

  if (error.code === "42703") {
    return `Database column is missing: ${error.column || error.message}. Run npm run db:setup, then try again.`;
  }

  if (error.code === "23505") {
    return "Email already exists";
  }

  return null;
};

// ─── Register ──────────────────────────────────────────────────
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Validate fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate role
    if (!["girl", "mentor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be girl or mentor",
      });
    }

    // Check if email exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Save OTP
    await saveOtp(email, otp, expiresAt);

    await sendOtpEmail({
      to: email,
      otp,
      purpose: "verify your email",
    });
    console.log(`Verification OTP sent to ${email}`);

    return res.status(201).json({
      success: true,
      message: "Registration successful! Check your email for OTP",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("register error:", error);
    const databaseMessage = getDatabaseErrorMessage(error);

    if (databaseMessage) {
      return res.status(error.code === "23505" ? 400 : 500).json({
        success: false,
        message: databaseMessage,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ─── Verify OTP ────────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Check OTP
    const user = await verifyOtp(email, otp);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark email as verified
    await markEmailVerified(email);

    // Clear OTP
    await clearOtp(email);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now login",
    });
  } catch (error) {
    console.error("verifyEmail error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ─── Login ─────────────────────────────────────────────────────
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if verified
    if (!user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    const databaseMessage = getDatabaseErrorMessage(error);

    if (databaseMessage) {
      return res.status(500).json({
        success: false,
        message: databaseMessage,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ─── Get Profile ───────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ─── Forgot Password ───────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email not found",
      });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await saveOtp(email, otp, expiresAt);

    await sendOtpEmail({
      to: email,
      otp,
      purpose: "reset your password",
    });
    console.log(`Password reset OTP sent to ${email}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ─── Reset Password ────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Verify OTP
    const user = await verifyOtp(email, otp);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await updatePassword(email, hashedPassword);

    // Clear OTP
    await clearOtp(email);

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ─── Get All Users (for DMs) ───────────────────────────────────
export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers(req.user.id);
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("getAllUsersController error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
