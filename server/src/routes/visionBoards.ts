import { Router } from "express";
import { VisionBoardController } from "../controllers/visionBoardController.js";

const router = Router();

// Get all vision boards
router.get("/", VisionBoardController.getAllVisionBoards);

// Get vision board by year and month
router.get("/year/:year/month/:month", VisionBoardController.getVisionBoardByYearAndMonth);

// Get image file (must come before /:id route)
router.get("/images/:imageId", VisionBoardController.getImage);

// Get vision board by ID
router.get("/:id", VisionBoardController.getVisionBoardById);

// Create new vision board
router.post("/", VisionBoardController.createVisionBoard);

// Update vision board
router.put("/:id", VisionBoardController.updateVisionBoard);

// Delete vision board
router.delete("/:id", VisionBoardController.deleteVisionBoard);

// Add image to vision board
router.post("/:boardId/images", VisionBoardController.uploadMiddleware, VisionBoardController.addImage);

// Update image in vision board
router.put("/:boardId/images/:imageId", VisionBoardController.updateImage);

// Delete image from vision board
router.delete("/:boardId/images/:imageId", VisionBoardController.deleteImage);

export default router; 