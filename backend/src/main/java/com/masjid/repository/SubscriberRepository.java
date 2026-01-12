package com.masjid.repository;

import com.masjid.model.Subscriber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriberRepository extends JpaRepository<Subscriber, Long> {
    Optional<Subscriber> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<Subscriber> findByActiveTrueAndVerifiedTrue();
    List<Subscriber> findByPreferredLanguageAndActiveTrueAndVerifiedTrue(Subscriber.Language language);
    Optional<Subscriber> findByVerificationToken(String token);
}
