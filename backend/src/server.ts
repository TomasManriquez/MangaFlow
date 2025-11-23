// Express Server
// Main application entry point

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import mangaRouter from './routers/manga.router.js';
import chapterRouter from './routers/chapter.router.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

// CORS - Allow frontend access
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4321',
    credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(logger);

// ==========================================
// ROUTES
// ==========================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'MangaFlow API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/manga', mangaRouter);
app.use('/api/chapters', chapterRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handler (must be last)
app.use(errorHandler);

// ==========================================
// SERVER START
// ==========================================

app.listen(PORT, () => {
    console.log('');
    console.log('🚀 MangaFlow Backend Server');
    console.log('================================');
    console.log(`📍 Running on: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Health check: http://localhost:${PORT}/health`);
    console.log('================================');
    console.log('');
});

export default app;
