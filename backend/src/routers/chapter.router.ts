// Chapter Router
// API routes for chapter operations

import { Router } from 'express';
import ChapterController from '../controllers/ChapterController.js';

const router = Router();

/**
 * GET /api/chapters/downloaded
 * Get all downloaded chapters
 */
router.get('/downloaded', ChapterController.getDownloadedChapters);

/**
 * GET /api/chapters/:id
 * Get chapter by ID with pages
 */
router.get('/:id', ChapterController.getChapterPages);

/**
 * POST /api/chapters/:id/download
 * Download chapter for offline reading
 */
router.post('/:id/download', ChapterController.downloadChapter);

/**
 * GET /api/manga/:mangaId/chapters
 * Get chapters for a manga
 */
router.get('/manga/:mangaId', ChapterController.getChaptersByMangaId);

/**
 * POST /api/manga/:mangaId/chapters/sync
 * Sync chapters from source
 */
router.post('/manga/:mangaId/sync', ChapterController.syncChapters);

export default router;
