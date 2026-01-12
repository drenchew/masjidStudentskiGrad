package com.masjid.repository;

import com.masjid.model.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByDonorEmailOrderByCreatedAtDesc(String email);
    List<Donation> findByTypeAndActiveTrueOrderByCreatedAtDesc(Donation.DonationType type);
    
    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.type = 'ONE_TIME'")
    BigDecimal getTotalOneTimeDonations();
    
    @Query("SELECT COUNT(d) FROM Donation d WHERE d.type = 'RECURRING' AND d.active = true")
    Long getActiveSubscriptionCount();
}
