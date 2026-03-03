const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchGames() {
    const res = await fetch(`${BASE_URL}/games`);
    if (!res.ok) throw new Error('Failed to fetch games');
    return res.json();
}

export async function fetchStats() {
    const res = await fetch(`${BASE_URL}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
}

export async function fetchAnalytics() {
    const res = await fetch(`${BASE_URL}/analytics/overview`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
}

export async function markGamePlayed(userId, gameId) {
    const res = await fetch(`${BASE_URL}/user/${userId}/played`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId }),
    });
    if (!res.ok) throw new Error('Failed to mark game as played');
    return res.json();
}

export async function unmarkGamePlayed(userId, gameId) {
    const res = await fetch(`${BASE_URL}/user/${userId}/played/${gameId}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to unmark game');
    return res.json();
}

export async function fetchUserStats(userId) {
    const res = await fetch(`${BASE_URL}/user/${userId}/stats`);
    if (!res.ok) throw new Error('Failed to fetch user stats');
    return res.json();
}
