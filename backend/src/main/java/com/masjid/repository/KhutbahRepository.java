package com.masjid.repository;

import com.masjid.model.Khutbah;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface KhutbahRepository extends JpaRepository<Khutbah, Long> {
    List<Khutbah> findByActiveTrueOrderByDeliveredDateDesc();
    List<Khutbah> findByFeaturedTrueAndActiveTrueOrderByDeliveredDateDesc();
    List<Khutbah> findByDeliveredDateBetweenAndActiveTrueOrderByDeliveredDateDesc(LocalDate start, LocalDate end);
}
