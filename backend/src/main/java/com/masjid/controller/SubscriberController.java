package com.masjid.controller;

import com.masjid.model.Subscriber;
import com.masjid.service.SubscriberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/subscribers")
@RequiredArgsConstructor
public class SubscriberController {
    
    private final SubscriberService subscriberService;
    
    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String languageStr = request.get("language");
        
        try {
            // Handle language code variations (e.g., "EN", "en", "en-US" → "EN")
            String normalizedLanguage = languageStr.toUpperCase().split("-")[0];
            Subscriber.Language language = Subscriber.Language.valueOf(normalizedLanguage);
            
            subscriberService.subscribe(email, language);
            return ResponseEntity.ok(Map.of("message", "Please check your email to verify subscription"));
        } catch (IllegalArgumentException e) {
            // Invalid language code
            return ResponseEntity.status(400).body(Map.of("message", "Invalid language code. Use: EN, BG, or AR"));
        } catch (RuntimeException e) {
            // Common path: email already subscribed
            return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to subscribe"));
        }
    }
    
    @GetMapping("/verify")
    public ResponseEntity<Map<String, String>> verifySubscription(@RequestParam String token) {
        try {
            subscriberService.verifySubscription(token);
            return ResponseEntity.ok(Map.of("message", "Subscription verified successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid or expired verification token. Please subscribe again."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to verify subscription"));
        }
    }
    
    @PostMapping("/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(@RequestBody Map<String, String> request) {
        subscriberService.unsubscribe(request.get("email"));
        return ResponseEntity.ok(Map.of("message", "Unsubscribed successfully"));
    }
}
