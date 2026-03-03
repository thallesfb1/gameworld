import os
import httpx
from typing import Optional

IGDB_CLIENT_ID = os.getenv("IGDB_CLIENT_ID", "")
IGDB_ACCESS_TOKEN = os.getenv("IGDB_ACCESS_TOKEN", "")
IGDB_BASE_URL = "https://api.igdb.com/v4"

HEADERS = {
    "Client-ID": IGDB_CLIENT_ID,
    "Authorization": f"Bearer {IGDB_ACCESS_TOKEN}",
}


async def fetch_game_cover(title: str) -> Optional[str]:
    """Fetch the cover URL for a game from IGDB."""
    if not IGDB_CLIENT_ID or not IGDB_ACCESS_TOKEN:
        return None
    async with httpx.AsyncClient() as client:
        # First search for the game
        search_resp = await client.post(
            f"{IGDB_BASE_URL}/games",
            headers=HEADERS,
            data=f'search "{title}"; fields id,name,cover; limit 1;',
        )
        if search_resp.status_code != 200 or not search_resp.json():
            return None
        game_data = search_resp.json()[0]
        cover_id = game_data.get("cover")
        if not cover_id:
            return None

        # Then fetch the cover image
        cover_resp = await client.post(
            f"{IGDB_BASE_URL}/covers",
            headers=HEADERS,
            data=f"fields image_id; where id = {cover_id};",
        )
        if cover_resp.status_code != 200 or not cover_resp.json():
            return None
        image_id = cover_resp.json()[0].get("image_id")
        if not image_id:
            return None
        return f"https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg"


async def fetch_game_description(title: str) -> Optional[str]:
    """Fetch the description/summary for a game from IGDB."""
    if not IGDB_CLIENT_ID or not IGDB_ACCESS_TOKEN:
        return None
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{IGDB_BASE_URL}/games",
            headers=HEADERS,
            data=f'search "{title}"; fields summary; limit 1;',
        )
        if resp.status_code != 200 or not resp.json():
            return None
        return resp.json()[0].get("summary")


async def fetch_game_year(title: str) -> Optional[int]:
    """Fetch the release year for a game from IGDB."""
    if not IGDB_CLIENT_ID or not IGDB_ACCESS_TOKEN:
        return None
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{IGDB_BASE_URL}/games",
            headers=HEADERS,
            data=f'search "{title}"; fields first_release_date; limit 1;',
        )
        if resp.status_code != 200 or not resp.json():
            return None
        ts = resp.json()[0].get("first_release_date")
        if not ts:
            return None
        from datetime import datetime
        return datetime.utcfromtimestamp(ts).year
