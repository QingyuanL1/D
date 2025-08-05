CREATE TABLE new_order_changzhou (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    category VARCHAR(50) NOT NULL,
    area VARCHAR(50) NOT NULL,
    year_plan DECIMAL(10,2) DEFAULT 0,
    month_plan DECIMAL(10,2) DEFAULT 0,
    month_actual DECIMAL(10,2) DEFAULT 0,
    period_complete DECIMAL(10,2) DEFAULT 0,
    year_complete_rate VARCHAR(10),
    pre_bidding DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_period_category_area` (`period`, `category`, `area`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 