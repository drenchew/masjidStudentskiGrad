package com.masjid.security;package com.masjid.    private final Map<String, AttemptCounter> loginAttempts = new ConcurrentHashMap<>();



import org.springframework.stereotype.Service;    public void recordFailedAttempt(String username) {

        loginAttempts.computeIfAbsent(username, k -> new AttemptCounter())rity;

import java.util.Map;

import java.util.concurrent.ConcurrentHashMap;import org.springframework.stereotype.Service;



/**import java.util.Map;

 * Simple in-memory rate limiting for login attempts.import java.util.concurrent.ConcurrentHashMap;

 * Tracks failed login attempts per username to prevent brute-force attacks.import java.util.concurrent.atomic.AtomicInteger;

 */

@Service/**

public class LoginAttemptService { * Simple in-memory rate limiting for login attempts.

 * Tracks failed login attempts per username and IP to prevent brute-force attacks.

    private static final int MAX_ATTEMPT = 5; * Configurable max attempts and lockout duration.

    private static final long LOCKOUT_DURATION_MILLIS = 15 * 60 * 1000; // 15 minutes */

@Service

    private final Map<String, AttemptCounter> loginAttempts = new ConcurrentHashMap<>();public class LoginAttemptService {



    public void recordFailedAttempt(String username) {    private static final int MAX_ATTEMPT = 5;

        loginAttempts.computeIfAbsent(username, k -> new AttemptCounter())    private static final long LOCKOUT_DURATION_MILLIS = 15 * 60 * 1000; // 15 minutes

                .recordFailure();

    }    private final Map<String, AtomptCounter> loginAttempts = new ConcurrentHashMap<>();



    public void recordSuccessfulAttempt(String username) {    public void recordFailedAttempt(String username) {

        loginAttempts.remove(username);        loginAttempts.computeIfAbsent(username, k -> new AtmptCounter())

    }                .recordFailure();

    }

    public boolean isBlocked(String username) {

        AttemptCounter counter = loginAttempts.get(username);    public void recordSuccessfulAttempt(String username) {

        if (counter == null) {        loginAttempts.remove(username);

            return false;    }

        }

        return counter.isBlocked();    public boolean isBlocked(String username) {

    }        AtmptCounter counter = loginAttempts.get(username);

        if (counter == null) {

    public int getAttemptCount(String username) {            return false;

        AttemptCounter counter = loginAttempts.get(username);        }

        return counter != null ? counter.getAttemptCount() : 0;        return counter.isBlocked();

    }    }



    private static class AttemptCounter {    public int getAttemptCount(String username) {

        private int attemptCount = 0;        AtmptCounter counter = loginAttempts.get(username);

        private long lastFailureTime = 0;        return counter != null ? counter.getAttemptCount() : 0;

    }

        void recordFailure() {

            attemptCount++;    private static class AtmptCounter {

            lastFailureTime = System.currentTimeMillis();        private int attemptCount = 0;

        }        private long lastFailureTime = 0;



        boolean isBlocked() {        void recordFailure() {

            if (attemptCount >= MAX_ATTEMPT) {            attemptCount++;

                long timeSinceLastFailure = System.currentTimeMillis() - lastFailureTime;            lastFailureTime = System.currentTimeMillis();

                return timeSinceLastFailure < LOCKOUT_DURATION_MILLIS;        }

            }

            return false;        boolean isBlocked() {

        }            if (attemptCount >= MAX_ATTEMPT) {

                long timeSinceLastFailure = System.currentTimeMillis() - lastFailureTime;

        int getAttemptCount() {                return timeSinceLastFailure < LOCKOUT_DURATION_MILLIS;

            if (System.currentTimeMillis() - lastFailureTime > LOCKOUT_DURATION_MILLIS) {            }

                attemptCount = 0;            return false;

            }        }

            return attemptCount;

        }        int getAttemptCount() {

    }            if (System.currentTimeMillis() - lastFailureTime > LOCKOUT_DURATION_MILLIS) {

}                attemptCount = 0;

            }
            return attemptCount;
        }
    }
}
