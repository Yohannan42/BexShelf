import { Router } from "express";
import { QuickNoteController } from "../controllers/quickNoteController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Quick note routes - all require authentication
router.use(authenticateToken);

// GET /api/quick-notes - Get all quick notes
router.get("/", QuickNoteController.getAllQuickNotes);

// GET /api/quick-notes/count - Get quick notes count
router.get("/count", QuickNoteController.getQuickNotesCount);

// GET /api/quick-notes/:id - Get a specific quick note
router.get("/:id", QuickNoteController.getQuickNoteById);

// POST /api/quick-notes - Create a new quick note
router.post("/", QuickNoteController.createQuickNote);

// PUT /api/quick-notes/:id - Update a quick note
router.put("/:id", QuickNoteController.updateQuickNote);

// DELETE /api/quick-notes/:id - Delete a quick note
router.delete("/:id", QuickNoteController.deleteQuickNote);

export default router; 