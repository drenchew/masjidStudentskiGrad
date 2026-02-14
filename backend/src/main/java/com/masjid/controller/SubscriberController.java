package com.masjid.controller;

import com.masjid.model.Subscriber;
import com.masjid.service.SubscriberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/subscribers")
@RequiredArgsConstructor
@Slf4j
public class SubscriberController {
    
    private final SubscriberService subscriberService;
    
    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String languageStr = request.get("language");
        
        // Validate email
        if (email == null || email.isBlank() || email.length() > 255) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid email address"));
        }
        
        // Basic email format validation
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid email format"));
        }
        
        // Validate language
        if (languageStr == null || languageStr.isBlank()) {
            return ResponseEntity.status(400).body(Map.of("message", "Language is required"));
        }
        
        try {
            // Handle language code variations (e.g., "EN", "en", "en-US" → "EN")
            String normalizedLanguage = languageStr.toUpperCase().split("-")[0].trim();
            
            // Only accept known language codes
            if (!normalizedLanguage.matches("^(EN|BG|AR)$")) {
                return ResponseEntity.status(400).body(Map.of("message", "Invalid language code. Use: EN, BG, or AR"));
            }
            
            Subscriber.Language language = Subscriber.Language.valueOf(normalizedLanguage);
            
            subscriberService.subscribe(email.trim().toLowerCase(), language);
            return ResponseEntity.ok(Map.of("message", "Please check your email to verify subscription"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid language code. Use: EN, BG, or AR"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(Map.of("message", "Email already subscribed"));
        } catch (Exception e) {
            log.error("Subscription error", e);
            return ResponseEntity.status(500).body(Map.of("message", "Failed to subscribe"));
        }
    }
    
    @GetMapping("/verify")
    public ResponseEntity<Map<String, String>> verifySubscription(@RequestParam String token) {
        // Validate token format - should be a UUID
        if (token == null || token.isBlank() || token.length() > 100) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid verification token"));
        }
        
        // Only accept UUID-format tokens
        if (!token.matches("^[0-9a-fA-F-]{36}$")) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid verification token format"));
        }
        
        try {
            subscriberService.verifySubscription(token);
            return ResponseEntity.ok(Map.of("message", "Subscription verified successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid or expired verification token. Please subscribe again."));
        } catch (Exception e) {
            log.error("Verification error", e);
            return ResponseEntity.status(500).body(Map.of("message", "Failed to verify subscription"));
        }
    }
    
    @PostMapping("/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        if (email == null || email.isBlank() || email.length() > 255) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid email address"));
        }
        
        try {
            subscriberService.unsubscribe(email.trim().toLowerCase());
            return ResponseEntity.ok(Map.of("message", "Unsubscribed successfully"));
        } catch (RuntimeException e) {
            // Don't reveal whether email exists or not
            return ResponseEntity.ok(Map.of("message", "Unsubscribed successfully"));
        }
    }
}
