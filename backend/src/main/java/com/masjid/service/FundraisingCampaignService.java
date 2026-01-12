package com.masjid.service;

import com.masjid.model.FundraisingCampaign;
import com.masjid.repository.FundraisingCampaignRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FundraisingCampaignService {
    
    @Autowired
    private FundraisingCampaignRepository campaignRepository;
    
    public List<FundraisingCampaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }
    
    public List<FundraisingCampaign> getActiveCampaigns() {
        return campaignRepository.findByActiveTrueOrderByCreatedAtDesc();
    }
    
    public List<FundraisingCampaign> getFeaturedCampaigns() {
        return campaignRepository.findByFeaturedTrueAndActiveTrue();
    }
    
    public Optional<FundraisingCampaign> getCampaignById(Long id) {
        return campaignRepository.findById(id);
    }
    
    public FundraisingCampaign createCampaign(FundraisingCampaign campaign) {
        return campaignRepository.save(campaign);
    }
    
    public FundraisingCampaign updateCampaign(Long id, FundraisingCampaign campaignDetails) {
        FundraisingCampaign campaign = campaignRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Campaign not found with id: " + id));
        
        campaign.setTitleEn(campaignDetails.getTitleEn());
        campaign.setTitleBg(campaignDetails.getTitleBg());
        campaign.setTitleAr(campaignDetails.getTitleAr());
        campaign.setDescriptionEn(campaignDetails.getDescriptionEn());
        campaign.setDescriptionBg(campaignDetails.getDescriptionBg());
        campaign.setDescriptionAr(campaignDetails.getDescriptionAr());
        campaign.setGoalAmount(campaignDetails.getGoalAmount());
        campaign.setCurrentAmount(campaignDetails.getCurrentAmount());
        campaign.setImageUrl(campaignDetails.getImageUrl());
        campaign.setStartDate(campaignDetails.getStartDate());
        campaign.setEndDate(campaignDetails.getEndDate());
        campaign.setActive(campaignDetails.getActive());
        campaign.setFeatured(campaignDetails.getFeatured());
        
        return campaignRepository.save(campaign);
    }
    
    public void deleteCampaign(Long id) {
        campaignRepository.deleteById(id);
    }
}
