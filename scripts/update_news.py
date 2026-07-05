import json
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

import feedparser

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "sources.json"
OUTPUT = ROOT / "news.json"
MAX_ITEMS_PER_SOURCE = 8


def parse_date(entry):
    for key in ("published", "updated", "created"):
        value = entry.get(key)
        if value:
            try:
                return parsedate_to_datetime(value).astimezone(timezone.utc).isoformat()
            except Exception:
                pass
    return datetime.now(timezone.utc).isoformat()


def main():
    categories = json.loads(SOURCES.read_text(encoding="utf-8"))
    items = []
    failures = []

    for group in categories:
        category = group["category"]
        for source in group["sources"]:
            feed_url = source["feed_url"]
            parsed = feedparser.parse(feed_url)
            if parsed.bozo and not parsed.entries:
                failures.append({"source": source["name"], "feed_url": feed_url, "error": str(parsed.bozo_exception)})
                continue

            for entry in parsed.entries[:MAX_ITEMS_PER_SOURCE]:
                items.append({
                    "category": category,
                    "source": source["name"],
                    "title": entry.get("title", "Untitled"),
                    "link": entry.get("link", source["site_url"]),
                    "summary": entry.get("summary", entry.get("description", "")),
                    "published": parse_date(entry),
                    "feed_type": source.get("feed_type", "rss")
                })

    items.sort(key=lambda x: x.get("published", ""), reverse=True)
    OUTPUT.write_text(json.dumps({
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "item_count": len(items),
        "failures": failures,
        "items": items
    }, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(items)} items to {OUTPUT}")
    if failures:
        print("Some feeds failed:")
        for failure in failures:
            print(f"- {failure['source']}: {failure['error']}")


if __name__ == "__main__":
    main()
