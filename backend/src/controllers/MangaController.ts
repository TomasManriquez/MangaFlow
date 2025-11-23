// Manga Controller
// Business logic layer for manga operations

import { Request, Response, NextFunction } from 'express';
import MangaRepository from '../repositories/MangaRepository.js';
import ScraperFactory from '../scrapers/ScraperFactory.js';

export class MangaController {
    /**
     * Get all mangas with pagination
     */
    async getAllMangas(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;

            const mangas = await MangaRepository.findAll(skip, limit);

            res.json({
                success: true,
                data: mangas,
                pagination: {
                    page,
                    limit,
                    hasMore: mangas.length === limit
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get manga by ID
     */
    async getMangaById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const manga = await MangaRepository.findById(id);

            if (!manga) {
                return res.status(404).json({
                    success: false,
                    error: 'Manga not found'
                });
            }

            res.json({
                success: true,
                data: manga
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Search mangas locally and across sources
     */
    async searchMangas(req: Request, res: Response, next: NextFunction) {
        try {
            const { query, sources } = req.body;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Query is required'
                });
            }

            // Search in local database first
            const localResults = await MangaRepository.search(query);

            // If sources specified, search external sources
            let externalResults: any[] = [];
            if (sources && Array.isArray(sources)) {
                const searchPromises = sources.map(async (source: string) => {
                    try {
                        const scraper = ScraperFactory.getScraper(source as any);
                        const results = await scraper.searchManga(query);
                        return results;
                    } catch (error) {
                        console.error(`Error searching ${source}:`, error);
                        return [];
                    }
                });

                const results = await Promise.all(searchPromises);
                externalResults = results.flat();
            }

            res.json({
                success: true,
                data: {
                    local: localResults,
                    external: externalResults
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Sync manga from external source to database
     */
    async syncMangaFromSource(req: Request, res: Response, next: NextFunction) {
        try {
            const { source, sourceId } = req.body;

            if (!source || !sourceId) {
                return res.status(400).json({
                    success: false,
                    error: 'Source and sourceId are required'
                });
            }

            // Get scraper for source
            const scraper = ScraperFactory.getScraper(source);

            // Fetch manga details from source
            const mangaDetails = await scraper.getMangaDetails(sourceId);

            // Save to database
            const manga = await MangaRepository.upsert({
                title: mangaDetails.title,
                altTitles: mangaDetails.altTitles,
                description: mangaDetails.description,
                coverImage: mangaDetails.coverImage,
                authors: mangaDetails.authors,
                artists: mangaDetails.artists,
                genres: mangaDetails.genres,
                status: mangaDetails.status,
                year: mangaDetails.year,
                source,
                sourceId,
                sourceUrl: mangaDetails.sourceUrl
            });

            // Fetch and save chapters
            const chapters = await scraper.getChapterList(sourceId);

            res.json({
                success: true,
                data: manga,
                message: `Synced ${chapters.length} chapters`
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get manga statistics
     */
    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await MangaRepository.getStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new MangaController();
