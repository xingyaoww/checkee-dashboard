# AGENTS.md - Repository Knowledge

## Project Overview

US Visa Check Dashboard - Visualizes US visa administrative processing data from [checkee.info](https://www.checkee.info). Designed for deployment on Vercel with automated daily data updates.

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, Recharts
- **Scraper**: Python 3.12, requests, beautifulsoup4
- **Deployment**: Vercel (auto-deploy on push)
- **CI/CD**: GitHub Actions (daily data scraping)

## Project Structure

```
/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Main dashboard page
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── Dashboard.tsx       # Main dashboard container
│   │   ├── WaitingTimeChart.tsx    # Monthly avg waiting time chart
│   │   ├── StatusDistributionChart.tsx  # Pie chart for status
│   │   ├── MonthlyBreakdownChart.tsx    # Stacked bar chart
│   │   ├── DataTable.tsx       # Raw data table with pagination
│   │   ├── FilterPanel.tsx     # Visa type & consulate filters
│   │   └── StatsCards.tsx      # Summary statistics cards
│   ├── lib/
│   │   └── dataUtils.ts        # Data processing utilities
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── scripts/
│   ├── scraper.py              # Python data scraper
│   └── requirements.txt        # Python dependencies
├── public/
│   └── data/
│       └── checkee_data.jsonl  # Scraped raw data (committed to repo)
└── .github/
    └── workflows/
        └── update-data.yml     # Daily scraping workflow
```

## Common Commands

```bash
# Development
npm run dev                     # Start dev server (default port 3000)
npm run build                   # Build for production
npm run lint                    # Run ESLint

# Data Scraping
pip install -r scripts/requirements.txt   # Install Python deps
python scripts/scraper.py                  # Run scraper (takes ~5 min)
```

## Data Update Mechanism

1. **GitHub Actions** runs daily at 6:00 AM UTC (see `.github/workflows/update-data.yml`)
2. Scraper fetches all data from checkee.info
3. Updates `public/data/checkee_data.jsonl`
4. Auto-commits changes to repo
5. Vercel auto-deploys on push

Manual trigger available via GitHub Actions "workflow_dispatch".

## Data Format (JSONL)

Each line in `checkee_data.jsonl` is a JSON object:

```json
{
  "case_id": "844215",
  "id": "username",
  "visa_type": "F1",
  "visa_entry": "New",
  "us_consulate": "BeiJing",
  "major": "Computer Science",
  "status": "Clear",
  "check_date": "2024-01-15",
  "complete_date": "2024-02-01",
  "waiting_days": "17",
  "month": "2024-01",
  "scraped_at": "2024-02-01T06:00:00.000000+00:00"
}
```

**Key fields:**
- `visa_type`: F1, H1, B1, J1, B2, H4, L1, O1, etc.
- `status`: Clear, Reject, Pending
- `complete_date`: "0000-00-00" if still pending

## Important Notes

### Scraping
- checkee.info requires proper `User-Agent` header to avoid 403 errors
- Always include browser-like headers in requests
- Be respectful with rate limiting (0.5s delay between requests)

### Data Analysis
- When calculating average waiting time, beware of **selection bias**:
  - Recent months have high pending ratios
  - Only fast-completing cases are counted, skewing averages low
- Solution: Track `pendingRatio` and `isReliable` flags in `MonthlyStats`
- Display unreliable data differently (orange dashed line) with warnings

### Chart Components
- `WaitingTimeChart`: Uses ComposedChart with dual Y-axes (days + sample size)
- Reliable data shown as blue solid line, high-pending as orange dashed
- Custom tooltip shows detailed breakdown (completed count, pending ratio)
