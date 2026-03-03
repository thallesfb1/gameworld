import { useState, useEffect, useCallback } from 'react';
import Globe from './components/Globe.jsx';
import GameModal from './components/GameModal.jsx';
import InsightsPanel from './components/InsightsPanel.jsx';
import UserStats from './components/UserStats.jsx';
import {
    fetchGames, fetchStats, fetchAnalytics,
    markGamePlayed, unmarkGamePlayed, fetchUserStats,
} from './services/api.js';

function getUserId() {
    let id = localStorage.getItem('gw_user_id');
    if (!id) { id = 'user_' + Math.random().toString(36).slice(2, 10); localStorage.setItem('gw_user_id', id); }
    return id;
}
const USER_ID = getUserId();

export default function App() {
    const [games, setGames] = useState([]);
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [selectedGame, setSelectedGame] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [showUserStats, setShowUserStats] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState(() => localStorage.getItem('gw_theme') || 'dark');

    // Apply theme class to <html>
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('gw_theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    useEffect(() => {
        Promise.all([fetchGames(), fetchStats(), fetchAnalytics()])
            .then(([g, s, a]) => { setGames(g); setStats(s); setAnalytics(a); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, []);

    const refreshUserStats = useCallback(() => {
        fetchUserStats(USER_ID).then(setUserStats).catch(console.error);
    }, []);

    useEffect(() => { refreshUserStats(); }, [refreshUserStats]);

    const playedIds = userStats?.played_game_ids || [];

    const handleTogglePlayed = useCallback(async (gameId) => {
        try {
            if (playedIds.includes(gameId)) await unmarkGamePlayed(USER_ID, gameId);
            else await markGamePlayed(USER_ID, gameId);
            refreshUserStats();
        } catch (e) { console.error(e); }
    }, [playedIds, refreshUserStats]);

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-brand">
                    <span className="header-logo">🌐</span>
                    <span className="header-title">GameWorld</span>
                </div>
                <p className="header-subtitle">Explore video games mapped across history &amp; geography</p>
                <div className="header-actions">
                    {stats && (
                        <span className="header-badge">
                            {stats.total_games} games · {stats.countries_count} countries · {stats.eras_count} eras
                        </span>
                    )}
                    <button
                        className="btn-theme"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button className="btn-user" onClick={() => setShowUserStats(s => !s)} title="My Stats">
                        🧑‍🚀 My Stats
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="loading-screen"><div className="spinner" /><p>Loading GameWorld…</p></div>
            ) : error ? (
                <div className="error-screen">
                    <h2>⚠️ Failed to load</h2><p>{error}</p>
                    <p className="error-hint">Make sure the backend is running: <code>uvicorn app.main:app --reload</code></p>
                </div>
            ) : (
                <Globe
                    games={games}
                    selectedGame={selectedGame}
                    onGameClick={setSelectedGame}
                    playedGameIds={playedIds}
                    theme={theme}
                />
            )}

            {selectedGame && (
                <GameModal
                    game={selectedGame}
                    onClose={() => setSelectedGame(null)}
                    isPlayed={playedIds.includes(selectedGame.id)}
                    onTogglePlayed={handleTogglePlayed}
                />
            )}

            <InsightsPanel analytics={analytics} stats={stats} theme={theme} />

            {showUserStats && (
                <UserStats userStats={userStats} onClose={() => setShowUserStats(false)} />
            )}

            <div className="controls-hint">
                <span>🖱 <kbd>Drag</kbd> Rotate</span>
                <span><kbd>Right-Drag</kbd> Pan</span>
                <span><kbd>Scroll</kbd> Zoom</span>
                <span><kbd>Click pin</kbd> Open game</span>
            </div>

            <div className="legend">
                <span className="legend-dot" style={{ background: '#00FF88' }} />
                <span>Played</span>
                <span className="legend-dot legend-dot--era" />
                <span>Era Color</span>
            </div>
        </div>
    );
}
