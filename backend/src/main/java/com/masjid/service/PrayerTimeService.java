package com.masjid.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.masjid.model.PrayerTime;
import com.masjid.model.PrayerTimeCache;
import com.masjid.repository.PrayerTimeRepository;
import com.masjid.repository.PrayerTimeCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrayerTimeService {
    
    private final PrayerTimeRepository prayerTimeRepository;
    private final PrayerTimeCacheRepository prayerTimeCacheRepository;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;
    
    @Value("${app.prayer-times.api-url:https://islamicapi.com/api/v1/prayer-time}")
    private String apiUrl;
    
    @Value("${app.prayer-times.city:Sofia}")
    private String city;
    
    @Value("${app.prayer-times.country:Bulgaria}")
    private String country;
    
    @Value("${app.prayer-times.latitude:42.6977}")
    private String latitude;
    
    @Value("${app.prayer-times.longitude:23.3219}")
    private String longitude;
    
    @Value("${app.prayer-times.method:13}")
    private int method; // 13 = Turkey Diyanet
    
    @Value("${app.prayer-times.school:1}")
    private int school;
    
    @Value("${app.prayer-times.api-key:}")
    private String islamicApiKey;
    
    @Value("${app.prayer-times.backup-api-url:https://api.aladhan.com/v1/timings}")
    private String backupApiUrl;
    
    /**
     * Fetch and store prayer times for the entire year (365/366 days)
     * This runs once on application startup
     */
    @Scheduled(initialDelay = 5000, fixedDelay = Long.MAX_VALUE) // Run once after 5 seconds startup
    public void fetchAndStoreFullYear() {
        log.info("Starting full year prayer times fetch...");
        
        // Check if we already have data for today - if yes, skip to avoid re-fetching
        LocalDate today = LocalDate.now();
        if (prayerTimeCacheRepository.findByPrayerDate(today).isPresent()) {
            log.info("Prayer times cache already populated for today, skipping full year fetch");
            return;
        }
        
        try {
            LocalDate startDate = today;
            LocalDate endDate = today.plusYears(1);
            int daysTotal = (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
            int daysFetched = 0;
            int daysSkipped = 0;
            
            log.info("Fetching prayer times for {} days from {} to {}", daysTotal, startDate, endDate);
            
            for (LocalDate date = startDate; date.isBefore(endDate); date = date.plusDays(1)) {
                // Check if already cached to avoid re-fetching
                if (prayerTimeCacheRepository.findByPrayerDate(date).isPresent()) {
                    daysSkipped++;
                    continue;
                }
                
                try {
                    fetchPrayerTimesForDate(date);
                    daysFetched++;
                    
                    // Small delay between requests to avoid rate limiting (500ms = 2 req/sec)
                    if (daysFetched % 10 == 0) { // More aggressive delay every 10 requests
                        try {
                            Thread.sleep(1000); // 1 second delay every 10 requests
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            log.warn("Sleep interrupted while fetching prayer times");
                        }
                    } else {
                        try {
                            Thread.sleep(500); // 500ms delay between requests
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to fetch prayer times for {}: {}", date, e.getMessage());
                    // Continue to next date instead of stopping
                }
            }
            
            log.info("Full year prayer times fetch completed: {} fetched, {} already cached", daysFetched, daysSkipped);
        } catch (Exception e) {
            log.error("Error fetching full year prayer times: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Refetch prayer times for today and tomorrow (daily refresh of recent data)
     * Runs once daily at 3 AM to update with latest accurate times
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void refreshRecentPrayerTimes() {
        log.info("Refreshing prayer times for today and tomorrow...");
        try {
            LocalDate today = LocalDate.now();
            
            // Delete old cache entries for today and tomorrow to refetch fresh
            try {
                prayerTimeCacheRepository.deleteByPrayerDate(today);
                prayerTimeCacheRepository.deleteByPrayerDate(today.plusDays(1));
            } catch (Exception e) {
                log.debug("Could not delete old cache entries: {}", e.getMessage());
            }
            
            // Refetch today and tomorrow
            fetchPrayerTimesForDate(today);
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            fetchPrayerTimesForDate(today.plusDays(1));
            
            log.info("Prayer times refreshed for today and tomorrow");
        } catch (Exception e) {
            log.error("Error refreshing prayer times: {}", e.getMessage(), e);
        }
    }
    
    private void fetchPrayerTimesForDate(LocalDate date) {
        try {
            WebClient webClient = webClientBuilder.build();
            String response = null;
            boolean usedPrimaryApi = false;

            // Try primary provider (Islamic API) with latitude/longitude
            try {
                String url = apiUrl + "?lat=" + latitude + "&lon=" + longitude + 
                            "&method=" + method + "&school=" + school;
                if (islamicApiKey != null && !islamicApiKey.isBlank()) {
                    url += "&api_key=" + islamicApiKey;
                }
                log.info("Fetching from primary API (IslamicAPI): {}", url);
                response = webClient.get().uri(url).retrieve().bodyToMono(String.class).block();
                
                // Check if response is valid JSON
                if (response != null && !response.isEmpty()) {
                    if (response.trim().startsWith("{") || response.trim().startsWith("[")) {
                        usedPrimaryApi = true;
                    } else {
                        log.warn("Primary API returned non-JSON response (possibly HTML error page). First 200 chars: {}", 
                                response.length() > 200 ? response.substring(0, 200) : response);
                        response = null;
                    }
                }
            } catch (Exception e) {
                log.warn("Primary prayer-times provider (IslamicAPI) failed: {}", e.getMessage());
                response = null;
            }

            // If primary failed or returned null, try backup provider (Aladhan)
            if (response == null || response.isEmpty()) {
                try {
                    // Use Aladhan API with date format DD-MM-YYYY
                    String dateStr = String.format("%02d-%02d-%d", 
                        date.getDayOfMonth(), 
                        date.getMonthValue(), 
                        date.getYear());
                    String url = String.format("%s/%s?latitude=%s&longitude=%s&method=%d&school=%d",
                            backupApiUrl, dateStr, latitude, longitude, method, school);
                    log.info("Fetching from backup API (Aladhan): {}", url);
                    response = webClient.get().uri(url).retrieve().bodyToMono(String.class).block();
                    
                    // Validate backup API response is JSON
                    if (response != null && !response.isEmpty()) {
                        if (response.trim().startsWith("{") || response.trim().startsWith("[")) {
                            log.info("Backup API (Aladhan) returned valid JSON response");
                            usedPrimaryApi = false;
                        } else {
                            log.warn("Backup API (Aladhan) returned non-JSON response. First 200 chars: {}", 
                                    response.length() > 200 ? response.substring(0, 200) : response);
                            response = null;
                        }
                    } else {
                        log.warn("Backup API (Aladhan) returned empty response");
                        response = null;
                    }
                } catch (Exception e) {
                    log.error("Backup prayer-times provider (Aladhan) failed with exception: {}", e.getMessage(), e);
                    response = null;
                }
            }

            if (response == null || response.isEmpty()) {
                log.error("Failed to fetch prayer times from any provider for {}", date);
                return;
            }

            JsonNode root;
            try {
                root = objectMapper.readTree(response);
            } catch (Exception e) {
                log.error("Failed to parse JSON response for {}. Response preview: {}", 
                        date, response.length() > 300 ? response.substring(0, 300) + "..." : response);
                return;
            }

            // Islamic API response: { data: { times: {...}, prohibited_times: {...}, ... } }
                if (root.has("data") && root.get("data").has("times")) {
                    JsonNode data = root.get("data");
                    JsonNode times = data.get("times");
                    JsonNode prohibitedTimes = data.path("prohibited_times");
                    
                    PrayerTime prayerTime = new PrayerTime();
                    prayerTime.setDate(date);
                    prayerTime.setFajr(cleanTime(times.path("Fajr").asText("06:00")));
                    prayerTime.setSunrise(cleanTime(times.path("Sunrise").asText("07:30")));
                    prayerTime.setDhuhr(cleanTime(times.path("Dhuhr").asText("12:30")));
                    prayerTime.setAsr(cleanTime(times.path("Asr").asText("15:00")));
                    prayerTime.setMaghrib(cleanTime(times.path("Maghrib").asText("17:30")));
                    prayerTime.setIsha(cleanTime(times.path("Isha").asText("19:00")));
                    
                    // Set prohibited times from Islamic API
                    JsonNode sunriseProhibited = prohibitedTimes.path("sunrise");
                    if (!sunriseProhibited.isMissingNode()) {
                        prayerTime.setSunriseProhibitedStart(sunriseProhibited.path("start").asText());
                        prayerTime.setSunriseProhibitedEnd(sunriseProhibited.path("end").asText());
                    }
                    
                    JsonNode noonProhibited = prohibitedTimes.path("noon");
                    if (!noonProhibited.isMissingNode()) {
                        prayerTime.setNoonProhibitedStart(noonProhibited.path("start").asText());
                        prayerTime.setNoonProhibitedEnd(noonProhibited.path("end").asText());
                    }
                    
                    JsonNode sunsetProhibited = prohibitedTimes.path("sunset");
                    if (!sunsetProhibited.isMissingNode()) {
                        prayerTime.setSunsetProhibitedStart(sunsetProhibited.path("start").asText());
                        prayerTime.setSunsetProhibitedEnd(sunsetProhibited.path("end").asText());
                    }
                    
                    // Set hijri date from Islamic API
                    JsonNode hijriData = data.path("date").path("hijri");
                    if (!hijriData.isMissingNode() && hijriData.has("day")) {
                        String day = hijriData.path("day").asText();
                        String month = hijriData.path("month").path("en").asText("");
                        String year = hijriData.path("year").asText("");
                        prayerTime.setHijriDate(day + " " + month + " " + year);
                    }

                    // Check if record exists, update if it does, otherwise insert
                    savePrayerTime(prayerTime, date, "Islamic API");
                    return;
                }

                // Aladhan response: { data: { timings: { Fajr:..., ... }, date: { hijri: {...} } } }
                if (root.has("data") && root.get("data").has("timings")) {
                    JsonNode data = root.get("data");
                    JsonNode timings = data.get("timings");
                    JsonNode hijri = data.path("date").path("hijri");

                    PrayerTime prayerTime = new PrayerTime();
                    prayerTime.setDate(date);
                    prayerTime.setFajr(cleanTime(timings.get("Fajr").asText()));
                    prayerTime.setSunrise(cleanTime(timings.get("Sunrise").asText()));
                    prayerTime.setDhuhr(cleanTime(timings.get("Dhuhr").asText()));
                    prayerTime.setAsr(cleanTime(timings.get("Asr").asText()));
                    prayerTime.setMaghrib(cleanTime(timings.get("Maghrib").asText()));
                    prayerTime.setIsha(cleanTime(timings.get("Isha").asText()));
                    if (!hijri.isMissingNode() && hijri.has("day")) {
                        prayerTime.setHijriDate(hijri.get("day").asText() + " " +
                                hijri.path("month").path("en").asText("") + " " +
                                hijri.path("year").asText("") );
                    }

                    // Check if record exists, update if it does, otherwise insert
                    savePrayerTime(prayerTime, date, "Aladhan API");
                    return;
                }

                // Muslim Salat response structure: { items: [ { fajr: "6:15 am", dhuhr: "12:34 pm", ... } ] }
                if (root.has("items") && root.get("items").isArray() && root.get("items").size() > 0) {
                    JsonNode item = root.get("items").get(0);

                    PrayerTime prayerTime = new PrayerTime();
                    prayerTime.setDate(date);
                    prayerTime.setFajr(cleanTime(item.path("fajr").asText("06:00")));
                    prayerTime.setSunrise(cleanTime(item.path("shurooq").asText("07:30")));
                    prayerTime.setDhuhr(cleanTime(item.path("dhuhr").asText("12:30")));
                    prayerTime.setAsr(cleanTime(item.path("asr").asText("15:00")));
                    prayerTime.setMaghrib(cleanTime(item.path("maghrib").asText("17:30")));
                    prayerTime.setIsha(cleanTime(item.path("isha").asText("19:00")));
                    prayerTime.setHijriDate("");

                    // Check if record exists, update if it does, otherwise insert
                    savePrayerTime(prayerTime, date, "Muslim Salat API");
                    return;
                }
            
            log.error("Failed to parse prayer times from any provider for {}", date);
        } catch (Exception e) {
            log.error("Error fetching prayer times for {}: {}", date, e.getMessage(), e);
        }
    }
    
    /**
     * Helper method to save or update prayer times, handling duplicate key scenarios
     */
    private void savePrayerTime(PrayerTime prayerTime, LocalDate date, String source) {
        try {
            Optional<PrayerTime> existing = prayerTimeRepository.findByDate(date);
            if (existing.isPresent()) {
                PrayerTime record = existing.get();
                record.setFajr(prayerTime.getFajr());
                record.setSunrise(prayerTime.getSunrise());
                record.setDhuhr(prayerTime.getDhuhr());
                record.setAsr(prayerTime.getAsr());
                record.setMaghrib(prayerTime.getMaghrib());
                record.setIsha(prayerTime.getIsha());
                record.setHijriDate(prayerTime.getHijriDate());
                
                // Only update prohibited times if they are set (not null)
                if (prayerTime.getSunriseProhibitedStart() != null) {
                    record.setSunriseProhibitedStart(prayerTime.getSunriseProhibitedStart());
                }
                if (prayerTime.getSunriseProhibitedEnd() != null) {
                    record.setSunriseProhibitedEnd(prayerTime.getSunriseProhibitedEnd());
                }
                if (prayerTime.getNoonProhibitedStart() != null) {
                    record.setNoonProhibitedStart(prayerTime.getNoonProhibitedStart());
                }
                if (prayerTime.getNoonProhibitedEnd() != null) {
                    record.setNoonProhibitedEnd(prayerTime.getNoonProhibitedEnd());
                }
                if (prayerTime.getSunsetProhibitedStart() != null) {
                    record.setSunsetProhibitedStart(prayerTime.getSunsetProhibitedStart());
                }
                if (prayerTime.getSunsetProhibitedEnd() != null) {
                    record.setSunsetProhibitedEnd(prayerTime.getSunsetProhibitedEnd());
                }
                
                prayerTimeRepository.save(record);
                log.info("Updated prayer times for {} from {}", date, source);
            } else {
                prayerTimeRepository.save(prayerTime);
                log.info("Stored prayer times for {} from {}", date, source);
            }
        } catch (Exception e) {
            log.error("Failed to save prayer times for {} from {}: {}", date, source, e.getMessage());
            // If it's a duplicate key error, try to fetch and update again
            if (e.getMessage() != null && e.getMessage().contains("duplicate key")) {
                log.warn("Duplicate key detected, attempting to update existing record for {}", date);
                try {
                    Optional<PrayerTime> existing = prayerTimeRepository.findByDate(date);
                    if (existing.isPresent()) {
                        PrayerTime record = existing.get();
                        record.setFajr(prayerTime.getFajr());
                        record.setSunrise(prayerTime.getSunrise());
                        record.setDhuhr(prayerTime.getDhuhr());
                        record.setAsr(prayerTime.getAsr());
                        record.setMaghrib(prayerTime.getMaghrib());
                        record.setIsha(prayerTime.getIsha());
                        record.setHijriDate(prayerTime.getHijriDate());
                        prayerTimeRepository.save(record);
                        log.info("Successfully updated existing record for {}", date);
                    }
                } catch (Exception retryException) {
                    log.error("Failed to update existing record for {}: {}", date, retryException.getMessage());
                }
            }
        }
    }
    
    private String cleanTime(String time) {
        // Remove timezone info and extra characters
        time = time.split(" ")[0];
        
        // If time contains AM/PM, convert to 24-hour format
        String originalTime = time;
        if (time.toLowerCase().contains("am") || time.toLowerCase().contains("pm")) {
            try {
                // Parse 12-hour format like "6:15 am" or "5:22 pm"
                String[] parts = originalTime.toLowerCase().split(" ");
                if (parts.length >= 2) {
                    String timePart = parts[0];
                    String ampm = parts[1];
                    
                    String[] hourMin = timePart.split(":");
                    int hour = Integer.parseInt(hourMin[0]);
                    int minute = Integer.parseInt(hourMin[1]);
                    
                    // Convert to 24-hour format
                    if (ampm.equals("pm") && hour != 12) {
                        hour += 12;
                    } else if (ampm.equals("am") && hour == 12) {
                        hour = 0;
                    }
                    
                    time = String.format("%02d:%02d", hour, minute);
                }
            } catch (Exception e) {
                log.warn("Failed to convert time format: {}", originalTime);
            }
        }
        
        return time;
    }
    
    public PrayerTime getTodayPrayerTimes() {
        LocalDate today = LocalDate.now();
        
        // Load from cache (should always be present since we preload the entire year)
        Optional<PrayerTimeCache> cached = prayerTimeCacheRepository.findByPrayerDate(today);
        if (cached.isPresent()) {
            return convertCacheToPrayerTime(cached.get());
        }
        
        log.warn("Prayer times not found in cache for {}, using fallback", today);
        return createFallbackPrayerTimes(today);
    }
    
    /**
     * Convert cached prayer times to PrayerTime object
     */
    private PrayerTime convertCacheToPrayerTime(PrayerTimeCache cache) {
        PrayerTime pt = new PrayerTime();
        pt.setDate(cache.getPrayerDate());
        pt.setFajr(cache.getFajr());
        pt.setSunrise(cache.getSunrise());
        pt.setDhuhr(cache.getDhuhr());
        pt.setAsr(cache.getAsr());
        pt.setMaghrib(cache.getMaghrib());
        pt.setIsha(cache.getIsha());
        pt.setHijriDate(cache.getHijriDate() != null ? cache.getHijriDate() : "");
        return pt;
    }
    
    /**
     * Cache prayer times for faster future access
     */
    private void cachePrayerTime(LocalDate date, PrayerTime prayerTime) {
        try {
            PrayerTimeCache cache = PrayerTimeCache.builder()
                .prayerDate(date)
                .fajr(prayerTime.getFajr())
                .sunrise(prayerTime.getSunrise())
                .dhuhr(prayerTime.getDhuhr())
                .asr(prayerTime.getAsr())
                .maghrib(prayerTime.getMaghrib())
                .isha(prayerTime.getIsha())
                .hijriDate(prayerTime.getHijriDate())
                .source("database")
                .build();
            prayerTimeCacheRepository.save(cache);
            log.debug("Cached prayer times for {}", date);
        } catch (Exception e) {
            log.warn("Failed to cache prayer times for {}: {}", date, e.getMessage());
        }
    }
    
    private PrayerTime createFallbackPrayerTimes(LocalDate date) {
        log.warn("Using fallback prayer times for {}", date);
        PrayerTime fallback = new PrayerTime();
        fallback.setDate(date);
        fallback.setFajr("06:00");
        fallback.setSunrise("07:30");
        fallback.setDhuhr("12:30");
        fallback.setAsr("15:00");
        fallback.setMaghrib("17:30");
        fallback.setIsha("19:00");
        fallback.setHijriDate("15 Rajab 1447");
        return fallback;
    }
    
    public PrayerTime getPrayerTimesByDate(LocalDate date) {
        // Load from cache (should always be present since we preload the entire year)
        Optional<PrayerTimeCache> cached = prayerTimeCacheRepository.findByPrayerDate(date);
        if (cached.isPresent()) {
            return convertCacheToPrayerTime(cached.get());
        }
        
        // Fallback to legacy PrayerTime table if cache is missing
        Optional<PrayerTime> prayerTime = prayerTimeRepository.findByDate(date);
        if (prayerTime.isPresent()) {
            return prayerTime.get();
        }
        
        log.warn("Prayer times not available for {}", date);
        return createFallbackPrayerTimes(date);
    }
}
