import json
import os
from typing import List
from app.schemas import Game

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "games.json")


def load_games() -> List[Game]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)
    return [Game(**g) for g in raw]


def get_all_games() -> List[Game]:
    return load_games()


def get_game_by_id(game_id: str) -> Game | None:
    games = load_games()
    for game in games:
        if game.id == game_id:
            return game
    return None
