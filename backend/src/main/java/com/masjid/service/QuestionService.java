package com.masjid.service;

import com.masjid.model.Question;
import com.masjid.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {
    
    private final QuestionRepository questionRepository;
    
    // Public methods
    @Transactional
    public Question submitQuestion(String questionText) {
        if (questionText == null || questionText.trim().isEmpty()) {
            throw new IllegalArgumentException("Question text cannot be empty");
        }
        
        Question question = new Question();
        question.setQuestionText(questionText.trim());
        question.setIsAnswered(false);
        question.setIsVisible(true);
        question.setIsHidden(false);
        
        return questionRepository.save(question);
    }
    
    public List<Question> getPublicQuestions() {
        return questionRepository.findByIsVisibleTrueAndIsHiddenFalseAndIsAnsweredTrueOrderByAnsweredAtDesc();
    }
    
    public Long getUnansweredCount() {
        return questionRepository.countByIsAnsweredFalse();
    }
    
    // Admin methods
    public List<Question> getAllQuestions() {
        return questionRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public List<Question> getUnansweredQuestions() {
        return questionRepository.findByIsAnsweredFalseOrderByCreatedAtAsc();
    }
    
    public List<Question> getAnsweredQuestions() {
        return questionRepository.findByIsAnsweredTrueOrderByAnsweredAtDesc();
    }
    
    public List<Question> getHiddenQuestions() {
        return questionRepository.findByIsHiddenTrueOrderByCreatedAtDesc();
    }
    
    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
    }
    
    @Transactional
    public Question answerQuestion(Long id, String answerText, Boolean isVisible) {
        Question question = getQuestionById(id);
        
        if (answerText == null || answerText.trim().isEmpty()) {
            throw new IllegalArgumentException("Answer text cannot be empty");
        }
        
        question.setAnswerText(answerText.trim());
        question.setIsAnswered(true);
        question.setAnsweredAt(LocalDateTime.now());
        
        if (isVisible != null) {
            question.setIsVisible(isVisible);
        }
        
        return questionRepository.save(question);
    }
    
    @Transactional
    public Question updateAnswer(Long id, String answerText, Boolean isVisible) {
        Question question = getQuestionById(id);
        
        if (!question.getIsAnswered()) {
            throw new IllegalStateException("Question has not been answered yet");
        }
        
        if (answerText != null && !answerText.trim().isEmpty()) {
            question.setAnswerText(answerText.trim());
            question.setAnsweredAt(LocalDateTime.now());
        }
        
        if (isVisible != null) {
            question.setIsVisible(isVisible);
        }
        
        return questionRepository.save(question);
    }
    
    @Transactional
    public Question hideQuestion(Long id) {
        Question question = getQuestionById(id);
        question.setIsHidden(true);
        question.setIsVisible(false);
        return questionRepository.save(question);
    }
    
    @Transactional
    public Question unhideQuestion(Long id) {
        Question question = getQuestionById(id);
        question.setIsHidden(false);
        question.setIsVisible(true);
        return questionRepository.save(question);
    }
    
    @Transactional
    public Question toggleVisibility(Long id) {
        Question question = getQuestionById(id);
        question.setIsVisible(!question.getIsVisible());
        return questionRepository.save(question);
    }
    
    @Transactional
    public void deleteQuestion(Long id) {
        Question question = getQuestionById(id);
        questionRepository.delete(question);
    }
}
