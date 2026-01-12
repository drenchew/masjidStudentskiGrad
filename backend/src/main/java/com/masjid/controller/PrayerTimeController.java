package com.masjid.controller;

import com.masjid.dto.PrayerTimesResponse;
import com.masjid.model.PrayerTime;
import com.masjid.service.PrayerTimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/prayer-times")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PrayerTimeController {
    
    private final PrayerTimeService prayerTimeService;
    
    @GetMapping("/today")
    public ResponseEntity<PrayerTime> getTodayPrayerTimes() {
        return ResponseEntity.ok(prayerTimeService.getTodayPrayerTimes());
    }
    
    @GetMapping("/date/{date}")
    public ResponseEntity<PrayerTime> getPrayerTimesByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(prayerTimeService.getPrayerTimesByDate(date));
    }
}
