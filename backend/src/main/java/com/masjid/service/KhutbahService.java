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
        String uploadDir = "uploads/khutbahs/" + type + "/";
        Path uploadPath = Paths.get(uploadDir);
        
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);
        
        return "/uploads/khutbahs/" + type + "/" + filename;
    }
    
    public void deleteKhutbah(Long id) {
        Khutbah khutbah = getKhutbahById(id);
        khutbah.setActive(false);
        khutbahRepository.save(khutbah);
    }
}
