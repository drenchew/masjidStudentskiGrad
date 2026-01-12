package com.masjid.repository;

import com.masjid.model.FundraisingCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FundraisingCampaignRepository extends JpaRepository<FundraisingCampaign, Long> {
    
    List<FundraisingCampaign> findByActiveTrue();
    
    List<FundraisingCampaign> findByActiveTrueOrderByCreatedAtDesc();
    
    List<FundraisingCampaign> findByFeaturedTrueAndActiveTrue();
}
