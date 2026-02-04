package com.masjid.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service to prevent brute force attacks by tracking login attempts
 */
@Service
@Slf4j
public class LoginAttemptService {
    
    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCKOUT_DURATION_MINUTES = 15;
    
    // Store failed attempts: key = username/IP, value = attempt data
    private final Map<String, LoginAttemptData> attemptCache = new ConcurrentHashMap<>();
    
    /**
     * Record a failed login attempt
     */
    public void loginFailed(String key) {
        LoginAttemptData data = attemptCache.getOrDefault(key, new LoginAttemptData());
        data.incrementAttempts();
        attemptCache.put(key, data);
        
        log.warn("Failed login attempt for: {} (Attempt {}/{})", key, data.getAttempts(), MAX_ATTEMPTS);
        
        if (data.getAttempts() >= MAX_ATTEMPTS) {
            log.error("Account locked due to too many failed attempts: {}", key);
        }
    }
    
    /**
     * Clear attempts on successful login
     */
    public void loginSucceeded(String key) {
        attemptCache.remove(key);
        log.info("Successful login for: {}, attempts cleared", key);
    }
    
    /**
     * Check if the user/IP is currently blocked
     */
    public boolean isBlocked(String key) {
        LoginAttemptData data = attemptCache.get(key);
        
        if (data == null) {
            return false;
        }
        
        // Check if lockout has expired
        if (data.isLockoutExpired(LOCKOUT_DURATION_MINUTES)) {
            attemptCache.remove(key);
            log.info("Lockout expired for: {}", key);
            return false;
        }
        
        // Blocked if max attempts reached
        boolean blocked = data.getAttempts() >= MAX_ATTEMPTS;
        
        if (blocked) {
            long minutesRemaining = ChronoUnit.MINUTES.between(LocalDateTime.now(), data.getLockoutExpiry(LOCKOUT_DURATION_MINUTES));
            log.warn("Login blocked for: {} ({} minutes remaining)", key, minutesRemaining);
        }
        
        return blocked;
    }
    
    /**
     * Get remaining attempts before lockout
     */
    public int getRemainingAttempts(String key) {
        LoginAttemptData data = attemptCache.get(key);
        if (data == null) {
            return MAX_ATTEMPTS;
        }
        return Math.max(0, MAX_ATTEMPTS - data.getAttempts());
    }
    
    /**
     * Clean up old entries (call periodically)
     */
    public void cleanupExpiredEntries() {
        attemptCache.entrySet().removeIf(entry -> 
            entry.getValue().isLockoutExpired(LOCKOUT_DURATION_MINUTES)
        );
    }
    
    /**
     * Internal class to track login attempt data
     */
    private static class LoginAttemptData {
        private int attempts = 0;
        private LocalDateTime lastAttempt;
        
        public void incrementAttempts() {
            attempts++;
            lastAttempt = LocalDateTime.now();
        }
        
        public int getAttempts() {
            return attempts;
        }
        
        public boolean isLockoutExpired(int lockoutMinutes) {
            if (lastAttempt == null) {
                return true;
            }
            return ChronoUnit.MINUTES.between(lastAttempt, LocalDateTime.now()) >= lockoutMinutes;
        }
        
        public LocalDateTime getLockoutExpiry(int lockoutMinutes) {
            if (lastAttempt == null) {
                return LocalDateTime.now();
            }
            return lastAttempt.plusMinutes(lockoutMinutes);
        }
    }
}
