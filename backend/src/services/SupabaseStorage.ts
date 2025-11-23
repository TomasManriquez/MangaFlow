// Supabase Storage Service
// Handles file uploads and downloads to Supabase Storage

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class SupabaseStorage {
    private client: SupabaseClient;
    private bucketName: string;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials in environment variables');
        }

        this.client = createClient(supabaseUrl, supabaseKey);
        this.bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'manga-pages';
    }

    /**
     * Upload an image from URL to Supabase Storage
     * @param imageUrl - URL of the image to download
     * @param storagePath - Path in Supabase Storage (e.g., "manga-123/chapter-456/page-001.jpg")
     * @returns Promise<string> - Storage path if successful
     */
    async uploadImageFromUrl(imageUrl: string, storagePath: string): Promise<string> {
        try {
            // Download image from source
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': process.env.SCRAPER_USER_AGENT || 'MangaFlow/1.0'
                },
                timeout: 30000
            });

            const buffer = Buffer.from(response.data);
            const contentType = response.headers['content-type'] || 'image/jpeg';

            // Upload to Supabase Storage
            const { error } = await this.client.storage
                .from(this.bucketName)
                .upload(storagePath, buffer, {
                    contentType,
                    upsert: true // Replace if exists
                });

            if (error) {
                throw error;
            }

            return storagePath;
        } catch (error) {
            console.error(`Error uploading image to Supabase Storage:`, error);
            throw new Error(`Failed to upload image: ${storagePath}`);
        }
    }

    /**
     * Get a signed URL for an image (valid for 1 hour)
     * @param storagePath - Path in Supabase Storage
     * @returns Promise<string> - Signed URL
     */
    async getSignedUrl(storagePath: string, expiresIn: number = 3600): Promise<string> {
        try {
            const { data, error } = await this.client.storage
                .from(this.bucketName)
                .createSignedUrl(storagePath, expiresIn);

            if (error || !data) {
                throw error || new Error('Failed to generate signed URL');
            }

            return data.signedUrl;
        } catch (error) {
            console.error(`Error generating signed URL:`, error);
            throw new Error(`Failed to get signed URL for: ${storagePath}`);
        }
    }

    /**
     * Get public URL for an image (if bucket is public)
     * @param storagePath - Path in Supabase Storage
     * @returns string - Public URL
     */
    getPublicUrl(storagePath: string): string {
        const { data } = this.client.storage
            .from(this.bucketName)
            .getPublicUrl(storagePath);

        return data.publicUrl;
    }

    /**
     * Delete a file from Supabase Storage
     * @param storagePath - Path in Supabase Storage
     * @returns Promise<boolean> - true if successful
     */
    async deleteFile(storagePath: string): Promise<boolean> {
        try {
            const { error } = await this.client.storage
                .from(this.bucketName)
                .remove([storagePath]);

            if (error) {
                throw error;
            }

            return true;
        } catch (error) {
            console.error(`Error deleting file from Supabase Storage:`, error);
            return false;
        }
    }

    /**
     * Delete all files in a folder (e.g., all pages of a chapter)
     * @param folderPath - Folder path (e.g., "manga-123/chapter-456")
     * @returns Promise<number> - Number of files deleted
     */
    async deleteFolder(folderPath: string): Promise<number> {
        try {
            // List all files in folder
            const { data: files, error: listError } = await this.client.storage
                .from(this.bucketName)
                .list(folderPath);

            if (listError || !files) {
                throw listError || new Error('Failed to list files');
            }

            // Delete all files
            const filePaths = files.map(file => `${folderPath}/${file.name}`);

            if (filePaths.length === 0) {
                return 0;
            }

            const { error: deleteError } = await this.client.storage
                .from(this.bucketName)
                .remove(filePaths);

            if (deleteError) {
                throw deleteError;
            }

            return filePaths.length;
        } catch (error) {
            console.error(`Error deleting folder from Supabase Storage:`, error);
            return 0;
        }
    }

    /**
     * Check if a file exists in Supabase Storage
     * @param storagePath - Path in Supabase Storage
     * @returns Promise<boolean> - true if exists
     */
    async fileExists(storagePath: string): Promise<boolean> {
        try {
            const { data, error } = await this.client.storage
                .from(this.bucketName)
                .list(storagePath.split('/').slice(0, -1).join('/'));

            if (error || !data) {
                return false;
            }

            const fileName = storagePath.split('/').pop();
            return data.some(file => file.name === fileName);
        } catch (error) {
            return false;
        }
    }

    /**
     * Generate storage path for a manga page
     * @param mangaId - Manga ID
     * @param chapterId - Chapter ID
     * @param pageNumber - Page number
     * @param extension - File extension (default: jpg)
     * @returns string - Storage path
     */
    static generatePagePath(
        mangaId: string,
        chapterId: string,
        pageNumber: number,
        extension: string = 'jpg'
    ): string {
        const paddedPage = pageNumber.toString().padStart(3, '0');
        return `manga-${mangaId}/chapter-${chapterId}/page-${paddedPage}.${extension}`;
    }
}

// Singleton instance
let supabaseStorageInstance: SupabaseStorage | null = null;

export function getSupabaseStorage(): SupabaseStorage {
    if (!supabaseStorageInstance) {
        supabaseStorageInstance = new SupabaseStorage();
    }
    return supabaseStorageInstance;
}

export default getSupabaseStorage;
