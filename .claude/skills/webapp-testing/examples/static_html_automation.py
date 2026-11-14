from pathlib import Path
from playwright.sync_api import sync_playwright

html_file = Path("path/to/your/file.html").resolve()
if not html_file.is_file():
    raise SystemExit(f"HTML file not found: {html_file}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto(html_file.as_uri())
    page.wait_for_load_state("load")
    page.screenshot(path="/tmp/static-page-check.png", full_page=True)
    browser.close()
