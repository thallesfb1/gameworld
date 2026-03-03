from collections import Counter
from typing import List
from app.schemas import Game, AnalyticsResponse, ContinentDistribution, EraDistribution


def compute_analytics(games: List[Game]) -> AnalyticsResponse:
    total = len(games)

    # Continent distribution
    continent_counter = Counter(g.continent for g in games)
    continent_dist = [
        ContinentDistribution(
            continent=continent,
            count=count,
            percentage=round((count / total) * 100, 1) if total else 0,
        )
        for continent, count in continent_counter.most_common()
    ]

    # Era distribution
    era_counter = Counter(g.era_label for g in games)
    era_dist = [
        EraDistribution(
            era_label=era,
            count=count,
            percentage=round((count / total) * 100, 1) if total else 0,
        )
        for era, count in era_counter.most_common()
    ]

    # Rankings
    countries = [g.country for g in games]
    genres = [genre for g in games for genre in g.genres]
    platforms = [p for g in games for p in g.platforms]
    eras = [g.era_label for g in games]

    top_country = Counter(countries).most_common(1)[0][0] if countries else "N/A"
    top_era = Counter(eras).most_common(1)[0][0] if eras else "N/A"
    top_genre = Counter(genres).most_common(1)[0][0] if genres else "N/A"
    top_platform = Counter(platforms).most_common(1)[0][0] if platforms else "N/A"

    return AnalyticsResponse(
        continent_distribution=continent_dist,
        era_distribution=era_dist,
        top_country=top_country,
        top_era=top_era,
        top_genre=top_genre,
        top_platform=top_platform,
    )
