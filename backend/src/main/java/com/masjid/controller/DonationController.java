package com.masjid.controller;

import com.masjid.dto.DonationRequest;
import com.masjid.model.Donation;
import com.masjid.service.DonationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
@Slf4j
public class DonationController {
    
    private final DonationService donationService;
    
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createOneTimeDonation(@Valid @RequestBody DonationRequest request) {
        try {
            BigDecimal amount = BigDecimal.valueOf(request.getAmount());
            
            // Additional server-side validation
            if (amount.compareTo(BigDecimal.valueOf(0.50)) < 0 || amount.compareTo(BigDecimal.valueOf(999999.99)) > 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid donation amount"));
            }
            
            String email = sanitize(request.getEmail());
            String name = sanitize(request.getName());
            String message = sanitize(request.getMessage());
            
            Map<String, String> response = donationService.createOneTimeDonation(email, name, amount, message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating one-time donation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process donation. Please try again."));
        }
    }
    
    @PostMapping("/recurring")
    public ResponseEntity<Map<String, String>> createRecurringDonation(@Valid @RequestBody DonationRequest request) {
        try {
            BigDecimal amount = BigDecimal.valueOf(request.getAmount());
            
            if (amount.compareTo(BigDecimal.valueOf(0.50)) < 0 || amount.compareTo(BigDecimal.valueOf(999999.99)) > 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid donation amount"));
            }
            
            String intervalStr = request.getInterval();
            if (intervalStr == null || intervalStr.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Subscription interval is required"));
            }
            
            Donation.SubscriptionInterval interval;
            try {
                interval = Donation.SubscriptionInterval.valueOf(intervalStr.toUpperCase().trim());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid interval. Use MONTHLY or YEARLY."));
            }
            
            String email = sanitize(request.getEmail());
            String name = sanitize(request.getName());
            
            Map<String, String> response = donationService.createRecurringDonation(email, name, amount, interval);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating recurring donation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process donation. Please try again."));
        }
    }
    
    @PostMapping("/campaign/{campaignId}")
    public ResponseEntity<Map<String, String>> donateToCampaign(
            @PathVariable Long campaignId,
            @Valid @RequestBody DonationRequest request) {
        try {
            BigDecimal amount = BigDecimal.valueOf(request.getAmount());
            
            if (amount.compareTo(BigDecimal.valueOf(0.50)) < 0 || amount.compareTo(BigDecimal.valueOf(999999.99)) > 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid donation amount"));
            }
            
            String email = sanitize(request.getEmail());
            String name = sanitize(request.getName());
            String message = sanitize(request.getMessage());
            String currency = request.getCurrency() != null ? request.getCurrency().toUpperCase().trim() : "EUR";
            
            // Validate currency code (ISO 4217 - 3 letters)
            if (!currency.matches("^[A-Z]{3}$")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid currency code"));
            }
            
            Map<String, String> response = donationService.createCampaignDonation(
                campaignId, email, name, amount, message, currency
            );
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating campaign donation for campaign {}", campaignId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process donation. Please try again."));
        }
    }
    
    @PostMapping("/webhook/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        if (sigHeader == null || sigHeader.isBlank()) {
            log.warn("Stripe webhook received without signature header");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing signature");
        }
        try {
            donationService.handleStripeWebhook(payload, sigHeader);
            return ResponseEntity.ok("Webhook handled");
        } catch (Exception e) {
            log.error("Webhook processing error", e);
            return ResponseEntity.badRequest().body("Webhook error");
        }
    }
    
    /**
     * Basic input sanitization - strips HTML/script tags
     */
    private String sanitize(String input) {
        if (input == null) return "";
        return input.trim()
                .replaceAll("<[^>]*>", "")  // Remove HTML tags
                .replaceAll("[<>\"';]", "") // Remove dangerous characters
                .substring(0, Math.min(input.trim().length(), 5000));
    }
}
