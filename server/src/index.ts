import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import writingProjectsRoutes from './routes/writingProjects.js';
import journalsRoutes from './routes/journals.js';
import booksRoutes from './routes/books.js';
import tasksRoutes from './routes/tasks.js';
import notesRoutes from './routes/notes.js';
import visionBoardsRoutes from './routes/visionBoards.js';
import quickNotesRoutes from './routes/quickNotes.js';
import readingGoalsRoutes from './routes/readingGoals.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:3001"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));
app.use(cors({
  origin: [
    'http://localhost:4000',
    'http://localhost:4001', 
    'http://localhost:4002',
    'http://localhost:4003',
    'http://localhost:5173',
    'https://bex-shelf-8cg47kog7-yohannan-woldesemayats-proje.vercel.app',
    'https://bex-shelf.vercel.app',
    process.env.FRONTEND_URL
  ].filter((url): url is string => Boolean(url)),
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/writing-projects', writingProjectsRoutes);
app.use('/api/journals', journalsRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/quick-notes', quickNotesRoutes);
app.use('/api/reading-goals', readingGoalsRoutes);
// Add CORS headers for image serving
app.use('/api/vision-boards/images/:imageId', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/api/vision-boards', visionBoardsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔐 Authentication API available at http://localhost:${PORT}/api/auth`);
  console.log(`📝 Writing Projects API available at http://localhost:${PORT}/api/writing-projects`);
  console.log(`📔 Journals API available at http://localhost:${PORT}/api/journals`);
  console.log(`📚 Books API available at http://localhost:${PORT}/api/books`);
  console.log(`✅ Tasks API available at http://localhost:${PORT}/api/tasks`);
  console.log(`📝 Notes API available at http://localhost:${PORT}/api/notes`);
  console.log(`📝 Quick Notes API available at http://localhost:${PORT}/api/quick-notes`);
  console.log(`📖 Reading Goals API available at http://localhost:${PORT}/api/reading-goals`);
  console.log(`✨ Vision Boards API available at http://localhost:${PORT}/api/vision-boards`);
}); 