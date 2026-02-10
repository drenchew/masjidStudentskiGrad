package com.masjid.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "khutbahs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Khutbah {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 500)
    private String titleEn;
    
    @Column(nullable = false, length = 500)
    private String titleBg;
    
    @Column(nullable = false, length = 500)
    private String titleAr;
    
    @Column(columnDefinition = "TEXT")
    private String descriptionEn;
    
    @Column(columnDefinition = "TEXT")
    private String descriptionBg;
    
    @Column(columnDefinition = "TEXT")
    private String descriptionAr;
    
    @Column(nullable = false)
    private LocalDate deliveredDate;
    
    @Column(length = 300)
    private String speaker;
    
    @Column(length = 500)
    private String topicEn;
    
    @Column(length = 500)
    private String topicBg;
    
    private String topicAr;
    
    private String audioUrl;
    
    private String videoUrl;
    
    private String transcriptPdfUrlEn;
    
    private String transcriptPdfUrlBg;
    
    private String transcriptPdfUrlAr;
    
    @Column(nullable = false)
    private Boolean featured = false;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
