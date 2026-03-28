import express from "express";
import { createClub, getAllClubs, deleteClub,updateClub } from "../controllers/ClubController.js";
import { protect, authorize } from "../middleware/AuthMiddleware.js";
import multer from "multer";

const router = express.Router();

// ---------------- MULTER CONFIG ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // make sure 'uploads/' folder exists
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// ---------------- CLUB ROUTES ----------------

// Only admin can create club + upload logo
router.post("/create", protect, authorize("admin"), upload.single("logo"), createClub);

router.patch("/update/:id", protect, authorize("admin"), upload.single("logo"), updateClub); // <- ADD THIS

// Delete club
router.delete("/delete/:id", protect, authorize("admin"), deleteClub);

// Anyone logged in can view clubs
router.get("/", protect, getAllClubs);



export default router;