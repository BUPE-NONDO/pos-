-- Update Products Table with Common Pharmacy Products and Images
-- Replace demo products with real pharmacy items

-- ============================================================================
-- CLEAR EXISTING SAMPLE DATA
-- ============================================================================

DELETE FROM public.products WHERE sku IN ('MED-001', 'MED-002', 'SUP-001', 'HYG-001', 'HYG-002');

-- ============================================================================
-- INSERT COMMON PHARMACY PRODUCTS WITH IMAGES
-- ============================================================================

INSERT INTO public.products (name, price, sku, category, stock_quantity, description, image, is_active) VALUES
    -- Pain Relief & Anti-inflammatory
    ('Paracetamol 500mg (100 tablets)', 45.00, 'PARA-500-100', 'Pain Relief', 250, 'Effective pain and fever relief', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop', true),
    ('Ibuprofen 400mg (30 tablets)', 65.00, 'IBU-400-30', 'Pain Relief', 180, 'Anti-inflammatory and pain reliever', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop', true),
    ('Aspirin 300mg (60 tablets)', 38.00, 'ASP-300-60', 'Pain Relief', 200, 'Analgesic and antiplatelet', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop', true),
    ('Diclofenac Gel 50g', 85.00, 'DICL-GEL-50', 'Topical', 120, 'Topical anti-inflammatory gel', 'https://images.unsplash.com/photo-1556228724-db29f351f8c4?w=400&h=400&fit=crop', true),
    
    -- Antibiotics
    ('Amoxicillin 500mg (21 caps)', 120.00, 'AMOX-500-21', 'Antibiotics', 150, 'Broad-spectrum antibiotic', 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop', true),
    ('Azithromycin 500mg (3 tabs)', 95.00, 'AZI-500-3', 'Antibiotics', 100, 'Macrolide antibiotic', 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop', true),
    ('Ciprofloxacin 500mg (10 tabs)', 110.00, 'CIPRO-500-10', 'Antibiotics', 90, 'Fluoroquinolone antibiotic', 'https://images.unsplash.com/photo-1603493952152-4d2b4d3c1e6d?w=400&h=400&fit=crop', true),
    
    -- Vitamins & Supplements
    ('Vitamin C 1000mg (60 tablets)', 125.00, 'VIT-C-1000-60', 'Vitamins', 300, 'Immune system support', 'https://images.unsplash.com/photo-1526328828355-69b01701ca6a?w=400&h=400&fit=crop', true),
    ('Multivitamin Complex (30 tabs)', 180.00, 'MULTI-VIT-30', 'Vitamins', 200, 'Complete daily vitamins', 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=400&fit=crop', true),
    ('Vitamin D3 5000IU (90 caps)', 145.00, 'VIT-D3-5000-90', 'Vitamins', 180, 'Bone health support', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop', true),
    ('Zinc 50mg (100 tablets)', 95.00, 'ZINC-50-100', 'Supplements', 220, 'Immune support mineral', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop', true),
    ('Omega-3 Fish Oil (60 caps)', 195.00, 'OMEGA3-60', 'Supplements', 150, 'Heart health support', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', true),
    
    -- Cold & Flu
    ('Loratadine 10mg (30 tablets)', 75.00, 'LORA-10-30', 'Antihistamine', 180, 'Non-drowsy allergy relief', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop', true),
    ('Cetirizine 10mg (30 tablets)', 68.00, 'CET-10-30', 'Antihistamine', 200, '24-hour allergy relief', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop', true),
    ('Cough Syrup 200ml', 85.00, 'COUGH-SYR-200', 'Cough & Cold', 140, 'Relieves cough and congestion', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop', true),
    
    -- Digestive Health
    ('Omeprazole 20mg (28 caps)', 110.00, 'OMEP-20-28', 'Digestive', 160, 'Acid reflux treatment', 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop', true),
    ('Loperamide 2mg (20 caps)', 45.00, 'LOPER-2-20', 'Digestive', 130, 'Diarrhea relief', 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop', true),
    ('Antacid Tablets (60 chewable)', 55.00, 'ANTACID-60', 'Digestive', 190, 'Fast heartburn relief', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop', true),
    
    -- First Aid & Hygiene
    ('Hand Sanitizer 500ml', 65.00, 'SANITIZER-500', 'Hygiene', 280, '70% alcohol hand sanitizer', 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&h=400&fit=crop', true),
    ('Face Masks (Box of 50)', 120.00, 'MASK-50', 'PPE', 200, '3-ply disposable face masks', 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400&h=400&fit=crop', true),
    ('Digital Thermometer', 145.00, 'THERMO-DIG-01', 'Medical Devices', 85, 'Fast accurate temperature', 'https://images.unsplash.com/photo-1584555684040-bad07cfb9089?w=400&h=400&fit=crop', true),
    ('First Aid Kit', 295.00, 'FIRSTAID-KIT-01', 'First Aid', 60, 'Complete emergency kit', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&h=400&fit=crop', true),
    ('Bandages Assorted (40 pack)', 45.00, 'BANDAGE-40', 'First Aid', 220, 'Various sizes sterile bandages', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop', true),
    ('Cotton Wool 500g', 38.00, 'COTTON-500', 'First Aid', 180, 'Absorbent medical cotton', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop', true),
    ('Antiseptic Solution 500ml', 75.00, 'ANTISEP-500', 'First Aid', 150, 'Wound cleaning solution', 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop', true),
    
    -- Blood Pressure & Heart
    ('Amlodipine 5mg (30 tablets)', 85.00, 'AMLOD-5-30', 'Cardiovascular', 140, 'Blood pressure medication', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop', true),
    ('Atenolol 50mg (30 tablets)', 95.00, 'ATEN-50-30', 'Cardiovascular', 120, 'Beta-blocker for hypertension', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop', true),
    
    -- Diabetes
    ('Metformin 500mg (60 tablets)', 125.00, 'METF-500-60', 'Diabetes', 160, 'Type 2 diabetes treatment', 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop', true),
    ('Glucometer Kit', 395.00, 'GLUCO-KIT-01', 'Medical Devices', 45, 'Blood glucose monitoring', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop', true),
    ('Test Strips (50 pack)', 285.00, 'TEST-STRIPS-50', 'Medical Devices', 80, 'Blood glucose test strips', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&h=400&fit=crop', true),
    
    -- Skin Care
    ('Hydrocortisone Cream 30g', 68.00, 'HYDRO-CREAM-30', 'Topical', 150, 'Anti-itch cream', 'https://images.unsplash.com/photo-1556228724-db29f351f8c4?w=400&h=400&fit=crop', true),
    ('Calamine Lotion 200ml', 55.00, 'CALAM-LOT-200', 'Topical', 130, 'Soothing skin lotion', 'https://images.unsplash.com/photo-1608181078548-76087bdaa8ce?w=400&h=400&fit=crop', true),
    ('Petroleum Jelly 100g', 42.00, 'PET-JELLY-100', 'Skin Care', 200, 'Moisturizing jelly', 'https://images.unsplash.com/photo-1556228724-db29f351f8c4?w=400&h=400&fit=crop', true)

ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    stock_quantity = EXCLUDED.stock_quantity,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.products IS 'Pharmacy product catalog with real medicines and healthcare items';

