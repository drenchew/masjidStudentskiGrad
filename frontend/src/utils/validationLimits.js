/**
 * Input Validation Constants and Limits
 * Defines acceptable ranges and sizes for all user inputs across the application
 */

export const VALIDATION_LIMITS = {
  // Donation Amounts
  DONATION: {
    MIN: 0.01,
    MAX: 999999.99,
    ERROR_MIN: 'Donation amount must be at least €0.01',
    ERROR_MAX: 'Donation amount cannot exceed €999,999.99',
  },

  // Campaign Management
  CAMPAIGN: {
    TITLE: {
      MIN: 5,
      MAX: 500,
      ERROR_MIN: 'Title must be at least 5 characters',
      ERROR_MAX: 'Title cannot exceed 500 characters',
    },
    DESCRIPTION: {
      MIN: 10,
      MAX: 5000,
      ERROR_MIN: 'Description must be at least 10 characters',
      ERROR_MAX: 'Description cannot exceed 5000 characters',
    },
    GOAL_AMOUNT: {
      MIN: 100,
      MAX: 999999999,
      ERROR_MIN: 'Goal amount must be at least €100',
      ERROR_MAX: 'Goal amount cannot exceed €999,999,999',
    },
    CURRENT_AMOUNT: {
      MIN: 0,
      MAX: 999999999,
      ERROR_MIN: 'Current amount cannot be negative',
      ERROR_MAX: 'Current amount cannot exceed €999,999,999',
    },
    IMAGE_URL: {
      MAX: 1000,
      ERROR_MAX: 'Image URL cannot exceed 1000 characters',
    },
  },

  // Product Management
  PRODUCT: {
    NAME: {
      MIN: 3,
      MAX: 500,
      ERROR_MIN: 'Product name must be at least 3 characters',
      ERROR_MAX: 'Product name cannot exceed 500 characters',
    },
    DESCRIPTION: {
      MIN: 10,
      MAX: 5000,
      ERROR_MIN: 'Description must be at least 10 characters',
      ERROR_MAX: 'Description cannot exceed 5000 characters',
    },
    PRICE: {
      MIN: 0.01,
      MAX: 999999.99,
      ERROR_MIN: 'Price must be at least €0.01',
      ERROR_MAX: 'Price cannot exceed €999,999.99',
    },
    STOCK: {
      MIN: 0,
      MAX: 999999,
      ERROR_MIN: 'Stock cannot be negative',
      ERROR_MAX: 'Stock cannot exceed 999,999 units',
    },
    CATEGORY: {
      MIN: 2,
      MAX: 200,
      ERROR_MIN: 'Category must be at least 2 characters',
      ERROR_MAX: 'Category cannot exceed 200 characters',
    },
    IMAGE_URL: {
      MAX: 1000,
      ERROR_MAX: 'Image URL cannot exceed 1000 characters',
    },
  },

  // Questions
  QUESTION: {
    CONTENT: {
      MIN: 5,
      MAX: 5000,
      ERROR_MIN: 'Question must be at least 5 characters',
      ERROR_MAX: 'Question cannot exceed 5000 characters',
    },
  },

  // Announcements
  ANNOUNCEMENT: {
    TITLE: {
      MIN: 3,
      MAX: 500,
      ERROR_MIN: 'Title must be at least 3 characters',
      ERROR_MAX: 'Title cannot exceed 500 characters',
    },
    CONTENT: {
      MIN: 5,
      MAX: 5000,
      ERROR_MIN: 'Content must be at least 5 characters',
      ERROR_MAX: 'Content cannot exceed 5000 characters',
    },
  },

  // Khutbahs
  KHUTBAH: {
    TITLE: {
      MIN: 5,
      MAX: 500,
      ERROR_MIN: 'Title must be at least 5 characters',
      ERROR_MAX: 'Title cannot exceed 500 characters',
    },
    SPEAKER: {
      MIN: 3,
      MAX: 300,
      ERROR_MIN: 'Speaker name must be at least 3 characters',
      ERROR_MAX: 'Speaker name cannot exceed 300 characters',
    },
    TOPICS: {
      MIN: 3,
      MAX: 500,
      ERROR_MIN: 'Topics must be at least 3 characters',
      ERROR_MAX: 'Topics cannot exceed 500 characters',
    },
  },

  // Ramadan Videos
  RAMADAN_VIDEO: {
    TITLE: {
      MIN: 3,
      MAX: 500,
      ERROR_MIN: 'Title must be at least 3 characters',
      ERROR_MAX: 'Title cannot exceed 500 characters',
    },
    IMAM: {
      MIN: 3,
      MAX: 300,
      ERROR_MIN: 'Imam name must be at least 3 characters',
      ERROR_MAX: 'Imam name cannot exceed 300 characters',
    },
    DURATION: {
      MIN: 1,
      MAX: 600,
      ERROR_MIN: 'Duration must be at least 1 minute',
      ERROR_MAX: 'Duration cannot exceed 600 minutes (10 hours)',
    },
  },

  // Zakat Calculator
  ZAKAT: {
    ASSETS: {
      MIN: 0,
      MAX: 999999999,
      ERROR_MIN: 'Asset value cannot be negative',
      ERROR_MAX: 'Asset value cannot exceed €999,999,999',
    },
  },

  // General Text Fields
  CONTACT_MESSAGE: {
    MIN: 5,
    MAX: 5000,
    ERROR_MIN: 'Message must be at least 5 characters',
    ERROR_MAX: 'Message cannot exceed 5000 characters',
  },

  NAME: {
    MIN: 2,
    MAX: 100,
    ERROR_MIN: 'Name must be at least 2 characters',
    ERROR_MAX: 'Name cannot exceed 100 characters',
  },

  EMAIL: {
    MAX: 255,
    ERROR_MAX: 'Email cannot exceed 255 characters',
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ERROR_PATTERN: 'Please enter a valid email address',
  },

  // File Uploads
  FILE: {
    MAX_SIZE_MB: 50,
    MAX_SIZE_BYTES: 50 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    ERROR_SIZE: 'File size cannot exceed 50MB',
    ERROR_TYPE: 'File type not allowed. Allowed types: JPEG, PNG, GIF, WebP, PDF',
  },
};

