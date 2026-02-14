package com.masjid.controller.admin;

import com.masjid.model.Subscriber;
import com.masjid.service.EmailService;
import com.masjid.service.SubscriberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/subscribers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSubscriberController {
    
    private final SubscriberService subscriberService;
    private final EmailService emailService;
    
    @GetMapping
    public ResponseEntity<List<Subscriber>> getAllSubscribers() {
        return ResponseEntity.ok(subscriberService.getAllActiveSubscribers());
    }
    
    @PostMapping("/send-announcement")
    public ResponseEntity<Map<String, String>> sendAnnouncement(@RequestBody Map<String, String> request) {
        String subject = request.get("subject");
        String contentEn = request.get("contentEn");
        String contentBg = request.get("contentBg");
        String contentAr = request.get("contentAr");
        String language = request.get("language"); // "ALL", "EN", "BG", "AR"
        
        try {
            int totalSent = 0;
            
            if ("ALL".equals(language)) {
                // Send to all subscribers, each in their preferred language
                List<Subscriber> allSubscribers = subscriberService.getAllActiveSubscribers();
                
                for (Subscriber subscriber : allSubscribers) {
                    String content = switch (subscriber.getPreferredLanguage()) {
                        case BG -> contentBg != null && !contentBg.isEmpty() ? contentBg : contentEn;
                        case AR -> contentAr != null && !contentAr.isEmpty() ? contentAr : contentEn;
                        default -> contentEn;
                    };
                    
                    emailService.sendAnnouncementToSubscribers(
                        java.util.List.of(subscriber.getEmail()), 
                        subject, 
                        content
                    );
                    totalSent++;
                }
            } else {
                // Send to subscribers of a specific language
                List<Subscriber> subscribers = subscriberService.getSubscribersByLanguage(
                    Subscriber.Language.valueOf(language)
                );
                
                List<String> emails = subscribers.stream().map(Subscriber::getEmail).toList();
                
                String content = switch (language) {
                    case "BG" -> contentBg != null && !contentBg.isEmpty() ? contentBg : contentEn;
                    case "AR" -> contentAr != null && !contentAr.isEmpty() ? contentAr : contentEn;
                    default -> contentEn;
                };
                
                emailService.sendAnnouncementToSubscribers(emails, subject, content);
                totalSent = emails.size();
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Announcement sent successfully to " + totalSent + " subscribers"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "Failed to send announcement. Please try again later."
            ));
        }
    }
}
