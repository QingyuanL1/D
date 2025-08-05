-- 创建南华公司和拓源公司的财务报表表结构
-- 完全复制原有的三个财务报表表结构，只改变表名前缀

USE finance;

-- ========================================
-- 南华公司财务报表表
-- ========================================

-- 南华资产负债表
CREATE TABLE `nanhua_balance_sheet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` date NOT NULL,
  `data` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 南华现金流量表
CREATE TABLE `nanhua_cash_flow` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` date NOT NULL,
  `data` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 南华利润表
CREATE TABLE `nanhua_income_statement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` date NOT NULL,
  `data` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 拓源公司财务报表表
-- ========================================

-- 拓源资产负债表
CREATE TABLE `tuoyuan_balance_sheet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` date NOT NULL,
  `data` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 拓源现金流量表
CREATE TABLE `tuoyuan_cash_flow` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` date NOT NULL,
  `data` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 拓源利润表
CREATE TABLE `tuoyuan_income_statement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` date NOT NULL,
  `data` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 在 form_modules 表中添加相应模块
-- ========================================

-- 南华公司财务报表模块
INSERT INTO form_modules (module_name, module_key, module_category, route_path, description, display_order) VALUES
('南华资产负债表', 'nanhua_balance_sheet', '财务', '/shanghai-nanhua-lanling-industry/balance-sheet', '南华公司资产负债状况', 101),
('南华现金流量表', 'nanhua_cash_flow', '财务', '/shanghai-nanhua-lanling-industry/cash-flow', '南华公司现金流入流出情况', 102),
('南华利润表', 'nanhua_income_statement', '财务', '/shanghai-nanhua-lanling-industry/income-statement', '南华公司收入支出和利润情况', 103);

-- 拓源公司财务报表模块
INSERT INTO form_modules (module_name, module_key, module_category, route_path, description, display_order) VALUES
('拓源资产负债表', 'tuoyuan_balance_sheet', '财务', '/changzhou-tuoyuan-electric/balance-sheet', '拓源公司资产负债状况', 201),
('拓源现金流量表', 'tuoyuan_cash_flow', '财务', '/changzhou-tuoyuan-electric/cash-flow', '拓源公司现金流入流出情况', 202),
('拓源利润表', 'tuoyuan_income_statement', '财务', '/changzhou-tuoyuan-electric/income-statement', '拓源公司收入支出和利润情况', 203);

-- 显示创建结果
SELECT 'Tables created successfully' as status;
SELECT 'Modules added successfully' as status;
