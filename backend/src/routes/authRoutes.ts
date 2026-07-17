import express from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/User.js";
import {
  signUp,
  logIn,
  forgot,
  verifyCode,
  confirm,
  reset,
  confirm_get,
} from "../controllers/authControl.js";
import { middleAuth } from "../middlewares/authMiddleware.js";

const currentUser = async (req: Request, res: Response) => {
  const token = req.cookies.access_token;
  if (!token || !env.ACCESS_SECRET) {
    return res.status(401).json({ auth_error: "Not authenticated" });
  }

  const payload = jwt.verify(token, env.ACCESS_SECRET);
  if (typeof payload !== "object" || !payload.userId) {
    return res.status(401).json({ auth_error: "Invalid session" });
  }

  const user = await User.findById(payload.userId).lean();
  if (!user) {
    return res.status(404).json({ data_error: "User not found" });
  }

  return res.json({
    user: {
      id: String(user._id),
      name: user.user_name,
      email: user.user_email,
      isVerified: user.isVerified,
      createdAtISO: user.createdAt?.toISOString?.(),
      updatedAtISO: user.updatedAt?.toISOString?.(),
    },
  });
};

const authRoutes = () => {
  const router = express.Router();
  router.get("/me", middleAuth, currentUser);
  router.post("/signup", signUp);
  router.post("/confirm", confirm);
  router.post("/login", logIn);
  router.post("/forgot", forgot);
  router.post("/verify", verifyCode);
  router.post("/reset", reset);
  router.get("/confirm_link/:confirmation_link_id", confirm_get);
  return router;
};
export default authRoutes;
