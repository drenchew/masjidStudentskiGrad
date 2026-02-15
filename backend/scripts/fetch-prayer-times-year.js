#!/usr/bin/env node

/**
 * Fetch Prayer Times for Entire Year
 * 
 * This script fetches prayer times for the entire year from Aladhan API
 * using the Turkish Diyanet method and stores them in a compact binary file.
 * 
 * Usage: node fetch-prayer-times-year.js [year]
 * Example: node fetch-prayer-times-year.js 2026
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  latitude: '42.6977',    // Sofia, Bulgaria
  longitude: '23.3219',
  method: 13,              // 13 = Turkey Diyanet
  school: 1,               // Hanafi
  city: 'Sofia',
  country: 'Bulgaria'
};

// Get year from command line argument or use current year
const year = process.argv[2] || new Date().getFullYear();
const outputDir = path.join(__dirname, '..', 'src', 'main', 'resources', 'data');
const outputFile = path.join(outputDir, `prayer-times-${year}.bin`);

console.log(`\n📅 Fetching prayer times for year ${year}...`);
console.log(`📍 Location: ${CONFIG.city}, ${CONFIG.country}`);
console.log(`🕌 Method: Turkey Diyanet (${CONFIG.method})`);
console.log(`📖 School: Hanafi (${CONFIG.school})\n`);

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`✅ Created directory: ${outputDir}\n`);
}

/**
 * Fetch prayer times for a specific date
 */
