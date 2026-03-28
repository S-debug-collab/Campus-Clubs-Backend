import express from "express";
import { protect } from "../middleware/AuthMiddleware.js";
import {
  createSuggestion,
  getSuggestions,
  toggleVote
} from "../controllers/SuggestionController.js";

const router = express.Router();


router.post("/", protect, createSuggestion);

router.get("/", protect, getSuggestions);

router.post("/:id/vote", protect, toggleVote);

export default router;