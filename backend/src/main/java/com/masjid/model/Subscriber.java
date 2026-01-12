package com.masjid.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "subscribers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Subscriber {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Language preferredLanguage = Language.EN;
    
    @Column(nullable = false)
    private Boolean verified = false;
    
    private String verificationToken;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime subscribedAt;
    
    public enum Language {
        EN, BG, AR
    }
}
