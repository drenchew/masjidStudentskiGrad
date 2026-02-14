-- Create Prayer Time Cache table for efficient full-year caching
-- This table caches prayer times for the entire year to avoid repeated API calls

CREATE TABLE IF NOT EXISTS prayer_time_cache (
    id BIGSERIAL PRIMARY KEY,
    prayer_date DATE NOT NULL UNIQUE,
    fajr VARCHAR(10) NOT NULL,
    sunrise VARCHAR(10) NOT NULL,
    dhuhr VARCHAR(10) NOT NULL,
    asr VARCHAR(10) NOT NULL,
    maghrib VARCHAR(10) NOT NULL,
    isha VARCHAR(10) NOT NULL,
    hijri_date VARCHAR(50),
    source VARCHAR(20),
    cached_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_prayer_date UNIQUE (prayer_date)
);

-- Create index for fast date lookups
CREATE INDEX idx_prayer_date ON prayer_time_cache (prayer_date);

-- Add comment to table
COMMENT ON TABLE prayer_time_cache IS 'Caches prayer times for the entire year to reduce external API calls. Fetched once on startup and refreshed daily for today/tomorrow.';
COMMENT ON COLUMN prayer_time_cache.prayer_date IS 'The date for which these prayer times apply (unique key)';
COMMENT ON COLUMN prayer_time_cache.cached_at IS 'When these prayer times were cached/fetched';
COMMENT ON COLUMN prayer_time_cache.source IS 'Which API provided these times (islamicapi, aladhan, etc.)';
