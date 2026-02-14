package com.masjid.controller;

import com.masjid.model.Settings;
import com.masjid.service.SettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {
    
    private final SettingsService settingsService;
    
    @GetMapping
    public ResponseEntity<List<Settings>> getAllSettings() {
        return ResponseEntity.ok(settingsService.getAllSettings());
    }
    
    @GetMapping("/{key}")
    public ResponseEntity<String> getSetting(@PathVariable String key) {
        // Validate key format to prevent injection
        if (key == null || !key.matches("^[a-zA-Z0-9._-]{1,100}$")) {
            return ResponseEntity.badRequest().build();
        }
        String value = settingsService.getSetting(key, null);
        if (value == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(value);
    }
    
    @PutMapping("/{key}")
    public ResponseEntity<Settings> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> body) {
        // Validate key format
        if (key == null || !key.matches("^[a-zA-Z0-9._-]{1,100}$")) {
            return ResponseEntity.badRequest().build();
        }
        String value = body.get("value");
        String description = body.get("description");
        
        log.info("Updating setting: {}", key);
        Settings updated = settingsService.updateSetting(key, value, description);
        return ResponseEntity.ok(updated);
    }
    
    // Public endpoint to check if shop ordering is enabled
    @GetMapping("/public/shop-ordering-enabled")
    public ResponseEntity<Map<String, Boolean>> isShopOrderingEnabled() {
        boolean enabled = settingsService.getBooleanSetting("shop.ordering.enabled", true);
        return ResponseEntity.ok(Map.of("enabled", enabled));
    }
}
