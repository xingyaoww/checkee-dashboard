# US Visa Check Dashboard

A visualization dashboard for US visa administrative processing data from [checkee.info](https://www.checkee.info).

## Features

- **Filter by Visa Type**: F1, H1, B1, J1, and more
- **Filter by US Consulate**: Beijing, Shanghai, Guangzhou, etc.
- **Monthly Waiting Time Analysis**: Line chart showing average waiting days for completed cases
- **Status Distribution**: Pie chart showing Clear/Reject/Pending ratios
- **Monthly Breakdown**: Stacked bar chart showing case results by month
- **Summary Statistics**: Total cases, clear rate, average waiting days

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Charts**: Recharts
- **Data**: JSONL format, updated daily via GitHub Actions
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+ (for data scraping)

### Installation

```bash
# Install Node.js dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Data Scraping

To manually update the data:

```bash
# Install Python dependencies
pip install -r scripts/requirements.txt

# Run scraper
python scripts/scraper.py
```

## Automated Data Updates

The data is automatically updated daily at 6:00 AM UTC via GitHub Actions. The workflow:

1. Runs the Python scraper to fetch latest data from checkee.info
2. Commits updated JSONL file to the repository
3. Triggers Vercel deployment automatically

You can also manually trigger the workflow from the GitHub Actions tab.

## Data Format

The data is stored in `public/data/checkee_data.jsonl` with the following structure:

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

## Deployment

This project is designed to be deployed on Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy on every push to main
3. Daily data updates via GitHub Actions will trigger new deployments

## License

MIT

## Acknowledgments

Data source: [checkee.info](https://www.checkee.info)
