package com.masjid.controller.admin;

import com.masjid.model.Donation;
import com.masjid.service.DonationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/donations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDonationController {
    
    private final DonationService donationService;
    
    @GetMapping
    public ResponseEntity<List<Donation>> getAllDonations() {
        return ResponseEntity.ok(donationService.getAllDonations());
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDonationStats() {
        return ResponseEntity.ok(Map.of(
                "totalOneTime", donationService.getTotalOneTimeDonations(),
                "activeSubscriptions", donationService.getActiveSubscriptionCount()
        ));
    }
}
