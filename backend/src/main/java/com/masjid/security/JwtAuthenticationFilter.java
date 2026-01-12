package com.masjid.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        // Skip JWT processing for public endpoints
        String path = request.getRequestURI();
        
        logger.info("=== JWT Filter Debug ===");
        logger.info("Path: " + path);
        logger.info("Method: " + request.getMethod());
        
        if (path.startsWith("/api/auth/") || 
            path.startsWith("/api/public/") ||
            path.startsWith("/api/prayer-times/") ||
            path.startsWith("/api/products") ||
            path.startsWith("/api/subscribers") ||
            path.startsWith("/api/donations/create") ||
            path.startsWith("/api/donations/webhook") ||
            path.startsWith("/api/orders/create") ||
            path.startsWith("/api/khutbahs/public/")) {
            logger.info("Public endpoint, skipping JWT");
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            String jwt = getJwtFromRequest(request);
            logger.info("JWT present: " + (jwt != null && !jwt.isEmpty()));
            
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String username = tokenProvider.getUsernameFromJWT(jwt);
                logger.info("JWT valid, username: " + username);
                
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                logger.info("User authorities: " + userDetails.getAuthorities());
                
                UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.info("Authentication set successfully");
            } else {
                logger.warn("JWT validation failed or not present");
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }
        
        filterChain.doFilter(request, response);
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/") || 
               path.startsWith("/api/public/") ||
               path.startsWith("/api/prayer-times/") ||
               path.startsWith("/api/products") ||
               path.startsWith("/api/subscribers") ||
               path.startsWith("/api/donations/create") ||
               path.startsWith("/api/donations/webhook") ||
               path.startsWith("/api/orders/create") ||
               path.startsWith("/api/khutbahs/public/");
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
