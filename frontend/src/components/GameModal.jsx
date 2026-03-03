import { useEffect, useRef } from 'react';

const CONTINENT_EMOJI = {
    Europe: '🇪🇺',
    Asia: '🌏',
    Americas: '🌎',
    Africa: '🌍',
    Oceania: '🌊',
};

export default function GameModal({ game, onClose, isPlayed, onTogglePlayed }) {
    const modalRef = useRef();

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    useEffect(() => {
        const handleClick = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    if (!game) return null;

    const eraYear = game.era_start < 0
        ? `${Math.abs(game.era_start)} BCE`
        : `${game.era_start} CE`;

    return (
        <div className="modal-overlay">
            <div className="modal-card" ref={modalRef}>
                <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

                <div className="modal-cover-wrapper">
                    <img
                        src={game.cover_url}
                        alt={game.title}
                        className="modal-cover"
                        onError={(e) => { e.target.src = `https://placehold.co/264x352/1a1a2e/6C5CE7?text=${encodeURIComponent(game.title)}`; }}
                    />
                    <div className="modal-cover-overlay" />
                    {game.fictional && <span className="badge badge-fictional">Fictional World</span>}
                    {isPlayed && <span className="badge badge-played">✓ Played</span>}
                </div>

                <div className="modal-body">
                    <h2 className="modal-title">{game.title}</h2>

                    <div className="modal-meta">
                        <div className="meta-item">
                            <span className="meta-icon">📍</span>
                            <div>
                                <span className="meta-label">Location</span>
                                <span className="meta-value">{game.location_name}</span>
                            </div>
                        </div>
                        <div className="meta-item">
                            <span className="meta-icon">{CONTINENT_EMOJI[game.continent] || '🌐'}</span>
                            <div>
                                <span className="meta-label">Country</span>
                                <span className="meta-value">{game.country}</span>
                            </div>
                        </div>
                        <div className="meta-item">
                            <span className="meta-icon">⏳</span>
                            <div>
                                <span className="meta-label">Era</span>
                                <span className="meta-value">{game.era_label} <em className="era-year">({eraYear})</em></span>
                            </div>
                        </div>
                    </div>

                    {game.description && (
                        <p className="modal-description">{game.description}</p>
                    )}

                    {game.steam_url && (
                        <a
                            href={game.steam_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="modal-steam-link"
                        >
                            🎮 View on Steam
                        </a>
                    )}

                    <div className="modal-tags-section">
                        <div className="tags-row">
                            <span className="tags-label">Genres</span>
                            <div className="tags">
                                {game.genres.map((g) => (
                                    <span key={g} className="tag tag-genre">{g}</span>
                                ))}
                            </div>
                        </div>
                        <div className="tags-row">
                            <span className="tags-label">Platforms</span>
                            <div className="tags">
                                {game.platforms.map((p) => (
                                    <span key={p} className="tag tag-platform">{p}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        className={`btn-played ${isPlayed ? 'btn-played--active' : ''}`}
                        onClick={() => onTogglePlayed(game.id)}
                    >
                        {isPlayed ? '✓ Marked as Played' : '+ Mark as Played'}
                    </button>
                </div>
            </div>
        </div>
    );
}
