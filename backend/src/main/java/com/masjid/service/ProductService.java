package com.masjid.service;

import com.masjid.model.Product;
import com.masjid.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    
    private final ProductRepository productRepository;
    
    @Value("${app.file-storage.upload-dir:./uploads}")
    private String uploadBaseDir;
    
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".jpg", ".jpeg", ".png", ".gif", ".webp"
    );
    
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for images
    
    public List<Product> getAllActiveProducts() {
        return productRepository.findByActiveTrue();
    }
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }
    
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndActiveTrue(category);
    }
    
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }
    
    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        
        product.setNameEn(productDetails.getNameEn());
        product.setNameBg(productDetails.getNameBg());
        product.setNameAr(productDetails.getNameAr());
        product.setDescriptionEn(productDetails.getDescriptionEn());
        product.setDescriptionBg(productDetails.getDescriptionBg());
        product.setDescriptionAr(productDetails.getDescriptionAr());
        product.setPrice(productDetails.getPrice());
        product.setStock(productDetails.getStock());
        product.setCategory(productDetails.getCategory());
        product.setActive(productDetails.getActive());
        
        if (productDetails.getImageUrl() != null) {
            product.setImageUrl(productDetails.getImageUrl());
        }
        
        return productRepository.save(product);
    }
    
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        product.setActive(false);
        productRepository.save(product);
    }
    
    public String uploadImage(MultipartFile file) throws IOException {
        // Validate file is not empty
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        
        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 10MB");
        }
        
        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Allowed: JPEG, PNG, GIF, WebP");
        }
        
        // Validate file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("File must have a name");
        }
        
        // Prevent path traversal attacks
        String sanitizedName = Paths.get(originalFilename).getFileName().toString();
        if (sanitizedName.contains("..") || sanitizedName.contains("/") || sanitizedName.contains("\\")) {
            throw new IllegalArgumentException("Invalid filename");
        }
        
        String extension = "";
        int dotIndex = sanitizedName.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = sanitizedName.substring(dotIndex).toLowerCase();
        }
        
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Invalid file extension. Allowed: .jpg, .jpeg, .png, .gif, .webp");
        }
        
        // Generate safe unique filename (no user-controlled parts)
        String filename = UUID.randomUUID().toString() + extension;
        
        String uploadDir = uploadBaseDir + "/products/";
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        Path filePath = uploadPath.resolve(filename).normalize();
        
        // Ensure the file path is still within the upload directory (prevent traversal)
        if (!filePath.startsWith(uploadPath)) {
            throw new IllegalArgumentException("Invalid file path detected");
        }
        
        Files.copy(file.getInputStream(), filePath);
        log.info("Product image uploaded: {}", filename);
        
        return "/uploads/products/" + filename;
    }
}
