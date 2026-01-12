-- Create fundraising_campaigns table
CREATE TABLE IF NOT EXISTS fundraising_campaigns (
    id BIGSERIAL PRIMARY KEY,
    title_en VARCHAR(255) NOT NULL,
    title_bg VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    description_en TEXT NOT NULL,
    description_bg TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    goal_amount DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    image_url VARCHAR(500),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX idx_campaigns_active ON fundraising_campaigns(active);
CREATE INDEX idx_campaigns_featured ON fundraising_campaigns(featured, active);

-- Insert sample campaigns
INSERT INTO fundraising_campaigns (
    title_en, title_bg, title_ar,
    description_en, description_bg, description_ar,
    goal_amount, current_amount,
    image_url, start_date, end_date,
    active, featured
) VALUES 
(
    'Mosque Renovation Project',
    'Проект за ремонт на джамията',
    'مشروع تجديد المسجد',
    'Help us renovate and modernize our mosque facilities to better serve our growing community. The renovation includes prayer hall upgrades, new carpets, improved lighting, and accessibility features.',
    'Помогнете ни да обновим и модернизираме съоръженията на нашата джамия, за да обслужваме по-добре нашата растяща общност. Ремонтът включва подобрения на молитвената зала, нови килими, подобрено осветление и функции за достъпност.',
    'ساعدونا في تجديد وتحديث مرافق مسجدنا لخدمة مجتمعنا المتنامي بشكل أفضل. يشمل التجديد تحسينات في قاعة الصلاة، وسجاد جديد، وإضاءة محسنة، وميزات إمكانية الوصول.',
    50000.00,
    12500.00,
    'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '90 days',
    true,
    true
),
(
    'Islamic School Equipment',
    'Оборудване за ислямско училище',
    'معدات المدرسة الإسلامية',
    'Purchase essential equipment and learning materials for our weekend Islamic school. This includes books, tablets, chairs, tables, and educational resources for students of all ages.',
    'Закупуване на основно оборудване и учебни материали за нашето уикенд ислямско училище. Това включва книги, таблети, столове, маси и образователни ресурси за ученици от всички възрасти.',
    'شراء المعدات الأساسية والمواد التعليمية لمدرستنا الإسلامية في نهاية الأسبوع. ويشمل ذلك الكتب والأجهزة اللوحية والكراسي والطاولات والموارد التعليمية للطلاب من جميع الأعمار.',
    15000.00,
    8750.00,
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    CURRENT_TIMESTAMP - INTERVAL '30 days',
    CURRENT_TIMESTAMP + INTERVAL '60 days',
    true,
    true
),
(
    'Community Food Bank',
    'Обществена банка за храни',
    'بنك الطعام المجتمعي',
    'Establish a food bank to support families in need within our community. Your donations will help provide essential groceries and meals to those facing hardship.',
    'Създаване на банка за храни за подкрепа на нуждаещи се семейства в нашата общност. Вашите дарения ще помогнат за осигуряване на основни хранителни продукти и храна за тези, които изпитват трудности.',
    'إنشاء بنك للطعام لدعم الأسر المحتاجة في مجتمعنا. ستساعد تبرعاتكم في توفير البقالة الأساسية والوجبات لمن يواجهون الصعوبات.',
    10000.00,
    4200.00,
    'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=800',
    CURRENT_TIMESTAMP - INTERVAL '15 days',
    CURRENT_TIMESTAMP + INTERVAL '120 days',
    true,
    false
);

-- Grant permissions (adjust role name if needed)
-- GRANT ALL PRIVILEGES ON fundraising_campaigns TO your_db_user;
