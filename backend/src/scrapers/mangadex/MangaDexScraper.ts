// MangaDex API Scraper
// Uses the official MangaDex API v5

import axios, { AxiosInstance } from 'axios';
import type {
    IScraper,
    MangaSearchResult,
    MangaDetails,
    ChapterInfo,
    PageInfo
} from '../base/Scraper.interface.js';

export class MangaDexScraper implements IScraper {
    public readonly source = 'mangadex' as const;
    private api: AxiosInstance;
    private readonly baseUrl = 'https://api.mangadex.org';
    private readonly coverBaseUrl = 'https://uploads.mangadex.org/covers';

    constructor() {
        this.api = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'User-Agent': process.env.SCRAPER_USER_AGENT || 'MangaFlow/1.0'
            },
            timeout: 10000
        });
    }

    async searchManga(query: string): Promise<MangaSearchResult[]> {
        try {
            const response = await this.api.get('/manga', {
                params: {
                    title: query,
                    limit: 20,
                    includes: ['cover_art'],
                    availableTranslatedLanguage: ['es', 'en']
                }
            });

            return response.data.data.map((manga: any) => {
                const coverArt = manga.relationships.find((rel: any) => rel.type === 'cover_art');
                const cover = coverArt
                    ? `${this.coverBaseUrl}/${manga.id}/${coverArt.attributes.fileName}`
                    : undefined;

                return {
                    id: manga.id,
                    title: manga.attributes.title.en || manga.attributes.title.es || Object.values(manga.attributes.title)[0],
                    cover,
                    description: manga.attributes.description.en || manga.attributes.description.es,
                    source: this.source
                };
            });
        } catch (error) {
            console.error('MangaDex search error:', error);
            return [];
        }
    }

    async getMangaDetails(id: string): Promise<MangaDetails> {
        try {
            const response = await this.api.get(`/manga/${id}`, {
                params: {
                    includes: ['cover_art', 'author', 'artist']
                }
            });

            const manga = response.data.data;
            const attributes = manga.attributes;

            // Extract cover art
            const coverArt = manga.relationships.find((rel: any) => rel.type === 'cover_art');
            const coverImage = coverArt
                ? `${this.coverBaseUrl}/${manga.id}/${coverArt.attributes.fileName}`
                : undefined;

            // Extract authors and artists
            const authors = manga.relationships
                .filter((rel: any) => rel.type === 'author')
                .map((rel: any) => rel.attributes?.name)
                .filter(Boolean);

            const artists = manga.relationships
                .filter((rel: any) => rel.type === 'artist')
                .map((rel: any) => rel.attributes?.name)
                .filter(Boolean);

            return {
                id: manga.id,
                title: attributes.title.en || attributes.title.es || Object.values(attributes.title)[0],
                altTitles: attributes.altTitles?.map((alt: any) =>
                    alt.en || alt.es || Object.values(alt)[0]
                ) || [],
                description: attributes.description?.en || attributes.description?.es,
                coverImage,
                authors,
                artists,
                genres: attributes.tags
                    ?.filter((tag: any) => tag.attributes.group === 'genre')
                    .map((tag: any) => tag.attributes.name.en),
                status: attributes.status,
                year: attributes.year,
                source: this.source,
                sourceUrl: `https://mangadex.org/title/${manga.id}`
            };
        } catch (error) {
            console.error('MangaDex details error:', error);
            throw new Error(`Failed to fetch manga details: ${id}`);
        }
    }

    async getChapterList(mangaId: string): Promise<ChapterInfo[]> {
        try {
            const chapters: ChapterInfo[] = [];
            let offset = 0;
            const limit = 100;

            // MangaDex paginates results
            while (true) {
                const response = await this.api.get('/chapter', {
                    params: {
                        manga: mangaId,
                        translatedLanguage: ['es'],
                        limit,
                        offset,
                        order: { chapter: 'asc' },
                        includes: ['scanlation_group']
                    }
                });

                const data = response.data.data;
                if (data.length === 0) break;

                chapters.push(...data.map((chapter: any) => ({
                    id: chapter.id,
                    chapterNumber: parseFloat(chapter.attributes.chapter) || 0,
                    title: chapter.attributes.title,
                    volume: chapter.attributes.volume,
                    language: chapter.attributes.translatedLanguage,
                    publishedAt: new Date(chapter.attributes.publishAt),
                    sourceUrl: `https://mangadex.org/chapter/${chapter.id}`
                })));

                if (data.length < limit) break;
                offset += limit;
            }

            return chapters;
        } catch (error) {
            console.error('MangaDex chapters error:', error);
            return [];
        }
    }

    async getChapterPages(chapterId: string): Promise<PageInfo[]> {
        try {
            // Get chapter data with server info
            const response = await this.api.get(`/at-home/server/${chapterId}`);
            const { baseUrl, chapter } = response.data;

            // Use data quality images (or dataSaver for lower quality)
            const pages: PageInfo[] = chapter.data.map((filename: string, index: number) => ({
                pageNumber: index + 1,
                imageUrl: `${baseUrl}/data/${chapter.hash}/${filename}`
            }));

            return pages;
        } catch (error) {
            console.error('MangaDex pages error:', error);
            return [];
        }
    }
}
