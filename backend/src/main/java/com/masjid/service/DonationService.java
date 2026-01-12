package com.masjid.service;

import com.google.gson.Gson;
import com.masjid.model.Donation;
import com.masjid.model.FundraisingCampaign;
import com.masjid.repository.DonationRepository;
import com.masjid.repository.FundraisingCampaignRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.net.Webhook;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DonationService {
    
    private final DonationRepository donationRepository;
    private final FundraisingCampaignRepository campaignRepository;
    private final EmailService emailService;
    
    @Value("${app.stripe.api-key}")
    private String stripeApiKey;
    
    @Value("${app.stripe.webhook-secret:}")
    private String webhookSecret;
    
    @Value("${app.frontend-url}")
    private String frontendUrl;
    
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }
    
    public Map<String, String> createOneTimeDonation(String email, String name, BigDecimal amount, String message) throws StripeException {
        // Create Stripe Payment Intent
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount.multiply(new BigDecimal(100)).longValue()) // Convert to cents
                .setCurrency("eur")
                .putMetadata("donorEmail", email)
                .putMetadata("donorName", name != null ? name : "")
                .putMetadata("type", "one_time")
                .putMetadata("purpose", "GENERAL")
                .build();
        
        PaymentIntent paymentIntent = PaymentIntent.create(params);
        
        // Save donation record
        Donation donation = new Donation();
        donation.setDonorEmail(email);
        donation.setDonorName(name);
        donation.setAmount(amount);
        donation.setType(Donation.DonationType.ONE_TIME);
        donation.setStripePaymentIntentId(paymentIntent.getId());
        donation.setMessage(message);
        donation.setActive(true);
        donation.setPurpose(Donation.DonationPurpose.GENERAL);
        donation.setPaymentStatus(Donation.PaymentStatus.PENDING);
        donation.setCurrency("EUR");
        
        donationRepository.save(donation);
        
        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", paymentIntent.getClientSecret());
        response.put("paymentIntentId", paymentIntent.getId());
        
        return response;
    }
    
    @Transactional
    public Map<String, String> createCampaignDonation(Long campaignId, String email, String name, 
                                                      BigDecimal amount, String message, String currency) throws StripeException {
        log.info("Creating campaign donation - Campaign ID: {}, Amount: {}, Currency: {}", campaignId, amount, currency);
        
        // Verify campaign exists
        FundraisingCampaign campaign = campaignRepository.findById(campaignId)
            .orElseThrow(() -> new RuntimeException("Campaign not found with id: " + campaignId));
        
        log.info("Campaign found: {} (Active: {})", campaign.getTitleEn(), campaign.isActive());
        
        // Check if campaign is active
        if (!campaign.isActive()) {
            throw new RuntimeException("Campaign is not active");
        }
        
        // Check Stripe API key
        if (stripeApiKey == null || stripeApiKey.isEmpty()) {
            log.error("Stripe API key is not configured!");
            throw new RuntimeException("Stripe is not configured. Please set STRIPE_API_KEY in backend/.env");
        }
        
        log.info("Creating Stripe Payment Intent for amount: {} cents", amount.multiply(new BigDecimal(100)).longValue());
        
        try {
            // Create Stripe Payment Intent
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amount.multiply(new BigDecimal(100)).longValue()) // Convert to cents
                    .setCurrency(currency.toLowerCase())
                    .putMetadata("donorEmail", email != null ? email : "anonymous")
                    .putMetadata("donorName", name != null ? name : "Anonymous")
                    .putMetadata("type", "one_time")
                    .putMetadata("purpose", "CAMPAIGN")
                    .putMetadata("campaignId", campaignId.toString())
                    .putMetadata("campaignTitle", campaign.getTitleEn())
                    .build();
            
            log.info("Calling Stripe API...");
            PaymentIntent paymentIntent = PaymentIntent.create(params);
            log.info("Stripe Payment Intent created successfully: {}", paymentIntent.getId());
            
            // Save donation record
            Donation donation = new Donation();
            donation.setDonorEmail(email != null ? email : "anonymous@donor.com");
            donation.setDonorName(name != null ? name : "Anonymous");
            donation.setAmount(amount);
            donation.setType(Donation.DonationType.ONE_TIME);
            donation.setStripePaymentIntentId(paymentIntent.getId());
            donation.setMessage(message);
            donation.setActive(true);
            donation.setCampaignId(campaignId);
            donation.setPurpose(Donation.DonationPurpose.CAMPAIGN);
            donation.setCurrency(currency);
            donation.setPaymentStatus(Donation.PaymentStatus.PENDING);
            
            donationRepository.save(donation);
            log.info("Donation record saved with PENDING status (will be completed by webhook)");
            
            // 🆕 OPTIMISTIC UPDATE: Immediately update campaign total
            // This provides instant feedback to users without waiting for webhooks
            // The webhook will verify and correct if payment fails
            BigDecimal oldAmount = campaign.getCurrentAmount();
            BigDecimal newAmount = oldAmount.add(amount);
            campaign.setCurrentAmount(newAmount);
            campaignRepository.save(campaign);
            log.info("⚡ Optimistically updated campaign {} total: {} → {} (added {})", 
                    campaign.getId(), oldAmount, newAmount, amount);
            log.info("   ⚠️  Campaign total updated optimistically. Webhook will confirm/rollback on payment result.");
            log.info("   (Will be verified/corrected by webhook on payment completion)");
            
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());
            response.put("paymentIntentId", paymentIntent.getId());
            response.put("campaignTitle", campaign.getTitleEn());
            
            log.info("Returning response with clientSecret");
            return response;
            
        } catch (StripeException e) {
            log.error("Stripe API error: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating campaign donation: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create donation: " + e.getMessage(), e);
        }
    }
    
    public Map<String, String> createRecurringDonation(String email, String name, BigDecimal amount, 
                                                       Donation.SubscriptionInterval interval) throws StripeException {
        // Create Stripe Checkout Session for subscription
        SessionCreateParams.Builder builder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setSuccessUrl(frontendUrl + "/donation-success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/donate")
                .setCustomerEmail(email);
        
        // Create price based on interval
        long amountInCents = amount.multiply(new BigDecimal(100)).longValue();
        String intervalString = interval == Donation.SubscriptionInterval.MONTHLY ? "month" : "year";
        
        builder.addLineItem(
                SessionCreateParams.LineItem.builder()
                        .setPriceData(
                                SessionCreateParams.LineItem.PriceData.builder()
                                        .setCurrency("eur")
                                        .setUnitAmount(amountInCents)
                                        .setRecurring(
                                                SessionCreateParams.LineItem.PriceData.Recurring.builder()
                                                        .setInterval(SessionCreateParams.LineItem.PriceData.Recurring.Interval.valueOf(intervalString.toUpperCase()))
                                                        .build()
                                        )
                                        .setProductData(
                                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                        .setName("Monthly Donation to Masjid Studentski Grad")
                                                        .build()
                                        )
                                        .build()
                        )
                        .setQuantity(1L)
                        .build()
        );
        
        Session session = Session.create(builder.build());
        
        // Save donation record (will be updated after successful payment)
        Donation donation = new Donation();
        donation.setDonorEmail(email);
        donation.setDonorName(name);
        donation.setAmount(amount);
        donation.setType(Donation.DonationType.RECURRING);
        donation.setSubscriptionInterval(interval);
        donation.setActive(false); // Will be activated after payment
        donation.setPurpose(Donation.DonationPurpose.GENERAL);
        donation.setPaymentStatus(Donation.PaymentStatus.PENDING);
        donation.setCurrency("EUR");
        
        donationRepository.save(donation);
        
        Map<String, String> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("sessionUrl", session.getUrl());
        
        return response;
    }
    
    @Transactional
    public void handleStripeWebhook(String payload, String sigHeader) throws SignatureVerificationException {
        Event event;
        
        if (webhookSecret == null || webhookSecret.isEmpty()) {
            log.error("⚠️  PRODUCTION WARNING: Webhook secret not configured!");
            log.error("   Donations will remain PENDING until webhooks are properly configured.");
            log.error("   Campaign totals update optimistically but won't be verified.");
            log.error("   Configure STRIPE_WEBHOOK_SECRET in backend/.env");
            log.error("   See: STRIPE_WEBHOOK_SETUP.md for instructions");
            
            // Parse without verification (ONLY for development/testing)
            // DO NOT use in production without webhook secret!
            try {
                Gson gson = new Gson();
                event = gson.fromJson(payload, Event.class);
                log.warn("   Parsing webhook WITHOUT signature verification (INSECURE)");
            } catch (Exception e) {
                log.error("Failed to parse webhook payload: {}", e.getMessage());
                return;
            }
        } else {
            // Production mode: verify signature for security
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            log.info("✅ Webhook signature verified successfully");
        }
        
        log.info("Received Stripe webhook event: {}", event.getType());
        
        // Handle the event
        switch (event.getType()) {
            case "payment_intent.succeeded":
                handlePaymentIntentSucceeded(event);
                break;
            case "payment_intent.payment_failed":
                handlePaymentIntentFailed(event);
                break;
            default:
                log.info("Unhandled event type: {}", event.getType());
        }
    }
    
    @Transactional
    private void handlePaymentIntentSucceeded(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject()
                .orElse(null);
        
        if (paymentIntent == null) {
            log.error("PaymentIntent is null in payment_intent.succeeded event");
            return;
        }
        
        String paymentIntentId = paymentIntent.getId();
        log.info("Processing payment_intent.succeeded for PaymentIntent: {}", paymentIntentId);
        
        // Find and update donation
        List<Donation> matchingDonations = donationRepository.findAll().stream()
                .filter(d -> paymentIntentId.equals(d.getStripePaymentIntentId()))
                .toList();
        
        if (matchingDonations.isEmpty()) {
            log.error("No donation found for PaymentIntent: {}", paymentIntentId);
            return;
        }
        
        matchingDonations.forEach(donation -> {
            log.info("Found donation ID: {}, campaignId: {}, amount: {}, currentStatus: {}", 
                    donation.getId(), donation.getCampaignId(), donation.getAmount(), donation.getPaymentStatus());
            
            // Update to COMPLETED
            donation.setPaymentStatus(Donation.PaymentStatus.COMPLETED);
            donation.setActive(true);
            donationRepository.save(donation);
            log.info("✅ Donation {} status updated: {} → COMPLETED", 
                    donation.getId(), donation.getPaymentStatus());
            
            // Campaign was already updated optimistically, just log confirmation
            if (donation.getCampaignId() != null) {
                campaignRepository.findById(donation.getCampaignId())
                        .ifPresentOrElse(campaign -> {
                            log.info("✅ Campaign {} payment confirmed by webhook. Current total: {}", 
                                    campaign.getId(), campaign.getCurrentAmount());
                        }, () -> {
                            log.error("❌ Campaign {} not found for donation {}", 
                                    donation.getCampaignId(), donation.getId());
                        });
            }
            
            // Send thank you email
            if (donation.getDonorEmail() != null && !donation.getDonorEmail().equals("anonymous@donor.com")) {
                try {
                    emailService.sendDonationThankYou(
                            donation.getDonorEmail(),
                            donation.getDonorName(),
                            donation.getAmount().toString()
                    );
                    log.info("✉️  Thank you email sent to: {}", donation.getDonorEmail());
                } catch (Exception e) {
                    log.error("Failed to send thank you email: {}", e.getMessage());
                }
            }
        });
    }
    
    @Transactional
    private void handlePaymentIntentFailed(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject()
                .orElse(null);
        
        if (paymentIntent == null) {
            log.error("PaymentIntent is null in payment_intent.payment_failed event");
            return;
        }
        
        String paymentIntentId = paymentIntent.getId();
        log.warn("Payment failed for PaymentIntent: {}", paymentIntentId);
        
        // Find and update donation
        donationRepository.findAll().stream()
                .filter(d -> paymentIntentId.equals(d.getStripePaymentIntentId()))
                .findFirst()
                .ifPresent(donation -> {
                    donation.setPaymentStatus(Donation.PaymentStatus.FAILED);
                    donation.setActive(false);
                    donationRepository.save(donation);
                    log.info("Donation {} marked as FAILED", donation.getId());
                    
                    // 🔄 ROLLBACK: Remove the optimistic amount from campaign
                    if (donation.getCampaignId() != null) {
                        campaignRepository.findById(donation.getCampaignId())
                                .ifPresent(campaign -> {
                                    BigDecimal oldAmount = campaign.getCurrentAmount();
                                    BigDecimal newAmount = oldAmount.subtract(donation.getAmount());
                                    campaign.setCurrentAmount(newAmount);
                                    campaignRepository.save(campaign);
                                    log.warn("⚠️ Rolled back campaign {} total: {} → {} (removed {})", 
                                            campaign.getId(), oldAmount, newAmount, donation.getAmount());
                                });
                    }
                });
    }
    
    public void handleSuccessfulPayment(String paymentIntentId) {
        donationRepository.findAll().stream()
                .filter(d -> paymentIntentId.equals(d.getStripePaymentIntentId()))
                .findFirst()
                .ifPresent(donation -> {
                    emailService.sendDonationThankYou(
                            donation.getDonorEmail(),
                            donation.getDonorName(),
                            donation.getAmount().toString()
                    );
                });
    }
    
    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }
    
    public BigDecimal getTotalOneTimeDonations() {
        BigDecimal total = donationRepository.getTotalOneTimeDonations();
        return total != null ? total : BigDecimal.ZERO;
    }
    
    public Long getActiveSubscriptionCount() {
        return donationRepository.getActiveSubscriptionCount();
    }
}
