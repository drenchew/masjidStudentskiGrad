package com.masjid;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MasjidApplication {

    public static void main(String[] args) {
        SpringApplication.run(MasjidApplication.class, args);
    }
}
