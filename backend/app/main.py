from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app.schemas import (
    Game,
    StatsResponse,
    AnalyticsResponse,
    PlayedGameRequest,
    UserStatsResponse,
)
from app.services.game_service import get_all_games, get_game_by_id
from app.services.stats_service import compute_stats
from app.services.analytics_service import compute_analytics
from app.services.user_service import mark_game_played, get_user_stats
from app.models import create_tables, get_db

# Create DB tables on startup
create_tables()

app = FastAPI(
    title="GameWorld API",
    description="A REST API for the GameWorld interactive globe — mapping video games by geographic origin.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Games ───────────────────────────────────────────────────────────────────

@app.get("/games", response_model=List[Game], tags=["Games"])
def list_games():
    """Return the full list of games with geographic data."""
    return get_all_games()


@app.get("/games/{game_id}", response_model=Game, tags=["Games"])
def get_game(game_id: str):
    """Return a single game by its ID."""
    game = get_game_by_id(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


# ── Stats ────────────────────────────────────────────────────────────────────

@app.get("/stats", response_model=StatsResponse, tags=["Stats"])
def global_stats():
    """Return aggregate statistics about the game dataset."""
    games = get_all_games()
    return compute_stats(games)


# ── Analytics ────────────────────────────────────────────────────────────────

@app.get("/analytics/overview", response_model=AnalyticsResponse, tags=["Analytics"])
def analytics_overview():
    """Return detailed analytics: continent/era distributions and rankings."""
    games = get_all_games()
    return compute_analytics(games)


# ── User System ───────────────────────────────────────────────────────────────

@app.post("/user/{user_id}/played", tags=["User"])
def mark_played(user_id: str, body: PlayedGameRequest, db: Session = Depends(get_db)):
    """Mark a game as played for a given user."""
    game = get_game_by_id(body.game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    added = mark_game_played(db, user_id, body.game_id)
    return {"success": True, "already_existed": not added}


@app.delete("/user/{user_id}/played/{game_id}", tags=["User"])
def unmark_played(user_id: str, game_id: str, db: Session = Depends(get_db)):
    """Remove a game from the user's played list."""
    from app.models import PlayedGame
    record = (
        db.query(PlayedGame)
        .filter(PlayedGame.user_id == user_id, PlayedGame.game_id == game_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"success": True}


@app.get("/user/{user_id}/stats", response_model=UserStatsResponse, tags=["User"])
def user_stats(user_id: str, db: Session = Depends(get_db)):
    """Return personal statistics for a given user."""
    return get_user_stats(db, user_id)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "GameWorld API"}
