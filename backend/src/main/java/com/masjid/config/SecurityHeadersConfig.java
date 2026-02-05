package com.masjid.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@Slf4j
public class SecurityHeadersConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SecurityHeaderInterceptor());
    }

    public static class SecurityHeaderInterceptor implements HandlerInterceptor {

        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
            // Prevent clickjacking
            response.setHeader("X-Frame-Options", "DENY");
            
            // Prevent MIME type sniffing
            response.setHeader("X-Content-Type-Options", "nosniff");
            
            // Enable XSS protection
            response.setHeader("X-XSS-Protection", "1; mode=block");
            
            // Prevent referrer leakage
            response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            
            // Content Security Policy
            response.setHeader("Content-Security-Policy", 
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' https://js.stripe.com; " +
                "style-src 'self' 'unsafe-inline'; " +
                "font-src 'self' data:; " +
                "img-src 'self' data: https: https://img.youtube.com; " +
                "connect-src 'self' https://api.stripe.com https://api.aladhan.com https://muslimsalat.com; " +
                "frame-src https://js.stripe.com https://www.youtube-nocookie.com; " +
                "base-uri 'self'; " +
                "form-action 'self'");
            
            // Permissions Policy
            response.setHeader("Permissions-Policy", 
                "geolocation=(), microphone=(), camera=(), payment=(self \"https://js.stripe.com\")");
            
            // HSTS (only in production)
            String profile = System.getenv("SPRING_PROFILES_ACTIVE");
            if ("prod".equals(profile)) {
                response.setHeader("Strict-Transport-Security", 
                    "max-age=31536000; includeSubDomains; preload");
            }
            
            return true;
        }
    }
}
