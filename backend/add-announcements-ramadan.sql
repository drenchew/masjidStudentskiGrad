-- Add Ramadan Videos table
CREATE TABLE IF NOT EXISTS ramadan_videos (
    id BIGSERIAL PRIMARY KEY,
    title_en VARCHAR(255) NOT NULL,
    title_bg VARCHAR(255),
    title_ar VARCHAR(255),
    date DATE NOT NULL,
    imam VARCHAR(255) NOT NULL,
    duration VARCHAR(50),
    video_url VARCHAR(500) NOT NULL,
    thumbnail VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster date-based queries
CREATE INDEX idx_ramadan_videos_date ON ramadan_videos(date DESC);

-- Note: Announcements table should already exist from previous migrations
-- If not, here's the schema:
CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    title_en VARCHAR(255) NOT NULL,
    title_bg VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    content_en TEXT NOT NULL,
    content_bg TEXT NOT NULL,
    content_ar TEXT NOT NULL,
    send_email BOOLEAN DEFAULT FALSE,
    email_sent BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster active announcements queries
CREATE INDEX idx_announcements_active_created ON announcements(active, created_at DESC);

-- Sample Ramadan video (optional)
INSERT INTO ramadan_videos (title_en, title_bg, title_ar, date, imam, duration, video_url, thumbnail)
VALUES 
    ('Taraweeh Night 1 - Ramadan 1447', 
     'Таравих Нощ 1 - Рамадан 1447', 
     'صلاة التراويح الليلة 1 - رمضان 1447',
     '2026-03-01',
     'Sheikh Ahmed',
     '45:30',
     'https://youtube.com/watch?v=example1',
     'https://via.placeholder.com/400x225/006B3F/FFFFFF?text=Taraweeh+Night+1');

-- Sample announcement (optional)
INSERT INTO announcements (title_en, title_bg, title_ar, content_en, content_bg, content_ar, active)
VALUES 
    ('Welcome to Our New Website',
     'Добре дошли в нашия нов уебсайт',
     'مرحبا بكم في موقعنا الجديد',
     'We are pleased to announce the launch of our new mosque website. You can now access prayer times, khutbahs, and much more online.',
     'Имаме удоволствието да обявим стартирането на новия уебсайт на нашата джамия. Вече можете да достъпвате времена за молитва, проповеди и много повече онлайн.',
     'يسعدنا أن نعلن عن إطلاق موقعنا الإلكتروني الجديد للمسجد. يمكنك الآن الوصول إلى أوقات الصلاة والخطب وأكثر من ذلك عبر الإنترنت.',
     true);
