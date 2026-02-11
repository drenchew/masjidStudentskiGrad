package com.masjid.controller;

import com.masjid.model.Order;
import com.masjid.dto.OrderRequest;
import com.masjid.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;
    
    @PostMapping
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrderFromRequest(request));
    }
    
    @PostMapping("/create")
    public ResponseEntity<Order> createOrderLegacy(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrderFromRequest(request));
    }
    
    @GetMapping("/track")
    public ResponseEntity<Order> trackOrder(
            @RequestParam String number, 
            @RequestParam String email) {
        return ResponseEntity.ok(orderService.getOrderByNumberAndEmail(number, email));
    }
}
