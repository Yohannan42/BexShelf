import { Router } from "express";
import { NoteController } from "../controllers/noteController.js";

const router = Router();

// Get all notes
router.get("/", NoteController.getAllNotes);

// Get pinned notes
router.get("/pinned", NoteController.getPinnedNotes);

// Search notes
router.get("/search", NoteController.searchNotes);

// Get note by ID
router.get("/:id", NoteController.getNoteById);

// Create new note
router.post("/", NoteController.createNote);

// Update note
router.put("/:id", NoteController.updateNote);

// Delete note
router.delete("/:id", NoteController.deleteNote);

export default router; 