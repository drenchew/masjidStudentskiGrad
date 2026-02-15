#!/usr/bin/env python3

"""
Fetch Prayer Times for Entire Year

This script fetches prayer times for the entire year from Aladhan API
using the Turkish Diyanet method and stores them in a compact binary file.

Usage: python3 fetch-prayer-times-year.py [year]
Example: python3 fetch-prayer-times-year.py 2026

Requirements: pip install aiohttp (for async HTTP requests)
"""

import asyncio
import aiohttp
import struct
import sys
import json
from datetime import datetime, date, timedelta
from pathlib import Path
import time

# Configuration
CONFIG = {
    'latitude': '42.6977',    # Sofia, Bulgaria
    'longitude': '23.3219',
    'method': 13,             # 13 = Turkey Diyanet
    'school': 1,              # Hanafi
    'city': 'Sofia',
    'country': 'Bulgaria'
}

# Hijri months mapping (complete and correct)
HIJRI_MONTHS = {
    'Muḥarram': 1, 'Muharram': 1,
    'Ṣafar': 2, 'Safar': 2,
    'Rabīʿ': 3, 'Rabi': 3, 'Rabī': 3,
    'Rabīʿ al-thānī': 4, 'Rabi al-thani': 4, 'Rabīʿ II': 4,
    'Jumādá': 5, 'Jumada': 5, 'Jumādā': 5,
    'Jumādá al-thāniyah': 6, 'Jumada al-thani': 6, 'Jumādā II': 6,
    'Rajab': 7,
    'Shaʿbān': 8, "Sha'ban": 8, 'Shaban': 8,
    'Ramaḍān': 9, 'Ramadan': 9, 'Ramadhan': 9,
    'Shawwāl': 10, 'Shawwal': 10,
    'Dhū al-Qaʿdah': 11, 'Dhu al-Qidah': 11, 'Dhū al-Qi': 11, 'Dhu al-Qi': 11,
    'Dhū al-Ḥijjah': 12, 'Dhu al-Hijjah': 12, 'Dhū al-Ḥi': 12, 'Dhu al-Hi': 12
}

def parse_hijri_month(month_str):
    """Parse Hijri month name to number (1-12)"""
    if not month_str:
        return 1
    
    # Try exact match first
    if month_str in HIJRI_MONTHS:
        return HIJRI_MONTHS[month_str]
    
    # Try partial match
    for key, value in HIJRI_MONTHS.items():
        if key in month_str or month_str in key:
            return value
    
    return 1  # Default to Muharram if not found

def time_to_minutes(time_str):
    """Convert HH:MM time string to minutes since midnight"""
    try:
        parts = time_str.split(':')
        hours = int(parts[0])
        minutes = int(parts[1]) if len(parts) > 1 else 0
        return hours * 60 + minutes
    except:
        return 0

async def fetch_prayer_times_for_date(session, date_obj, semaphore):
    """Fetch prayer times for a specific date with rate limiting"""
    async with semaphore:
        date_str = date_obj.strftime('%d-%m-%Y')
        url = (f"https://api.aladhan.com/v1/timings/{date_str}"
               f"?latitude={CONFIG['latitude']}"
               f"&longitude={CONFIG['longitude']}"
               f"&method={CONFIG['method']}"
               f"&school={CONFIG['school']}")
        
        retries = 5  # Increased from 3 to 5
        for attempt in range(retries):
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if data.get('code') == 200 and data.get('data'):
                            timings = data['data']['timings']
                            hijri = data['data']['date']['hijri']
                            
                            return {
                                'date': date_obj,
                                'fajr': timings['Fajr'].split()[0],
                                'sunrise': timings['Sunrise'].split()[0],
                                'dhuhr': timings['Dhuhr'].split()[0],
                                'asr': timings['Asr'].split()[0],
                                'maghrib': timings['Maghrib'].split()[0],
                                'isha': timings['Isha'].split()[0],
                                'hijri_day': int(hijri['day']),
                                'hijri_month': parse_hijri_month(hijri['month']['en']),
                                'hijri_year': int(hijri['year'])
                            }
                    elif response.status == 429:
                        # Rate limited, wait exponentially longer
                        wait_time = min(2 ** (attempt + 1), 30)  # Max 30 seconds
                        print(f"⚠️  Rate limited on {date_str}, waiting {wait_time}s... (attempt {attempt + 1}/{retries})")
                        await asyncio.sleep(wait_time)
                    else:
                        print(f"❌ HTTP {response.status} for {date_str}")
                        if attempt < retries - 1:
                            await asyncio.sleep(3)
                        
            except asyncio.TimeoutError:
                print(f"⏱️  Timeout for {date_str}, attempt {attempt + 1}/{retries}")
                if attempt < retries - 1:
                    await asyncio.sleep(2)
            except Exception as e:
                print(f"❌ Error fetching {date_str}: {e}")
                if attempt < retries - 1:
                    await asyncio.sleep(2)
        
        return None

