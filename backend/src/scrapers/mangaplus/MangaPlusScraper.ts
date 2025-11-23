// Manga Plus Scraper
// Note: Manga Plus has protections and may require special handling

import axios, { AxiosInstance } from 'axios';
import type {
    IScraper,
    MangaSearchResult,
    MangaDetails,
    ChapterInfo,
    PageInfo
} from '../base/Scraper.interface.js';

export class MangaPlusScraper implements IScraper {
    public readonly source = 'mangaplus' as const;
    private client: AxiosInstance;
    private readonly baseUrl = 'https://jumpg-webapi.tokyo-cdn.com/api';
    private readonly webUrl = 'https://mangaplus.shueisha.co.jp';

    constructor() {
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'User-Agent': process.env.SCRAPER_USER_AGENT || 'Mozilla/5.0',
                'Origin': this.webUrl,
                'Referer': this.webUrl
            },
            timeout: 10000
        });
    }

    async searchManga(query: string): Promise<MangaSearchResult[]> {
        try {
            // Manga Plus doesn't have a direct search API
            // We'll need to browse all manga and filter
            // For now, returning empty - this would need more research
            console.warn('Manga Plus search not fully implemented - API limitations');
            return [];
        } catch (error) {
            console.error('Manga Plus search error:', error);
            return [];
        }
    }

    async getMangaDetails(id: string): Promise<MangaDetails> {
        try {
            const response = await this.client.get(`/title_detailV3`, {
                params: {
                    title_id: id,
                    format: 'json'
                }
            });

            const data = response.data.success?.titleDetailView;
            if (!data) {
                throw new Error('Invalid response from Manga Plus');
            }

            const title = data.title?.name || '';
            const author = data.title?.author || '';

            return {
                id,
                title,
                description: data.overview || undefined,
                coverImage: data.title?.portraitImageUrl,
                authors: author ? [author] : undefined,
                genres: data.title?.genres || undefined,
                source: this.source,
                sourceUrl: `${this.webUrl}/titles/${id}`
            };
        } catch (error) {
            console.error('Manga Plus details error:', error);
            throw new Error(`Failed to fetch manga details: ${id}`);
        }
    }

    async getChapterList(mangaId: string): Promise<ChapterInfo[]> {
        try {
            const response = await this.client.get(`/title_detailV3`, {
                params: {
                    title_id: mangaId,
                    format: 'json'
                }
            });

            const data = response.data.success?.titleDetailView;
            if (!data) return [];

            const chapters: ChapterInfo[] = [];

            // Process first chapter list
            if (data.firstChapterList) {
                data.firstChapterList.forEach((chapter: any) => {
                    chapters.push(this.parseChapter(chapter));
                });
            }

            // Process last chapter list
            if (data.lastChapterList) {
                data.lastChapterList.forEach((chapter: any) => {
                    chapters.push(this.parseChapter(chapter));
                });
            }

            return chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
        } catch (error) {
            console.error('Manga Plus chapters error:', error);
            return [];
        }
    }

    private parseChapter(chapter: any): ChapterInfo {
        return {
            id: chapter.chapterId?.toString() || '',
            chapterNumber: parseFloat(chapter.name.match(/\d+(\.\d+)?/)?.[0] || '0'),
            title: chapter.subTitle || chapter.name,
            language: 'en', // Manga Plus is primarily English
            publishedAt: chapter.startTimeStamp ? new Date(chapter.startTimeStamp * 1000) : undefined,
            sourceUrl: `${this.webUrl}/viewer/${chapter.chapterId}`
        };
    }

    async getChapterPages(chapterId: string): Promise<PageInfo[]> {
        try {
            const response = await this.client.get(`/manga_viewer`, {
                params: {
                    chapter_id: chapterId,
                    split: 'yes',
                    img_quality: 'high',
                    format: 'json'
                }
            });

            const data = response.data.success?.mangaViewer;
            if (!data?.pages) return [];

            const pages: PageInfo[] = [];

            data.pages.forEach((pageData: any, index: number) => {
                if (pageData.mangaPage) {
                    pages.push({
                        pageNumber: index + 1,
                        imageUrl: pageData.mangaPage.imageUrl,
                        width: pageData.mangaPage.width,
                        height: pageData.mangaPage.height
                    });
                }
            });

            return pages;
        } catch (error) {
            console.error('Manga Plus pages error:', error);
            return [];
        }
    }
}
