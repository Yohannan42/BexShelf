import { Router } from "express";
import { TaskController } from "../controllers/taskController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

// Get all tasks
router.get("/", TaskController.getAllTasks);

// Get task statistics
router.get("/stats", TaskController.getTaskStats);

// Get tasks by status
router.get("/status/:status", TaskController.getTasksByStatus);

// Get tasks by date
router.get("/date/:date", TaskController.getTasksByDate);

// Get task by ID
router.get("/:id", TaskController.getTaskById);

// Create new task
router.post("/", TaskController.createTask);

// Update task
router.put("/:id", TaskController.updateTask);

// Delete task
router.delete("/:id", TaskController.deleteTask);

export default router; 