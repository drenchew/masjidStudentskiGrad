package com.masjid.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String titleEn;
    
    @Column(nullable = false)
    private String titleBg;
    
    @Column(nullable = false)
    private String titleAr;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String contentEn;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String contentBg;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String contentAr;
    
    @Column(nullable = false)
    private Boolean sendEmail = false;
    
    @Column(nullable = false)
    private Boolean emailSent = false;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
