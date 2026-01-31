package com.masjid.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter(
            @Value("${app.cors.allowed-origins:https://masjid-studentski-grad-pbnx.vercel.app}") String allowedOrigins) {
        CorsConfigurationSource source = new UrlBasedCorsConfigurationSource() {
            @Override
            public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                CorsConfiguration cc = new CorsConfiguration();
                
                // Parse allowed origins from environment variable
                List<String> origins = Arrays.asList(allowedOrigins.split(","));
                origins = origins.stream().map(String::trim).toList();
                
                cc.setAllowedOrigins(origins);
                cc.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
                cc.setAllowedHeaders(Arrays.asList("*"));
                cc.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Total-Count"));
                cc.setAllowCredentials(true);
                cc.setMaxAge(3600L);
                return cc;
            }
        };
        return new CorsFilter(source);
    }
}
