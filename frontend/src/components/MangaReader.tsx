// Manga Reader Component
// React component for reading manga chapters

import { useState, useEffect, useCallback } from 'react';
import './MangaReader.css';

interface Page {
    pageNumber: number;
    imageUrl: string;
    width?: number;
    height?: number;
}

interface MangaReaderProps {
    chapterId: string;
    initialPage?: number;
}

export default function MangaReader({ chapterId, initialPage = 1 }: MangaReaderProps) {
    const [pages, setPages] = useState<Page[]>([]);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Fetch chapter pages
    useEffect(() => {
        const fetchPages = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3000/api/chapters/${chapterId}`);
                const data = await response.json();

                if (data.success && data.data.pages) {
                    setPages(data.data.pages);
                } else {
                    setError('Failed to load pages');
                }
            } catch (err) {
                setError('Error loading chapter');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPages();
    }, [chapterId]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                nextPage();
            } else if (e.key === 'ArrowLeft') {
                previousPage();
            } else if (e.key === 'f') {
                toggleFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentPage, pages]);

    const nextPage = useCallback(() => {
        if (currentPage < pages.length) {
            setCurrentPage(prev => prev + 1);
        }
    }, [currentPage, pages.length]);

    const previousPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    }, [currentPage]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    if (loading) {
        return (
            <div className="reader-loading">
                <div className="loading-spinner"></div>
                <p>Cargando páginas...</p>
            </div>
        );
    }

    if (error || pages.length === 0) {
        return (
            <div className="reader-error">
                <p>{error || 'No pages found'}</p>
            </div>
        );
    }

    const currentPageData = pages[currentPage - 1];

    return (
        <div className="manga-reader">
            {/* Reader Controls */}
            <div className="reader-controls">
                <div className="controls-left">
                    <button
                        onClick={previousPage}
                        disabled={currentPage === 1}
                        className="control-btn"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                        Anterior
                    </button>
                </div>

                <div className="controls-center">
                    <span className="page-counter">
                        Página {currentPage} de {pages.length}
                    </span>
                </div>

                <div className="controls-right">
                    <button
                        onClick={toggleFullscreen}
                        className="control-btn"
                        title="Fullscreen (F)"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {isFullscreen ? (
                                <>
                                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                                </>
                            ) : (
                                <>
                                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                                </>
                            )}
                        </svg>
                    </button>

                    <button
                        onClick={nextPage}
                        disabled={currentPage === pages.length}
                        className="control-btn btn-primary"
                    >
                        Siguiente
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Page Display */}
            <div className="reader-page" onClick={nextPage}>
                {currentPageData && (
                    <img
                        src={currentPageData.imageUrl}
                        alt={`Page ${currentPage}`}
                        className="page-image"
                        loading="lazy"
                    />
                )}
            </div>

            {/* Progress Bar */}
            <div className="reader-progress">
                <div
                    className="progress-fill"
                    style={{ width: `${(currentPage / pages.length) * 100}%` }}
                />
            </div>

            {/* Keyboard Hints */}
            <div className="keyboard-hints">
                <span>← Anterior</span>
                <span>→ o Espacio: Siguiente</span>
                <span>F: Pantalla completa</span>
            </div>
        </div>
    );
}
