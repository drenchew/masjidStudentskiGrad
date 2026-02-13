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
        log.info("=== ORDER CREATION STARTED ===");
        log.info("Customer: {}", request.getCustomerName());
        log.info("Email: {}", request.getEmail());
        log.info("Items count: {}", request.getItems() != null ? request.getItems().size() : 0);
        
        try {
            Order order = orderService.createOrderFromRequest(request);
            OrderResponse response = OrderResponse.fromOrder(order);
            log.info("=== ORDER CREATED SUCCESSFULLY === Order Number: {}", order.getOrderNumber());
            log.info("Returning response to frontend");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("=== ORDER CREATION FAILED ===", e);
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
        return ResponseEntity.ok(orderService.getOrderByNumberAndEmail(number, email));
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
        
        log.info("Updating order {} status to {} with tracking: {}", id, statusStr, trackingNumber);
        
        Order.OrderStatus status = Order.OrderStatus.valueOf(statusStr);
        Order updatedOrder = orderService.updateOrderStatus(id, status, trackingNumber, null);
        return ResponseEntity.ok(OrderResponse.fromOrder(updatedOrder));
    }
}
