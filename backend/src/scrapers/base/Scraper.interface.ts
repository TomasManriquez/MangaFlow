// Base Scraper Interface
// All scrapers must implement this interface

export interface MangaSearchResult {
    id: string;
    title: string;
    cover?: string;
    description?: string;
    source: 'mangadex' | 'zonatmo' | 'mangaplus';
}

export interface MangaDetails {
    id: string;
    title: string;
    altTitles?: string[];
    description?: string;
    coverImage?: string;
    authors?: string[];
    artists?: string[];
    genres?: string[];
    status?: string;
    year?: number;
    source: 'mangadex' | 'zonatmo' | 'mangaplus';
    sourceUrl: string;
}

export interface ChapterInfo {
    id: string;
    chapterNumber: number;
    title?: string;
    volume?: string;
    language: string;
    publishedAt?: Date;
    sourceUrl: string;
}

export interface PageInfo {
    pageNumber: number;
    imageUrl: string;
    width?: number;
    height?: number;
}

// Abstract Scraper Interface
export interface IScraper {
    source: 'mangadex' | 'zonatmo' | 'mangaplus';

    /**
     * Search for manga by query string
     */
    searchManga(query: string): Promise<MangaSearchResult[]>;

    /**
     * Get detailed information about a manga
     */
    getMangaDetails(id: string): Promise<MangaDetails>;

    /**
     * Get list of chapters for a manga
     */
    getChapterList(mangaId: string): Promise<ChapterInfo[]>;

    /**
     * Get pages for a specific chapter
     */
    getChapterPages(chapterId: string): Promise<PageInfo[]>;
}
