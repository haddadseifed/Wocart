from playwright.sync_api import sync_playwright

url = "http://localhost:4321"
console_logs = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})

    def handle_console_message(msg):
        console_logs.append(f"[{msg.type}] {msg.text}")
        print(f"Console: [{msg.type}] {msg.text}")

    page.on("console", handle_console_message)
    page.goto(url)
    page.wait_for_load_state("networkidle")
    page.screenshot(path="/tmp/sellercove-console-check.png", full_page=True)
    browser.close()

print(f"Captured {len(console_logs)} console messages")
