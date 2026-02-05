package com.masjid.service;

import com.masjid.model.Subscriber;
import com.masjid.repository.SubscriberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriberService {
    
    private final SubscriberRepository subscriberRepository;
    private final EmailService emailService;

    @Value("${app.frontend-url:https://masjid-studentski-grad-pbnx.vercel.app}")
    private String frontendUrl;
    
    public Subscriber subscribe(String email, Subscriber.Language language) {
        if (subscriberRepository.existsByEmail(email)) {
            log.warn("Subscription attempt for already subscribed email: {}", email);
            throw new RuntimeException("Email already subscribed");
        }
        
        log.info("Creating new subscriber: {} with language: {}", email, language);
        
        Subscriber subscriber = new Subscriber();
        subscriber.setEmail(email);
        subscriber.setPreferredLanguage(language);
        subscriber.setVerificationToken(UUID.randomUUID().toString());
        subscriber.setVerified(false);
        subscriber.setActive(true);
        
        Subscriber saved = subscriberRepository.save(subscriber);
        
        log.debug("Subscriber created with token: {}", saved.getVerificationToken().substring(0, 10) + "...");
        
        // Send verification email
        String verificationLink = frontendUrl + "/verify-subscription?token=" + saved.getVerificationToken();
        try {
            emailService.sendSubscriptionConfirmation(saved, verificationLink);
            log.info("Verification email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", email, e);
            // Don't fail the subscription if email fails, but log the error
        }
        
        return saved;
    }
    
    public void verifySubscription(String token) {
        if (token == null || token.trim().isEmpty()) {
            log.warn("Subscription verification attempted with empty token");
            throw new RuntimeException("Invalid verification token");
        }
        
        log.debug("Attempting to verify subscription with token: {}", token.substring(0, Math.min(10, token.length())) + "...");
        
        Subscriber subscriber = subscriberRepository.findByVerificationToken(token)
                .orElseThrow(() -> {
                    log.warn("Subscription verification failed - token not found: {}", token.substring(0, Math.min(10, token.length())) + "...");
                    return new RuntimeException("Invalid verification token");
                });
        
        log.info("Verification token found for email: {}", subscriber.getEmail());
        
        subscriber.setVerified(true);
        subscriber.setVerificationToken(null);
        subscriberRepository.save(subscriber);
        
        log.info("Subscription verified successfully for email: {}", subscriber.getEmail());
    }
    
    public void unsubscribe(String email) {
        Subscriber subscriber = subscriberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));
        
        subscriber.setActive(false);
        subscriberRepository.save(subscriber);
    }
    
    public List<Subscriber> getAllActiveSubscribers() {
        return subscriberRepository.findByActiveTrueAndVerifiedTrue();
    }
    
    public List<Subscriber> getSubscribersByLanguage(Subscriber.Language language) {
        return subscriberRepository.findByPreferredLanguageAndActiveTrueAndVerifiedTrue(language);
    }
}
