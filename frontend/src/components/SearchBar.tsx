// Search Bar Component
// React component for searching manga

import { useState } from 'react';
import './SearchBar.css';

interface SearchBarProps {
    onSearch: (query: string, sources: string[]) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [selectedSources, setSelectedSources] = useState<string[]>(['mangadex']);

    const sources = [
        { id: 'mangadex', name: 'MangaDex', icon: '📖' },
        { id: 'zonatmo', name: 'ZonaT.mo', icon: '🔥' },
        { id: 'mangaplus', name: 'Manga Plus', icon: '⚡' }
    ];

    const toggleSource = (sourceId: string) => {
        setSelectedSources(prev =>
            prev.includes(sourceId)
                ? prev.filter(s => s !== sourceId)
                : [...prev, sourceId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim(), selectedSources);
        }
    };

    return (
        <div className="search-bar-container">
            <form onSubmit={handleSubmit} className="search-form">
                <div className="search-input-wrapper">
                    <svg
                        className="search-icon"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar manga..."
                        className="search-input"
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="clear-btn"
                            aria-label="Clear search"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>

                <button type="submit" className="search-btn btn-primary">
                    Buscar
                </button>
            </form>

            <div className="source-selector">
                <span className="source-label">Buscar en:</span>
                <div className="source-chips">
                    {sources.map(source => (
                        <button
                            key={source.id}
                            type="button"
                            onClick={() => toggleSource(source.id)}
                            className={`source-chip ${selectedSources.includes(source.id) ? 'active' : ''}`}
                        >
                            <span className="source-icon">{source.icon}</span>
                            {source.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
