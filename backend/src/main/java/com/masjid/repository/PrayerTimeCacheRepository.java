package com.masjid.repository;

import com.masjid.model.PrayerTimeCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PrayerTimeCacheRepository extends JpaRepository<PrayerTimeCache, Long> {
    Optional<PrayerTimeCache> findByPrayerDate(LocalDate prayerDate);
    
    void deleteByPrayerDate(LocalDate prayerDate);
    
    long countByPrayerDateBetween(LocalDate startDate, LocalDate endDate);
}
