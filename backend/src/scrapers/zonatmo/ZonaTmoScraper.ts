// ZonaT.mo Scraper
// Web scraping implementation using Cheerio

import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import type {
    IScraper,
    MangaSearchResult,
    MangaDetails,
    ChapterInfo,
    PageInfo
} from '../base/Scraper.interface.js';

export class ZonaTmoScraper implements IScraper {
    public readonly source = 'zonatmo' as const;
    private client: AxiosInstance;
    private readonly baseUrl = 'https://zonatmo.com';
    private readonly delay: number;

    constructor() {
        this.delay = parseInt(process.env.SCRAPER_DELAY_MS || '1000');
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'User-Agent': process.env.SCRAPER_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async searchManga(query: string): Promise<MangaSearchResult[]> {
        try {
            await this.sleep(this.delay);

            const response = await this.client.get('/buscar', {
                params: { q: query }
            });

            const $ = cheerio.load(response.data);
            const results: MangaSearchResult[] = [];

            $('.manga-item, .search-result-item').each((_, element) => {
                const $el = $(element);
                const link = $el.find('a').first();
                const title = link.attr('title') || link.text().trim();
                const href = link.attr('href');
                const cover = $el.find('img').first().attr('src');

                if (href && title) {
                    const id = href.split('/').filter(Boolean).pop() || '';
                    results.push({
                        id,
                        title,
                        cover: cover?.startsWith('http') ? cover : `${this.baseUrl}${cover}`,
                        source: this.source
                    });
                }
            });

            return results.slice(0, 20);
        } catch (error) {
            console.error('ZonaT.mo search error:', error);
            return [];
        }
    }

    async getMangaDetails(id: string): Promise<MangaDetails> {
        try {
            await this.sleep(this.delay);

            const url = `${this.baseUrl}/manga/${id}`;
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);

            const title = $('h1.manga-title, .entry-title').first().text().trim();
            const description = $('.manga-description, .summary').first().text().trim();
            const cover = $('img.manga-cover, .manga-thumbnail img').first().attr('src');

            // Extract metadata
            const genres: string[] = [];
            $('.genre-item, .manga-genre a').each((_, el) => {
                genres.push($(el).text().trim());
            });

            const authors: string[] = [];
            $('.author-item, .manga-author').each((_, el) => {
                authors.push($(el).text().trim());
            });

            return {
                id,
                title,
                description: description || undefined,
                coverImage: cover?.startsWith('http') ? cover : `${this.baseUrl}${cover}`,
                authors: authors.length > 0 ? authors : undefined,
                genres: genres.length > 0 ? genres : undefined,
                source: this.source,
                sourceUrl: url
            };
        } catch (error) {
            console.error('ZonaT.mo details error:', error);
            throw new Error(`Failed to fetch manga details: ${id}`);
        }
    }

    async getChapterList(mangaId: string): Promise<ChapterInfo[]> {
        try {
            await this.sleep(this.delay);

            const url = `${this.baseUrl}/manga/${mangaId}`;
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);

            const chapters: ChapterInfo[] = [];

            $('.chapter-item, .chapter-list li').each((_, element) => {
                const $el = $(element);
                const link = $el.find('a').first();
                const href = link.attr('href');
                const text = link.text().trim();

                if (href) {
                    // Extract chapter number from text
                    const chapterMatch = text.match(/cap[ií]tulo\s+(\d+(?:\.\d+)?)/i);
                    const chapterNumber = chapterMatch ? parseFloat(chapterMatch[1]) : 0;

                    const chapterId = href.split('/').filter(Boolean).pop() || '';

                    chapters.push({
                        id: chapterId,
                        chapterNumber,
                        title: text,
                        language: 'es',
                        sourceUrl: href.startsWith('http') ? href : `${this.baseUrl}${href}`
                    });
                }
            });

            return chapters.reverse(); // Oldest to newest
        } catch (error) {
            console.error('ZonaT.mo chapters error:', error);
            return [];
        }
    }

    async getChapterPages(chapterId: string): Promise<PageInfo[]> {
        try {
            await this.sleep(this.delay);

            const url = `${this.baseUrl}/leer/${chapterId}`;
            const response = await this.client.get(url);
            const $ = cheerio.load(response.data);

            const pages: PageInfo[] = [];

            // Try different selectors for pages
            $('.page-image img, #chapter-reader img, .reader-image').each((index, element) => {
                const src = $(element).attr('src') || $(element).attr('data-src');
                if (src) {
                    pages.push({
                        pageNumber: index + 1,
                        imageUrl: src.startsWith('http') ? src : `${this.baseUrl}${src}`
                    });
                }
            });

            // Fallback: check for JavaScript data
            if (pages.length === 0) {
                const scriptContent = $('script:contains("pages")').html() || '';
                const pagesMatch = scriptContent.match(/pages\s*=\s*\[(.*?)\]/s);
                if (pagesMatch) {
                    const pageUrls = pagesMatch[1]
                        .split(',')
                        .map(url => url.trim().replace(/['"]/g, ''))
                        .filter(Boolean);

                    pageUrls.forEach((url, index) => {
                        pages.push({
                            pageNumber: index + 1,
                            imageUrl: url.startsWith('http') ? url : `${this.baseUrl}${url}`
                        });
                    });
                }
            }

            return pages;
        } catch (error) {
            console.error('ZonaT.mo pages error:', error);
            return [];
        }
    }
}
