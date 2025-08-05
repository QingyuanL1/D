-- 修复模块ID，按照正确的规则分配
-- 0-300: 电气公司
-- 300+: 南华公司  
-- 400+: 拓源公司

USE finance;

-- 删除错误的记录
DELETE FROM form_modules WHERE id IN (428, 429, 430, 431, 432, 433);

-- 重新插入正确ID的记录
INSERT INTO form_modules (id, module_name, module_key, module_category, route_path, description, display_order) VALUES
(301, '南华资产负债表', 'nanhua_balance_sheet', '财务', '/shanghai-nanhua-lanling-industry/balance-sheet', '南华公司资产负债状况', 301),
(302, '南华现金流量表', 'nanhua_cash_flow', '财务', '/shanghai-nanhua-lanling-industry/cash-flow', '南华公司现金流入流出情况', 302),
(303, '南华利润表', 'nanhua_income_statement', '财务', '/shanghai-nanhua-lanling-industry/income-statement', '南华公司收入支出和利润情况', 303),
(401, '拓源资产负债表', 'tuoyuan_balance_sheet', '财务', '/changzhou-tuoyuan-electric/balance-sheet', '拓源公司资产负债状况', 401),
(402, '拓源现金流量表', 'tuoyuan_cash_flow', '财务', '/changzhou-tuoyuan-electric/cash-flow', '拓源公司现金流入流出情况', 402),
(403, '拓源利润表', 'tuoyuan_income_statement', '财务', '/changzhou-tuoyuan-electric/income-statement', '拓源公司收入支出和利润情况', 403);

-- 验证结果
SELECT id, module_name, module_key FROM form_modules WHERE id IN (301, 302, 303, 401, 402, 403) ORDER BY id;
