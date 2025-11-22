// Chapter Repository
// Data access layer for chapter entities

import prisma from '../models/index.js';
import type { Chapter, Page } from '@prisma/client';

export class ChapterRepository {
    /**
     * Find chapters by manga ID
     */
    async findByMangaId(mangaId: string) {
        return await prisma.chapter.findMany({
            where: { mangaId },
            include: {
                pages: {
                    orderBy: { pageNumber: 'asc' }
                }
            },
            orderBy: { chapterNumber: 'asc' }
        });
    }

    /**
     * Find chapter by ID
     */
    async findById(id: string) {
        return await prisma.chapter.findUnique({
            where: { id },
            include: {
                pages: {
                    orderBy: { pageNumber: 'asc' }
                },
                manga: true
            }
        });
    }

    /**
     * Find chapter by source chapter ID
     */
    async findBySourceId(mangaId: string, source: string, sourceChapterId: string) {
        return await prisma.chapter.findFirst({
            where: {
                mangaId,
                source,
                sourceChapterId
            },
            include: {
                pages: {
                    orderBy: { pageNumber: 'asc' }
                }
            }
        });
    }

    /**
     * Create or update chapter
     */
    async upsert(data: {
        mangaId: string;
        chapterNumber: number;
        title?: string;
        volume?: string;
        language?: string;
        source: string;
        sourceChapterId: string;
        sourceUrl: string;
        publishedAt?: Date;
        pages?: Array<{
            pageNumber: number;
            imageUrl: string;
            width?: number;
            height?: number;
        }>;
    }) {
        const { pages, ...chapterData } = data;

        // Check if chapter exists
        const existing = await this.findBySourceId(
            data.mangaId,
            data.source,
            data.sourceChapterId
        );

        if (existing) {
            // Update existing chapter
            return await prisma.chapter.update({
                where: { id: existing.id },
                data: {
                    ...chapterData,
                    pageCount: pages?.length || existing.pageCount,
                    pages: pages ? {
                        deleteMany: {},
                        create: pages
                    } : undefined
                },
                include: {
                    pages: {
                        orderBy: { pageNumber: 'asc' }
                    }
                }
            });
        } else {
            // Create new chapter
            return await prisma.chapter.create({
                data: {
                    ...chapterData,
                    pageCount: pages?.length || 0,
                    pages: pages ? {
                        create: pages
                    } : undefined
                },
                include: {
                    pages: {
                        orderBy: { pageNumber: 'asc' }
                    }
                }
            });
        }
    }

    /**
     * Mark chapter as downloaded
     */
    async markAsDownloaded(id: string, downloadPath: string) {
        return await prisma.chapter.update({
            where: { id },
            data: {
                isDownloaded: true,
                downloadPath
            }
        });
    }

    /**
     * Get downloaded chapters
     */
    async getDownloaded() {
        return await prisma.chapter.findMany({
            where: {
                isDownloaded: true
            },
            include: {
                manga: true,
                pages: true
            }
        });
    }

    /**
     * Delete chapter
     */
    async delete(id: string) {
        return await prisma.chapter.delete({
            where: { id }
        });
    }
}

export default new ChapterRepository();
