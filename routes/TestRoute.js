import express from "express";
import { protect, authorize } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.get("/private", protect, (req, res) => {
  res.json({ message: `Hello ${req.user.name}, you are logged in!` });
});

router.get("/admin-only", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome admin! 🔑" });
});

export default router;
