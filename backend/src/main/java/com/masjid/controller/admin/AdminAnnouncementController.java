package com.masjid.controller.admin;

import com.masjid.model.Announcement;
import com.masjid.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/announcements")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnnouncementController {
    
    private final AnnouncementService announcementService;
    
    @GetMapping
    public ResponseEntity<List<Announcement>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Announcement> getAnnouncementById(@PathVariable Long id) {
        return ResponseEntity.ok(announcementService.getAnnouncementById(id));
    }
    
    @PostMapping
    public ResponseEntity<Announcement> createAnnouncement(@RequestBody Announcement announcement) {
        return ResponseEntity.ok(announcementService.createAnnouncement(announcement));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Announcement> updateAnnouncement(
            @PathVariable Long id, 
            @RequestBody Announcement announcement) {
        return ResponseEntity.ok(announcementService.updateAnnouncement(id, announcement));
    }
    
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Announcement> toggleActive(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        Boolean active = body.get("active");
        return ResponseEntity.ok(announcementService.toggleActive(id, active));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok(Map.of("message", "Announcement deleted successfully"));
    }
}
