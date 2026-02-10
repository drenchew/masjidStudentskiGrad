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
    
    @Column(nullable = false, length = 500)
    private String titleEn;
    
    @Column(length = 500)
    private String titleBg;
    
    @Column(length = 500)
    private String titleAr;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(nullable = false, length = 300)
    private String imam;
    
    @Column(length = 100)
    private String duration;
    
    @Column(nullable = false, length = 1000)
    private String videoUrl;
    
    @Column(length = 1000)
    private String thumbnail;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
