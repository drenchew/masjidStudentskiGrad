package com.masjid.validation;

/**
 * Input validation constraints for all user-submitted data
 * Prevents data overflow, injection attacks, and database errors
 */
public class ValidationConstraints {

    // Donation amounts
    public static final double MIN_DONATION = 0.01;
    public static final double MAX_DONATION = 999999.99;

    // Campaign fields
    public static final int MIN_CAMPAIGN_TITLE_LENGTH = 5;
    public static final int MAX_CAMPAIGN_TITLE_LENGTH = 500;
    public static final int MIN_CAMPAIGN_DESCRIPTION_LENGTH = 10;
    public static final int MAX_CAMPAIGN_DESCRIPTION_LENGTH = 5000;
    public static final double MIN_GOAL_AMOUNT = 100;
    public static final double MAX_GOAL_AMOUNT = 999999999;
    public static final int MAX_IMAGE_URL_LENGTH = 1000;

    // Product fields
    public static final int MIN_PRODUCT_NAME_LENGTH = 3;
    public static final int MAX_PRODUCT_NAME_LENGTH = 500;
    public static final int MIN_PRODUCT_DESCRIPTION_LENGTH = 10;
    public static final int MAX_PRODUCT_DESCRIPTION_LENGTH = 5000;
    public static final double MIN_PRODUCT_PRICE = 0.01;
    public static final double MAX_PRODUCT_PRICE = 999999.99;
    public static final int MAX_PRODUCT_STOCK = 999999;
    public static final int MAX_CATEGORY_LENGTH = 200;

    // Questions
    public static final int MIN_QUESTION_LENGTH = 5;
    public static final int MAX_QUESTION_LENGTH = 5000;

    // Announcements
    public static final int MIN_ANNOUNCEMENT_TITLE_LENGTH = 3;
    public static final int MAX_ANNOUNCEMENT_TITLE_LENGTH = 500;
    public static final int MIN_ANNOUNCEMENT_CONTENT_LENGTH = 5;
    public static final int MAX_ANNOUNCEMENT_CONTENT_LENGTH = 5000;

    // Khutbahs
    public static final int MIN_KHUTBAH_TITLE_LENGTH = 5;
    public static final int MAX_KHUTBAH_TITLE_LENGTH = 500;
    public static final int MIN_SPEAKER_NAME_LENGTH = 3;
    public static final int MAX_SPEAKER_NAME_LENGTH = 300;
    public static final int MIN_TOPICS_LENGTH = 3;
    public static final int MAX_TOPICS_LENGTH = 500;

    // Ramadan Videos
    public static final int MIN_VIDEO_TITLE_LENGTH = 3;
    public static final int MAX_VIDEO_TITLE_LENGTH = 500;
    public static final int MIN_IMAM_NAME_LENGTH = 3;
    public static final int MAX_IMAM_NAME_LENGTH = 300;
    public static final int MIN_DURATION = 1;
    public static final int MAX_DURATION = 600; // 10 hours in minutes

    // Zakat calculator assets
    public static final double MIN_ASSET_VALUE = 0;
    public static final double MAX_ASSET_VALUE = 999999999;

    // General text fields
    public static final int MIN_NAME_LENGTH = 2;
    public static final int MAX_NAME_LENGTH = 100;
    public static final int MAX_EMAIL_LENGTH = 255;
    public static final int MIN_MESSAGE_LENGTH = 5;
    public static final int MAX_MESSAGE_LENGTH = 5000;

    // File uploads
    public static final long MAX_FILE_SIZE_BYTES = 50L * 1024 * 1024; // 50MB
    public static final String[] ALLOWED_FILE_TYPES = {
        "image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"
    };

    /**
     * Validate string field length
     */
    public static boolean isValidLength(String value, int min, int max) {
        if (value == null) return false;
        int length = value.trim().length();
        return length >= min && length <= max;
    }

    /**
     * Validate numeric value range
     */
    public static boolean isValidRange(double value, double min, double max) {
        return value >= min && value <= max;
    }

    /**
     * Validate email format
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.length() > MAX_EMAIL_LENGTH) return false;
        return email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

    /**
     * Sanitize string input
     */
    public static String sanitize(String input) {
        if (input == null) return "";
        return input.trim()
                .replaceAll("[<>]", "") // Remove potential HTML tags
                .substring(0, Math.min(input.length(), 5000)); // Max 5000 chars
    }

    /**
     * Check if file size is within limits
     */
    public static boolean isValidFileSize(long fileSize) {
        return fileSize > 0 && fileSize <= MAX_FILE_SIZE_BYTES;
    }

    /**
     * Check if file type is allowed
     */
    public static boolean isValidFileType(String mimeType) {
        if (mimeType == null) return false;
        for (String allowed : ALLOWED_FILE_TYPES) {
            if (allowed.equals(mimeType)) return true;
        }
        return false;
    }
}
