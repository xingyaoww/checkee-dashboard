#!/usr/bin/env python3
"""
Scraper for checkee.info - US Visa Administrative Processing Data
Fetches recent case data and merges with existing data.
"""

import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Generator

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.checkee.info"
MAIN_PAGE_URL = f"{BASE_URL}/main.php"
OUTPUT_FILE = Path(__file__).parent.parent / "public" / "data" / "checkee_data.jsonl"

# Number of recent months to scrape (for incremental updates)
RECENT_MONTHS_TO_SCRAPE = 3

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Connection": "keep-alive",
}


def get_all_months() -> list[str]:
    """Fetch all available months from the homepage."""
    resp = requests.get(f"{BASE_URL}/index.php", headers=HEADERS, timeout=30)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    
    months = []
    for link in soup.find_all("a", href=True):
        href = link["href"]
        if "dispdate=" in href:
            match = re.search(r"dispdate=(\d{4}-\d{2})", href)
            if match:
                month = match.group(1)
                if month not in months:
                    months.append(month)
    
    return sorted(months, reverse=True)


def get_recent_months(count: int = RECENT_MONTHS_TO_SCRAPE) -> list[str]:
    """Fetch only the most recent N months."""
    all_months = get_all_months()
    return all_months[:count]


def parse_case_row(row, headers: list[str]) -> dict | None:
    """Parse a single case row from the table."""
    cells = row.find_all("td")
    if len(cells) < len(headers):
        return None
    
    case_data = {}
    for i, header in enumerate(headers):
        cell = cells[i]
        key = header.lower().replace(" ", "_").replace("(", "").replace(")", "")
        
        if key == "update":
            link = cell.find("a")
            if link and "casenum=" in link.get("href", ""):
                match = re.search(r"casenum=(\d+)", link["href"])
                case_data["case_id"] = match.group(1) if match else None
            continue
        elif key == "details":
            continue
        else:
            case_data[key] = cell.get_text(strip=True)
    
    return case_data if case_data.get("case_id") else None


def fetch_month_data(month: str) -> list[dict]:
    """Fetch all case data for a specific month."""
    url = f"{MAIN_PAGE_URL}?dispdate={month}"
    print(f"  Fetching: {url}")
    
    resp = requests.get(url, headers=HEADERS, timeout=60)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    
    cases = []
    tables = soup.find_all("table")
    
    for table in tables:
        header_row = table.find("tr")
        if not header_row:
            continue
            
        headers = []
        for th in header_row.find_all(["th", "td"]):
            link = th.find("a")
            if link:
                headers.append(link.get_text(strip=True))
            else:
                headers.append(th.get_text(strip=True))
        
        expected_headers = ["ID", "Visa Type", "Status", "Check Date"]
        if not all(h in headers for h in expected_headers):
            continue
        
        rows = table.find_all("tr")[1:]
        for row in rows:
            case = parse_case_row(row, headers)
            if case:
                case["month"] = month
                case["scraped_at"] = datetime.now(timezone.utc).isoformat()
                cases.append(case)
    
    return cases


def scrape_months(months: list[str]) -> Generator[dict, None, None]:
    """Generator that yields case data from specified months."""
    for i, month in enumerate(months, 1):
        print(f"Processing month {i}/{len(months)}: {month}")
        try:
            cases = fetch_month_data(month)
            print(f"  Found {len(cases)} cases")
            for case in cases:
                yield case
        except Exception as e:
            print(f"  Error fetching {month}: {e}")
        
        time.sleep(0.5)


def load_existing_data(file_path: Path) -> dict[str, dict]:
    """Load existing data, keyed by case_id."""
    if not file_path.exists():
        return {}
    
    data = {}
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                case = json.loads(line)
                data[case["case_id"]] = case
    return data


def save_to_jsonl(output_file: Path = OUTPUT_FILE, full_scrape: bool = False):
    """
    Save scraped data to JSONL format.
    
    If full_scrape=False (default): Only scrape recent months and merge with existing data.
    If full_scrape=True: Scrape all months (for initial setup).
    """
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    if full_scrape:
        # Full scrape - get all months
        print("Fetching all available months...")
        months = get_all_months()
        print(f"Found {len(months)} months of data")
        existing_data = {}
    else:
        # Incremental scrape - only recent months
        print(f"Fetching recent {RECENT_MONTHS_TO_SCRAPE} months...")
        months = get_recent_months(RECENT_MONTHS_TO_SCRAPE)
        print(f"Will scrape: {', '.join(months)}")
        
        # Load existing data
        print("Loading existing data...")
        existing_data = load_existing_data(output_file)
        print(f"Loaded {len(existing_data)} existing cases")
        
        # Remove cases from months we're about to re-scrape
        months_to_update = set(months)
        existing_data = {
            case_id: case 
            for case_id, case in existing_data.items() 
            if case.get("month") not in months_to_update
        }
        print(f"Keeping {len(existing_data)} cases from older months")
    
    # Scrape new data
    new_cases = 0
    for case in scrape_months(months):
        existing_data[case["case_id"]] = case
        new_cases += 1
    
    print(f"\nScraped {new_cases} cases from recent months")
    
    # Sort by check_date (descending) and write
    sorted_cases = sorted(
        existing_data.values(),
        key=lambda x: x.get("check_date", ""),
        reverse=True
    )
    
    with open(output_file, "w", encoding="utf-8") as f:
        for case in sorted_cases:
            f.write(json.dumps(case, ensure_ascii=False) + "\n")
    
    print(f"Total cases saved: {len(sorted_cases)}")
    print(f"Output file: {output_file}")
    return len(sorted_cases)


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Scrape checkee.info visa data")
    parser.add_argument(
        "--full", 
        action="store_true",
        help="Scrape all historical data (default: only recent 3 months)"
    )
    args = parser.parse_args()
    
    print("=" * 60)
    print("Checkee.info Data Scraper")
    print("=" * 60)
    
    if args.full:
        print("Mode: FULL SCRAPE (all months)")
    else:
        print(f"Mode: INCREMENTAL (recent {RECENT_MONTHS_TO_SCRAPE} months)")
    print()
    
    start_time = time.time()
    total = save_to_jsonl(full_scrape=args.full)
    elapsed = time.time() - start_time
    
    print(f"\nCompleted in {elapsed:.1f} seconds")
    print(f"Total {total} cases in database")


if __name__ == "__main__":
    main()
