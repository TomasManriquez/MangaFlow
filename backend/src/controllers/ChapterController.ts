// Chapter Controller
// Business logic for chapter operations

import { Request, Response, NextFunction } from 'express';
import ChapterRepository from '../repositories/ChapterRepository.js';
import ScraperFactory from '../scrapers/ScraperFactory.js';
import MangaRepository from '../repositories/MangaRepository.js';

export class ChapterController {
    /**
     * Get chapters by manga ID
     */
    async getChaptersByMangaId(req: Request, res: Response, next: NextFunction) {
        try {
            const { mangaId } = req.params;

            const chapters = await ChapterRepository.findByMangaId(mangaId);

            res.json({
                success: true,
                data: chapters
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get chapter pages
     */
    async getChapterPages(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const chapter = await ChapterRepository.findById(id);

            if (!chapter) {
                return res.status(404).json({
                    success: false,
                    error: 'Chapter not found'
                });
            }

            // If pages not in database, fetch from source
            if (!chapter.pages || chapter.pages.length === 0) {
                const scraper = ScraperFactory.getScraper(chapter.source as any);
                const pages = await scraper.getChapterPages(chapter.sourceChapterId);

                // Save pages to database
                await ChapterRepository.upsert({
                    mangaId: chapter.mangaId,
                    chapterNumber: chapter.chapterNumber,
                    title: chapter.title || undefined,
                    volume: chapter.volume || undefined,
                    language: chapter.language,
                    source: chapter.source,
                    sourceChapterId: chapter.sourceChapterId,
                    sourceUrl: chapter.sourceUrl,
                    pages: pages.map(p => ({
                        pageNumber: p.pageNumber,
                        imageUrl: p.imageUrl,
                        width: p.width,
                        height: p.height
                    }))
                });

                // Re-fetch chapter with pages
                const updatedChapter = await ChapterRepository.findById(id);
                return res.json({
                    success: true,
                    data: updatedChapter
                });
            }

            res.json({
                success: true,
                data: chapter
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Sync chapters for a manga
     */
    async syncChapters(req: Request, res: Response, next: NextFunction) {
        try {
            const { mangaId } = req.params;

            const manga = await MangaRepository.findById(mangaId);

            if (!manga) {
                return res.status(404).json({
                    success: false,
                    error: 'Manga not found'
                });
            }

            if (!manga.sources || manga.sources.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Manga has no external sources'
                });
            }

            // Use the first source
            const source = manga.sources[0];
            const scraper = ScraperFactory.getScraper(source.source as any);

            // Fetch chapters from source
            const chapters = await scraper.getChapterList(source.sourceId);

            // Save chapters to database
            const savePromises = chapters.map(chapter =>
                ChapterRepository.upsert({
                    mangaId,
                    chapterNumber: chapter.chapterNumber,
                    title: chapter.title,
                    volume: chapter.volume,
                    language: chapter.language,
                    source: source.source,
                    sourceChapterId: chapter.id,
                    sourceUrl: chapter.sourceUrl,
                    publishedAt: chapter.publishedAt
                })
            );

            await Promise.all(savePromises);

            res.json({
                success: true,
                message: `Synced ${chapters.length} chapters`,
                data: chapters
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Download chapter for offline reading
     */
    async downloadChapter(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const chapter = await ChapterRepository.findById(id);

            if (!chapter) {
                return res.status(404).json({
                    success: false,
                    error: 'Chapter not found'
                });
            }

            if (chapter.isDownloaded) {
                return res.json({
                    success: true,
                    message: 'Chapter already downloaded',
                    data: chapter
                });
            }

            // TODO: Implement actual download logic
            // This would download images and save locally
            // For now, just mark as downloaded

            const downloadPath = `./storage/manga/${chapter.mangaId}/${chapter.id}`;
            await ChapterRepository.markAsDownloaded(id, downloadPath);

            res.json({
                success: true,
                message: 'Chapter download initiated',
                data: { downloadPath }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get downloaded chapters
     */
    async getDownloadedChapters(req: Request, res: Response, next: NextFunction) {
        try {
            const chapters = await ChapterRepository.getDownloaded();

            res.json({
                success: true,
                data: chapters
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ChapterController();
