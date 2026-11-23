"""Walk a case study's storyline guide beat by beat and report problems.

Needs a running site (npm run build && npx astro preview) and Google Chrome.
Usage: uv run --with playwright python scripts/story_walk.py <slug> [base_url] [--shots DIR]
Checks, in zh and en: every beat outlines exactly one element and lights at least one element,
closing the guide leaves no beat classes behind, and there are no console errors.
"""
import sys
from playwright.sync_api import sync_playwright

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
args = [a for a in sys.argv[1:] if not a.startswith("--")]
slug = args[0]
base = args[1] if len(args) > 1 else "http://localhost:4321/PCResume"
shots = sys.argv[sys.argv.index("--shots") + 1] if "--shots" in sys.argv else None

STATE = """() => ({
  count: document.querySelector('.story-count').textContent.trim(),
  pips: document.querySelectorAll('.story-beats i').length,
  on: document.querySelectorAll('.story-beats i.on').length,
  now: document.querySelectorAll('.beat-now').length,
  focus: document.querySelectorAll('.story-focus').length,
  playing: [...document.querySelectorAll('video')].filter(v => !v.paused).length,
  next: document.querySelector('.story-next').textContent })"""

ok = True
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME)
    for lang in ["", "/en"]:
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.goto(f"{base}{lang}/projects/{slug}/")
        page.wait_for_timeout(2500)
        page.click(".story-start")
        page.wait_for_timeout(900)
        problems, beats = [], 0
        for i in range(200):
            s = page.evaluate(STATE)
            beats += 1
            if s["focus"] != 1 or (s["pips"] > 0 and s["now"] == 0):
                problems.append((s["count"], s["on"]))
            if shots:
                page.screenshot(path=f"{shots}/{slug}{lang.replace('/', '-')}-{i:02d}.png")
            if s["next"] in ("看完了", "Done"):
                break
            page.keyboard.press("ArrowRight")
            page.wait_for_timeout(800)
        page.keyboard.press("Escape")
        page.wait_for_timeout(300)
        left = page.evaluate("document.querySelectorAll('.beat-pending,.beat-now,.beat-dim,.beat-shown,.story-focus').length")
        print(f"{lang or 'zh'}: {beats} beats, problems {problems}, leftover {left}, console errors {errors}")
        ok = ok and not problems and not left and not errors
    browser.close()
sys.exit(0 if ok else 1)
