// Manga Router
// API routes for manga operations

import { Router } from 'express';
import MangaController from '../controllers/MangaController.js';

const router = Router();

/**
 * GET /api/manga
 * Get all mangas with pagination
 */
router.get('/', MangaController.getAllMangas);

/**
 * GET /api/manga/stats
 * Get manga statistics
 */
router.get('/stats', MangaController.getStats);

/**
 * GET /api/manga/:id
 * Get manga by ID
 */
router.get('/:id', MangaController.getMangaById);

/**
 * POST /api/manga/search
 * Search mangas
 */
router.post('/search', MangaController.searchMangas);

/**
 * POST /api/manga/sync
 * Sync manga from external source
 */
router.post('/sync', MangaController.syncMangaFromSource);

export default router;
