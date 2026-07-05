# Adam's Daily Reading Dashboard

A self-updating news dashboard based on Adam's daily reading source list.

## What it does

- Pulls headlines from RSS/Atom feeds or Google News RSS fallbacks.
- Saves the latest items to `news.json`.
- Displays everything in one searchable webpage.
- Can auto-update hourly using GitHub Actions.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python scripts/update_news.py
python -m http.server 8000
```

Open: `http://localhost:8000`

## Publish with GitHub Pages

1. Create a new GitHub repository.
2. Upload these files.
3. Go to **Settings → Pages**.
4. Set source to **Deploy from a branch**.
5. Select branch **main** and folder **root**.
6. The included GitHub Action updates `news.json` every hour.

## Edit sources

Change `sources.json` to add, remove, or replace feeds.

Some publishers do not provide easy public RSS feeds. For those, this project uses Google News RSS search as a fallback so you can still monitor that platform from one dashboard.
