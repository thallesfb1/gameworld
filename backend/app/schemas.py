from pydantic import BaseModel
from typing import List, Optional


class Game(BaseModel):
    id: str
    title: str
    lat: float
    lng: float
    location_name: str
    country: str
    continent: str
    era_start: int
    era_label: str
    genres: List[str]
    platforms: List[str]
    fictional: bool
    cover_url: str
    description: Optional[str] = None
    steam_url: Optional[str] = None


class StatsResponse(BaseModel):
    total_games: int
    countries_count: int
    eras_count: int
    top_country: str
    top_genre: str


class ContinentDistribution(BaseModel):
    continent: str
    count: int
    percentage: float


class EraDistribution(BaseModel):
    era_label: str
    count: int
    percentage: float


class AnalyticsResponse(BaseModel):
    continent_distribution: List[ContinentDistribution]
    era_distribution: List[EraDistribution]
    top_country: str
    top_era: str
    top_genre: str
    top_platform: str


class PlayedGameRequest(BaseModel):
    game_id: str


class UserStatsResponse(BaseModel):
    user_id: str
    total_played: int
    world_explored_pct: float
    favorite_continent: Optional[str]
    favorite_era: Optional[str]
    favorite_genre: Optional[str]
    played_game_ids: List[str]
