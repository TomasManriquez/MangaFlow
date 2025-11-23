// Frontend API Client
// Utility functions to interact with backend

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Manga {
    id: string;
    title: string;
    description?: string;
    coverImage?: string;
    authors?: string[];
    genres?: string[];
    status?: string;
}

export interface Chapter {
    id: string;
    chapterNumber: number;
    title?: string;
    pageCount: number;
    isDownloaded: boolean;
}

export interface Page {
    pageNumber: number;
    imageUrl: string;
}

// ==========================================
// MANGA API
// ==========================================

export async function getAllMangas(page: number = 1, limit: number = 20) {
    const response = await fetch(`${API_BASE_URL}/manga?page=${page}&limit=${limit}`);
    const data = await response.json();
    return data;
}

export async function getMangaById(id: string) {
    const response = await fetch(`${API_BASE_URL}/manga/${id}`);
    const data = await response.json();
    return data;
}

export async function searchMangas(query: string, sources: string[] = ['mangadex']) {
    const response = await fetch(`${API_BASE_URL}/manga/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, sources })
    });
    const data = await response.json();
    return data;
}

export async function syncMangaFromSource(source: string, sourceId: string) {
    const response = await fetch(`${API_BASE_URL}/manga/sync`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ source, sourceId })
    });
    const data = await response.json();
    return data;
}

// ==========================================
// CHAPTER API
// ==========================================

export async function getChaptersByMangaId(mangaId: string) {
    const response = await fetch(`${API_BASE_URL}/chapters/manga/${mangaId}`);
    const data = await response.json();
    return data;
}

export async function getChapterPages(chapterId: string) {
    const response = await fetch(`${API_BASE_URL}/chapters/${chapterId}`);
    const data = await response.json();
    return data;
}

export async function syncChapters(mangaId: string) {
    const response = await fetch(`${API_BASE_URL}/chapters/manga/${mangaId}/sync`, {
        method: 'POST'
    });
    const data = await response.json();
    return data;
}

export async function downloadChapter(chapterId: string) {
    const response = await fetch(`${API_BASE_URL}/chapters/${chapterId}/download`, {
        method: 'POST'
    });
    const data = await response.json();
    return data;
}

export async function getDownloadedChapters() {
    const response = await fetch(`${API_BASE_URL}/chapters/downloaded`);
    const data = await response.json();
    return data;
}

// ==========================================
// ERROR HANDLING
// ==========================================

export class APIError extends Error {
    constructor(message: string, public statusCode?: number) {
        super(message);
        this.name = 'APIError';
    }
}

// Wrapper for API calls with error handling
export async function apiCall<T>(
    promise: Promise<Response>
): Promise<T> {
    try {
        const response = await promise;

        if (!response.ok) {
            throw new APIError(
                `API request failed: ${response.statusText}`,
                response.status
            );
        }

        const data = await response.json();

        if (!data.success) {
            throw new APIError(data.error || 'API request failed');
        }

        return data.data;
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        throw new APIError('Network error or server unavailable');
    }
}
