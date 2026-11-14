from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.goto("http://localhost:4321")
    page.wait_for_load_state("networkidle")

    for selector, label in [
        ("button", "buttons"),
        ("a[href]", "links"),
        ("input, textarea, select", "form controls"),
    ]:
        elements = page.locator(selector).all()
        print(f"Found {len(elements)} {label}:")
        for index, element in enumerate(elements[:20]):
            text = element.inner_text().strip() if element.is_visible() else "[hidden]"
            print(f"  [{index}] {text[:100]}")

    page.screenshot(path="/tmp/sellercove-mobile-discovery.png", full_page=True)
    browser.close()
