import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { VisionBoard, VisionImage, CreateVisionBoardRequest, UpdateVisionBoardRequest, UpdateVisionImageRequest } from "../types.js";

const DATA_DIR = path.join(process.cwd(), "data");
const VISION_BOARDS_FILE = path.join(DATA_DIR, "vision-boards.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads", "vision-boards");

export class VisionBoardModel {
  private static async ensureDataDir() {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  private static async ensureUploadsDir() {
    try {
      await fs.access(UPLOADS_DIR);
    } catch {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
    }
  }

  private static async readVisionBoards(): Promise<VisionBoard[]> {
    try {
      const data = await fs.readFile(VISION_BOARDS_FILE, "utf-8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private static async writeVisionBoards(boards: VisionBoard[]): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(VISION_BOARDS_FILE, JSON.stringify(boards, null, 2));
  }

  static async getAll(): Promise<VisionBoard[]> {
    return await this.readVisionBoards();
  }

  static async getById(id: string): Promise<VisionBoard | null> {
    const boards = await this.readVisionBoards();
    return boards.find(board => board.id === id) || null;
  }

  static async getByYearAndMonth(year: number, month: number): Promise<VisionBoard | null> {
    const boards = await this.readVisionBoards();
    return boards.find(board => board.year === year && board.month === month) || null;
  }

  static async create(data: CreateVisionBoardRequest): Promise<VisionBoard> {
    const boards = await this.readVisionBoards();
    
    const newBoard: VisionBoard = {
      id: uuidv4(),
      year: data.year,
      month: data.month,
      title: data.title,
      description: data.description,
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    boards.push(newBoard);
    await this.writeVisionBoards(boards);
    
    return newBoard;
  }

  static async update(id: string, data: UpdateVisionBoardRequest): Promise<VisionBoard | null> {
    const boards = await this.readVisionBoards();
    const boardIndex = boards.findIndex(board => board.id === id);
    
    if (boardIndex === -1) {
      return null;
    }

    boards[boardIndex] = {
      ...boards[boardIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeVisionBoards(boards);
    return boards[boardIndex];
  }

  static async delete(id: string): Promise<boolean> {
    const boards = await this.readVisionBoards();
    const filteredBoards = boards.filter(board => board.id !== id);
    
    if (filteredBoards.length === boards.length) {
      return false; // Board not found
    }

    // Delete associated images
    const board = boards.find(b => b.id === id);
    if (board) {
      for (const image of board.images) {
        try {
          await fs.unlink(path.join(UPLOADS_DIR, image.fileName));
        } catch (error) {
          console.error(`Failed to delete image file: ${image.fileName}`, error);
        }
      }
    }

    await this.writeVisionBoards(filteredBoards);
    return true;
  }

  static async addImage(boardId: string, file: Express.Multer.File): Promise<VisionImage | null> {
    const boards = await this.readVisionBoards();
    const boardIndex = boards.findIndex(board => board.id === boardId);
    
    if (boardIndex === -1) {
      return null;
    }

    await this.ensureUploadsDir();
    
    const imageId = uuidv4();
    const fileName = `${imageId}-${file.originalname}`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    // Save the file
    await fs.writeFile(filePath, file.buffer);

    const newImage: VisionImage = {
      id: imageId,
      visionBoardId: boardId,
      fileName: fileName,
      filePath: filePath,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 200 },
      rotation: 0,
      zIndex: boards[boardIndex].images.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    boards[boardIndex].images.push(newImage);
    boards[boardIndex].updatedAt = new Date().toISOString();
    
    await this.writeVisionBoards(boards);
    return newImage;
  }

  static async updateImage(boardId: string, imageId: string, data: UpdateVisionImageRequest): Promise<VisionImage | null> {
    const boards = await this.readVisionBoards();
    const boardIndex = boards.findIndex(board => board.id === boardId);
    
    if (boardIndex === -1) {
      return null;
    }

    const imageIndex = boards[boardIndex].images.findIndex(img => img.id === imageId);
    if (imageIndex === -1) {
      return null;
    }

    boards[boardIndex].images[imageIndex] = {
      ...boards[boardIndex].images[imageIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    boards[boardIndex].updatedAt = new Date().toISOString();
    await this.writeVisionBoards(boards);
    return boards[boardIndex].images[imageIndex];
  }

  static async deleteImage(boardId: string, imageId: string): Promise<boolean> {
    const boards = await this.readVisionBoards();
    const boardIndex = boards.findIndex(board => board.id === boardId);
    
    if (boardIndex === -1) {
      return false;
    }

    const imageIndex = boards[boardIndex].images.findIndex(img => img.id === imageId);
    if (imageIndex === -1) {
      return false;
    }

    const image = boards[boardIndex].images[imageIndex];
    
    // Delete the file
    try {
      await fs.unlink(path.join(UPLOADS_DIR, image.fileName));
    } catch (error) {
      console.error(`Failed to delete image file: ${image.fileName}`, error);
    }

    boards[boardIndex].images.splice(imageIndex, 1);
    boards[boardIndex].updatedAt = new Date().toISOString();
    
    await this.writeVisionBoards(boards);
    return true;
  }

  static async getImagePath(imageId: string): Promise<string | null> {
    const boards = await this.readVisionBoards();
    for (const board of boards) {
      const image = board.images.find(img => img.id === imageId);
      if (image) {
        return path.join(UPLOADS_DIR, image.fileName);
      }
    }
    return null;
  }
} 