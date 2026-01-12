package com.masjid.service;

import com.masjid.model.Order;
import com.masjid.model.OrderItem;
import com.masjid.model.Product;
import com.masjid.repository.OrderRepository;
import com.masjid.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;
    
    @Transactional
    public Order createOrder(Order order) {
        // Generate order number
        order.setOrderNumber(generateOrderNumber());
        
        // Calculate totals and create order items
        BigDecimal subtotal = BigDecimal.ZERO;
        
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            
            // Check stock
            if (product.getStock() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getNameEn());
            }
            
            // Set item details
            item.setOrder(order);
            item.setProduct(product);
            item.setPriceAtOrder(product.getPrice());
            item.setProductNameEn(product.getNameEn());
            item.setProductNameBg(product.getNameBg());
            item.setProductNameAr(product.getNameAr());
            
            // Calculate item total
            BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(item.getQuantity()));
            subtotal = subtotal.add(itemTotal);
            
            // Decrease stock
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
        }
        
        order.setSubtotal(subtotal);
        order.setTotal(subtotal.add(order.getShippingCost()));
        order.setStatus(Order.OrderStatus.PENDING);
        
        Order savedOrder = orderRepository.save(order);
        
        // Send confirmation email
        emailService.sendOrderConfirmation(savedOrder);
        
        return savedOrder;
    }
    
    private String generateOrderNumber() {
        return "MAS-" + LocalDateTime.now().getYear() + 
               String.format("%02d", LocalDateTime.now().getMonthValue()) +
               UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    public Order getOrderByNumberAndEmail(String orderNumber, String email) {
        return orderRepository.findByOrderNumberAndCustomerEmail(orderNumber, email)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public Order updateOrderStatus(Long id, Order.OrderStatus status, String trackingNumber, String deliveryNotes) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        Order.OrderStatus oldStatus = order.getStatus();
        order.setStatus(status);
        
        if (trackingNumber != null) {
            order.setTrackingNumber(trackingNumber);
        }
        if (deliveryNotes != null) {
            order.setDeliveryNotes(deliveryNotes);
        }
        
        Order updatedOrder = orderRepository.save(order);
        
        // Send status update email if status changed
        if (!oldStatus.equals(status)) {
            emailService.sendOrderStatusUpdate(updatedOrder);
        }
        
        return updatedOrder;
    }
}
