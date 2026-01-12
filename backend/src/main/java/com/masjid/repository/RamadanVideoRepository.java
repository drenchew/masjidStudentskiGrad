package com.masjid.repository;

import com.masjid.model.RamadanVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RamadanVideoRepository extends JpaRepository<RamadanVideo, Long> {
    List<RamadanVideo> findAllByOrderByDateDesc();
}
