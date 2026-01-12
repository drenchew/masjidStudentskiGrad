package com.masjid.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHasher {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    // changed to the user-requested admin password
    String password = "masjid123";
        String hash = encoder.encode(password);
        
        System.out.println("Password: " + password);
        System.out.println("BCrypt hash: " + hash);
        System.out.println();
        System.out.println("SQL to update admin:");
        System.out.println("UPDATE admins SET password = '" + hash + "' WHERE username = 'admin';");
    }
}
