from collections import Counter
from typing import List
from app.schemas import Game, StatsResponse


def compute_stats(games: List[Game]) -> StatsResponse:
    countries = [g.country for g in games]
    eras = [g.era_label for g in games]
    genres = [genre for g in games for genre in g.genres]

    top_country = Counter(countries).most_common(1)[0][0] if countries else "N/A"
    top_genre = Counter(genres).most_common(1)[0][0] if genres else "N/A"

    return StatsResponse(
        total_games=len(games),
        countries_count=len(set(countries)),
        eras_count=len(set(eras)),
        top_country=top_country,
        top_genre=top_genre,
    )
