package com.masjid.controller;

import com.masjid.model.Order;
import com.masjid.dto.OrderRequest;
import com.masjid.dto.OrderResponse;
import com.masjid.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;
    
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        log.info("Order creation started for customer: {}", request.getCustomerName());
        
        try {
            Order order = orderService.createOrderFromRequest(request);
            OrderResponse response = OrderResponse.fromOrder(order);
            log.info("Order created successfully: {}", order.getOrderNumber());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Order creation failed", e);
            throw e;
        }
    }
    
    @PostMapping("/create")
    public ResponseEntity<OrderResponse> createOrderLegacy(@Valid @RequestBody OrderRequest request) {
        Order order = orderService.createOrderFromRequest(request);
        return ResponseEntity.ok(OrderResponse.fromOrder(order));
    }
    
    @GetMapping("/track")
    public ResponseEntity<Order> trackOrder(
            @RequestParam String number, 
            @RequestParam String email) {
        // Validate order number format (alphanumeric with dashes, max 50 chars)
        if (number == null || number.length() > 50 || !number.matches("^[a-zA-Z0-9-]+$")) {
            return ResponseEntity.badRequest().build();
        }
        // Validate email format
        if (email == null || email.length() > 255 || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(orderService.getOrderByNumberAndEmail(number, email.toLowerCase().trim()));
    }
    
    // Admin endpoints
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        log.info("Fetching all orders for admin");
        List<Order> orders = orderService.getAllOrders();
        List<OrderResponse> responses = orders.stream()
                .map(OrderResponse::fromOrder)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(OrderResponse.fromOrder(order));
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        String statusStr = statusUpdate.get("status");
        String trackingNumber = statusUpdate.get("trackingNumber");
        
        if (statusStr == null || statusStr.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        
        // Validate status is a known enum value
        Order.OrderStatus status;
        try {
            status = Order.OrderStatus.valueOf(statusStr.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid order status: " + statusStr);
        }
        
        // Sanitize tracking number
        if (trackingNumber != null) {
            trackingNumber = trackingNumber.trim().replaceAll("[<>\"';]", "");
            if (trackingNumber.length() > 100) {
                trackingNumber = trackingNumber.substring(0, 100);
            }
        }
        
        log.info("Updating order {} status to {}", id, status);
        
        Order updatedOrder = orderService.updateOrderStatus(id, status, trackingNumber, null);
        return ResponseEntity.ok(OrderResponse.fromOrder(updatedOrder));
    }
}
