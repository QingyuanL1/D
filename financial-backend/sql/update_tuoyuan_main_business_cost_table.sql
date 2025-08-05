-- 更新拓源主营业务成本表结构，使其与电气公司的列结构一致

-- 先备份现有数据（如果需要的话）
-- CREATE TABLE tuoyuan_main_business_cost_structure_quality_backup AS SELECT * FROM tuoyuan_main_business_cost_structure_quality;

-- 删除现有表
DROP TABLE IF EXISTS tuoyuan_main_business_cost_structure_quality;

-- 创建新的拓源主营业务成本表，与电气公司结构一致
CREATE TABLE tuoyuan_main_business_cost_structure_quality (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间 (YYYY-MM)',
    category VARCHAR(20) NOT NULL COMMENT '板块 (设备)',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源主营业务成本结构与质量表';

-- 插入拓源公司的基础数据模板（按新结构）
INSERT INTO tuoyuan_main_business_cost_structure_quality (period, category, customer_type, yearly_plan, plan_execution_rate, current_material_cost, cumulative_material_cost, current_labor_cost, cumulative_labor_cost) VALUES
-- 设备板块
('2024-01', '设备', '电业项目', 0, 0, 0, 0, 0, 0),
('2024-01', '设备', '用户项目', 0, 0, 0, 0, 0, 0),
('2024-01', '设备', '贸易', 0, 0, 0, 0, 0, 0),
('2024-01', '设备', '代理设备', 0, 0, 0, 0, 0, 0),
('2024-01', '设备', '代理工程', 0, 0, 0, 0, 0, 0),
('2024-01', '设备', '代理设计', 0, 0, 0, 0, 0, 0);

-- 添加2025年的模板数据
INSERT INTO tuoyuan_main_business_cost_structure_quality (period, category, customer_type, yearly_plan, plan_execution_rate, current_material_cost, cumulative_material_cost, current_labor_cost, cumulative_labor_cost) VALUES
-- 设备板块
('2025-01', '设备', '电业项目', 0, 0, 0, 0, 0, 0),
('2025-01', '设备', '用户项目', 0, 0, 0, 0, 0, 0),
('2025-01', '设备', '贸易', 0, 0, 0, 0, 0, 0),
('2025-01', '设备', '代理设备', 0, 0, 0, 0, 0, 0),
('2025-01', '设备', '代理工程', 0, 0, 0, 0, 0, 0),
('2025-01', '设备', '代理设计', 0, 0, 0, 0, 0, 0);

-- 确认表结构
DESCRIBE tuoyuan_main_business_cost_structure_quality; 