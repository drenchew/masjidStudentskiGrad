package com.masjid.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "prayer_times")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrayerTime {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private LocalDate date;
    
    @Column(nullable = false)
    private String fajr;
    
    @Column(nullable = false)
    private String sunrise;
    
    @Column(nullable = false)
    private String dhuhr;
    
    @Column(nullable = false)
    private String asr;
    
    @Column(nullable = false)
    private String maghrib;
    
    @Column(nullable = false)
    private String isha;
    
    private String hijriDate;
    
    // Prohibited times (when salah is not allowed)
    @Column(name = "sunrise_prohibited_start")
    private String sunriseProhibitedStart;
    
    @Column(name = "sunrise_prohibited_end")
    private String sunriseProhibitedEnd;
    
    @Column(name = "noon_prohibited_start")
    private String noonProhibitedStart;
    
    @Column(name = "noon_prohibited_end")
    private String noonProhibitedEnd;
    
    @Column(name = "sunset_prohibited_start")
    private String sunsetProhibitedStart;
    
    @Column(name = "sunset_prohibited_end")
    private String sunsetProhibitedEnd;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    /**
     * Check if current time is in a prohibited period
     * @return "sunrise" if in sunrise prohibited time, "noon" if in noon, "sunset" if in sunset, null otherwise
     */
    @Transient
    public String getProhibitedTimeType() {
        LocalTime now = LocalTime.now();
        
        // Check sunrise prohibited time
        if (sunriseProhibitedStart != null && sunriseProhibitedEnd != null) {
            LocalTime start = LocalTime.parse(sunriseProhibitedStart);
            LocalTime end = LocalTime.parse(sunriseProhibitedEnd);
            if (isTimeBetween(now, start, end)) {
                return "sunrise";
            }
        }
        
        // Check noon prohibited time
        if (noonProhibitedStart != null && noonProhibitedEnd != null) {
            LocalTime start = LocalTime.parse(noonProhibitedStart);
            LocalTime end = LocalTime.parse(noonProhibitedEnd);
            if (isTimeBetween(now, start, end)) {
                return "noon";
            }
        }
        
        // Check sunset prohibited time
        if (sunsetProhibitedStart != null && sunsetProhibitedEnd != null) {
            LocalTime start = LocalTime.parse(sunsetProhibitedStart);
            LocalTime end = LocalTime.parse(sunsetProhibitedEnd);
            if (isTimeBetween(now, start, end)) {
                return "sunset";
            }
        }
        
        return null;
    }
    
    private static boolean isTimeBetween(LocalTime time, LocalTime start, LocalTime end) {
        return !time.isBefore(start) && !time.isAfter(end);
    }
}
