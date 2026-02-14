package com.masjid.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionRequest {
    
    @NotBlank(message = "Question text cannot be empty")
    @Size(min = 5, max = 5000, message = "Question must be between 5 and 5000 characters")
    private String questionText;
}
