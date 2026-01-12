package com.masjid.controller;

import com.masjid.model.FundraisingCampaign;
import com.masjid.service.FundraisingCampaignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@CrossOrigin(origins = "*")
public class FundraisingCampaignController {
    
    @Autowired
    private FundraisingCampaignService campaignService;
    
    @GetMapping
    public ResponseEntity<List<FundraisingCampaign>> getAllCampaigns() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<FundraisingCampaign>> getActiveCampaigns() {
        return ResponseEntity.ok(campaignService.getActiveCampaigns());
    }
    
    @GetMapping("/featured")
    public ResponseEntity<List<FundraisingCampaign>> getFeaturedCampaigns() {
        return ResponseEntity.ok(campaignService.getFeaturedCampaigns());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FundraisingCampaign> getCampaignById(@PathVariable Long id) {
        return campaignService.getCampaignById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
