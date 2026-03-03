import { useState } from 'react';

function BarChart({ data, colorKey }) {
    const max = Math.max(...data.map((d) => d.percentage));
    return (
        <div className="bar-chart">
            {data.map((item) => (
                <div key={item[colorKey]} className="bar-row">
                    <span className="bar-label">{item[colorKey]}</span>
                    <div className="bar-track">
                        <div
                            className="bar-fill"
                            style={{ width: `${(item.percentage / max) * 100}%` }}
                        />
                    </div>
                    <span className="bar-value">{item.percentage}%</span>
                </div>
            ))}
        </div>
    );
}

export default function InsightsPanel({ analytics, stats }) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('continents');

    return (
        <>
            <button
                className={`insights-toggle ${open ? 'insights-toggle--active' : ''}`}
                onClick={() => setOpen((o) => !o)}
                title="GameWorld Insights"
            >
                <span className="insights-toggle-icon">📊</span>
                <span className="insights-toggle-label">Insights</span>
            </button>

            <div className={`insights-panel ${open ? 'insights-panel--open' : ''}`}>
                <div className="insights-header">
                    <h3>🌍 GameWorld Insights</h3>
                    <button className="insights-close" onClick={() => setOpen(false)}>✕</button>
                </div>

                {stats && (
                    <div className="insights-stats-grid">
                        <div className="stat-card">
                            <span className="stat-value">{stats.total_games}</span>
                            <span className="stat-label">Total Games</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{stats.countries_count}</span>
                            <span className="stat-label">Countries</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{stats.eras_count}</span>
                            <span className="stat-label">Eras</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value stat-value--sm">{stats.top_genre}</span>
                            <span className="stat-label">Top Genre</span>
                        </div>
                    </div>
                )}

                {analytics && (
                    <>
                        <div className="insights-tabs">
                            <button
                                className={`tab ${activeTab === 'continents' ? 'tab--active' : ''}`}
                                onClick={() => setActiveTab('continents')}
                            >Continents</button>
                            <button
                                className={`tab ${activeTab === 'eras' ? 'tab--active' : ''}`}
                                onClick={() => setActiveTab('eras')}
                            >Eras</button>
                            <button
                                className={`tab ${activeTab === 'rankings' ? 'tab--active' : ''}`}
                                onClick={() => setActiveTab('rankings')}
                            >Rankings</button>
                        </div>

                        <div className="insights-content">
                            {activeTab === 'continents' && (
                                <BarChart data={analytics.continent_distribution} colorKey="continent" />
                            )}
                            {activeTab === 'eras' && (
                                <BarChart data={analytics.era_distribution} colorKey="era_label" />
                            )}
                            {activeTab === 'rankings' && (
                                <div className="rankings">
                                    <div className="ranking-item">
                                        <span className="ranking-icon">🏆</span>
                                        <div>
                                            <span className="ranking-label">Top Country</span>
                                            <span className="ranking-value">{analytics.top_country}</span>
                                        </div>
                                    </div>
                                    <div className="ranking-item">
                                        <span className="ranking-icon">⏳</span>
                                        <div>
                                            <span className="ranking-label">Top Era</span>
                                            <span className="ranking-value">{analytics.top_era}</span>
                                        </div>
                                    </div>
                                    <div className="ranking-item">
                                        <span className="ranking-icon">🎮</span>
                                        <div>
                                            <span className="ranking-label">Top Genre</span>
                                            <span className="ranking-value">{analytics.top_genre}</span>
                                        </div>
                                    </div>
                                    <div className="ranking-item">
                                        <span className="ranking-icon">💻</span>
                                        <div>
                                            <span className="ranking-label">Top Platform</span>
                                            <span className="ranking-value">{analytics.top_platform}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
