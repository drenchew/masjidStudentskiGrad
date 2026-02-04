package com.masjid.controller.admin;

import com.masjid.model.Order;
import com.masjid.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {
    
    private final OrderService orderService;
    
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        Order.OrderStatus status = Order.OrderStatus.valueOf(request.get("status"));
        String trackingNumber = request.get("trackingNumber");
        String deliveryNotes = request.get("deliveryNotes");
        
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status, trackingNumber, deliveryNotes));
    }
}
