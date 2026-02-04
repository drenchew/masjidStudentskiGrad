package com.masjid.controller.admin;

import com.masjid.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {
    
    private final DonationRepository donationRepository;
    private final OrderRepository orderRepository;
    private final SubscriberRepository subscriberRepository;
    private final ProductRepository productRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("donations", donationRepository.count());
        stats.put("orders", orderRepository.count());
        stats.put("subscribers", subscriberRepository.count());
        stats.put("products", productRepository.count());
        
        return ResponseEntity.ok(stats);
    }
}
