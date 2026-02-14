package com.masjid.controller;

import com.masjid.dto.QuestionRequest;
import com.masjid.model.Question;
import com.masjid.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {
    
    private final QuestionService questionService;
    
    @PostMapping
    public ResponseEntity<?> submitQuestion(@Valid @RequestBody QuestionRequest request) {
        try {
            // Sanitize input
            String sanitizedText = request.getQuestionText().trim()
                    .replaceAll("<[^>]*>", "")
                    .replaceAll("[<>\"';]", "");
            
            Question question = questionService.submitQuestion(sanitizedText);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Question submitted successfully",
                    "id", question.getId()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Question>> getPublicQuestions() {
        return ResponseEntity.ok(questionService.getPublicQuestions());
    }
    
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnansweredCount() {
        return ResponseEntity.ok(Map.of("unanswered", questionService.getUnansweredCount()));
    }
}
