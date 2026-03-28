import express from "express";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/AuthMiddleware.js";
import { adminOnly } from "../middleware/RoleMiddleware.js";
import { assignClubLead,getDashboardStats ,makeAdmin } from "../controllers/AdminController.js";
const router = express.Router();

router.put(
  "/make-clublead/:userId",
  protect,
  authorize("admin"),
  assignClubLead
);



router.get(
  "/stats",
  protect,
  authorize("admin"),
  getDashboardStats
);


router.put(
  "/make-admin",
  protect,
  authorize("admin"),
  makeAdmin
);
export default router;
