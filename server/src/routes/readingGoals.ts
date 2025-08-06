import { Router } from "express";
import { ReadingGoalController } from "../controllers/readingGoalController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Reading goal routes - all require authentication
router.use(authenticateToken);

// GET /api/reading-goals - Get all reading goals
router.get("/", ReadingGoalController.getAllReadingGoals);

// GET /api/reading-goals/active - Get active reading goal
router.get("/active", ReadingGoalController.getActiveReadingGoal);

// GET /api/reading-goals/year/:year - Get reading goal by year
router.get("/year/:year", ReadingGoalController.getReadingGoalByYear);

// GET /api/reading-goals/:id - Get a specific reading goal
router.get("/:id", ReadingGoalController.getReadingGoalById);

// POST /api/reading-goals - Create a new reading goal
router.post("/", ReadingGoalController.createReadingGoal);

// PUT /api/reading-goals/:id - Update a reading goal
router.put("/:id", ReadingGoalController.updateReadingGoal);

// DELETE /api/reading-goals/:id - Delete a reading goal
router.delete("/:id", ReadingGoalController.deleteReadingGoal);

export default router; 