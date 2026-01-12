package com.masjid.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Donation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String donorEmail;
    
    private String donorName;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationType type;
    
    private String stripePaymentIntentId;
    
    private String stripeSubscriptionId;
    
    @Enumerated(EnumType.STRING)
    private SubscriptionInterval subscriptionInterval;
    
    private String message;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    // Campaign donation support
    @Column
    private Long campaignId;
    
    @Enumerated(EnumType.STRING)
    private DonationPurpose purpose = DonationPurpose.GENERAL;
    
    @Column
    private String currency = "EUR";
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    public enum DonationType {
        ONE_TIME, RECURRING
    }
    
    public enum SubscriptionInterval {
        MONTHLY, YEARLY
    }
    
    public enum DonationPurpose {
        GENERAL, ZAKAT, CAMPAIGN
    }
    
    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, REFUNDED
    }
}
