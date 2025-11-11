# File: app/services/verification.py

"""
External Verification Service

Author: Mandar . k
Date: 2025-11-02

This module handles all external network calls:
1.  Specialized API crawlers for known providers (Wadhwani, Coursera).
2.  A generic Playwright-based crawler for unknown, JS-heavy sites.
3.  Posting the final result back to the Node.js server.
"""
import httpx
import asyncio
import re
import logging
from typing import Dict, Any, Optional
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Playwright, Browser, Page
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# --- Playwright Global Instance ---
# We use a global instance to avoid the high cost of starting/stopping
# the browser process for every single request.
_playwright: Optional[Playwright] = None
_playwright_browser: Optional[Browser] = None

async def start_playwright():
    """Starts the global Playwright instance and launches a browser."""
    global _playwright, _playwright_browser
    if _playwright is None:
        log.info("Initializing Playwright...")
        _playwright = await async_playwright().start()
        _playwright_browser = await _playwright.chromium.launch(headless=True)
        log.info("Playwright browser launched.")

async def stop_playwright():
    """Stops the global Playwright browser and instance."""
    global _playwright, _playwright_browser
    if _playwright_browser:
        await _playwright_browser.close()
        _playwright_browser = None
    if _playwright:
        await _playwright.stop()
        _playwright = None
    log.info("Playwright stopped.")

async def get_playwright_browser() -> Browser:
    """Returns the global browser, starting it if necessary."""
    if _playwright_browser is None:
        log.warning("Playwright not started, starting on-demand.")
        await start_playwright()
    return _playwright_browser

# --- Provider-Specific Crawlers ---

async def crawl_wadhwani_foundation_api(page_url: str) -> Optional[str]:
    """
    Specific handler for Wadhwani Foundation.
    It calls their public API directly instead of scraping the JS-based page.
    """
    log.info(f"Detected Wadhwani Foundation URL. Attempting direct API call.")
    try:
        match = re.search(r'certificateId=([a-f0-9]+)', page_url)
        if not match:
            log.warning("Wadhwani URL: Could not parse certificateId.")
            return None
        
        certificate_id = match.group(1)
        api_url = "https://l2-cen.wadhwanifoundation.org/api/v1/PublicCertificate/GetCertificate"
        payload = {"certificateId": certificate_id}
        
        async with httpx.AsyncClient(timeout=settings.POST_TIMEOUT_SECONDS, follow_redirects=True) as client:
            r = await client.post(api_url, json=payload)
            r.raise_for_status()
            response_json = r.json()
            
            if response_json.get("success") and response_json.get("data"):
                data = response_json["data"]
                # Convert the structured JSON into a simple text string for Gemini
                text_blob = f"""
                Certificate Provider: Wadhwani Foundation
                Student Name: {data.get("studentName")}
                Course Name: {data.get("courseName")}
                Issued On: {data.get("issueDate")}
                Status: {data.get("status")}
                """
                log.info(f"--- CRAWLED TEXT (from Wadhwani API) --- \n{text_blob}\n--- END CRAWLED TEXT ---")
                return text_blob
            else:
                log.warning(f"Wadhwani API call succeeded but returned no data.")
                return None
    except Exception as e:
        log.error(f"Wadhwani API call failed: {e}", exc_info=True)
        return None

async def crawl_coursera_api(page_url: str) -> Optional[str]:
    """
    Specific handler for Coursera. Calls their public verification API.
    """
    log.info(f"Detected Coursera URL. Attempting direct API call.")
    try:
        match = re.search(r'verify/([A-Z0-9]+)', page_url)
        if not match:
            log.warning("Coursera URL: Could not parse certificateId.")
            return None
        
        certificate_id = match.group(1)
        api_url = f"https://api.coursera.org/api/certificate.v1/verification/{certificate_id}"
        
        async with httpx.AsyncClient(timeout=settings.POST_TIMEOUT_SECONDS, follow_redirects=True) as client:
            headers = {'User-Agent': 'TalentSync-Verification-Bot/1.0'}
            r = await client.get(api_url, headers=headers)
            r.raise_for_status()
            response_json = r.json()
            
            if response_json.get("elements") and len(response_json["elements"]) > 0:
                data = response_json["elements"][0]
                text_blob = f"""
                Certificate Provider: Coursera
                Recipient Name: {data.get("recipientName")}
                Course Name: {data.get("courseName")}
                Issued On: {data.get("issuedOn")}
                University: {data.get("universityName")}
                """
                log.info(f"--- CRAWLED TEXT (from Coursera API) --- \n{text_blob}\n--- END CRAWLED TEXT ---")
                return text_blob
            else:
                log.warning(f"Coursera API call succeeded but returned no data.")
                return None
    except Exception as e:
        log.error(f"Coursera API call failed: {e}", exc_info=True)
        return None

