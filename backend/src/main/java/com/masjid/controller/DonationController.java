package com.masjid.controller;

import com.masjid.model.Donation;
import com.masjid.service.DonationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {
    
    private final DonationService donationService;
    
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createOneTimeDonation(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String name = request.get("name");
            BigDecimal amount = new BigDecimal(request.get("amount"));
            String message = request.get("message");
            
            Map<String, String> response = donationService.createOneTimeDonation(email, name, amount, message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/recurring")
    public ResponseEntity<Map<String, String>> createRecurringDonation(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String name = request.get("name");
            BigDecimal amount = new BigDecimal(request.get("amount"));
            Donation.SubscriptionInterval interval = Donation.SubscriptionInterval.valueOf(request.get("interval").toUpperCase());
            
            Map<String, String> response = donationService.createRecurringDonation(email, name, amount, interval);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/campaign/{campaignId}")
    public ResponseEntity<Map<String, String>> donateToCampaign(
            @PathVariable Long campaignId,
            @RequestBody Map<String, Object> request) {
        try {
            String email = (String) request.get("email");
            String name = (String) request.get("name");
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String message = (String) request.get("message");
            String currency = request.getOrDefault("currency", "EUR").toString();
            
            Map<String, String> response = donationService.createCampaignDonation(
                campaignId, email, name, amount, message, currency
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/webhook/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            donationService.handleStripeWebhook(payload, sigHeader);
            return ResponseEntity.ok("Webhook handled");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }
}
