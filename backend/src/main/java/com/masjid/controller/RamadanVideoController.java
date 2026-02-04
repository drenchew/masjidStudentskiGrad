package com.masjid.controller;

import com.masjid.model.RamadanVideo;
import com.masjid.service.RamadanVideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ramadan-videos")
@RequiredArgsConstructor
public class RamadanVideoController {
    
    private final RamadanVideoService ramadanVideoService;
    
    @GetMapping
    public ResponseEntity<List<RamadanVideo>> getAllVideos() {
        return ResponseEntity.ok(ramadanVideoService.getAllVideos());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RamadanVideo> getVideoById(@PathVariable Long id) {
        return ResponseEntity.ok(ramadanVideoService.getVideoById(id));
    }
}
