export default function UserStats({ userStats, onClose }) {
    if (!userStats) return null;

    const { total_played, world_explored_pct, favorite_continent, favorite_era, favorite_genre } = userStats;

    return (
        <div className="user-stats-panel">
            <div className="user-stats-header">
                <h3>🧑‍🚀 My GameWorld</h3>
                <button className="insights-close" onClick={onClose}>✕</button>
            </div>

            <div className="progress-ring-wrapper">
                <svg viewBox="0 0 120 120" className="progress-ring">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#1a1a3e" strokeWidth="12" />
                    <circle
                        cx="60" cy="60" r="50"
                        fill="none"
                        stroke="url(#progressGrad)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - world_explored_pct / 100)}`}
                        transform="rotate(-90 60 60)"
                    />
                    <defs>
                        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6C5CE7" />
                            <stop offset="100%" stopColor="#00CEC9" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="progress-ring-label">
                    <span className="progress-pct">{world_explored_pct}%</span>
                    <span className="progress-sub">explored</span>
                </div>
            </div>

            <p className="user-played-count">
                <strong>{total_played}</strong> game{total_played !== 1 ? 's' : ''} played
            </p>

            <div className="user-favorites">
                {favorite_continent && (
                    <div className="fav-item">
                        <span className="fav-icon">🌍</span>
                        <div>
                            <span className="fav-label">Fav. Continent</span>
                            <span className="fav-value">{favorite_continent}</span>
                        </div>
                    </div>
                )}
                {favorite_era && (
                    <div className="fav-item">
                        <span className="fav-icon">⏳</span>
                        <div>
                            <span className="fav-label">Fav. Era</span>
                            <span className="fav-value">{favorite_era}</span>
                        </div>
                    </div>
                )}
                {favorite_genre && (
                    <div className="fav-item">
                        <span className="fav-icon">🎮</span>
                        <div>
                            <span className="fav-label">Fav. Genre</span>
                            <span className="fav-value">{favorite_genre}</span>
                        </div>
                    </div>
                )}
                {!favorite_continent && !favorite_era && !favorite_genre && (
                    <p className="user-empty">Mark some games as played to see your stats!</p>
                )}
            </div>
        </div>
    );
}
