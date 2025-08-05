import { v4 as uuidv4 } from 'uuid';
import { Book, CreateBookRequest, UpdateBookRequest } from '../types.js';
import fs from 'fs/promises';
import path from 'path';

// File-based storage
const DATA_FILE = path.join(process.cwd(), 'data', 'books.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'books');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Ensure uploads directory exists
async function ensureUploadsDirectory() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

// Load books from file
async function loadBooks(): Promise<Book[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const books = JSON.parse(data);
    // Convert date strings back to Date objects
    return books.map((book: any) => ({
      ...book,
      createdAt: new Date(book.createdAt),
      updatedAt: new Date(book.updatedAt),
      startDate: book.startDate ? new Date(book.startDate) : undefined,
      finishDate: book.finishDate ? new Date(book.finishDate) : undefined,
    }));
  } catch (error) {
    // File doesn't exist or is empty, return empty array
    return [];
  }
}

// Load books for a specific user
async function loadBooksForUser(userId: string): Promise<Book[]> {
  const allBooks = await loadBooks();
  return allBooks.filter(book => book.userId === userId);
}

// Save books to file
async function saveBooks(books: Book[]): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(DATA_FILE, JSON.stringify(books, null, 2));
}

// Save uploaded file
async function saveBookFile(file: Express.Multer.File, bookId: string): Promise<string> {
  await ensureUploadsDirectory();
  const fileExtension = path.extname(file.originalname);
  const fileName = `${bookId}${fileExtension}`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  
  await fs.writeFile(filePath, file.buffer);
  return fileName;
}

// Delete book file
async function deleteBookFile(bookId: string): Promise<void> {
  try {
    await ensureUploadsDirectory();
    const files = await fs.readdir(UPLOADS_DIR);
    const bookFile = files.find(file => file.startsWith(bookId));
    if (bookFile) {
      await fs.unlink(path.join(UPLOADS_DIR, bookFile));
    }
  } catch (error) {
    // File doesn't exist, that's fine
  }
}

export class BookModel {
  static async getAll(userId: string): Promise<Book[]> {
    return await loadBooksForUser(userId);
  }

  static async getById(id: string, userId: string): Promise<Book | null> {
    const books = await loadBooksForUser(userId);
    return books.find(book => book.id === id) || null;
  }

  static async getByStatus(status: string, userId: string): Promise<Book[]> {
    const books = await loadBooksForUser(userId);
    return books.filter(book => book.status === status);
  }

  static async create(data: CreateBookRequest, userId: string, file?: Express.Multer.File): Promise<Book> {
    const allBooks = await loadBooks();
    const now = new Date();
    const bookId = uuidv4();
    
    let pdfPath: string | undefined;
    if (file) {
      pdfPath = await saveBookFile(file, bookId);
    }

    const book: Book = {
      id: bookId,
      userId,
      title: data.title,
      author: data.author,
      genre: data.genre,
      status: data.status,
      rating: data.rating,
      notes: data.notes,
      pdfPath,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      startDate: data.status === 'currently_reading' ? now : undefined,
      finishDate: data.status === 'finished' ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };

    allBooks.push(book);
    await saveBooks(allBooks);
    return book;
  }

  static async update(id: string, data: UpdateBookRequest, userId: string, file?: Express.Multer.File): Promise<Book | null> {
    const allBooks = await loadBooks();
    const bookIndex = allBooks.findIndex(book => book.id === id && book.userId === userId);
    if (bookIndex === -1) return null;

    let pdfPath = books[bookIndex].pdfPath;
    if (file) {
      // Delete old file if exists
      if (pdfPath) {
        await deleteBookFile(id);
      }
      pdfPath = await saveBookFile(file, id);
    }

    const updatedBook = {
      ...books[bookIndex],
      ...data,
      pdfPath,
      updatedAt: new Date(),
    };

    // Handle status changes
    if (data.status === 'currently_reading' && !updatedBook.startDate) {
      updatedBook.startDate = new Date();
    }
    if (data.status === 'finished' && !updatedBook.finishDate) {
      updatedBook.finishDate = new Date();
    }

    allBooks[bookIndex] = updatedBook;
    await saveBooks(allBooks);
    return updatedBook;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const allBooks = await loadBooks();
    const bookIndex = allBooks.findIndex(book => book.id === id && book.userId === userId);
    if (bookIndex === -1) return false;

    // Delete associated file
    await deleteBookFile(id);

    allBooks.splice(bookIndex, 1);
    await saveBooks(allBooks);
    return true;
  }

  // Get statistics
  static async getStats(userId: string): Promise<{
    total: number;
    currentlyReading: number;
    finished: number;
    wantToRead: number;
    topGenres: { genre: string; count: number }[];
    averageRating: number;
  }> {
    const books = await loadBooksForUser(userId);
    
    const total = books.length;
    const currentlyReading = books.filter(book => book.status === 'currently_reading').length;
    const finished = books.filter(book => book.status === 'finished').length;
    const wantToRead = books.filter(book => book.status === 'want_to_read').length;

    // Calculate top genres
    const genreCounts: { [key: string]: number } = {};
    books.forEach(book => {
      genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
    });
    
    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate average rating
    const ratedBooks = books.filter(book => book.rating !== undefined);
    const averageRating = ratedBooks.length > 0 
      ? ratedBooks.reduce((sum, book) => sum + (book.rating || 0), 0) / ratedBooks.length
      : 0;

    return {
      total,
      currentlyReading,
      finished,
      wantToRead,
      topGenres,
      averageRating,
    };
  }

  // Get book file path
  static async getBookFilePath(bookId: string, userId: string): Promise<string | null> {
    try {
      await ensureUploadsDirectory();
      const files = await fs.readdir(UPLOADS_DIR);
      
      // First, try to find a file that starts with the book ID
      const bookFile = files.find(file => file.startsWith(bookId));
      if (bookFile) {
        return path.join(UPLOADS_DIR, bookFile);
      }
      
      // If not found, check if there's a PDF file with the book ID as the name
      const pdfFile = files.find(file => file === `${bookId}.pdf`);
      if (pdfFile) {
        return path.join(UPLOADS_DIR, pdfFile);
      }
      
      // If still not found, get the book data and check if the pdfPath exists
      const books = await loadBooksForUser(userId);
      const book = books.find(b => b.id === bookId);
      if (book && book.pdfPath) {
        const pdfPathFile = files.find(file => file === book.pdfPath);
        if (pdfPathFile) {
          return path.join(UPLOADS_DIR, pdfPathFile);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting book file path:', error);
      return null;
    }
  }
} 