package com.masjid.controller.admin;

import com.masjid.model.RamadanVideo;
import com.masjid.service.RamadanVideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/ramadan-videos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminRamadanVideoController {
    
    private final RamadanVideoService ramadanVideoService;
    
    @GetMapping
    public ResponseEntity<List<RamadanVideo>> getAllVideos() {
        return ResponseEntity.ok(ramadanVideoService.getAllVideos());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RamadanVideo> getVideoById(@PathVariable Long id) {
        return ResponseEntity.ok(ramadanVideoService.getVideoById(id));
    }
    
    @PostMapping
    public ResponseEntity<RamadanVideo> createVideo(@RequestBody RamadanVideo video) {
        return ResponseEntity.ok(ramadanVideoService.createVideo(video));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<RamadanVideo> updateVideo(
            @PathVariable Long id, 
            @RequestBody RamadanVideo video) {
        return ResponseEntity.ok(ramadanVideoService.updateVideo(id, video));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteVideo(@PathVariable Long id) {
        ramadanVideoService.deleteVideo(id);
        return ResponseEntity.ok(Map.of("message", "Ramadan video deleted successfully"));
    }
}
