import { Request, Response } from "express";
import { VisionBoardModel } from "../models/visionBoard.js";
import { CreateVisionBoardRequest, UpdateVisionBoardRequest, UpdateVisionImageRequest } from "../types.js";
import multer from "multer";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export class VisionBoardController {
  static uploadMiddleware = upload.single('image');

  static async getAllVisionBoards(req: Request, res: Response) {
    try {
      const boards = await VisionBoardModel.getAll();
      res.json(boards);
    } catch (error) {
      console.error("Error fetching vision boards:", error);
      res.status(500).json({ error: "Failed to fetch vision boards" });
    }
  }

  static async getVisionBoardById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const board = await VisionBoardModel.getById(id);
      
      if (!board) {
        return res.status(404).json({ error: "Vision board not found" });
      }
      
      res.json(board);
    } catch (error) {
      console.error("Error fetching vision board:", error);
      res.status(500).json({ error: "Failed to fetch vision board" });
    }
  }

  static async getVisionBoardByYearAndMonth(req: Request, res: Response) {
    try {
      const { year, month } = req.params;
      const board = await VisionBoardModel.getByYearAndMonth(
        parseInt(year),
        parseInt(month)
      );
      
      if (!board) {
        return res.status(404).json({ error: "Vision board not found" });
      }
      
      res.json(board);
    } catch (error) {
      console.error("Error fetching vision board:", error);
      res.status(500).json({ error: "Failed to fetch vision board" });
    }
  }

  static async createVisionBoard(req: Request, res: Response) {
    try {
      const boardData: CreateVisionBoardRequest = req.body;
      
      // Validate required fields
      if (!boardData.year || !boardData.month) {
        return res.status(400).json({ 
          error: "Year and month are required" 
        });
      }

      const newBoard = await VisionBoardModel.create(boardData);
      res.status(201).json(newBoard);
    } catch (error) {
      console.error("Error creating vision board:", error);
      res.status(500).json({ error: "Failed to create vision board" });
    }
  }

  static async updateVisionBoard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateVisionBoardRequest = req.body;

      const updatedBoard = await VisionBoardModel.update(id, updateData);
      
      if (!updatedBoard) {
        return res.status(404).json({ error: "Vision board not found" });
      }
      
      res.json(updatedBoard);
    } catch (error) {
      console.error("Error updating vision board:", error);
      res.status(500).json({ error: "Failed to update vision board" });
    }
  }

  static async deleteVisionBoard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await VisionBoardModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Vision board not found" });
      }
      
      res.json({ message: "Vision board deleted successfully" });
    } catch (error) {
      console.error("Error deleting vision board:", error);
      res.status(500).json({ error: "Failed to delete vision board" });
    }
  }

  static async addImage(req: Request, res: Response) {
    try {
      const { boardId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const newImage = await VisionBoardModel.addImage(boardId, req.file);
      
      if (!newImage) {
        return res.status(404).json({ error: "Vision board not found" });
      }
      
      res.status(201).json(newImage);
    } catch (error) {
      console.error("Error adding image:", error);
      res.status(500).json({ error: "Failed to add image" });
    }
  }

  static async updateImage(req: Request, res: Response) {
    try {
      const { boardId, imageId } = req.params;
      const updateData: UpdateVisionImageRequest = req.body;

      const updatedImage = await VisionBoardModel.updateImage(boardId, imageId, updateData);
      
      if (!updatedImage) {
        return res.status(404).json({ error: "Vision board or image not found" });
      }
      
      res.json(updatedImage);
    } catch (error) {
      console.error("Error updating image:", error);
      res.status(500).json({ error: "Failed to update image" });
    }
  }

  static async deleteImage(req: Request, res: Response) {
    try {
      const { boardId, imageId } = req.params;
      const deleted = await VisionBoardModel.deleteImage(boardId, imageId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Vision board or image not found" });
      }
      
      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  }

  static async getImage(req: Request, res: Response) {
    try {
      const { imageId } = req.params;
      const imagePath = await VisionBoardModel.getImagePath(imageId);
      
      if (!imagePath) {
        return res.status(404).json({ error: "Image not found" });
      }

      // Set CORS headers for image serving
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      res.header('Cross-Origin-Resource-Policy', 'cross-origin');
      
      res.sendFile(imagePath);
    } catch (error) {
      console.error("Error fetching image:", error);
      res.status(500).json({ error: "Failed to fetch image" });
    }
  }
} 