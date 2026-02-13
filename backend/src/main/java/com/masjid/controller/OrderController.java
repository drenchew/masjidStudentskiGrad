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
}
