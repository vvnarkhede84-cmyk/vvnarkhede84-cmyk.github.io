# National AQI Live-Mapping Terminal - Setup Guide

## Quick Start (5 minutes)

### 1. Get WAQI API Token
- Visit: https://aqicn.org/data-platform/register/
- Sign up for free account
- Copy your API token

### 2. Configure GitHub Secrets
- Go to: Repository Settings → Secrets and variables → Actions
- Click: "New repository secret"
- Name: `WAQI_TOKEN`
- Value: `<paste-your-token>`
- Click: "Add secret"

### 3. Enable GitHub Pages
- Go to: Repository Settings → Pages
- Source: Deploy from a branch
- Branch: `main`
- Directory: `/ (root)`
- Click: "Save"

### 4. Access Your App
- Wait 2-3 minutes for deployment
- Visit: `https://your-username.github.io/vvnarkhede84-cmyk/`

## Local Development

### Run Frontend (Required!)
```bash
# IMPORTANT: Must use HTTP server, NOT file:// protocol
python -m http.server 8000

# Then open: http://localhost:8000 (NOT http://file://...)
```

**Why?** The app fetches `data/aqi_snapshot.json` which requires HTTP protocol due to CORS restrictions. If opened as `file://`, you'll see "Mock Data" warning - this is expected behavior.

### Run Data Fetcher
```bash
# Install dependencies
pip install -r requirements.txt

# Set API token (Windows PowerShell)
$env:WAQI_TOKEN = "your_token_here"

# Run fetcher
python scripts/fetch_aqi.py
```

## Architecture

### Backend: GitHub Actions + Python
- Runs every hour (configurable)
- Fetches real-time AQI from WAQI API
- Updates `data/aqi_snapshot.json`
- Auto-commits if changes detected

### Frontend: Static HTML + Leaflet.js
- No backend required
- Loads `data/aqi_snapshot.json`
- Renders interactive map with 50+ city markers
- Fully responsive (mobile, tablet, desktop)

## Monitoring the Workflow

1. Go to: Repository → Actions tab
2. Check: "Sync AQI Data" workflow
3. View: Recent runs and logs
4. Trigger: Manual run via "Run workflow"

## Customization

### Change Update Frequency
Edit `.github/workflows/sync_aqi.yml`:
```yaml
schedule:
  - cron: '0 * * * *'  # Every hour
```

Cron Format: `minute hour day month day-of-week`

### Add/Remove Cities
Edit `scripts/fetch_aqi.py`:
```python
CITIES_MATRIX = [
    {"name": "Mumbai", "state": "Maharashtra", ...},
    # Add more cities here
]
```

### Change Map Style
Edit `assets/styles.css`:
- CSS variables at top (colors, sizes)
- Leaflet tile layer in `assets/app.js`
- Color scheme: Dark theme optimized for 24/7 monitoring

## Troubleshooting

**Problem: Workflow fails with "WAQI_TOKEN not found"**
- Solution: Check Settings → Secrets → Actions, ensure `WAQI_TOKEN` exists

**Problem: Map shows no markers**
- Solution: Check `data/aqi_snapshot.json` exists and is valid JSON

**Problem: Page won't load on first visit**
- Solution: Wait ~1-2 minutes for GitHub Pages deployment, then refresh

## Performance Tips

1. **Caching**: Browser caches data.json, CSS, and JS
2. **Compression**: GitHub automatically gzips static assets
3. **CDN**: GitHub Pages uses Cloudflare CDN for fast delivery

## Security Notes

- ✅ API token stored securely in GitHub Secrets
- ✅ Never commit `.env` or token to repository
- ✅ All data served over HTTPS
- ✅ Git history provides audit trail

## Next Steps

1. ✅ Set up WAQI_TOKEN secret
2. ✅ Enable GitHub Pages
3. ✅ Test local setup
4. ✅ Monitor first automated run
5. ✅ Share your live dashboard!

---

For more details, see README.md
