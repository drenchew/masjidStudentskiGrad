package com.masjid.validation;

import jakarta.validation.constraints.*;

/**
 * Common validation annotations for DTOs
 */
public class ValidationAnnotations {
    
    /**
     * Donation Request DTO
     */
    public static class DonationValidation {
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Minimum donation is €0.01")
        @DecimalMax(value = "999999.99", message = "Maximum donation is €999,999.99")
        public Double amount;

        @Size(max = 100, message = "Name cannot exceed 100 characters")
        public String name;

        @Email(message = "Invalid email format")
        @Size(max = 255, message = "Email cannot exceed 255 characters")
        public String email;

        @Size(max = 1000, message = "Message cannot exceed 1000 characters")
        public String message;
    }

    /**
     * Campaign DTO
     */
    public static class CampaignValidation {
        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 500, message = "Title must be between 5 and 500 characters")
        public String titleEn;

        @Size(min = 5, max = 500, message = "Title must be between 5 and 500 characters")
        public String titleBg;

        @Size(min = 5, max = 500, message = "Title must be between 5 and 500 characters")
        public String titleAr;

        @NotBlank(message = "Description is required")
        @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters")
        public String descriptionEn;

        @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters")
        public String descriptionBg;

        @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters")
        public String descriptionAr;

        @NotNull(message = "Goal amount is required")
        @DecimalMin(value = "100", message = "Minimum goal is €100")
        @DecimalMax(value = "999999999", message = "Maximum goal is €999,999,999")
        public Double goalAmount;

        @DecimalMin(value = "0", message = "Current amount cannot be negative")
        @DecimalMax(value = "999999999", message = "Maximum current amount is €999,999,999")
        public Double currentAmount;

        @Size(max = 1000, message = "Image URL cannot exceed 1000 characters")
        public String imageUrl;
    }

    /**
     * Product DTO
     */
    public static class ProductValidation {
        @NotBlank(message = "Product name is required")
        @Size(min = 3, max = 500, message = "Name must be between 3 and 500 characters")
        public String name;

        @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters")
        public String description;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Minimum price is €0.01")
        @DecimalMax(value = "999999.99", message = "Maximum price is €999,999.99")
        public Double price;

        @Min(value = 0, message = "Stock cannot be negative")
        @Max(value = 999999, message = "Maximum stock is 999,999 units")
        public Integer stock;

        @Size(min = 2, max = 200, message = "Category must be between 2 and 200 characters")
        public String category;

        @Size(max = 1000, message = "Image URL cannot exceed 1000 characters")
        public String imageUrl;
    }

    /**
     * Question DTO
     */
    public static class QuestionValidation {
        @NotBlank(message = "Question cannot be empty")
        @Size(min = 5, max = 5000, message = "Question must be between 5 and 5000 characters")
        public String content;
    }

    /**
     * Announcement DTO
     */
    public static class AnnouncementValidation {
        @NotBlank(message = "Title is required")
        @Size(min = 3, max = 500, message = "Title must be between 3 and 500 characters")
        public String titleEn;

        @Size(min = 3, max = 500, message = "Title must be between 3 and 500 characters")
        public String titleBg;

        @Size(min = 3, max = 500, message = "Title must be between 3 and 500 characters")
        public String titleAr;

        @NotBlank(message = "Content is required")
        @Size(min = 5, max = 5000, message = "Content must be between 5 and 5000 characters")
        public String contentEn;

        @Size(min = 5, max = 5000, message = "Content must be between 5 and 5000 characters")
        public String contentBg;

        @Size(min = 5, max = 5000, message = "Content must be between 5 and 5000 characters")
        public String contentAr;
    }

    /**
     * Khutbah DTO
     */
    public static class KhutbahValidation {
        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 500, message = "Title must be between 5 and 500 characters")
        public String titleEn;

        @Size(min = 3, max = 300, message = "Speaker name must be between 3 and 300 characters")
        public String speaker;

        @Size(min = 3, max = 500, message = "Topics must be between 3 and 500 characters")
        public String topics;
    }

    /**
     * Ramadan Video DTO
     */
    public static class RamadanVideoValidation {
        @NotBlank(message = "Title is required")
        @Size(min = 3, max = 500, message = "Title must be between 3 and 500 characters")
        public String titleEn;

        @Size(min = 3, max = 300, message = "Imam name must be between 3 and 300 characters")
        public String imam;

        @Min(value = 1, message = "Duration must be at least 1 minute")
        @Max(value = 600, message = "Duration cannot exceed 600 minutes (10 hours)")
        public Integer duration;

        @Size(max = 1000, message = "Video URL cannot exceed 1000 characters")
        public String videoUrl;
    }

    /**
     * Zakat Calculator DTO
     */
    public static class ZakatCalculationValidation {
        @DecimalMin(value = "0", message = "Value cannot be negative")
        @DecimalMax(value = "999999999", message = "Value cannot exceed €999,999,999")
        public Double gold;

        @DecimalMin(value = "0", message = "Value cannot be negative")
        @DecimalMax(value = "999999999", message = "Value cannot exceed €999,999,999")
        public Double silver;

        @DecimalMin(value = "0", message = "Value cannot be negative")
        @DecimalMax(value = "999999999", message = "Value cannot exceed €999,999,999")
        public Double cash;

        @DecimalMin(value = "0", message = "Value cannot be negative")
        @DecimalMax(value = "999999999", message = "Value cannot exceed €999,999,999")
        public Double investments;

        @DecimalMin(value = "0", message = "Value cannot be negative")
        @DecimalMax(value = "999999999", message = "Value cannot exceed €999,999,999")
        public Double business;

        @DecimalMin(value = "0", message = "Value cannot be negative")
        @DecimalMax(value = "999999999", message = "Value cannot exceed €999,999,999")
        public Double debt;
    }

    /**
     * Contact Message DTO
     */
    public static class ContactValidation {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        public String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        @Size(max = 255, message = "Email cannot exceed 255 characters")
        public String email;

        @NotBlank(message = "Message is required")
        @Size(min = 5, max = 5000, message = "Message must be between 5 and 5000 characters")
        public String message;
    }
}
