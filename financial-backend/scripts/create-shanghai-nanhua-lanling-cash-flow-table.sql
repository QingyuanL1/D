-- 上海南华兰陵实业有限公司现金流量表
CREATE TABLE IF NOT EXISTS shanghai_nanhua_lanling_cash_flow (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(7) NOT NULL COMMENT '期间(YYYY-MM格式)',
    data JSON NOT NULL COMMENT '现金流量表数据(JSON格式)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY unique_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='上海南华兰陵实业有限公司现金流量表';

-- 创建索引
CREATE INDEX idx_period ON shanghai_nanhua_lanling_cash_flow(period);
CREATE INDEX idx_created_at ON shanghai_nanhua_lanling_cash_flow(created_at);

-- 插入示例数据（2025-02期间）
INSERT INTO shanghai_nanhua_lanling_cash_flow (period, data) VALUES 
('2025-02', '{}') 
ON DUPLICATE KEY UPDATE data = VALUES(data); 