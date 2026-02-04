package com.masjid.controller.admin;

import com.masjid.model.FundraisingCampaign;
import com.masjid.service.FundraisingCampaignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/campaigns")
@PreAuthorize("hasRole('ADMIN')")
public class AdminFundraisingController {
    
    @Autowired
    private FundraisingCampaignService campaignService;
    
    @GetMapping
    public ResponseEntity<List<FundraisingCampaign>> getAllCampaigns() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }
    
    @PostMapping
    public ResponseEntity<FundraisingCampaign> createCampaign(@RequestBody FundraisingCampaign campaign) {
        return ResponseEntity.ok(campaignService.createCampaign(campaign));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<FundraisingCampaign> updateCampaign(
            @PathVariable Long id,
            @RequestBody FundraisingCampaign campaign) {
        return ResponseEntity.ok(campaignService.updateCampaign(id, campaign));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable Long id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.ok().build();
    }
}
