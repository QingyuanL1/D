-- 创建拓源成本中心结构表
CREATE TABLE IF NOT EXISTS tuoyuan_cost_center_structure (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period VARCHAR(7) NOT NULL COMMENT '期间，格式：YYYY-MM',
  customer_name VARCHAR(100) NOT NULL COMMENT '客户名称',
  category ENUM('engineering', 'nonMainBusiness') NOT NULL COMMENT '类别：engineering=设备/其他, nonMainBusiness=非主营业务',
  yearly_planned_income DECIMAL(15,2) DEFAULT 0 COMMENT '年度计划收入（万元）',
  marketing DECIMAL(15,2) DEFAULT 0 COMMENT '营销费用（万元）',
  management DECIMAL(15,2) DEFAULT 0 COMMENT '管理费用（万元）',
  finance DECIMAL(15,2) DEFAULT 0 COMMENT '财务费用（万元）',
  production DECIMAL(15,2) DEFAULT 0 COMMENT '生产费用（万元）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_period_customer_category (period, customer_name, category),
  INDEX idx_period (period),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='拓源成本中心结构表';

-- 插入拓源成本中心结构的初始数据（设备板块）
INSERT INTO tuoyuan_cost_center_structure (period, customer_name, category, yearly_planned_income, marketing, management, finance, production) VALUES
-- 设备板块 - 电业项目
('2025-01', '电业项目', 'engineering', 0, 0, 0, 0, 0),
-- 设备板块 - 用户项目  
('2025-01', '用户项目', 'engineering', 0, 0, 0, 0, 0),
-- 设备板块 - 贸易
('2025-01', '贸易', 'engineering', 0, 0, 0, 0, 0),
-- 设备板块 - 代理设备
('2025-01', '代理设备', 'engineering', 0, 0, 0, 0, 0),
-- 其他板块 - 代理工程
('2025-01', '代理工程', 'engineering', 0, 0, 0, 0, 0),
-- 其他板块 - 代理设计
('2025-01', '代理设计', 'engineering', 0, 0, 0, 0, 0),
-- 非主营业务
('2025-01', '存货盘盈', 'nonMainBusiness', 0, 0, 0, 0, 0),
('2025-01', '利息收入', 'nonMainBusiness', 0, 0, 0, 0, 0)
ON DUPLICATE KEY UPDATE
yearly_planned_income = VALUES(yearly_planned_income),
marketing = VALUES(marketing),
management = VALUES(management),
finance = VALUES(finance),
production = VALUES(production),
updated_at = CURRENT_TIMESTAMP;
