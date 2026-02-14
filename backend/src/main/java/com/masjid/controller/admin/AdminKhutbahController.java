package com.masjid.controller.admin;

import com.masjid.model.Khutbah;
import com.masjid.service.KhutbahService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/khutbahs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminKhutbahController {
    
    private final KhutbahService khutbahService;
    
    @GetMapping
    public ResponseEntity<List<Khutbah>> getAllKhutbahs() {
        return ResponseEntity.ok(khutbahService.getAllActiveKhutbahs());
    }
    
    @PostMapping
    public ResponseEntity<Khutbah> createKhutbah(@RequestBody Khutbah khutbah) {
        return ResponseEntity.ok(khutbahService.createKhutbah(khutbah));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Khutbah> updateKhutbah(@PathVariable Long id, @RequestBody Khutbah khutbah) {
        return ResponseEntity.ok(khutbahService.updateKhutbah(id, khutbah));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteKhutbah(@PathVariable Long id) {
        khutbahService.deleteKhutbah(id);
        return ResponseEntity.ok(Map.of("message", "Khutbah deleted successfully"));
    }
    
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {
        try {
            String fileUrl = khutbahService.uploadFile(file, type);
            return ResponseEntity.ok(Map.of("fileUrl", fileUrl));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "File upload failed"));
        }
    }
}
