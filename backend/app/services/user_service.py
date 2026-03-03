from collections import Counter
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import PlayedGame
from app.schemas import UserStatsResponse
from app.services.game_service import get_all_games
import uuid


def mark_game_played(db: Session, user_id: str, game_id: str) -> bool:
    existing = (
        db.query(PlayedGame)
        .filter(PlayedGame.user_id == user_id, PlayedGame.game_id == game_id)
        .first()
    )
    if existing:
        return False  # Already marked
    record = PlayedGame(id=str(uuid.uuid4()), user_id=user_id, game_id=game_id)
    db.add(record)
    db.commit()
    return True


def get_user_stats(db: Session, user_id: str) -> UserStatsResponse:
    played_records = db.query(PlayedGame).filter(PlayedGame.user_id == user_id).all()
    played_ids = [r.game_id for r in played_records]

    all_games = get_all_games()
    total_games = len(all_games)
    played_games = [g for g in all_games if g.id in played_ids]
    total_played = len(played_games)
    world_explored_pct = round((total_played / total_games) * 100, 1) if total_games else 0.0

    fav_continent: Optional[str] = None
    fav_era: Optional[str] = None
    fav_genre: Optional[str] = None

    if played_games:
        continents = [g.continent for g in played_games]
        eras = [g.era_label for g in played_games]
        genres = [genre for g in played_games for genre in g.genres]
        fav_continent = Counter(continents).most_common(1)[0][0]
        fav_era = Counter(eras).most_common(1)[0][0]
        fav_genre = Counter(genres).most_common(1)[0][0]

    return UserStatsResponse(
        user_id=user_id,
        total_played=total_played,
        world_explored_pct=world_explored_pct,
        favorite_continent=fav_continent,
        favorite_era=fav_era,
        favorite_genre=fav_genre,
        played_game_ids=played_ids,
    )
