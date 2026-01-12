package com.masjid.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ramadan_videos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RamadanVideo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String titleEn;
    
    private String titleBg;
    
    private String titleAr;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(nullable = false)
    private String imam;
    
    private String duration;
    
    @Column(nullable = false)
    private String videoUrl;
    
    private String thumbnail;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
