package com.masjid.controller;

import com.masjid.model.Product;
import com.masjid.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    
    private final ProductService productService;
    
    @GetMapping
    public ResponseEntity<List<Product>> getAllActiveProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        // Validate category format (alphanumeric, underscores, hyphens, max 50 chars)
        if (category == null || category.length() > 50 || !category.matches("^[a-zA-Z0-9_-]+$")) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }
}
