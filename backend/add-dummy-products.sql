-- Add dummy products for testing

INSERT INTO products (name_en, name_bg, name_ar, description_en, description_bg, description_ar, price, stock, image_url, category, created_at, updated_at)
VALUES 
    ('Quran with Bulgarian Translation', 'Коран с български превод', 'القرآن مع ترجمة بلغارية', 
     'Beautiful Quran with Bulgarian translation and tafsir', 
     'Красив Коран с български превод и тафсир',
     'القرآن الكريم مع ترجمة وتفسير باللغة البلغارية',
     45.00, 20, 'https://images.unsplash.com/photo-1609599006353-e12de61d5c5f?w=400', 'BOOKS', NOW(), NOW()),
    
    ('Prayer Mat - Green', 'Молитвен килим - Зелен', 'سجادة صلاة - خضراء',
     'High quality prayer mat with compass',
     'Висококачествен молитвен килим с компас',
     'سجادة صلاة عالية الجودة مع بوصلة',
     25.00, 15, 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=400', 'PRAYER_ITEMS', NOW(), NOW()),
    
    ('Tasbih - 99 Beads', 'Тасбих - 99 мъниста', 'مسبحة - 99 حبة',
     'Traditional wooden tasbih beads',
     'Традиционни дървени тасбих мъниста',
     'مسبحة خشبية تقليدية',
     15.00, 30, 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400', 'PRAYER_ITEMS', NOW(), NOW()),
    
    ('Islamic Wall Art - Ayatul Kursi', 'Ислямско изкуство за стена - Аятул Курси', 'فن إسلامي للحائط - آية الكرسي',
     'Beautiful calligraphy wall art',
     'Красиво калиграфско изкуство за стена',
     'لوحة خط جميلة للحائط',
     35.00, 10, 'https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=400', 'HOME_DECOR', NOW(), NOW()),
    
    ('Miswak Natural Toothbrush', 'Мисвак естествена четка за зъби', 'سواك طبيعي',
     'Traditional natural toothbrush',
     'Традиционна естествена четка за зъби',
     'سواك طبيعي تقليدي',
     5.00, 50, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400', 'PERSONAL_CARE', NOW(), NOW()),
    
    ('Islamic Books Bundle', 'Пакет ислямски книги', 'مجموعة كتب إسلامية',
     'Collection of essential Islamic books in Bulgarian',
     'Колекция от основни ислямски книги на български',
     'مجموعة من الكتب الإسلامية الأساسية بالبلغارية',
     80.00, 8, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400', 'BOOKS', NOW(), NOW()),
    
    ('Prayer Beads with Counter', 'Молитвени мъниста с брояч', 'مسبحة رقمية',
     'Digital tasbih counter with LED display',
     'Цифров тасбих брояч с LED дисплей',
     'عداد مسبحة رقمي مع شاشة LED',
     30.00, 12, 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=400', 'PRAYER_ITEMS', NOW(), NOW()),
    
    ('Hijab - Various Colors', 'Хиджаб - Различни цветове', 'حجاب - ألوان متنوعة',
     'High quality cotton hijab',
     'Висококачествен памучен хиджаб',
     'حجاب قطني عالي الجودة',
     20.00, 25, 'https://images.unsplash.com/photo-1583003870417-59853e2f3ef4?w=400', 'CLOTHING', NOW(), NOW());

-- Verify insertion
SELECT id, name_en, price, stock, category FROM products;