/**
 * Validation helper functions
 */

export const validateField = (value, limits) => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return 'Invalid input type';
  }

  const strValue = String(value).trim();

  // Check minimum length
  if (limits.MIN !== undefined && strValue.length < limits.MIN) {
    return limits.ERROR_MIN;
  }

  // Check maximum length
  if (limits.MAX !== undefined && strValue.length > limits.MAX) {
    return limits.ERROR_MAX;
  }

  // Check pattern if defined
  if (limits.PATTERN && !limits.PATTERN.test(strValue)) {
    return limits.ERROR_PATTERN;
  }

  return null; // No error
};

export const validateNumericField = (value, limits) => {
  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return 'Please enter a valid number';
  }

  // Check minimum value
  if (limits.MIN !== undefined && numValue < limits.MIN) {
    return limits.ERROR_MIN;
  }

  // Check maximum value
  if (limits.MAX !== undefined && numValue > limits.MAX) {
    return limits.ERROR_MAX;
  }

  return null; // No error
};

export const validateDonationAmount = (amount) => {
  return validateNumericField(amount, VALIDATION_LIMITS.DONATION);
};

export const validateCampaignTitle = (title) => {
  return validateField(title, VALIDATION_LIMITS.CAMPAIGN.TITLE);
};

export const validateCampaignDescription = (description) => {
  return validateField(description, VALIDATION_LIMITS.CAMPAIGN.DESCRIPTION);
};

export const validateCampaignGoalAmount = (amount) => {
  return validateNumericField(amount, VALIDATION_LIMITS.CAMPAIGN.GOAL_AMOUNT);
};

export const validateProductName = (name) => {
  return validateField(name, VALIDATION_LIMITS.PRODUCT.NAME);
};

export const validateProductPrice = (price) => {
  return validateNumericField(price, VALIDATION_LIMITS.PRODUCT.PRICE);
};

export const validateEmail = (email) => {
  return validateField(email, VALIDATION_LIMITS.EMAIL);
};

export const validateQuestion = (question) => {
  return validateField(question, VALIDATION_LIMITS.QUESTION.CONTENT);
};

export const validateFileSize = (file) => {
  if (file.size > VALIDATION_LIMITS.FILE.MAX_SIZE_BYTES) {
    return VALIDATION_LIMITS.FILE.ERROR_SIZE;
  }
  return null;
};

export const validateFileType = (file) => {
  if (!VALIDATION_LIMITS.FILE.ALLOWED_TYPES.includes(file.type)) {
    return VALIDATION_LIMITS.FILE.ERROR_TYPE;
  }
  return null;
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 5000); // Max 5000 characters after sanitization
};

export const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '€0.00';
  return `€${num.toFixed(2)}`;
};
