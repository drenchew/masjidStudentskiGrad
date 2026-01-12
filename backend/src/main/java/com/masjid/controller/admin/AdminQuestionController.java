package com.masjid.controller.admin;

import com.masjid.dto.AnswerRequest;
import com.masjid.model.Question;
import com.masjid.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/questions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuestionController {
    
    private final QuestionService questionService;
    
    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }
    
    @GetMapping("/unanswered")
    public ResponseEntity<List<Question>> getUnansweredQuestions() {
        return ResponseEntity.ok(questionService.getUnansweredQuestions());
    }
    
    @GetMapping("/answered")
    public ResponseEntity<List<Question>> getAnsweredQuestions() {
        return ResponseEntity.ok(questionService.getAnsweredQuestions());
    }
    
    @GetMapping("/hidden")
    public ResponseEntity<List<Question>> getHiddenQuestions() {
        return ResponseEntity.ok(questionService.getHiddenQuestions());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestionById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(questionService.getQuestionById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{id}/answer")
    public ResponseEntity<?> answerQuestion(
            @PathVariable Long id,
            @RequestBody AnswerRequest request) {
        try {
            Question question = questionService.answerQuestion(
                    id, 
                    request.getAnswerText(), 
                    request.getIsVisible()
            );
            return ResponseEntity.ok(question);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/answer")
    public ResponseEntity<?> updateAnswer(
            @PathVariable Long id,
            @RequestBody AnswerRequest request) {
        try {
            Question question = questionService.updateAnswer(
                    id, 
                    request.getAnswerText(), 
                    request.getIsVisible()
            );
            return ResponseEntity.ok(question);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/hide")
    public ResponseEntity<?> hideQuestion(@PathVariable Long id) {
        try {
            Question question = questionService.hideQuestion(id);
            return ResponseEntity.ok(question);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/unhide")
    public ResponseEntity<?> unhideQuestion(@PathVariable Long id) {
        try {
            Question question = questionService.unhideQuestion(id);
            return ResponseEntity.ok(question);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/toggle-visibility")
    public ResponseEntity<?> toggleVisibility(@PathVariable Long id) {
        try {
            Question question = questionService.toggleVisibility(id);
            return ResponseEntity.ok(question);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        try {
            questionService.deleteQuestion(id);
            return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