async def fetch_all_prayer_times(year):
    """Fetch all prayer times for a year with concurrent requests"""
    # Generate all dates for the year
    start_date = date(year, 1, 1)
    end_date = date(year, 12, 31)
    dates = []
    current = start_date
    while current <= end_date:
        dates.append(current)
        current += timedelta(days=1)
    
    total_days = len(dates)
    print(f"📥 Fetching {total_days} days of prayer times...\n")
    
    # Semaphore to limit concurrent requests (reduced to 5 to avoid rate limits)
    semaphore = asyncio.Semaphore(5)
    
    # Create aiohttp session with connection pooling
    connector = aiohttp.TCPConnector(limit=5)
    timeout = aiohttp.ClientTimeout(total=60)
    
    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        tasks = []
        for date_obj in dates:
            task = fetch_prayer_times_for_date(session, date_obj, semaphore)
            tasks.append(task)
        
        # Fetch with progress updates
        results = []
        start_time = time.time()
        
        for i, task in enumerate(asyncio.as_completed(tasks)):
            result = await task
            if result:
                results.append(result)
            
            # Progress indicator
            if (i + 1) % 30 == 0 or (i + 1) == total_days:
                progress = (i + 1) / total_days * 100
                elapsed = time.time() - start_time
                print(f"\r✅ Progress: {i + 1}/{total_days} ({progress:.1f}%) - Elapsed: {elapsed:.1f}s", end='', flush=True)
        
        print()  # New line after progress
    
    # Sort results by date
    results.sort(key=lambda x: x['date'])
    
    return results

def convert_to_binary(prayer_times):
    """
    Convert prayer times to binary format
    Format per entry (24 bytes):
    - Year: 2 bytes (uint16, little-endian)
    - Month: 1 byte (uint8)
    - Day: 1 byte (uint8)
    - Fajr: 2 bytes (minutes since midnight, uint16)
    - Sunrise: 2 bytes
    - Dhuhr: 2 bytes
    - Asr: 2 bytes
    - Maghrib: 2 bytes
    - Isha: 2 bytes
    - Hijri Day: 1 byte
    - Hijri Month: 1 byte
    - Hijri Year: 2 bytes (uint16)
    - Reserved: 6 bytes (for future use)
    """
    entry_size = 24
    buffer = bytearray(entry_size * len(prayer_times))
    
    for i, entry in enumerate(prayer_times):
        offset = i * entry_size
        
        # Pack date and prayer times
        struct.pack_into('<H', buffer, offset, entry['date'].year)  # Year (little-endian uint16)
        struct.pack_into('B', buffer, offset + 2, entry['date'].month)  # Month
        struct.pack_into('B', buffer, offset + 3, entry['date'].day)  # Day
        struct.pack_into('<H', buffer, offset + 4, time_to_minutes(entry['fajr']))
        struct.pack_into('<H', buffer, offset + 6, time_to_minutes(entry['sunrise']))
        struct.pack_into('<H', buffer, offset + 8, time_to_minutes(entry['dhuhr']))
        struct.pack_into('<H', buffer, offset + 10, time_to_minutes(entry['asr']))
        struct.pack_into('<H', buffer, offset + 12, time_to_minutes(entry['maghrib']))
        struct.pack_into('<H', buffer, offset + 14, time_to_minutes(entry['isha']))
        struct.pack_into('B', buffer, offset + 16, entry['hijri_day'])
        struct.pack_into('B', buffer, offset + 17, entry['hijri_month'])
        struct.pack_into('<H', buffer, offset + 18, entry['hijri_year'])
        # Offset 20-25: reserved (already zero-filled)
    
    return bytes(buffer)

async def main():
    # Get year from command line or use current year
    year = int(sys.argv[1]) if len(sys.argv) > 1 else datetime.now().year
    
    print(f"\n📅 Fetching prayer times for year {year}...")
    print(f"📍 Location: {CONFIG['city']}, {CONFIG['country']}")
    print(f"🕌 Method: Turkey Diyanet ({CONFIG['method']})")
    print(f"📖 School: Hanafi ({CONFIG['school']})\n")
    
    # Setup output directory
    script_dir = Path(__file__).parent
    output_dir = script_dir.parent / 'src' / 'main' / 'resources' / 'data'
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"✅ Output directory: {output_dir}\n")
    
    output_file = output_dir / f'prayer-times-{year}.bin'
    meta_file = output_dir / f'prayer-times-{year}.meta.json'
    
    # Fetch all prayer times
    start_time = time.time()
    prayer_times = await fetch_all_prayer_times(year)
    
    if not prayer_times:
        print("❌ No prayer times fetched. Exiting.")
        return 1
    
    print(f"\n✅ Successfully fetched {len(prayer_times)} days")
    
    # Convert to binary
    print("\n💾 Converting to binary format...")
    binary_data = convert_to_binary(prayer_times)
    
    # Save binary file
    with open(output_file, 'wb') as f:
        f.write(binary_data)
    
    # Calculate statistics
    file_size_kb = len(binary_data) / 1024
    json_size_kb = len(json.dumps([{
        'date': pt['date'].isoformat(),
        'fajr': pt['fajr'],
        'sunrise': pt['sunrise'],
        'dhuhr': pt['dhuhr'],
        'asr': pt['asr'],
        'maghrib': pt['maghrib'],
        'isha': pt['isha']
    } for pt in prayer_times])) / 1024
    savings = ((json_size_kb - file_size_kb) / json_size_kb) * 100
    
    print(f"✅ Binary file saved: {output_file}")
    print(f"📊 File size: {file_size_kb:.2f} KB (vs {json_size_kb:.2f} KB JSON)")
    print(f"🎯 Space savings: {savings:.1f}%")
    
    # Save metadata
    metadata = {
        'year': year,
        'location': {
            'city': CONFIG['city'],
            'country': CONFIG['country'],
            'latitude': CONFIG['latitude'],
            'longitude': CONFIG['longitude']
        },
        'method': CONFIG['method'],
        'school': CONFIG['school'],
        'totalDays': len(prayer_times),
        'fetchedAt': datetime.now().isoformat(),
        'entrySize': 24,
        'fileSize': len(binary_data)
    }
    
    with open(meta_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"📋 Metadata saved: {meta_file}")
    
    elapsed = time.time() - start_time
    print(f"\n🎉 Done! Total time: {elapsed:.1f}s\n")
    
    return 0

if __name__ == '__main__':
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
