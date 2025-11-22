// Manga Repository
// Data access layer for manga entities

import prisma from '../models/index.js';
import type { Manga, MangaSource } from '@prisma/client';

export class MangaRepository {
    /**
     * Find all mangas with pagination
     */
    async findAll(skip: number = 0, take: number = 20) {
        return await prisma.manga.findMany({
            skip,
            take,
            include: {
                sources: true,
                chapters: {
                    take: 1,
                    orderBy: { chapterNumber: 'desc' }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
    }

    /**
     * Find manga by ID
     */
    async findById(id: string) {
        return await prisma.manga.findUnique({
            where: { id },
            include: {
                sources: true,
                chapters: {
                    orderBy: { chapterNumber: 'asc' }
                }
            }
        });
    }

    /**
     * Search mangas by title
     */
    async search(query: string, skip: number = 0, take: number = 20) {
        return await prisma.manga.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { altTitles: { has: query } },
                    { authors: { has: query } }
                ]
            },
            skip,
            take,
            include: {
                sources: true
            }
        });
    }

    /**
     * Find manga by source ID
     */
    async findBySourceId(source: string, sourceId: string) {
        const mangaSource = await prisma.mangaSource.findUnique({
            where: {
                source_sourceId: {
                    source,
                    sourceId
                }
            },
            include: {
                manga: {
                    include: {
                        sources: true,
                        chapters: true
                    }
                }
            }
        });

        return mangaSource?.manga;
    }

    /**
     * Create or update manga
     */
    async upsert(data: {
        title: string;
        altTitles?: string[];
        description?: string;
        coverImage?: string;
        authors?: string[];
        artists?: string[];
        genres?: string[];
        status?: string;
        year?: number;
        tags?: string[];
        source: string;
        sourceId: string;
        sourceUrl: string;
    }) {
        const { source, sourceId, sourceUrl, ...mangaData } = data;

        // Check if manga exists by source
        const existing = await this.findBySourceId(source, sourceId);

        if (existing) {
            // Update existing manga
            return await prisma.manga.update({
                where: { id: existing.id },
                data: {
                    ...mangaData,
                    sources: {
                        update: {
                            where: {
                                source_sourceId: { source, sourceId }
                            },
                            data: {
                                sourceUrl,
                                lastSynced: new Date()
                            }
                        }
                    }
                },
                include: {
                    sources: true,
                    chapters: true
                }
            });
        } else {
            // Create new manga
            return await prisma.manga.create({
                data: {
                    ...mangaData,
                    sources: {
                        create: {
                            source,
                            sourceId,
                            sourceUrl,
                            lastSynced: new Date()
                        }
                    }
                },
                include: {
                    sources: true,
                    chapters: true
                }
            });
        }
    }

    /**
     * Delete manga
     */
    async delete(id: string) {
        return await prisma.manga.delete({
            where: { id }
        });
    }

    /**
     * Get manga statistics
     */
    async getStats() {
        const totalMangas = await prisma.manga.count();
        const totalChapters = await prisma.chapter.count();
        const sourceBreakdown = await prisma.mangaSource.groupBy({
            by: ['source'],
            _count: true
        });

        return {
            totalMangas,
            totalChapters,
            sourceBreakdown
        };
    }
}

export default new MangaRepository();
