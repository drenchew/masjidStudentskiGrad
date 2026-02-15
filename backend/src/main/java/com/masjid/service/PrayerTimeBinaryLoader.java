package com.masjid.service;

import com.masjid.model.PrayerTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * Reads pre-fetched prayer times from binary file
 * Binary format per entry (24 bytes):
 * - Year: 2 bytes (uint16)
 * - Month: 1 byte (uint8)
 * - Day: 1 byte (uint8)
 * - Fajr: 2 bytes (minutes since midnight)
 * - Sunrise: 2 bytes
 * - Dhuhr: 2 bytes
 * - Asr: 2 bytes
 * - Maghrib: 2 bytes
 * - Isha: 2 bytes
 * - Hijri Day: 1 byte
 * - Hijri Month: 1 byte
 * - Hijri Year: 2 bytes
 * - Reserved: 6 bytes
 */
@Service
@Slf4j
public class PrayerTimeBinaryLoader {
    
    private static final int ENTRY_SIZE = 24;
    private static final String[] HIJRI_MONTHS = {
        "", "Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani",
        "Jumada al-awwal", "Jumada al-thani", "Rajab", "Sha'ban",
        "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
    };
    
    private final Map<LocalDate, PrayerTime> cache = new HashMap<>();
    private boolean loaded = false;
    
    /**
     * Load prayer times from binary file for specified year
     */
    public void loadPrayerTimes(int year) {
        if (loaded) {
            log.debug("Prayer times already loaded from binary file");
            return;
        }
        
        String resourcePath = String.format("data/prayer-times-%d.bin", year);
        
        try {
            ClassPathResource resource = new ClassPathResource(resourcePath);
            if (!resource.exists()) {
                log.warn("Binary prayer times file not found: {}", resourcePath);
                return;
            }
            
            try (InputStream is = resource.getInputStream()) {
                byte[] allBytes = is.readAllBytes();
                int entryCount = allBytes.length / ENTRY_SIZE;
                
                log.info("Loading {} prayer time entries from binary file: {}", entryCount, resourcePath);
                
                ByteBuffer buffer = ByteBuffer.wrap(allBytes).order(ByteOrder.LITTLE_ENDIAN);
                
                for (int i = 0; i < entryCount; i++) {
                    int offset = i * ENTRY_SIZE;
                    buffer.position(offset);
                    
                    // Read date
                    int yearValue = buffer.getShort() & 0xFFFF;
                    int month = buffer.get() & 0xFF;
                    int day = buffer.get() & 0xFF;
                    
                    // Read prayer times (in minutes since midnight)
                    int fajrMinutes = buffer.getShort() & 0xFFFF;
                    int sunriseMinutes = buffer.getShort() & 0xFFFF;
                    int dhuhrMinutes = buffer.getShort() & 0xFFFF;
                    int asrMinutes = buffer.getShort() & 0xFFFF;
                    int maghribMinutes = buffer.getShort() & 0xFFFF;
                    int ishaMinutes = buffer.getShort() & 0xFFFF;
                    
                    // Read Hijri date
                    int hijriDay = buffer.get() & 0xFF;
                    int hijriMonth = buffer.get() & 0xFF;
                    int hijriYear = buffer.getShort() & 0xFFFF;
                    
                    // Skip reserved bytes
                    buffer.position(offset + ENTRY_SIZE);
                    
                    // Create PrayerTime object
                    LocalDate date = LocalDate.of(yearValue, month, day);
                    PrayerTime prayerTime = new PrayerTime();
                    prayerTime.setDate(date);
                    prayerTime.setFajr(minutesToTime(fajrMinutes));
                    prayerTime.setSunrise(minutesToTime(sunriseMinutes));
                    prayerTime.setDhuhr(minutesToTime(dhuhrMinutes));
                    prayerTime.setAsr(minutesToTime(asrMinutes));
                    prayerTime.setMaghrib(minutesToTime(maghribMinutes));
                    prayerTime.setIsha(minutesToTime(ishaMinutes));
                    
                    // Set Hijri date
                    String hijriMonthName = hijriMonth > 0 && hijriMonth < HIJRI_MONTHS.length 
                        ? HIJRI_MONTHS[hijriMonth] 
                        : "Unknown";
                    prayerTime.setHijriDate(hijriDay + " " + hijriMonthName + " " + hijriYear);
                    
                    cache.put(date, prayerTime);
                }
                
                loaded = true;
                log.info("✅ Successfully loaded {} prayer times from binary file", cache.size());
                log.info("📅 Date range: {} to {}", 
                    cache.keySet().stream().min(LocalDate::compareTo).orElse(null),
                    cache.keySet().stream().max(LocalDate::compareTo).orElse(null)
                );
                
            }
        } catch (IOException e) {
            log.error("Failed to load prayer times from binary file: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Get prayer times for a specific date
     */
    public PrayerTime getPrayerTimeForDate(LocalDate date) {
        if (!loaded) {
            loadPrayerTimes(date.getYear());
        }
        return cache.get(date);
    }
    
    /**
     * Check if prayer times are loaded
     */
    public boolean isLoaded() {
        return loaded;
    }
    
    /**
     * Get total number of cached days
     */
    public int getCachedDaysCount() {
        return cache.size();
    }
    
    /**
     * Convert minutes since midnight to HH:MM format
     */
    private String minutesToTime(int totalMinutes) {
        int hours = totalMinutes / 60;
        int minutes = totalMinutes % 60;
        return String.format("%02d:%02d", hours, minutes);
    }
    
    /**
     * Clear cache (for testing or reloading)
     */
    public void clearCache() {
        cache.clear();
        loaded = false;
        log.info("Prayer times cache cleared");
    }
}
