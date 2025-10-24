-- Krili Peer-to-Peer Rental Marketplace Database Schema
-- MySQL Database Setup Script
-- Created for the Krili rental platform

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20),
  profile_picture_url VARCHAR(500),
  bio TEXT,
  location VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  verification_status ENUM('unverified', 'verified', 'rejected') DEFAULT 'unverified',
  kyc_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  total_rentals_as_renter INT DEFAULT 0,
  total_rentals_as_owner INT DEFAULT 0,
  account_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_verification_status (verification_status),
  INDEX idx_kyc_status (kyc_status),
  INDEX idx_is_active (is_active)
);

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  image_url VARCHAR(500),
  parent_category_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_is_active (is_active)
);

-- ============================================
-- 3. ITEMS/LISTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  condition ENUM('like_new', 'good', 'fair', 'poor') DEFAULT 'good',
  daily_rental_price DECIMAL(10, 2) NOT NULL,
  weekly_rental_price DECIMAL(10, 2),
  monthly_rental_price DECIMAL(10, 2),
  security_deposit DECIMAL(10, 2),
  quantity_available INT DEFAULT 1,
  quantity_rented INT DEFAULT 0,
  location VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  listing_status ENUM('active', 'inactive', 'delisted', 'sold') DEFAULT 'active',
  item_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_item_reviews INT DEFAULT 0,
  total_times_rented INT DEFAULT 0,
  insurance_available BOOLEAN DEFAULT FALSE,
  insurance_price_per_day DECIMAL(10, 2),
  delivery_available BOOLEAN DEFAULT FALSE,
  delivery_price DECIMAL(10, 2),
  pickup_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_owner_id (owner_id),
  INDEX idx_category_id (category_id),
  INDEX idx_listing_status (listing_status),
  INDEX idx_city (city),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- 4. ITEM IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS item_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  INDEX idx_item_id (item_id),
  INDEX idx_is_primary (is_primary)
);

-- ============================================
-- 5. RENTALS/BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rentals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  renter_id INT NOT NULL,
  owner_id INT NOT NULL,
  rental_start_date DATE NOT NULL,
  rental_end_date DATE NOT NULL,
  rental_duration_days INT NOT NULL,
  daily_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  security_deposit DECIMAL(10, 2),
  insurance_price DECIMAL(10, 2),
  delivery_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2) NOT NULL,
  rental_status ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  pickup_location VARCHAR(255),
  delivery_location VARCHAR(255),
  notes TEXT,
  cancellation_reason VARCHAR(500),
  cancelled_by ENUM('renter', 'owner', 'admin'),
  cancelled_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT,
  FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_item_id (item_id),
  INDEX idx_renter_id (renter_id),
  INDEX idx_owner_id (owner_id),
  INDEX idx_rental_status (rental_status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_rental_start_date (rental_start_date)
);

-- ============================================
-- 6. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rental_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  reviewee_id INT NOT NULL,
  item_id INT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_type ENUM('item', 'user') DEFAULT 'item',
  title VARCHAR(255),
  comment TEXT,
  cleanliness_rating INT CHECK (cleanliness_rating IS NULL OR (cleanliness_rating >= 1 AND cleanliness_rating <= 5)),
  condition_rating INT CHECK (condition_rating IS NULL OR (condition_rating >= 1 AND condition_rating <= 5)),
  communication_rating INT CHECK (communication_rating IS NULL OR (communication_rating >= 1 AND communication_rating <= 5)),
  punctuality_rating INT CHECK (punctuality_rating IS NULL OR (punctuality_rating >= 1 AND punctuality_rating <= 5)),
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
  INDEX idx_rental_id (rental_id),
  INDEX idx_reviewer_id (reviewer_id),
  INDEX idx_reviewee_id (reviewee_id),
  INDEX idx_item_id (item_id),
  INDEX idx_rating (rating)
);

-- ============================================
-- 7. WISHLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wishlist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_item (user_id, item_id),
  INDEX idx_user_id (user_id),
  INDEX idx_item_id (item_id)
);

-- ============================================
-- 8. MESSAGES/CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  item_id INT,
  rental_id INT,
  last_message_text TEXT,
  last_message_at TIMESTAMP NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
  FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE SET NULL,
  INDEX idx_sender_id (sender_id),
  INDEX idx_receiver_id (receiver_id),
  INDEX idx_last_message_at (last_message_at)
);

