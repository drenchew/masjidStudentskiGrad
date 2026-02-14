package com.masjid.controller;

import com.masjid.dto.LoginRequest;
import com.masjid.dto.JwtResponse;
import com.masjid.security.JwtTokenProvider;
import com.masjid.service.LoginAttemptService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final LoginAttemptService loginAttemptService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String username = loginRequest.getUsername();
        String ipAddress = getClientIP(request);
        String loginKey = username + "_" + ipAddress;
        
        // Check if account is blocked due to too many failed attempts
        if (loginAttemptService.isBlocked(loginKey)) {
            log.warn("Login attempt blocked for user: {} from IP: {}", username, ipAddress);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Too many failed login attempts");
            error.put("message", "Account temporarily locked. Please try again in 15 minutes.");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(error);
        }
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            username,
                            loginRequest.getPassword()
                    )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtTokenProvider.generateToken(authentication);
            
            // Clear failed attempts on successful login
            loginAttemptService.loginSucceeded(loginKey);
            
            log.info("Successful login for user: {} from IP: {}", username, ipAddress);
            return ResponseEntity.ok(new JwtResponse(jwt, "Bearer"));
            
        } catch (BadCredentialsException e) {
            // Record failed attempt
            loginAttemptService.loginFailed(loginKey);
            int remainingAttempts = loginAttemptService.getRemainingAttempts(loginKey);
            
            log.warn("Failed login attempt for user: {} from IP: {} ({} attempts remaining)", 
                    username, ipAddress, remainingAttempts);
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Invalid credentials");
            error.put("message", "Invalid username or password");
            error.put("remainingAttempts", remainingAttempts);
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
    
    /**
     * Get client IP address (handles proxies)
     */
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        // Only trust the first IP in the chain (client IP)
        String clientIp = xfHeader.split(",")[0].trim();
        // Basic validation to prevent log injection
        if (clientIp.matches("^[0-9a-fA-F.:]+$")) {
            return clientIp;
        }
        return request.getRemoteAddr();
    }
}
