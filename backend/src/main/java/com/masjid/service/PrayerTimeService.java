package com.masjid.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.masjid.model.PrayerTime;
import com.masjid.repository.PrayerTimeRepository;
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
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;
    
    @Value("${app.prayer-times.api-url:https://api.aladhan.com/v1/timingsByCity}")
    private String apiUrl;
    
    @Value("${app.prayer-times.city:Sofia}")
    private String city;
    
    @Value("${app.prayer-times.country:Bulgaria}")
    private String country;
    
    @Value("${app.prayer-times.method:2}")
    private int method;
    
    @Value("${app.prayer-times.backup-api-url:}")
    private String backupApiUrl;
    
    // Fetch prayer times every day at 3 AM
    @Scheduled(cron = "0 0 3 * * *")
    public void fetchAndStorePrayerTimes() {
        log.info("Fetching prayer times from API...");
        try {
            LocalDate today = LocalDate.now();
            fetchPrayerTimesForDate(today);
            
            // Also fetch for next 7 days
            for (int i = 1; i <= 7; i++) {
                fetchPrayerTimesForDate(today.plusDays(i));
            }
            
            log.info("Prayer times fetched and stored successfully");
        } catch (Exception e) {
            log.error("Error fetching prayer times: {}", e.getMessage(), e);
        }
    }
    
    private void fetchPrayerTimesForDate(LocalDate date) {
        try {
            WebClient webClient = webClientBuilder.build();
            String response = null;

            // Try primary provider (Aladhan) - use date in URL path format DD-MM-YYYY
            try {
                String dateStr = String.format("%02d-%02d-%d", 
                    date.getDayOfMonth(), 
                    date.getMonthValue(), 
                    date.getYear());
                String url = String.format("%s/%s?city=%s&country=%s&method=%d",
                        apiUrl, dateStr, city, country, method);
                log.info("Fetching from primary API: {}", url);
                response = webClient.get().uri(url).retrieve().bodyToMono(String.class).block();
            } catch (Exception e) {
                log.warn("Primary prayer-times provider (Aladhan) failed: {}", e.getMessage());
            }

            // If primary failed or returned null, try backup provider (Muslim Salat)
            if (response == null || response.isEmpty()) {
                if (backupApiUrl != null && !backupApiUrl.isBlank()) {
                    try {
                        String url = String.format("%s/%s.json", backupApiUrl, city.toLowerCase());
                        log.info("Fetching from backup API: {}", url);
                        response = webClient.get().uri(url).retrieve().bodyToMono(String.class).block();
                    } catch (Exception e) {
                        log.warn("Backup prayer-times provider (Muslim Salat) failed: {}", e.getMessage());
                    }
                }
            }

            if (response != null && !response.isEmpty()) {
                JsonNode root = objectMapper.readTree(response);

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
                        log.info("Updated prayer times for {} from Aladhan API", date);
                    } else {
                        prayerTimeRepository.save(prayerTime);
                        log.info("Stored prayer times for {} from Aladhan API", date);
                    }
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
                    Optional<PrayerTime> existingRecord = prayerTimeRepository.findByDate(date);
                    if (existingRecord.isPresent()) {
                        PrayerTime record = existingRecord.get();
                        record.setFajr(prayerTime.getFajr());
                        record.setSunrise(prayerTime.getSunrise());
                        record.setDhuhr(prayerTime.getDhuhr());
                        record.setAsr(prayerTime.getAsr());
                        record.setMaghrib(prayerTime.getMaghrib());
                        record.setIsha(prayerTime.getIsha());
                        record.setHijriDate(prayerTime.getHijriDate());
                        prayerTimeRepository.save(record);
                        log.info("Updated prayer times for {} from Muslim Salat API", date);
                    } else {
                        prayerTimeRepository.save(prayerTime);
                        log.info("Stored prayer times for {} from Muslim Salat API", date);
                    }
                    return;
                }
            }
            
            log.error("Failed to parse prayer times from any provider for {}", date);
        } catch (Exception e) {
            log.error("Error fetching prayer times for {}: {}", date, e.getMessage(), e);
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
        Optional<PrayerTime> prayerTime = prayerTimeRepository.findByDate(today);
        
        // If not found, try to fetch immediately
        if (prayerTime.isEmpty()) {
            log.info("Prayer times not in database, fetching now...");
            try {
                fetchPrayerTimesForDate(today);
                prayerTime = prayerTimeRepository.findByDate(today);
            } catch (Exception e) {
                log.error("Failed to fetch prayer times: {}", e.getMessage());
                // Create fallback prayer times
                return createFallbackPrayerTimes(today);
            }
        }
        
        // If still empty after fetch attempt, use fallback
        return prayerTime.orElseGet(() -> createFallbackPrayerTimes(today));
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
        Optional<PrayerTime> prayerTime = prayerTimeRepository.findByDate(date);
        
        // If not found, try to fetch immediately
        if (prayerTime.isEmpty()) {
            log.info("Prayer times not in database for {}, fetching now...", date);
            try {
                fetchPrayerTimesForDate(date);
                prayerTime = prayerTimeRepository.findByDate(date);
            } catch (Exception e) {
                log.error("Failed to fetch prayer times for {}: {}", date, e.getMessage());
            }
        }
        
        return prayerTime.orElseThrow(() -> new RuntimeException("Prayer times not available for " + date));
    }
}