-- ============================================
-- 9. MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  attachment_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_sender_id (sender_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- 10. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  message TEXT,
  related_item_id INT,
  related_rental_id INT,
  related_user_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  action_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_item_id) REFERENCES items(id) ON DELETE SET NULL,
  FOREIGN KEY (related_rental_id) REFERENCES rentals(id) ON DELETE SET NULL,
  FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- 11. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rental_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  transaction_id VARCHAR(255) UNIQUE,
  payment_gateway VARCHAR(50),
  payment_date TIMESTAMP NULL,
  refund_date TIMESTAMP NULL,
  refund_reason VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_rental_id (rental_id),
  INDEX idx_user_id (user_id),
  INDEX idx_payment_status (payment_status),
  INDEX idx_transaction_id (transaction_id)
);

-- ============================================
-- 12. DISPUTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS disputes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rental_id INT NOT NULL,
  reported_by_id INT NOT NULL,
  reported_against_id INT NOT NULL,
  dispute_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  dispute_status ENUM('open', 'in_review', 'resolved', 'closed') DEFAULT 'open',
  resolution TEXT,
  resolved_by_id INT,
  resolution_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_against_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_rental_id (rental_id),
  INDEX idx_dispute_status (dispute_status),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- 13. ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  role ENUM('admin', 'moderator', 'support') DEFAULT 'moderator',
  permissions JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
);

-- ============================================
-- 14. AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- 15. INSURANCE PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS insurance_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  coverage_amount DECIMAL(10, 2) NOT NULL,
  price_per_day DECIMAL(10, 2) NOT NULL,
  coverage_type VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_active (is_active)
);

-- ============================================
-- 16. RENTAL INSURANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rental_insurance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rental_id INT NOT NULL,
  insurance_plan_id INT NOT NULL,
  coverage_amount DECIMAL(10, 2),
  premium_paid DECIMAL(10, 2),
  claim_status ENUM('active', 'claimed', 'denied', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE,
  FOREIGN KEY (insurance_plan_id) REFERENCES insurance_plans(id) ON DELETE RESTRICT,
  INDEX idx_rental_id (rental_id),
  INDEX idx_claim_status (claim_status)
);

-- ============================================
-- 17. VERIFICATION DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS verification_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  document_url VARCHAR(500) NOT NULL,
  verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rejection_reason VARCHAR(500),
  verified_at TIMESTAMP NULL,
  verified_by_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by_id) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_verification_status (verification_status)
);

-- ============================================
-- 18. SAVED SEARCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_searches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  search_query VARCHAR(500),
  category_id INT,
  location VARCHAR(255),
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  search_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id)
);

-- ============================================
-- 19. PROMO CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS promo_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percentage', 'fixed_amount') DEFAULT 'percentage',
  discount_value DECIMAL(10, 2) NOT NULL,
  max_uses INT,
  current_uses INT DEFAULT 0,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_is_active (is_active)
);

-- ============================================
-- 20. PROMO CODE USAGE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  promo_code_id INT NOT NULL,
  rental_id INT NOT NULL,
  user_id INT NOT NULL,
  discount_amount DECIMAL(10, 2),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id) ON DELETE CASCADE,
  FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_promo_code_id (promo_code_id),
  INDEX idx_rental_id (rental_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_items_owner_status ON items(owner_id, listing_status);
CREATE INDEX idx_rentals_dates ON rentals(rental_start_date, rental_end_date);
CREATE INDEX idx_messages_conversation_read ON messages(conversation_id, is_read);
CREATE INDEX idx_reviews_item_rating ON reviews(item_id, rating);

-- ============================================
-- SAMPLE DATA (Optional - Comment out if not needed)
-- ============================================

-- Insert sample categories
INSERT INTO categories (name, slug, description, display_order) VALUES
('Tools & Equipment', 'tools-equipment', 'Power tools, hand tools, and equipment', 1),
('Electronics & Cameras', 'electronics-cameras', 'Cameras, laptops, and electronic devices', 2),
('Sports & Recreation', 'sports-recreation', 'Sports equipment and recreational gear', 3),
('Vehicles & Transportation', 'vehicles-transportation', 'Cars, bikes, and transportation', 4),
('Home & Garden', 'home-garden', 'Furniture, garden tools, and home items', 5),
('Party & Events', 'party-events', 'Party supplies and event equipment', 6);

-- ============================================
-- END OF DATABASE SCHEMA
-- ============================================
