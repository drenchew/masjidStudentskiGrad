package com.masjid.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {
    
    @Value("${app.jwt.secret:#{null}}")
    private String jwtSecret;
    
    @Value("${app.jwt.expiration:86400000}")
    private long jwtExpiration;
    
    @PostConstruct
    public void validateJwtSecret() {
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            log.error("JWT_SECRET is not configured! This is a critical security issue.");
            throw new IllegalStateException(
                "JWT_SECRET must be set in environment variables! " +
                "Generate a secure secret with: openssl rand -base64 64"
            );
        }
        
        if (jwtSecret.length() < 32) {
            log.error("JWT_SECRET is too short ({} characters). Minimum 32 characters required.", jwtSecret.length());
            throw new IllegalStateException(
                "JWT_SECRET must be at least 32 characters long for security! " +
                "Generate a secure secret with: openssl rand -base64 64"
            );
        }
        
        // Warn if using a default/weak secret
        if (jwtSecret.contains("Default") || jwtSecret.contains("Change") || jwtSecret.equals("secret")) {
            log.error("JWT_SECRET appears to be a default/weak value. This is insecure!");
            throw new IllegalStateException(
                "JWT_SECRET must not be a default value! " +
                "Generate a secure secret with: openssl rand -base64 64"
            );
        }
        
        log.info("JWT configuration validated successfully. Token expiration: {} ms", jwtExpiration);
    }
    
    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }
    
    public String getUsernameFromJWT(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        
        return claims.getSubject();
    }
    
    public boolean validateToken(String authToken) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            Jwts.parser().verifyWith(key).build().parseSignedClaims(authToken);
            return true;
        } catch (SecurityException ex) {
            log.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty");
        }
        return false;
    }
}
