import express from "express";
import {
  createEvent,
  getAllEvents,
  getMyEvents,
  uploadEventPhotos,
  uploadEventReport,
  completeEvent,
  registerEvent,
  deleteEvent,
  updateEvent
} from "../controllers/EventController.js";

import { protect, authorize } from "../middleware/AuthMiddleware.js";
import upload from "../middleware/Upload.js";

const router = express.Router();

// CREATE EVENT
router.post(
  "/create",
  protect,
  authorize("clubLead"),
  upload.single("poster"),
  createEvent
);
router.delete("/:id", protect, deleteEvent);
// GET ALL EVENTS (with optional ?club=id)
router.get("/", getAllEvents);
router.patch(
  "/:id/update",
  protect,
  authorize("clubLead"),
  updateEvent
);// GET MY EVENTS
router.get(
  "/my-events",
  protect,
  authorize("clubLead"),
  getMyEvents
);

// COMPLETE EVENT
router.put(
  "/complete/:id",
  protect,
  authorize("clubLead"),
  completeEvent
);



router.post(
  "/:id/register",
  protect,
  authorize("student","clubLead"),
  registerEvent
);



export default router;