-- 上海南华兰陵实业有限公司资产负债表
CREATE TABLE IF NOT EXISTS nanhua_balance_sheet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period VARCHAR(7) NOT NULL COMMENT '期间(YYYY-MM)',
  company_name VARCHAR(100) DEFAULT '上海南华兰陵实业有限公司' COMMENT '公司名称',
  unit VARCHAR(20) DEFAULT '元' COMMENT '金额单位',
  
  -- 流动资产
  current_assets JSON COMMENT '流动资产数据',
  noncurrent_longterm JSON COMMENT '一年内到期的长期债权投资等',
  current_assets_total_current DECIMAL(15,2) DEFAULT 0 COMMENT '流动资产合计-当期',
  current_assets_total_cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '流动资产合计-累计',
  
  -- 长期投资
  longterm_investment JSON COMMENT '长期投资数据',
  
  -- 固定资产
  fixed_assets JSON COMMENT '固定资产数据',
  fixed_assets_total_current DECIMAL(15,2) DEFAULT 0 COMMENT '固定资产合计-当期',
  fixed_assets_total_cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '固定资产合计-累计',
  
  -- 无形资产及其他资产
  intangible_assets JSON COMMENT '无形资产及其他资产数据',
  intangible_assets_total_current DECIMAL(15,2) DEFAULT 0 COMMENT '无形资产及其他资产合计-当期',
  intangible_assets_total_cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '无形资产及其他资产合计-累计',
  
  -- 递延税款借项
  deferred_tax_assets JSON COMMENT '递延税款借项数据',
  
  -- 资产总计
  assets_total_current DECIMAL(15,2) DEFAULT 0 COMMENT '资产总计-当期',
  assets_total_cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '资产总计-累计',
  
  -- 流动负债
  current_liabilities JSON COMMENT '流动负债数据',
  current_liabilities_total_current DECIMAL(15,2) DEFAULT 0 COMMENT '流动负债合计-当期',
  current_liabilities_total_cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '流动负债合计-累计',
  
  -- 长期负债
  longterm_liabilities JSON COMMENT '长期负债数据',
  longterm_liabilities_total_current DECIMAL(15,2) DEFAULT 0 COMMENT '长期负债合计-当期',
  longterm_liabilities_total_cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '长期负债合计-累计',
  
  -- 递延税款贷项
  deferred_tax_liabilities JSON COMMENT '递延税款贷项数据',
  
  -- 负债合计
  liabilities_total_current DECIMAL(15,2) DEFAULT 0 COMMENT '负债合计-当期',
  liabilities_total_cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '负债合计-累计',
  
  -- 所有者权益
  equity_items JSON COMMENT '所有者权益项目数据',
  equity_total_current DECIMAL(15,2) DEFAULT 0 COMMENT '所有者权益合计-当期',
  equity_total_cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '所有者权益合计-累计',
  
  -- 负债和所有者权益总计
  liabilities_equity_total_current DECIMAL(15,2) DEFAULT 0 COMMENT '负债和所有者权益总计-当期',
  liabilities_equity_total_cumulative DECIMAL(15,2) DEFAULT 0 COMMENT '负债和所有者权益总计-累计',
  
  -- 备注和建议
  remarks TEXT COMMENT '备注',
  suggestions TEXT COMMENT '建议',
  
  -- 审计字段
  created_by INT COMMENT '创建人ID',
  updated_by INT COMMENT '更新人ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 索引
  UNIQUE KEY unique_period (period),
  KEY idx_period (period),
  KEY idx_created_by (created_by),
  KEY idx_updated_by (updated_by),
  
  -- 外键
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='上海南华兰陵实业有限公司资产负债表'; 