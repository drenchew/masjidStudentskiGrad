package com.masjid.service;

import com.masjid.model.Order;
import com.masjid.model.OrderItem;
import com.masjid.model.Product;
import com.masjid.dto.OrderRequest;
import com.masjid.repository.OrderRepository;
import com.masjid.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;
    
    /**
     * Create order from OrderRequest DTO (used by Checkout form)
     */
    @Transactional
    public Order createOrderFromRequest(OrderRequest request) {
        log.info("Creating order for customer");
        
        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getEmail());
        order.setCustomerPhone(request.getPhoneNumber());
        order.setDeliveryAddress(request.getShippingAddress());
        order.setCity(request.getCity());
        order.setPostalCode(request.getPostalCode());
        order.setDeliveryNotes(request.getNotes());
        
        // Validate items list
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }
        
        if (request.getItems().size() > 50) {
            throw new IllegalArgumentException("Order cannot contain more than 50 items");
        }
        
        // Create order items from request
        List<OrderItem> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        
        for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            // Validate item data
            if (itemRequest.getQuantity() <= 0 || itemRequest.getQuantity() > 1000) {
                throw new IllegalArgumentException("Invalid quantity for product");
            }
            
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));
            
            // Check stock
            if (product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getNameEn());
            }
            
            // Verify price matches (prevent price manipulation)
            BigDecimal serverPrice = product.getPrice();
            BigDecimal clientPrice = BigDecimal.valueOf(itemRequest.getPrice());
            if (serverPrice.compareTo(clientPrice) != 0) {
                log.warn("Price mismatch detected for product {}: server={}, client={}", 
                        product.getId(), serverPrice, clientPrice);
                // Use the server-side price (authoritative)
                itemRequest.setPrice(serverPrice.doubleValue());
            }
            
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setPriceAtOrder(serverPrice); // Always use server price
            item.setProductNameEn(product.getNameEn());
            item.setProductNameBg(product.getNameBg());
            item.setProductNameAr(product.getNameAr());
            
            BigDecimal itemTotal = serverPrice.multiply(new BigDecimal(itemRequest.getQuantity()));
            subtotal = subtotal.add(itemTotal);
            
            // Decrease stock
            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);
            
            items.add(item);
        }
        
        order.setItems(items);
        order.setSubtotal(subtotal);
        order.setShippingCost(BigDecimal.ZERO);
        order.setTotal(subtotal);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setOrderNumber(generateOrderNumber());
        
        log.info("Saving order with number: {}", order.getOrderNumber());
        Order savedOrder = orderRepository.save(order);
        log.info("Order saved successfully with ID: {}", savedOrder.getId());
        
        // Send confirmation email (don't block order creation if it fails)
        try {
            log.info("Attempting to send order confirmation email");
            emailService.sendOrderConfirmation(savedOrder);
        } catch (Exception e) {
            // Log error but don't fail order creation
            log.error("Failed to send order confirmation email, but order was created successfully", e);
        }
        
        return savedOrder;
    }
    
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
    
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));
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
