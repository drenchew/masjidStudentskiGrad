package com.masjid.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Simple rate limiting filter to prevent abuse of public endpoints.
 * Limits requests per IP address within a sliding time window.
 */
@Component
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {
    
    // Tiered rate limits
    private static final int SENSITIVE_RATE_LIMIT = 10;      // 10/min for write operations (subscribe, donate, login)
    private static final int MODERATE_RATE_LIMIT = 100;      // 100/min for normal GET endpoints
    private static final long WINDOW_MS = 60_000; // 1 minute
    
    private final Map<String, RateLimitBucket> moderateBuckets = new ConcurrentHashMap<>();
    private final Map<String, RateLimitBucket> sensitiveBuckets = new ConcurrentHashMap<>();
    
    // Cleanup old entries every 5 minutes
    private final AtomicLong lastCleanup = new AtomicLong(System.currentTimeMillis());
    private static final long CLEANUP_INTERVAL_MS = 300_000; // 5 minutes
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String clientIp = getClientIp(request);
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // Skip rate limiting for OPTIONS (CORS preflight)
        if ("OPTIONS".equals(method)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Tier 1: Completely skip rate limiting for high-frequency cached read-only endpoints
        boolean isCachedEndpoint = "GET".equals(method) && (
            path.startsWith("/api/prayer-times") || 
            path.startsWith("/api/announcements") ||
            path.startsWith("/api/khutbahs") ||
            path.startsWith("/api/products") ||
            path.startsWith("/api/campaigns") ||
            path.startsWith("/api/ramadan-videos") ||
            path.startsWith("/api/settings/public") ||
            path.equals("/api/health-check") || 
            path.startsWith("/actuator/health"));
        
        if (isCachedEndpoint) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Periodic cleanup
        long now = System.currentTimeMillis();
        if (now - lastCleanup.get() > CLEANUP_INTERVAL_MS) {
            if (lastCleanup.compareAndSet(lastCleanup.get(), now)) {
                cleanup();
            }
        }
        
        // Check if this is a sensitive endpoint (POST to public write endpoints)
        boolean isSensitive = "POST".equals(method) && (
                path.startsWith("/api/subscribers") ||
                path.startsWith("/api/donations") ||
                path.startsWith("/api/questions") ||
                path.startsWith("/api/orders") ||
                path.startsWith("/api/auth/login")
        );
        
        // Tier 2: Sensitive write endpoints - 10/min
        if (isSensitive) {
            if (!checkRate(sensitiveBuckets, clientIp, SENSITIVE_RATE_LIMIT)) {
                log.warn("Sensitive rate limit exceeded for IP: {} on path: {}", clientIp, path);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
                return;
            }
        }
        
        // Tier 3: All other endpoints (admin, other GET/POST) - 100/min
        if (!checkRate(moderateBuckets, clientIp, MODERATE_RATE_LIMIT)) {
            log.warn("Moderate rate limit exceeded for IP: {} on path: {}", clientIp, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
            return;
        }
        
        filterChain.doFilter(request, response);
    }
    
    private boolean checkRate(Map<String, RateLimitBucket> buckets, String key, int limit) {
        RateLimitBucket bucket = buckets.computeIfAbsent(key, k -> new RateLimitBucket());
        return bucket.tryConsume(limit);
    }
    
    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            String ip = xfHeader.split(",")[0].trim();
            if (ip.matches("^[0-9a-fA-F.:]+$")) {
                return ip;
            }
        }
        return request.getRemoteAddr();
    }
    
    private void cleanup() {
        long expiry = System.currentTimeMillis() - WINDOW_MS * 2;
        moderateBuckets.entrySet().removeIf(e -> e.getValue().lastAccess.get() < expiry);
        sensitiveBuckets.entrySet().removeIf(e -> e.getValue().lastAccess.get() < expiry);
    }
    
    private static class RateLimitBucket {
        private final AtomicInteger count = new AtomicInteger(0);
        private final AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());
        final AtomicLong lastAccess = new AtomicLong(System.currentTimeMillis());
        
        boolean tryConsume(int limit) {
            long now = System.currentTimeMillis();
            lastAccess.set(now);
            
            // Reset window if expired
            if (now - windowStart.get() > WINDOW_MS) {
                count.set(0);
                windowStart.set(now);
            }
            
            return count.incrementAndGet() <= limit;
        }
    }
}
