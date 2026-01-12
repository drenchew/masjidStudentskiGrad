package com.masjid.service;

import com.masjid.model.Order;
import com.masjid.model.Subscriber;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    private final WebClient.Builder webClientBuilder;
    
    @Value("${app.email.from}")
    private String fromEmail;
    
    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.email.brevo-api-key:}")
    private String brevoApiKey;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @PostConstruct
    public void init() {
        log.info("Brevo API key configured: {}", (brevoApiKey != null && !brevoApiKey.isBlank()));
    }
    
    public void sendOrderConfirmation(Order order) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(order.getCustomerEmail());
            message.setSubject("Order Confirmation - " + order.getOrderNumber());
            message.setText(String.format(
                    "Dear %s,\n\n" +
                    "Thank you for your order!\n\n" +
                    "Order Number: %s\n" +
                    "Total Amount: €%.2f\n\n" +
                    "You can track your order at: %s/track-order?number=%s\n\n" +
                    "We will notify you when your order status changes.\n\n" +
                    "JazakAllah Khair,\n" +
                    "Masjid Studentski Grad",
                    order.getCustomerName(),
                    order.getOrderNumber(),
                    order.getTotal(),
                    frontendUrl,
                    order.getOrderNumber()
            ));
            
            mailSender.send(message);
            log.info("Order confirmation email sent to {}", order.getCustomerEmail());
        } catch (Exception e) {
            log.error("Failed to send order confirmation email: {}", e.getMessage());
        }
    }
    
    public void sendOrderStatusUpdate(Order order) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(order.getCustomerEmail());
            message.setSubject("Order Status Update - " + order.getOrderNumber());
            
            String statusMessage = switch (order.getStatus()) {
                case PROCESSING -> "Your order is being processed.";
                case SHIPPED -> "Your order has been shipped!" + 
                        (order.getTrackingNumber() != null ? "\nTracking Number: " + order.getTrackingNumber() : "");
                case DELIVERED -> "Your order has been delivered. Thank you for your purchase!";
                case CANCELLED -> "Your order has been cancelled.";
                default -> "Your order status has been updated to: " + order.getStatus();
            };
            
            message.setText(String.format(
                    "Dear %s,\n\n" +
                    "Your order %s has been updated.\n\n" +
                    "Status: %s\n" +
                    "%s\n\n" +
                    "Track your order: %s/track-order?number=%s\n\n" +
                    "JazakAllah Khair,\n" +
                    "Masjid Studentski Grad",
                    order.getCustomerName(),
                    order.getOrderNumber(),
                    order.getStatus(),
                    statusMessage,
                    frontendUrl,
                    order.getOrderNumber()
            ));
            
            mailSender.send(message);
            log.info("Order status update email sent to {}", order.getCustomerEmail());
        } catch (Exception e) {
            log.error("Failed to send order status update email: {}", e.getMessage());
        }
    }
    
    public void sendSubscriptionConfirmation(Subscriber subscriber, String verificationLink) {
        // If Brevo API key is configured, use Brevo HTTP API for reliable sending
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            try {
                Map<String, Object> payload = new HashMap<>();
                Map<String, String> sender = Map.of("name", "Masjid Studentski Grad", "email", fromEmail);
                List<Map<String, String>> to = List.of(Map.of("email", subscriber.getEmail()));

                String text = String.format(
                        "Assalamu Alaikum,\n\n" +
                        "Thank you for subscribing to Masjid Studentski Grad newsletter!\n\n" +
                        "Please confirm your subscription by clicking the link below:\n" +
                        "%s\n\n" +
                        "You will receive updates about:\n" +
                        "- New Friday khutbahs\n" +
                        "- Upcoming events\n" +
                        "- Important announcements\n\n" +
                        "JazakAllah Khair,\n" +
                        "Masjid Studentski Grad",
                        verificationLink
                );

                payload.put("sender", sender);
                payload.put("to", to);
                payload.put("subject", "Confirm Your Subscription - Masjid Studentski Grad");
                payload.put("textContent", text);

                webClientBuilder.build()
                        .post()
                        .uri("https://api.brevo.com/v3/smtp/email")
                        .header("api-key", brevoApiKey)
                        .bodyValue(payload)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                log.info("Subscription confirmation email sent to {} via Brevo API. From: {}", subscriber.getEmail(), fromEmail);
                return;
            } catch (WebClientResponseException wcre) {
                log.warn("Brevo API responded with status {} and body: {}. Will not attempt SMTP fallback unless configured.", wcre.getRawStatusCode(), wcre.getResponseBodyAsString());
                // Continue to SMTP only if SMTP credentials are present
            } catch (Exception e) {
                log.warn("Brevo API send failed: {}", e.toString());
                // Fall through to SMTP fallback if SMTP is configured
            }
        }
        // Fallback to SMTP only if credentials are configured to avoid authentication failures
        if (mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank()) {
            log.error("SMTP credentials not configured (spring.mail.username/password). Skipping SMTP fallback.");
            return;
        }

        // Fallback to SMTP
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(subscriber.getEmail());
            message.setSubject("Confirm Your Subscription - Masjid Studentski Grad");
            message.setText(String.format(
                    "Assalamu Alaikum,\n\n" +
                    "Thank you for subscribing to Masjid Studentski Grad newsletter!\n\n" +
                    "Please confirm your subscription by clicking the link below:\n" +
                    "%s\n\n" +
                    "You will receive updates about:\n" +
                    "- New Friday khutbahs\n" +
                    "- Upcoming events\n" +
                    "- Important announcements\n\n" +
                    "JazakAllah Khair,\n" +
                    "Masjid Studentski Grad",
                    verificationLink
            ));

            mailSender.send(message);
            log.info("Subscription confirmation email sent to {} via SMTP", subscriber.getEmail());
        } catch (Exception e) {
            log.error("Failed to send subscription confirmation email: {}", e.getMessage());
        }
    }
    
    public void sendAnnouncementToSubscribers(List<String> emails, String subject, String content) {
        // If Brevo API key is configured, attempt single bulk send via Brevo API
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            try {
                Map<String, Object> payload = new HashMap<>();
                Map<String, String> sender = Map.of("name", "Masjid Studentski Grad", "email", fromEmail);
                List<Map<String, String>> to = emails.stream().map(e -> Map.of("email", e)).collect(Collectors.toList());

                String fullContent = content + "\n\n---\nTo unsubscribe, visit: " + frontendUrl + "/unsubscribe";

                payload.put("sender", sender);
                payload.put("to", to);
                payload.put("subject", subject);
                payload.put("textContent", fullContent);

                String response = webClientBuilder.build()
                        .post()
                        .uri("https://api.brevo.com/v3/smtp/email")
                        .header("api-key", brevoApiKey)
                        .bodyValue(payload)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                log.info("Announcement sent to {} subscribers via Brevo API. Response: {}", emails.size(), response);
                log.info("Email details - From: {}, To: {}, Subject: {}", fromEmail, emails, subject);
                return;
            } catch (WebClientResponseException wcre) {
                log.warn("Brevo API bulk send responded with status {} and body: {}.", wcre.getStatusCode().value(), wcre.getResponseBodyAsString());
                // Continue to SMTP only if SMTP credentials are present
            } catch (Exception e) {
                log.warn("Brevo API bulk send failed: {}", e.toString());
                // fall through to SMTP fallback if SMTP is configured
            }
        }
        // Fallback to SMTP sending (one-by-one)
        if (mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank()) {
            log.error("SMTP credentials not configured (spring.mail.username/password). Skipping SMTP fallback for announcements.");
            return;
        }

        try {
            for (String email : emails) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(email);
                message.setSubject(subject);
                message.setText(content + "\n\n---\n" + 
                        "To unsubscribe, visit: " + frontendUrl + "/unsubscribe");

                mailSender.send(message);
            }
            log.info("Announcement sent to {} subscribers via SMTP", emails.size());
        } catch (Exception e) {
            log.error("Failed to send announcement emails: {}", e.getMessage());
        }
    }
    
    public void sendDonationThankYou(String email, String donorName, String amount) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Thank You for Your Donation");
            message.setText(String.format(
                    "Dear %s,\n\n" +
                    "JazakAllah Khair for your generous donation of €%s to Masjid Studentski Grad!\n\n" +
                    "Your contribution helps us maintain the mosque, organize community events, " +
                    "and support our educational programs.\n\n" +
                    "May Allah reward you abundantly for your generosity.\n\n" +
                    "Donation Amount: €%s\n\n" +
                    "Barakallah Feekum,\n" +
                    "Masjid Studentski Grad",
                    donorName != null ? donorName : "Valued Donor",
                    amount,
                    amount
            ));
            
            mailSender.send(message);
            log.info("Donation thank you email sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send donation thank you email: {}", e.getMessage());
        }
    }
}
