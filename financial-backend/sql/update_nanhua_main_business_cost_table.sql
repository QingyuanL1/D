-- 更新南华主营业务成本表结构，使其与电气公司的列结构一致

-- 先备份现有数据（如果需要的话）
-- CREATE TABLE nanhua_main_business_cost_backup AS SELECT * FROM nanhua_main_business_cost;

-- 删除现有表
DROP TABLE IF EXISTS nanhua_main_business_cost;

-- 创建新的南华主营业务成本表，与电气公司结构一致
CREATE TABLE nanhua_main_business_cost (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间 (YYYY-MM)',
    category VARCHAR(20) NOT NULL COMMENT '板块 (设备/元件/工程)',
    customer_type VARCHAR(100) NOT NULL COMMENT '客户属性',
    yearly_plan DECIMAL(15,2) DEFAULT 0 COMMENT '年度计划',
    plan_execution_rate DECIMAL(5,2) DEFAULT 0 COMMENT '计划执行率',
    current_material_cost DECIMAL(15,2) DEFAULT 0 COMMENT '当期直接费用',
    cumulative_material_cost DECIMAL(15,2) DEFAULT 0 COMMENT '累计直接费用',
    current_labor_cost DECIMAL(15,2) DEFAULT 0 COMMENT '当期制造费用/间接成本',
    cumulative_labor_cost DECIMAL(15,2) DEFAULT 0 COMMENT '累计制造费用/间接成本',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_period (period),
    INDEX idx_category (category),
    INDEX idx_customer_type (customer_type),
    UNIQUE KEY unique_period_category_customer (period, category, customer_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='南华主营业务成本结构与质量表';

-- 插入南华公司的基础数据模板（按新结构）
INSERT INTO nanhua_main_business_cost (period, category, customer_type, yearly_plan, plan_execution_rate, current_material_cost, cumulative_material_cost, current_labor_cost, cumulative_labor_cost) VALUES
-- 设备板块
('2024-01', '设备', '一包项目', 4576.40, 0, 0, 0, 0, 0),
('2024-01', '设备', '二包项目', 2441.97, 0, 0, 0, 0, 0),
('2024-01', '设备', '域内合作项目', 3831.93, 0, 0, 0, 0, 0),
('2024-01', '设备', '域外合作项目', 2410.82, 0, 0, 0, 0, 0),

-- 元件板块
('2024-01', '元件', '新能源项目', 3098.65, 0, 0, 0, 0, 0),
('2024-01', '元件', '苏州项目', 707.15, 0, 0, 0, 0, 0),

-- 工程板块
('2024-01', '工程', '抢修项目', 183.74, 0, 0, 0, 0, 0),
('2024-01', '工程', '运检项目', 1070.12, 0, 0, 0, 0, 0),
('2024-01', '工程', '设备外服', 242.25, 0, 0, 0, 0, 0),
('2024-01', '工程', '派遣', 207.07, 0, 0, 0, 0, 0),
('2024-01', '工程', '自建项目', 0.00, 0, 0, 0, 0, 0);

-- 添加2025年的模板数据
INSERT INTO nanhua_main_business_cost (period, category, customer_type, yearly_plan, plan_execution_rate, current_material_cost, cumulative_material_cost, current_labor_cost, cumulative_labor_cost) VALUES
-- 设备板块
('2025-01', '设备', '一包项目', 4576.40, 0, 0, 0, 0, 0),
('2025-01', '设备', '二包项目', 2441.97, 0, 0, 0, 0, 0),
('2025-01', '设备', '域内合作项目', 3831.93, 0, 0, 0, 0, 0),
('2025-01', '设备', '域外合作项目', 2410.82, 0, 0, 0, 0, 0),

-- 元件板块
('2025-01', '元件', '新能源项目', 3098.65, 0, 0, 0, 0, 0),
('2025-01', '元件', '苏州项目', 707.15, 0, 0, 0, 0, 0),

-- 工程板块
('2025-01', '工程', '抢修项目', 183.74, 0, 0, 0, 0, 0),
('2025-01', '工程', '运检项目', 1070.12, 0, 0, 0, 0, 0),
('2025-01', '工程', '设备外服', 242.25, 0, 0, 0, 0, 0),
('2025-01', '工程', '派遣', 207.07, 0, 0, 0, 0, 0),
('2025-01', '工程', '自建项目', 0.00, 0, 0, 0, 0, 0);

-- 确认表结构
DESCRIBE nanhua_main_business_cost; 