package com.masjid.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@Slf4j
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Generate or retrieve request ID (validate format if client-provided)
        String requestId = request.getHeader(REQUEST_ID_HEADER);
        if (requestId == null || requestId.isBlank() || requestId.length() > 50 
                || !requestId.matches("^[a-zA-Z0-9-]+$")) {
            requestId = UUID.randomUUID().toString();
        }
        
        // Add to response header for correlation
        response.addHeader(REQUEST_ID_HEADER, requestId);
        
        long startTime = System.currentTimeMillis();
        
        try {
            // Log incoming request
            log.debug("REQUEST [{}] {} {} from {}",
                    requestId,
                    request.getMethod(),
                    request.getRequestURI(),
                    request.getRemoteAddr()
            );
            
            filterChain.doFilter(request, response);
            
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            
            // Log outgoing response
            log.debug("RESPONSE [{}] {} {} - Status: {} - Duration: {}ms",
                    requestId,
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    duration
            );
        }
    }
}
