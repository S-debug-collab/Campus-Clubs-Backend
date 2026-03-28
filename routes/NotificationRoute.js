import express from "express";
import { protect } from "../middleware/AuthMiddleware.js";
import { getMyNotifications } from "../controllers/NotificationController.js";

const router = express.Router();

// ✅ ONLY THIS
router.get("/", protect, getMyNotifications);

export default router;