# --- Generic Fallback Crawler (Playwright) ---

async def crawl_with_playwright(page_url: str) -> Optional[str]:
    """
    Generic fallback crawler.
    Uses a headless browser (Playwright) to load the page, wait for
    JavaScript to render, and then extract the text content.
    """
    log.info(f"Attempting to crawl URL with Playwright (generic fallback): {page_url}")
    page: Optional[Page] = None
    try:
        browser = await get_playwright_browser()
        page = await browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        )
        
        # Go to the page with a generous timeout
        await page.goto(page_url, timeout=settings.PLAYWRIGHT_TIMEOUT * 1000)
        
        # Wait for 3 seconds to allow JS to load and render
        await page.wait_for_timeout(3000) 
        
        # Get the fully rendered HTML
        html_content = await page.content()
        
        # Use BeautifulSoup to parse the rendered HTML and strip text
        soup = BeautifulSoup(html_content, "html.parser")
        for script_or_style in soup(["script", "style", "nav", "footer", "header"]):
            script_or_style.decompose()
        
        page_text = soup.get_text(separator=" ", strip=True)
        
        log.info(f"Successfully crawled {len(page_text)} chars from {page_url} (Playwright).")
        log.info(f"--- CRAWLED TEXT (Playwright) --- \n{page_text[:1000]}...\n--- END CRAWLED TEXT ---")
        return page_text

    except Exception as e:
        log.error(f"Playwright crawl failed for {page_url}: {e}", exc_info=True)
        return None
    finally:
        if page:
            await page.close()

# --- Main Router Function ---

async def crawl_page_text(page_url: str) -> Optional[str]:
    """
    Crawls a verification URL.
    It uses specific API handlers if available (Provider Router),
    otherwise falls back to the Playwright headless browser.
    """
    
    # --- Provider Router ---

    
    if "coursera.org/account/accomplishments/verify" in page_url:
        return await crawl_coursera_api(page_url)
    
    # ... we can add more handlers here for Credly, Accredible, etc. ...
    
    # --- END Provider Router ---

    # --- Generic Fallback Crawler (Playwright) ---
    # If no specific handler matched, use the headless browser.
    return await crawl_with_playwright(page_url)


# --- Postback Function ---

async def post_to_server(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Posts the final processed payload to the configured server endpoint with retries.
    """
    log.info(f"Posting final payload for job {payload.get('jobId')} to {settings.SERVER_ENDPOINT}")
    async with httpx.AsyncClient(timeout=settings.POST_TIMEOUT_SECONDS) as client:
        last_exc = None
        for attempt in range(settings.POST_RETRIES):
            try:
                r = await client.post(settings.SERVER_ENDPOINT, json=payload, timeout=settings.POST_TIMEOUT_SECONDS)
                r.raise_for_status()
                log.info(f"Successfully posted job {payload.get('jobId')}, server responded with {r.status_code}.")
                return {"ok": True, "status_code": r.status_code, "response_text": r.text}
            except Exception as e:
                last_exc = e
                log.warning(f"Post to server failed (attempt {attempt + 1}/{settings.POST_RETRIES}). Retrying in 1s... Error: {e}")
                await asyncio.sleep(1) # Wait 1 second before retrying
                
    log.error(f"Failed to post job {payload.get('jobId')} after {settings.POST_RETRIES} attempts. Last error: {last_exc}")
    return {"ok": False, "error": str(last_exc)}

