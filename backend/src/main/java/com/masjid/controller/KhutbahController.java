package com.masjid.controller;

import com.masjid.model.Khutbah;
import com.masjid.service.KhutbahService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/khutbahs")
@RequiredArgsConstructor
public class KhutbahController {
    
    private final KhutbahService khutbahService;
    
    @GetMapping("/public")
    public ResponseEntity<List<Khutbah>> getAllActiveKhutbahs() {
        return ResponseEntity.ok(khutbahService.getAllActiveKhutbahs());
    }
    
    @GetMapping("/public/{id}")
    public ResponseEntity<Khutbah> getKhutbahById(@PathVariable Long id) {
        return ResponseEntity.ok(khutbahService.getKhutbahById(id));
    }
    
    @GetMapping("/public/featured")
    public ResponseEntity<List<Khutbah>> getFeaturedKhutbahs() {
        return ResponseEntity.ok(khutbahService.getFeaturedKhutbahs());
    }
}
