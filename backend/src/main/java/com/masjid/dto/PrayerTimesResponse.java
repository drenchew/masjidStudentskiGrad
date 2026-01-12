package com.masjid.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrayerTimesResponse {
    private String fajr;
    private String sunrise;
    private String dhuhr;
    private String asr;
    private String maghrib;
    private String isha;
    private String hijriDate;
    private String gregorianDate;
}
