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
        Subscriber.Language language = Subscriber.Language.valueOf(request.get("language").toUpperCase());
        try {
            subscriberService.subscribe(email, language);
            return ResponseEntity.ok(Map.of("message", "Please check your email to verify subscription"));
        } catch (RuntimeException e) {
            // Common path: email already subscribed
            return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to subscribe"));
        }
    }
    
    @GetMapping("/verify")
    public ResponseEntity<Map<String, String>> verifySubscription(@RequestParam String token) {
        subscriberService.verifySubscription(token);
        return ResponseEntity.ok(Map.of("message", "Subscription verified successfully"));
    }
    
    @PostMapping("/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(@RequestBody Map<String, String> request) {
        subscriberService.unsubscribe(request.get("email"));
        return ResponseEntity.ok(Map.of("message", "Unsubscribed successfully"));
    }
}
