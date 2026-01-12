package com.masjid.repository;

import com.masjid.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    // Public-facing: only visible and answered questions
    List<Question> findByIsVisibleTrueAndIsHiddenFalseAndIsAnsweredTrueOrderByAnsweredAtDesc();
    
    // Public-facing: count of unanswered questions
    Long countByIsAnsweredFalse();
    
    // Admin: all questions ordered by creation date
    List<Question> findAllByOrderByCreatedAtDesc();
    
    // Admin: unanswered questions
    List<Question> findByIsAnsweredFalseOrderByCreatedAtAsc();
    
    // Admin: answered questions
    List<Question> findByIsAnsweredTrueOrderByAnsweredAtDesc();
    
    // Admin: hidden questions
    List<Question> findByIsHiddenTrueOrderByCreatedAtDesc();
}
