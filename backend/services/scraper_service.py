"""Scraper service — fetches coding problems from popular competitive programming sites."""

import logging
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


def _clean(text: str) -> str:
    """Strip and normalise whitespace."""
    return " ".join(text.split()).strip() if text else ""


def _scrape_leetcode_graphql(data: dict) -> dict:
    if not data or "data" not in data or "question" not in data["data"] or not data["data"]["question"]:
        return {"error": "Could not extract LeetCode question data."}
    
    question = data["data"]["question"]
    title = question.get("title", "")
    content_html = question.get("content", "")
    
    soup = BeautifulSoup(content_html, "html.parser")
    description = ""
    constraints = ""
    sample_input = ""
    sample_output = ""
    
    # Very basic parsing of HTML content
    # In Leetcode GraphQL, content contains p tags and pre tags.
    description = _clean(soup.get_text())
    
    return {
        "title": title,
        "description": description,
        "constraints": constraints,
        "sample_input": sample_input,
        "sample_output": sample_output,
        "explanation": ""
    }


def _scrape_geeksforgeeks(soup: BeautifulSoup) -> dict:
    title_tag = soup.find("h1") or soup.find("title")
    title = _clean(title_tag.get_text()) if title_tag else ""

    article = soup.find("div", class_="problems_header_content__o_4GI") or soup.find("article") or soup.find("div", class_="text")
    description = _clean(article.get_text()) if article else ""

    return {"title": title, "description": description, "constraints": "",
            "sample_input": "", "sample_output": "", "explanation": ""}


def _scrape_codechef(soup: BeautifulSoup) -> dict:
    title_tag = soup.find("h1") or soup.find("title")
    title = _clean(title_tag.get_text()) if title_tag else ""

    prob = soup.find("div", class_="problem-statement") or soup.find("div", id="problem-statement")
    description = _clean(prob.get_text()) if prob else ""

    return {"title": title, "description": description, "constraints": "",
            "sample_input": "", "sample_output": "", "explanation": ""}


def _scrape_codeforces(soup: BeautifulSoup) -> dict:
    title_tag = soup.find("div", class_="title")
    title = _clean(title_tag.get_text()) if title_tag else ""

    prob = soup.find("div", class_="problem-statement")
    description = ""
    constraints = ""
    sample_input = ""
    sample_output = ""

    if prob:
        # Description paragraphs
        desc_parts = prob.find_all("p")
        description = " ".join(_clean(p.get_text()) for p in desc_parts[:5])

        # Input/output samples
        inp = prob.find("div", class_="input")
        if inp:
            pre = inp.find("pre")
            sample_input = _clean(pre.get_text()) if pre else ""

        out = prob.find("div", class_="output")
        if out:
            pre = out.find("pre")
            sample_output = _clean(pre.get_text()) if pre else ""

    return {"title": title, "description": description, "constraints": constraints,
            "sample_input": sample_input, "sample_output": sample_output, "explanation": ""}


async def scrape_question(url: str) -> dict:
    """Scrape a coding problem from a supported URL. Returns dict or {error: ...}."""
    domain = url.lower()
    try:
        if "leetcode.com" in domain:
            # Extract title slug from url
            # e.g. https://leetcode.com/problems/two-sum/ -> two-sum
            parts = [p for p in url.split("/") if p]
            if "problems" in parts:
                idx = parts.index("problems")
                if idx + 1 < len(parts):
                    title_slug = parts[idx + 1]
                    graphql_url = "https://leetcode.com/graphql"
                    payload = {
                        "operationName": "questionData",
                        "variables": {"titleSlug": title_slug},
                        "query": "query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { title content difficulty } }"
                    }
                    lc_headers = {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Content-Type": "application/json",
                        "Referer": "https://leetcode.com/",
                        "Origin": "https://leetcode.com"
                    }
                    async with httpx.AsyncClient(timeout=15) as client:
                        resp = await client.post(graphql_url, json=payload, headers=lc_headers)
                        resp.raise_for_status()
                        data = resp.json()
                        result = _scrape_leetcode_graphql(data)
                        result["source_url"] = url
                        return result

        async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True, timeout=15) as client:
            resp = await client.get(url)
            resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        if "geeksforgeeks.org" in domain:
            result = _scrape_geeksforgeeks(soup)
        elif "codechef.com" in domain:
            result = _scrape_codechef(soup)
        elif "codeforces.com" in domain:
            result = _scrape_codeforces(soup)
        else:
            return {"error": f"Unsupported platform. Supported: leetcode.com, geeksforgeeks.org, codechef.com, codeforces.com"}

        result["source_url"] = url
        return result

    except httpx.HTTPStatusError as e:
        logger.error("HTTP error scraping %s: %s", url, e)
        return {"error": f"HTTP {e.response.status_code} — could not fetch from this URL. Please fill manually."}
    except Exception as e:
        logger.error("Scrape error for %s: %s", url, e)
        return {"error": "Could not fetch from this URL. Please fill manually."}
