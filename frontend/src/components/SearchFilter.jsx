import { useMemo } from 'react';

export default function SearchFilter({ games, query, filters, onQueryChange, onFilterChange, onClear, filteredCount, onSearch }) {
    // Derive unique option lists dynamically from full game list
    const options = useMemo(() => {
        const eras = [...new Set(games.map(g => g.era_label))].sort();
        const continents = [...new Set(games.map(g => g.continent))].sort();
        const genres = [...new Set(games.flatMap(g => g.genres))].sort();
        const platforms = [...new Set(games.flatMap(g => g.platforms))].sort();
        return { eras, continents, genres, platforms };
    }, [games]);

    const hasActiveFilter = query || filters.era || filters.continent || filters.genre || filters.platform;
    // Search button is active only if the query matches exactly one game
    const canSearch = filteredCount === 1 && query.trim().length > 0;

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && canSearch) onSearch();
    };

    return (
        <div className="search-filter-bar">
            <div className="search-filter-inner">
                {/* Search input */}
                <div className="search-input-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                        id="game-search-input"
                        className="search-input"
                        type="text"
                        placeholder="Search games…"
                        value={query}
                        onChange={e => onQueryChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                        spellCheck={false}
                    />
                    {query && (
                        <button className="search-clear-x" onClick={() => onQueryChange('')} aria-label="Clear search">✕</button>
                    )}

                    <button
                        id="search-fly-btn"
                        className={`search-fly-btn ${canSearch ? 'search-fly-btn--active' : ''}`}
                        onClick={onSearch}
                        disabled={!canSearch}
                        title={canSearch ? 'Fly to this game on the globe' : 'Type a game name to search'}
                    >
                        🎯 Go
                    </button>
                </div>

                {/* Dropdowns */}
                <div className="filter-dropdowns">
                    <select
                        id="filter-continent"
                        className={`filter-select ${filters.continent ? 'filter-select--active' : ''}`}
                        value={filters.continent}
                        onChange={e => onFilterChange('continent', e.target.value)}
                    >
                        <option value="">🌍 Continent</option>
                        {options.continents.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    <select
                        id="filter-era"
                        className={`filter-select ${filters.era ? 'filter-select--active' : ''}`}
                        value={filters.era}
                        onChange={e => onFilterChange('era', e.target.value)}
                    >
                        <option value="">⏳ Era</option>
                        {options.eras.map(e => (
                            <option key={e} value={e}>{e}</option>
                        ))}
                    </select>

                    <select
                        id="filter-genre"
                        className={`filter-select ${filters.genre ? 'filter-select--active' : ''}`}
                        value={filters.genre}
                        onChange={e => onFilterChange('genre', e.target.value)}
                    >
                        <option value="">🎮 Genre</option>
                        {options.genres.map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>

                    <select
                        id="filter-platform"
                        className={`filter-select ${filters.platform ? 'filter-select--active' : ''}`}
                        value={filters.platform}
                        onChange={e => onFilterChange('platform', e.target.value)}
                    >
                        <option value="">🖥 Platform</option>
                        {options.platforms.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                {/* Result count + clear */}
                <div className="filter-meta">
                    <span className="filter-count">
                        <span className={filteredCount === 0 ? 'filter-count--zero' : filteredCount < games.length ? 'filter-count--filtered' : ''}>
                            {filteredCount}
                        </span>
                        {' '}/ {games.length} games
                    </span>
                    {hasActiveFilter && (
                        <button id="filter-clear-btn" className="filter-clear" onClick={onClear}>
                            Clear ✕
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
