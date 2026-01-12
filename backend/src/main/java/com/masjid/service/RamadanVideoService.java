package com.masjid.service;

import com.masjid.model.RamadanVideo;
import com.masjid.repository.RamadanVideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RamadanVideoService {
    
    private final RamadanVideoRepository ramadanVideoRepository;
    
    public List<RamadanVideo> getAllVideos() {
        return ramadanVideoRepository.findAllByOrderByDateDesc();
    }
    
    public RamadanVideo getVideoById(Long id) {
        return ramadanVideoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ramadan video not found with id: " + id));
    }
    
    @Transactional
    public RamadanVideo createVideo(RamadanVideo video) {
        return ramadanVideoRepository.save(video);
    }
    
    @Transactional
    public RamadanVideo updateVideo(Long id, RamadanVideo video) {
        RamadanVideo existing = getVideoById(id);
        
        existing.setTitleEn(video.getTitleEn());
        existing.setTitleBg(video.getTitleBg());
        existing.setTitleAr(video.getTitleAr());
        existing.setDate(video.getDate());
        existing.setImam(video.getImam());
        existing.setDuration(video.getDuration());
        existing.setVideoUrl(video.getVideoUrl());
        existing.setThumbnail(video.getThumbnail());
        
        return ramadanVideoRepository.save(existing);
    }
    
    @Transactional
    public void deleteVideo(Long id) {
        ramadanVideoRepository.deleteById(id);
    }
}
