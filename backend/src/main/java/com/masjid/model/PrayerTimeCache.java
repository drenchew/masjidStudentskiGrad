package com.masjid.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * Cache prayer times by date to avoid repeated API calls
 */
@Entity
@Table(name = "prayer_time_cache", indexes = {
    @Index(name = "idx_prayer_date", columnList = "prayer_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrayerTimeCache {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private LocalDate prayerDate;
    
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
    
    @Column
    private String hijriDate;
    
    @Column
    private String source; // "islamicapi" or "aladhan"
    
    @Column(nullable = false, updatable = false)
    private java.time.LocalDateTime cachedAt;
    
    @PrePersist
    protected void onCreate() {
        cachedAt = java.time.LocalDateTime.now();
    }
}
