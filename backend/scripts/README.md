# Prayer Times Binary File Generator

This script fetches prayer times for an entire year from the Aladhan API and stores them in a compact binary format.

## Features

- 🕌 Fetches prayer times using **Turkey Diyanet method (13)** and **Hanafi school (1)**
- 📍 Location: **Sofia, Bulgaria** (42.6977, 23.3219)
- 💾 **Binary format**: 24 bytes per day (saves ~85% space vs JSON)
- 🚀 **Fast loading**: ~8.7 KB for 365 days vs ~60 KB JSON
- ⚡ **Rate limiting**: 2 requests/second to avoid API throttling
- 🔄 **Retry logic**: Automatic retry on failure with exponential backoff

## Requirements

- Node.js 14+ (uses `https`, `fs`, `path` built-in modules)

## Usage

### 1. Fetch Prayer Times for Current Year

```bash
cd backend/scripts
node fetch-prayer-times-year.js
```

### 2. Fetch for Specific Year

```bash
node fetch-prayer-times-year.js 2026
```

### 3. Output Files

The script generates two files in `backend/src/main/resources/data/`:

- **`prayer-times-{year}.bin`** - Binary data file (24 bytes per entry)
- **`prayer-times-{year}.meta.json`** - Metadata (location, method, stats)

## Binary Format

Each entry is exactly **24 bytes**:

| Offset | Size | Type | Description |
|--------|------|------|-------------|
| 0 | 2 | uint16 | Year (e.g., 2026) |
| 2 | 1 | uint8 | Month (1-12) |
| 3 | 1 | uint8 | Day (1-31) |
| 4 | 2 | uint16 | Fajr (minutes since midnight) |
| 6 | 2 | uint16 | Sunrise |
| 8 | 2 | uint16 | Dhuhr |
| 10 | 2 | uint16 | Asr |
| 12 | 2 | uint16 | Maghrib |
| 14 | 2 | uint16 | Isha |
| 16 | 1 | uint8 | Hijri day |
| 17 | 1 | uint8 | Hijri month |
| 18 | 2 | uint16 | Hijri year |
| 20 | 6 | - | Reserved for future use |

**Total**: 24 bytes × 365 days = **8,760 bytes (~8.7 KB)**

## Example Output

```
📅 Fetching prayer times for year 2026...
📍 Location: Sofia, Bulgaria
🕌 Method: Turkey Diyanet (13)
📖 School: Hanafi (1)

✅ Created directory: backend/src/main/resources/data

📥 Fetching 365 days of prayer times...

✅ Progress: 365/365 (100.0%) - Elapsed: 183.4s

✅ Successfully fetched 365 days

💾 Converting to binary format...
✅ Binary file saved: backend/src/main/resources/data/prayer-times-2026.bin
📊 File size: 8.55 KB (vs 59.23 KB JSON)
🎯 Space savings: 85.6%
📋 Metadata saved: backend/src/main/resources/data/prayer-times-2026.meta.json

🎉 Done! Total time: 183.5s
```

## How It Works

### 1. Fetching Phase
- Generates all dates for the year (365 or 366 days)
- Calls Aladhan API: `https://api.aladhan.com/v1/timings/DD-MM-YYYY?latitude=...&method=13&school=1`
- Waits 500ms between requests (respects rate limits)
- Retries failed requests once with 2-second delay

### 2. Conversion Phase
- Converts time strings (HH:MM) to minutes since midnight (saves space)
- Packs all data into Little Endian binary format
- Each entry is exactly 24 bytes for predictable indexing

### 3. Storage Phase
- Writes binary file to `backend/src/main/resources/data/`
- Creates metadata JSON with location, method, and statistics
- Files are included in Spring Boot JAR at build time

## Integration with Backend

The `PrayerTimeBinaryLoader` service reads this file:

```java
@Autowired
private PrayerTimeBinaryLoader binaryLoader;

// Load on startup
@PostConstruct
public void init() {
    binaryLoader.loadPrayerTimes(LocalDate.now().getYear());
}

// Get prayer times
PrayerTime times = binaryLoader.getPrayerTimeForDate(LocalDate.now());
```

### Benefits:
- ✅ **No database required** for prayer times
- ✅ **No API calls** after initial generation
- ✅ **O(1) lookup** from in-memory HashMap
- ✅ **Fast startup** (~10ms to load 365 days)
- ✅ **Version control friendly** (small binary file)

## Updating Prayer Times

### Annually (recommended)
```bash
# Generate next year's file in December
node fetch-prayer-times-year.js 2027

# Commit to repository
git add backend/src/main/resources/data/prayer-times-2027.bin
git commit -m "feat: Add prayer times for 2027"
```

### On Deployment
```bash
# Add to your CI/CD pipeline or Dockerfile
RUN node backend/scripts/fetch-prayer-times-year.js $(date +%Y)
```

### Manually Trigger
```bash
# Delete old file to force regeneration
rm backend/src/main/resources/data/prayer-times-*.bin

# Run script
node fetch-prayer-times-year.js
```

## Configuration

Edit the `CONFIG` object in the script to change location or method:

```javascript
const CONFIG = {
  latitude: '42.6977',    // Your latitude
  longitude: '23.3219',   // Your longitude
  method: 13,              // Calculation method (13 = Turkey Diyanet)
  school: 1,               // Juristic school (1 = Hanafi)
  city: 'Sofia',
  country: 'Bulgaria'
};
```

### Available Methods

| ID | Method |
|----|--------|
| 1 | University of Islamic Sciences, Karachi |
| 2 | Islamic Society of North America (ISNA) |
| 3 | Muslim World League (MWL) |
| 4 | Umm al-Qura, Makkah |
| 5 | Egyptian General Authority of Survey |
| 7 | Institute of Geophysics, University of Tehran |
| 8 | Gulf Region |
| 9 | Kuwait |
| 10 | Qatar |
| 11 | Majlis Ugama Islam Singapura, Singapore |
| 12 | Union Organization islamic de France |
| **13** | **Turkey Diyanet** ⭐ (current) |
| 14 | Spiritual Administration of Muslims of Russia |

### Juristic Schools

| ID | School |
|----|--------|
| **1** | **Hanafi** ⭐ (current) |
| 0 | Shafi |

## Troubleshooting

### Rate Limit Errors (429)
- Increase delay: Change `await sleep(500)` to `await sleep(1000)` (line ~263)
- The script already has retry logic, so most errors will self-recover

### Missing Dependencies
```bash
# Script uses Node.js built-ins only, no npm install needed!
node --version  # Should be 14+
```

### Invalid Date Range
- Script automatically calculates leap years
- Handles dates from 01-01 to 12-31 correctly

### File Permission Errors
```bash
# Create directory manually if needed
mkdir -p backend/src/main/resources/data
chmod 755 backend/src/main/resources/data
```

## Performance Comparison

| Method | File Size | Load Time | API Calls/Year | Maintenance |
|--------|-----------|-----------|----------------|-------------|
| **Binary File** | 8.7 KB | ~10ms | 0 (pre-generated) | Annual update |
| Database Cache | ~50 KB | ~50ms | 365 (on startup) | Daily refresh |
| On-Demand API | 0 KB | ~500ms/request | 100,000+ | Real-time |

## License

This script is part of the Masjid Studentski Grad project.
