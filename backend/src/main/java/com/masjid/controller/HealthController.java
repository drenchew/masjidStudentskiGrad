package com.masjid.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {
    
    @Value("${spring.datasource.url:NOT_SET}")
    private String databaseUrl;
    
    @Value("${app.frontend-url:NOT_SET}")
    private String frontendUrl;
    
    @GetMapping("/health-check")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", System.currentTimeMillis());
        health.put("message", "Application is running");
        return ResponseEntity.ok(health);
    }
    
    @GetMapping("/config-check")
    public ResponseEntity<Map<String, String>> configCheck() {
        Map<String, String> config = new HashMap<>();
        config.put("database_url_set", databaseUrl != null && !databaseUrl.equals("NOT_SET") ? "YES" : "NO");
        config.put("frontend_url_set", frontendUrl != null && !frontendUrl.equals("NOT_SET") ? "YES" : "NO");
        config.put("database_url_length", databaseUrl != null ? String.valueOf(databaseUrl.length()) : "0");
        return ResponseEntity.ok(config);
    }
}