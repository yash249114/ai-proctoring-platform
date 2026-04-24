"""Scraper route — fetch coding problems from competitive programming sites."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.scraper_service import scrape_question

router = APIRouter(prefix="/scraper", tags=["Scraper"])


class FetchBody(BaseModel):
    url: str


@router.post("/fetch")
async def fetch_question(body: FetchBody):
    if not body.url:
        raise HTTPException(400, "URL is required")
    result = await scrape_question(body.url)
    return result
