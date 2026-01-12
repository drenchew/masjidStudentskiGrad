package com.masjid.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fundraising_campaigns")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FundraisingCampaign {
    
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
    private String descriptionEn;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String descriptionBg;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String descriptionAr;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal goalAmount;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal currentAmount = BigDecimal.ZERO;
    
    @Column
    private String imageUrl;
    
    @Column
    private LocalDateTime startDate;
    
    @Column
    private LocalDateTime endDate;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @Column(nullable = false)
    private Boolean featured = false;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    // Calculated field
    @Transient
    public Double getProgressPercentage() {
        if (goalAmount == null || goalAmount.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return (currentAmount.doubleValue() / goalAmount.doubleValue()) * 100;
    }
    
    @Transient
    public Boolean isActive() {
        if (!active) return false;
        LocalDateTime now = LocalDateTime.now();
        if (startDate != null && now.isBefore(startDate)) return false;
        if (endDate != null && now.isAfter(endDate)) return false;
        return true;
    }
}
