package com.masjid.repository;

import com.masjid.model.PrayerTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrayerTimeRepository extends JpaRepository<PrayerTime, Long> {
    Optional<PrayerTime> findByDate(LocalDate date);
    List<PrayerTime> findByDateBetweenOrderByDate(LocalDate startDate, LocalDate endDate);
}
