package com.masjid.service;

import com.masjid.model.Subscriber;
import com.masjid.repository.SubscriberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriberService {
    
    private final SubscriberRepository subscriberRepository;
    private final EmailService emailService;

    @Value("${app.frontend-url:https://masjid-studentski-grad-pbnx.vercel.app}")
    private String frontendUrl;
    
    public Subscriber subscribe(String email, Subscriber.Language language) {
        if (subscriberRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already subscribed");
        }
        
        Subscriber subscriber = new Subscriber();
        subscriber.setEmail(email);
        subscriber.setPreferredLanguage(language);
        subscriber.setVerificationToken(UUID.randomUUID().toString());
        subscriber.setVerified(false);
        subscriber.setActive(true);
        
        Subscriber saved = subscriberRepository.save(subscriber);
        
    // Send verification email
    String verificationLink = frontendUrl + "/verify-subscription?token=" + saved.getVerificationToken();
        emailService.sendSubscriptionConfirmation(saved, verificationLink);
        
        return saved;
    }
    
    public void verifySubscription(String token) {
        Subscriber subscriber = subscriberRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        
        subscriber.setVerified(true);
        subscriber.setVerificationToken(null);
        subscriberRepository.save(subscriber);
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
