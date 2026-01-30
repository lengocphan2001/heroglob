-- HeroGlob Database Initialization Script
-- Run this script to create all necessary tables

-- Use the database
USE heroglob1;

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS nft_rewards;
DROP TABLE IF EXISTS withdrawals;
DROP TABLE IF EXISTS payouts;
DROP TABLE IF EXISTS investments;
DROP TABLE IF EXISTS nfts;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS commissions;
DROP TABLE IF EXISTS referrals;
DROP TABLE IF EXISTS referral_codes;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS system_config;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    wallet_address VARCHAR(42) UNIQUE,
    hero_balance DECIMAL(20, 2) DEFAULT 0,
    usdt_balance DECIMAL(20, 2) DEFAULT 0,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    password_hash VARCHAR(255),
    referral_code VARCHAR(20) UNIQUE,
    referred_by_id INT,
    rank VARCHAR(20) DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_wallet (wallet_address),
    INDEX idx_email (email),
    INDEX idx_referral_code (referral_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hash_id VARCHAR(255) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    creator_handle VARCHAR(255),
    creator_avatar_url VARCHAR(500),
    price DECIMAL(18, 6) DEFAULT 0,
    price_usdt DECIMAL(18, 6) DEFAULT 0,
    price_hero DECIMAL(18, 6) DEFAULT 0,
    price_variant VARCHAR(50) DEFAULT 'both',
    token_type VARCHAR(50) DEFAULT 'both',
    category VARCHAR(255),
    category_id INT,
    is_featured BOOLEAN DEFAULT FALSE,
    live BOOLEAN DEFAULT TRUE,
    stock INT DEFAULT 0,
    daily_hero_reward DECIMAL(18, 6) DEFAULT 0,
    max_hero_reward DECIMAL(18, 6) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_id (category_id),
    INDEX idx_featured (is_featured),
    INDEX idx_live (live),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    token_type VARCHAR(10) NOT NULL,
    amount DECIMAL(18, 6) NOT NULL,
    tx_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_wallet (wallet_address),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create nfts table
CREATE TABLE nfts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    token_id VARCHAR(255),
    metadata_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create nft_rewards table
CREATE TABLE nft_rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nft_id INT NOT NULL,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    reward_amount DECIMAL(18, 6) NOT NULL,
    total_earned DECIMAL(18, 6) DEFAULT 0,
    reward_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nft_id (nft_id),
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_reward_date (reward_date),
    FOREIGN KEY (nft_id) REFERENCES nfts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create investments table
CREATE TABLE investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    amount DECIMAL(18, 6) NOT NULL,
    daily_return DECIMAL(18, 6) DEFAULT 0,
    total_earned DECIMAL(18, 6) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create payouts table
CREATE TABLE payouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    investment_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(18, 6) NOT NULL,
    payout_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_investment_id (investment_id),
    INDEX idx_user_id (user_id),
    INDEX idx_payout_date (payout_date),
    FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create referral_codes table
CREATE TABLE referral_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    uses INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create referrals table
CREATE TABLE referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id INT NOT NULL,
    referred_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_referrer_id (referrer_id),
    INDEX idx_referred_id (referred_id),
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create commissions table
CREATE TABLE commissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    from_user_id INT NOT NULL,
    amount DECIMAL(18, 6) NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_from_user_id (from_user_id),
    INDEX idx_type (type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create withdrawals table
CREATE TABLE withdrawals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount DECIMAL(20, 6) NOT NULL,
    token_type VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    tx_hash VARCHAR(255),
    reject_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_wallet (wallet_address),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create system_config table
CREATE TABLE system_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123)
INSERT INTO users (email, name, role, password_hash, wallet_address) VALUES
('admin@heroglobal.io.vn', 'Admin', 'admin', '$2b$10$rZ5YqJ5YqJ5YqJ5YqJ5YqOZQZ5YqJ5YqJ5YqJ5YqJ5YqJ5YqJ5Yq', NULL);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('NFT Collection', 'nft-collection', 'Digital collectibles and NFTs'),
('Investment', 'investment', 'Investment products'),
('Staking', 'staking', 'Staking opportunities');

-- Insert default system config
INSERT INTO system_config (config_key, config_value, description) VALUES
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('referral_commission_rate', '0.1', 'Referral commission rate (10%)'),
('min_withdrawal_amount', '10', 'Minimum withdrawal amount');

-- Show created tables
SHOW TABLES;

SELECT 'Database initialization completed successfully!' AS status;
