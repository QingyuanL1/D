-- 创建上海南华兰陵实业有限公司利润表
DROP TABLE IF EXISTS `shanghai_nanhua_lanling_income_statement`;

CREATE TABLE `shanghai_nanhua_lanling_income_statement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` date NOT NULL COMMENT '期间（YYYY-MM-DD格式，通常为月份第一天）',
  `data` json NOT NULL COMMENT '利润表数据（JSON格式）',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_period` (`period`) COMMENT '期间唯一索引',
  KEY `idx_period` (`period`) COMMENT '期间索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='上海南华兰陵实业有限公司利润表';

-- 插入示例数据（2025年2月）
INSERT INTO `shanghai_nanhua_lanling_income_statement` (`period`, `data`) VALUES
('2025-02-01', '{
  "main_business_revenue": {"current_amount": 11345833.36, "year_amount": 26594155.00},
  "direct_cost": {"current_amount": 7343997.77, "year_amount": 20049945.10},
  "labor_cost": {"current_amount": 1527134.76, "year_amount": 3109105.43},
  "manufacturing_cost": {"current_amount": 213001.23, "year_amount": 378013.04},
  "main_business_taxes": {"current_amount": 2063.14, "year_amount": 35638.32},
  "main_business_profit": {"current_amount": 2259636.46, "year_amount": 3021453.11},
  "other_business_profit": {"current_amount": 0, "year_amount": 0},
  "selling_expenses": {"current_amount": 506893.61, "year_amount": 1263534.24},
  "management_expenses": {"current_amount": 906435.24, "year_amount": 1708270.34},
  "financial_expenses": {"current_amount": 0, "year_amount": -11546.94},
  "operating_profit": {"current_amount": 846307.61, "year_amount": 61195.47},
  "investment_income": {"current_amount": 0, "year_amount": 0},
  "subsidy_income": {"current_amount": 7858.80, "year_amount": 7858.80},
  "non_operating_income": {"current_amount": 0, "year_amount": 1474.00},
  "prior_year_adjustment": {"current_amount": 0, "year_amount": 0},
  "non_operating_expenses": {"current_amount": 5360.13, "year_amount": 5360.13},
  "total_profit": {"current_amount": 848806.28, "year_amount": 65168.14},
  "income_tax": {"current_amount": 16292.03, "year_amount": 16292.03},
  "minority_interest_profit": {"current_amount": 0, "year_amount": 0},
  "unrecognized_investment_loss": {"current_amount": 0, "year_amount": 0},
  "tax_adjustment": {"current_amount": 0, "year_amount": 0},
  "net_profit": {"current_amount": 832514.25, "year_amount": 48876.11}
}'); 