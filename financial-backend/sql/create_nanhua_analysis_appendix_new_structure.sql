-- 使用finance数据库
USE finance;

-- 创建南华分析附表（应收账款）新结构表
-- 支持设备、元件、工程三个板块的数据存储

-- 如果表已存在，先备份数据然后删除旧表
DROP TABLE IF EXISTS nanhua_analysis_appendix_backup;
CREATE TABLE IF NOT EXISTS nanhua_analysis_appendix_backup AS SELECT * FROM nanhua_analysis_appendix;

-- 删除旧表
DROP TABLE IF EXISTS nanhua_analysis_appendix;

-- 创建新表
CREATE TABLE nanhua_analysis_appendix (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间，格式为YYYY-MM',
    data JSON NOT NULL COMMENT '表单数据，包含设备、元件、工程三个板块的详细信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_period (period),
    INDEX idx_period (period),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='南华分析附表（应收账款情况）';

-- JSON数据结构示例注释：
/*
data字段存储的JSON结构示例：
[
  {
    "customerType": "设备外服",
    "initialBalance": "0.00",
    "newInvoice": "100.00",
    "totalNewInvoice": "300.00",
    "currentReceipt": "50.00",
    "totalReceipt": "150.00", 
    "currentBalance": "150.00",
    "segment": "设备"
  },
  {
    "customerType": "一包项目",
    "initialBalance": "1.08",
    "newInvoice": "200.00",
    "totalNewInvoice": "500.00",
    "currentReceipt": "100.00",
    "totalReceipt": "200.00",
    "currentBalance": "301.08",
    "segment": "工程"
  }
]
*/ 