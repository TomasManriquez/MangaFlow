// Offline Storage using IndexedDB
// For caching manga chapter data

const DB_NAME = 'MangaFlowDB';
const DB_VERSION = 1;
const STORE_NAME = 'chapters';

let db: IDBDatabase | null = null;

// Initialize IndexedDB
export async function initDB(): Promise<IDBDatabase> {
    if (db) return db;

    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = database.createObjectStore(STORE_NAME, {
                    keyPath: 'chapterId'
                });

                objectStore.createIndex('mangaId', 'mangaId', { unique: false });
                objectStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
            }
        };
    });
}

// Save chapter to offline storage
export async function saveChapter(chapterId: string, mangaId: string, pages: any[]) {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const data = {
            chapterId,
            mangaId,
            pages,
            downloadedAt: new Date().toISOString()
        };

        const request = store.put(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Get chapter from offline storage
export async function getChapter(chapterId: string) {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(chapterId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Get all chapters for a manga
export async function getChaptersByManga(mangaId: string) {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('mangaId');
        const request = index.getAll(mangaId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Delete chapter from offline storage
export async function deleteChapter(chapterId: string) {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(chapterId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Clear all offline data
export async function clearOfflineData() {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Get storage usage stats
export async function getStorageStats() {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.count();

        request.onsuccess = () => {
            resolve({
                chapterCount: request.result
            });
        };
        request.onerror = () => reject(request.error);
    });
}

// Check if chapter is available offline
export async function isChapterOffline(chapterId: string): Promise<boolean> {
    try {
        const chapter = await getChapter(chapterId);
        return chapter !== undefined;
    } catch {
        return false;
    }
}

// Initialize DB on import
if (typeof window !== 'undefined') {
    initDB().catch(console.error);
}
