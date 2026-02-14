package com.masjid.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonationRequest {
    
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email cannot exceed 255 characters")
    private String email;
    
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.50", message = "Minimum donation is €0.50")
    @DecimalMax(value = "999999.99", message = "Maximum donation is €999,999.99")
    private Double amount;
    
    @Size(max = 1000, message = "Message cannot exceed 1000 characters")
    private String message;
    
    @Size(max = 10, message = "Currency code cannot exceed 10 characters")
    private String currency;
    
    private String interval; // MONTHLY or YEARLY for recurring
}
