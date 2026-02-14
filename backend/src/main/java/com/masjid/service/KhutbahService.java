package com.masjid.service;

import com.masjid.model.Khutbah;
import com.masjid.repository.KhutbahRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KhutbahService {
    
    private final KhutbahRepository khutbahRepository;
    
    public List<Khutbah> getAllActiveKhutbahs() {
        return khutbahRepository.findByActiveTrueOrderByDeliveredDateDesc();
    }
    
    public List<Khutbah> getFeaturedKhutbahs() {
        return khutbahRepository.findByFeaturedTrueAndActiveTrueOrderByDeliveredDateDesc();
    }
    
    public Khutbah getKhutbahById(Long id) {
        return khutbahRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khutbah not found"));
    }
    
    public Khutbah createKhutbah(Khutbah khutbah) {
        return khutbahRepository.save(khutbah);
    }
    
    public Khutbah updateKhutbah(Long id, Khutbah khutbahDetails) {
        Khutbah khutbah = getKhutbahById(id);
        
        khutbah.setTitleEn(khutbahDetails.getTitleEn());
        khutbah.setTitleBg(khutbahDetails.getTitleBg());
        khutbah.setTitleAr(khutbahDetails.getTitleAr());
        khutbah.setDescriptionEn(khutbahDetails.getDescriptionEn());
        khutbah.setDescriptionBg(khutbahDetails.getDescriptionBg());
        khutbah.setDescriptionAr(khutbahDetails.getDescriptionAr());
        khutbah.setDeliveredDate(khutbahDetails.getDeliveredDate());
        khutbah.setSpeaker(khutbahDetails.getSpeaker());
        khutbah.setTopicEn(khutbahDetails.getTopicEn());
        khutbah.setTopicBg(khutbahDetails.getTopicBg());
        khutbah.setTopicAr(khutbahDetails.getTopicAr());
        khutbah.setFeatured(khutbahDetails.getFeatured());
        khutbah.setActive(khutbahDetails.getActive());
        
        if (khutbahDetails.getAudioUrl() != null) khutbah.setAudioUrl(khutbahDetails.getAudioUrl());
        if (khutbahDetails.getVideoUrl() != null) khutbah.setVideoUrl(khutbahDetails.getVideoUrl());
        if (khutbahDetails.getTranscriptPdfUrlEn() != null) khutbah.setTranscriptPdfUrlEn(khutbahDetails.getTranscriptPdfUrlEn());
        if (khutbahDetails.getTranscriptPdfUrlBg() != null) khutbah.setTranscriptPdfUrlBg(khutbahDetails.getTranscriptPdfUrlBg());
        if (khutbahDetails.getTranscriptPdfUrlAr() != null) khutbah.setTranscriptPdfUrlAr(khutbahDetails.getTranscriptPdfUrlAr());
        
        return khutbahRepository.save(khutbah);
    }
    
    public String uploadFile(MultipartFile file, String type) throws IOException {
        // Validate type parameter (prevent path traversal)
        if (type == null || !type.matches("^(audio|pdf|video)$")) {
            throw new IllegalArgumentException("Invalid file type. Must be audio, pdf, or video.");
        }
        
        // Validate file is not empty
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        // Validate file size (max 50MB for audio/video)
        long maxSize = 50 * 1024 * 1024; // 50MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 50MB");
        }
        
        // Validate MIME type
        String contentType = file.getContentType();
        java.util.Set<String> allowedTypes = java.util.Set.of(
            "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg",
            "video/mp4", "video/webm",
            "application/pdf"
        );
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("File type not allowed");
        }
        
        String uploadDir = "uploads/khutbahs/" + type + "/";
        Path uploadPath = Paths.get(uploadDir).normalize();
        
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Use UUID-only filename to prevent path traversal
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }
        // Validate extension
        java.util.Set<String> allowedExtensions = java.util.Set.of(".mp3", ".wav", ".ogg", ".mp4", ".webm", ".pdf");
        if (!allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException("File extension not allowed");
        }
        
        String filename = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(filename).normalize();
        
        // Ensure the file path is still within the upload directory
        if (!filePath.startsWith(uploadPath)) {
            throw new SecurityException("Invalid file path");
        }
        
        Files.copy(file.getInputStream(), filePath);
        
        return "/uploads/khutbahs/" + type + "/" + filename;
    }
    
    public void deleteKhutbah(Long id) {
        Khutbah khutbah = getKhutbahById(id);
        khutbah.setActive(false);
        khutbahRepository.save(khutbah);
    }
}