function fetchPrayerTimesForDate(date) {
  return new Promise((resolve, reject) => {
    const dateStr = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${CONFIG.latitude}&longitude=${CONFIG.longitude}&method=${CONFIG.method}&school=${CONFIG.school}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.code === 200 && json.data && json.data.timings) {
            const timings = json.data.timings;
            const hijri = json.data.date.hijri;
            
            resolve({
              date: dateStr,
              fajr: timings.Fajr.split(' ')[0],
              sunrise: timings.Sunrise.split(' ')[0],
              dhuhr: timings.Dhuhr.split(' ')[0],
              asr: timings.Asr.split(' ')[0],
              maghrib: timings.Maghrib.split(' ')[0],
              isha: timings.Isha.split(' ')[0],
              hijriDate: `${hijri.day} ${hijri.month.en} ${hijri.year}`
            });
          } else {
            reject(new Error(`Invalid response for ${dateStr}`));
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get all dates for a year
 */
function getDatesForYear(year) {
  const dates = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  
  return dates;
}

/**
 * Convert prayer times array to binary buffer
 * Format per entry (24 bytes):
 * - Year: 2 bytes (uint16)
 * - Month: 1 byte (uint8)
 * - Day: 1 byte (uint8)
 * - Fajr: 2 bytes (minutes since midnight, uint16)
 * - Sunrise: 2 bytes
 * - Dhuhr: 2 bytes
 * - Asr: 2 bytes
 * - Maghrib: 2 bytes
 * - Isha: 2 bytes
 * - Hijri Day: 1 byte
 * - Hijri Month: 1 byte
 * - Hijri Year: 2 bytes (uint16)
 * - Reserved: 6 bytes (for future use)
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function convertToBinary(prayerTimesArray) {
  const entrySize = 24; // bytes per entry
  const buffer = Buffer.alloc(entrySize * prayerTimesArray.length);
  
  prayerTimesArray.forEach((entry, index) => {
    const offset = index * entrySize;
    const [day, month, year] = entry.date.split('-').map(Number);
    
    // Parse Hijri date
    const hijriParts = entry.hijriDate.split(' ');
    const hijriDay = parseInt(hijriParts[0]) || 1;
    const hijriYear = parseInt(hijriParts[2]) || 1447;
    const hijriMonthMap = {
      'Muharram': 1, 
      'Safar': 2, 
      'Rabī': 3, 'Rabīʿ': 3, 'Rabi': 3,                    // Rabi' al-awwal
      'Jumādá': 5, 'Jumada': 5, 'Jumādā': 5,               // Jumada al-awwal (month 5!)
      'Rajab': 7, 
      'Shaʿbān': 8, "Sha'ban": 8, 'Shaban': 8,
      'Ramaḍān': 9, 'Ramadan': 9, 'Ramadhan': 9,
      'Shawwāl': 10, 'Shawwal': 10,
      'Dhū': 11, 'Dhu': 11, 'Dhul': 11,                     // Dhu al-Qi'dah
      'Hijjah': 12, 'Ḥijjah': 12                            // Dhu al-Hijjah
    };
    let hijriMonth = 1;
    for (const [key, value] of Object.entries(hijriMonthMap)) {
      if (hijriParts[1] && hijriParts[1].includes(key)) {
        hijriMonth = value;
        break;
      }
    }
    
    buffer.writeUInt16LE(year, offset);
    buffer.writeUInt8(month, offset + 2);
    buffer.writeUInt8(day, offset + 3);
    buffer.writeUInt16LE(timeToMinutes(entry.fajr), offset + 4);
    buffer.writeUInt16LE(timeToMinutes(entry.sunrise), offset + 6);
    buffer.writeUInt16LE(timeToMinutes(entry.dhuhr), offset + 8);
    buffer.writeUInt16LE(timeToMinutes(entry.asr), offset + 10);
    buffer.writeUInt16LE(timeToMinutes(entry.maghrib), offset + 12);
    buffer.writeUInt16LE(timeToMinutes(entry.isha), offset + 14);
    buffer.writeUInt8(hijriDay, offset + 16);
    buffer.writeUInt8(hijriMonth, offset + 17);
    buffer.writeUInt16LE(hijriYear, offset + 18);
    // offset + 20 to 25: reserved (6 bytes)
  });
  
  return buffer;
}

/**
 * Main execution
 */
async function main() {
  const dates = getDatesForYear(year);
  const prayerTimes = [];
  let fetchedCount = 0;
  let failedCount = 0;
  
  console.log(`📥 Fetching ${dates.length} days of prayer times...\n`);
  
  const startTime = Date.now();
  
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    
    try {
      const times = await fetchPrayerTimesForDate(date);
      prayerTimes.push(times);
      fetchedCount++;
      
      // Progress indicator
      if ((i + 1) % 30 === 0 || (i + 1) === dates.length) {
        const progress = ((i + 1) / dates.length * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        process.stdout.write(`\r✅ Progress: ${i + 1}/${dates.length} (${progress}%) - Elapsed: ${elapsed}s`);
      }
      
      // Rate limiting: 1 request per 500ms (2 req/sec)
      if (i < dates.length - 1) {
        await sleep(500);
      }
    } catch (err) {
      failedCount++;
      console.error(`\n❌ Failed to fetch ${date.toISOString().split('T')[0]}: ${err.message}`);
      
      // Retry once with longer delay
      try {
        await sleep(2000);
        const times = await fetchPrayerTimesForDate(date);
        prayerTimes.push(times);
        fetchedCount++;
        failedCount--; // Subtract the failed count since we succeeded on retry
      } catch (retryErr) {
        console.error(`❌ Retry failed: ${retryErr.message}`);
      }
    }
  }
  
  console.log('\n');
  
  if (prayerTimes.length === 0) {
    console.error('❌ No prayer times fetched. Exiting.');
    process.exit(1);
  }
  
  console.log(`\n✅ Successfully fetched ${fetchedCount} days`);
  if (failedCount > 0) {
    console.log(`⚠️  Failed to fetch ${failedCount} days`);
  }
  
  // Convert to binary and save
  console.log(`\n💾 Converting to binary format...`);
  const binaryData = convertToBinary(prayerTimes);
  
  fs.writeFileSync(outputFile, binaryData);
  
  const fileSizeKB = (binaryData.length / 1024).toFixed(2);
  const jsonSize = (JSON.stringify(prayerTimes).length / 1024).toFixed(2);
  const savings = (((jsonSize - fileSizeKB) / jsonSize) * 100).toFixed(1);
  
  console.log(`✅ Binary file saved: ${outputFile}`);
  console.log(`📊 File size: ${fileSizeKB} KB (vs ${jsonSize} KB JSON)`);
  console.log(`🎯 Space savings: ${savings}%`);
  
  // Create a metadata file
  const metadataFile = path.join(outputDir, `prayer-times-${year}.meta.json`);
  const metadata = {
    year: parseInt(year),
    location: {
      city: CONFIG.city,
      country: CONFIG.country,
      latitude: CONFIG.latitude,
      longitude: CONFIG.longitude
    },
    method: CONFIG.method,
    school: CONFIG.school,
    totalDays: prayerTimes.length,
    fetchedAt: new Date().toISOString(),
    entrySize: 24,
    fileSize: binaryData.length
  };
  
  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
  console.log(`📋 Metadata saved: ${metadataFile}`);
  
  console.log(`\n🎉 Done! Total time: ${((Date.now() - startTime) / 1000).toFixed(1)}s\n`);
}

main().catch(err => {
  console.error(`\n❌ Fatal error: ${err.message}`);
  process.exit(1);
});
