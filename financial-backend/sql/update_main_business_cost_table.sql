-- 更新主营业务成本结构与质量表结构
-- 将表头从：板块、客户属性、年度计划、本年累计、计划执行进度、占主营收入比
-- 改为：板块、客户属性、计划执行率、当期材料费用、累计材料费用、当期人工费用、累计人工费用

USE finance;

-- 备份现有数据（可选）
CREATE TABLE IF NOT EXISTS main_business_cost_backup AS SELECT * FROM main_business_cost;

-- 删除现有表
DROP TABLE IF EXISTS main_business_cost;

-- 重新创建表结构
CREATE TABLE IF NOT EXISTS main_business_cost (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL,
    category ENUM('设备', '元件', '工程') NOT NULL,
    customer_type VARCHAR(100) NOT NULL,
    yearly_plan VARCHAR(50) DEFAULT '',
    plan_execution_rate VARCHAR(20) DEFAULT '',
    current_material_cost DECIMAL(15,2) DEFAULT 0.00,
    cumulative_material_cost DECIMAL(15,2) DEFAULT 0.00,
    current_labor_cost DECIMAL(15,2) DEFAULT 0.00,
    cumulative_labor_cost DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period),
    INDEX idx_category (category),
    INDEX idx_customer_type (customer_type)
);

-- 插入一些示例数据（基于图片中的结构）
INSERT INTO main_business_cost (period, category, customer_type, yearly_plan, plan_execution_rate, current_material_cost, cumulative_material_cost, current_labor_cost, cumulative_labor_cost) VALUES
-- 设备板块
('2025-01', '设备', '上海', '17398.82', '0.00%', 0.00, 0.00, 0.00, 0.00),
('2025-01', '设备', '国网', '6890.12', '0.00%', 0.00, 0.00, 0.00, 0.00),
('2025-01', '设备', '江苏', '3534.29', '0.00%', 0.00, 0.00, 0.00, 0.00),
('2025-01', '设备', '输配电内配', '/', '0.00%', 0.00, 0.00, 0.00, 0.00),
('2025-01', '设备', '西门子', '/', '0.00%', 0.00, 0.00, 0.00, 0.00),
('2025-01', '设备', '同业', '2828.35', '0.00%', 0.00, 0.00, 0.00, 0.00),
('2025-01', '设备', '用户', '0', '0.00%', 0.00, 0.00, 0.00, 0.00),
('2025-01', '设备', '其它', '0', '0.00%', 0.00, 0.00, 0.00, 0.00),
-- 元件板块
('2025-01', '元件', '用户', '0', '0.00%', 0.00, 0.00, 0.00, 0.00),
-- 工程板块
('2025-01', '工程', '一包', '0', '0.00%', 0.00, 0.00, 0.00, 0.00),
('2025-01', '工程', '二包', '0', '0.00%', 0.00, 0.00, 0.00, 0.00),
('2025-01', '工程', '域内合作', '0', '0.00%', 0.00, 0.00, 0.00, 0.00),
('2025-01', '工程', '域外合作', '0', '0.00%', 0.00, 0.00, 0.00, 0.00),
('2025-01', '工程', '其它', '0', '0.00%', 0.00, 0.00, 0.00, 0.00);
