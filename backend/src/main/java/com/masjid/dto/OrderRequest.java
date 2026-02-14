package com.masjid.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * DTO for creating orders from the checkout form
 */
public class OrderRequest {
    
    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @JsonProperty("customerName")
    private String customerName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email cannot exceed 255 characters")
    @JsonProperty("email")
    private String email;
    
    @NotBlank(message = "Phone number is required")
    @Size(min = 7, max = 20, message = "Phone must be between 7 and 20 characters")
    @JsonProperty("phoneNumber")
    private String phoneNumber;
    
    @NotBlank(message = "Shipping address is required")
    @Size(min = 5, max = 200, message = "Address must be between 5 and 200 characters")
    @JsonProperty("shippingAddress")
    private String shippingAddress;
    
    @NotBlank(message = "City is required")
    @Size(min = 2, max = 50, message = "City must be between 2 and 50 characters")
    @JsonProperty("city")
    private String city;
    
    @NotBlank(message = "Postal code is required")
    @Size(min = 3, max = 20, message = "Postal code must be between 3 and 20 characters")
    @JsonProperty("postalCode")
    private String postalCode;
    
    @Size(max = 5000, message = "Notes cannot exceed 5000 characters")
    @JsonProperty("notes")
    private String notes;
    
    @NotNull(message = "Items are required")
    @Size(min = 1, max = 50, message = "Order must contain between 1 and 50 items")
    @Valid
    private List<OrderItemRequest> items;
    
    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.01", message = "Total must be at least €0.01")
    @DecimalMax(value = "999999.99", message = "Total cannot exceed €999,999.99")
    @JsonProperty("totalAmount")
    private Double totalAmount;
    
    // Getters and setters
    public String getCustomerName() {
        return customerName;
    }
    
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getShippingAddress() {
        return shippingAddress;
    }
    
    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getPostalCode() {
        return postalCode;
    }
    
    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public List<OrderItemRequest> getItems() {
        return items;
    }
    
    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
    
    public Double getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    /**
     * Nested DTO for order items
     */
    public static class OrderItemRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;
        
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        @Max(value = 1000, message = "Quantity cannot exceed 1,000")
        private Integer quantity;
        
        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be at least €0.01")
        @DecimalMax(value = "999999.99", message = "Price cannot exceed €999,999.99")
        private Double price;
        
        // Getters and setters
        public Long getProductId() {
            return productId;
        }
        
        public void setProductId(Long productId) {
            this.productId = productId;
        }
        
        public Integer getQuantity() {
            return quantity;
        }
        
        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
        
        public Double getPrice() {
            return price;
        }
        
        public void setPrice(Double price) {
            this.price = price;
        }
    }
}
