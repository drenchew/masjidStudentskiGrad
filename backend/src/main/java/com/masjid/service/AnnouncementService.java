package com.masjid.service;

import com.masjid.model.Announcement;
import com.masjid.model.Subscriber;
import com.masjid.repository.AnnouncementRepository;
import com.masjid.repository.SubscriberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnnouncementService {
    
    private final AnnouncementRepository announcementRepository;
    private final SubscriberRepository subscriberRepository;
    private final EmailService emailService;
    
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }
    
    public List<Announcement> getActiveAnnouncements() {
        return announcementRepository.findByActiveTrueOrderByCreatedAtDesc();
    }
    
    public Announcement getAnnouncementById(Long id) {
        return announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found with id: " + id));
    }
    
    @Transactional
    public Announcement createAnnouncement(Announcement announcement) {
        Announcement saved = announcementRepository.save(announcement);
        
        // Send email if requested
        if (announcement.getSendEmail() && !announcement.getEmailSent()) {
            try {
                // Get all verified subscribers
                List<Subscriber> subscribers = subscriberRepository.findByActiveTrueAndVerifiedTrue();
                
                if (!subscribers.isEmpty()) {
                    // Send to each subscriber in their preferred language
                    for (Subscriber subscriber : subscribers) {
                        String subject = switch (subscriber.getPreferredLanguage()) {
                            case BG -> announcement.getTitleBg() != null && !announcement.getTitleBg().isEmpty() 
                                ? announcement.getTitleBg() : announcement.getTitleEn();
                            case AR -> announcement.getTitleAr() != null && !announcement.getTitleAr().isEmpty() 
                                ? announcement.getTitleAr() : announcement.getTitleEn();
                            default -> announcement.getTitleEn();
                        };
                        
                        String content = switch (subscriber.getPreferredLanguage()) {
                            case BG -> announcement.getContentBg() != null && !announcement.getContentBg().isEmpty() 
                                ? announcement.getContentBg() : announcement.getContentEn();
                            case AR -> announcement.getContentAr() != null && !announcement.getContentAr().isEmpty() 
                                ? announcement.getContentAr() : announcement.getContentEn();
                            default -> announcement.getContentEn();
                        };
                        
                        emailService.sendAnnouncementToSubscribers(
                            java.util.List.of(subscriber.getEmail()),
                            subject,
                            content
                        );
                    }
                    
                    saved.setEmailSent(true);
                    announcementRepository.save(saved);
                }
            } catch (Exception e) {
                // Log error but don't fail the creation
                log.error("Failed to send announcement emails", e);
            }
        }
        
        return saved;
    }
    
    @Transactional
    public Announcement updateAnnouncement(Long id, Announcement announcement) {
        Announcement existing = getAnnouncementById(id);
        
        existing.setTitleEn(announcement.getTitleEn());
        existing.setTitleBg(announcement.getTitleBg());
        existing.setTitleAr(announcement.getTitleAr());
        existing.setContentEn(announcement.getContentEn());
        existing.setContentBg(announcement.getContentBg());
        existing.setContentAr(announcement.getContentAr());
        existing.setActive(announcement.getActive());
        
        return announcementRepository.save(existing);
    }
    
    @Transactional
    public Announcement toggleActive(Long id, boolean active) {
        Announcement announcement = getAnnouncementById(id);
        announcement.setActive(active);
        return announcementRepository.save(announcement);
    }
    
    @Transactional
    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }
}
