package com.masjid.controller;

import com.masjid.model.Order;
import com.masjid.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {
    
    private final OrderService orderService;
    
    @PostMapping("/create")
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        return ResponseEntity.ok(orderService.createOrder(order));
    }
    
    @GetMapping("/track")
    public ResponseEntity<Order> trackOrder(
            @RequestParam String number, 
            @RequestParam String email) {
        return ResponseEntity.ok(orderService.getOrderByNumberAndEmail(number, email));
    }
}
