-- 添加南华和拓源公司财务报表模块及权限
USE finance;

-- 1. 删除之前错误添加的记录
DELETE FROM role_permissions WHERE module_id IN (428, 429, 430, 431, 432, 433);
DELETE FROM form_modules WHERE id IN (428, 429, 430, 431, 432, 433);

-- 2. 查看当前最大ID，确保不冲突
-- SELECT MAX(id) as max_id FROM form_modules;

-- 3. 添加南华公司财务报表模块 (使用500+的ID避免冲突)
INSERT INTO form_modules (id, module_name, module_key, module_category, route_path, description, display_order) VALUES
(501, '南华资产负债表', 'nanhua_balance_sheet', '财务', '/shanghai-nanhua-lanling-industry/balance-sheet', '南华公司资产负债状况', 501),
(502, '南华现金流量表', 'nanhua_cash_flow', '财务', '/shanghai-nanhua-lanling-industry/cash-flow', '南华公司现金流入流出情况', 502),
(503, '南华利润表', 'nanhua_income_statement', '财务', '/shanghai-nanhua-lanling-industry/income-statement', '南华公司收入支出和利润情况', 503);

-- 4. 添加拓源公司财务报表模块
INSERT INTO form_modules (id, module_name, module_key, module_category, route_path, description, display_order) VALUES
(601, '拓源资产负债表', 'tuoyuan_balance_sheet', '财务', '/changzhou-tuoyuan-electric/balance-sheet', '拓源公司资产负债状况', 601),
(602, '拓源现金流量表', 'tuoyuan_cash_flow', '财务', '/changzhou-tuoyuan-electric/cash-flow', '拓源公司现金流入流出情况', 602),
(603, '拓源利润表', 'tuoyuan_income_statement', '财务', '/changzhou-tuoyuan-electric/income-statement', '拓源公司收入支出和利润情况', 603);

-- 5. 为所有角色分配权限（按照原有的权限分配逻辑）

-- 超级管理员 (role_id=1) - 所有新模块读写权限
INSERT IGNORE INTO role_permissions (role_id, module_id, permission_type) VALUES
(1, 501, 'write'), (1, 502, 'write'), (1, 503, 'write'),
(1, 601, 'write'), (1, 602, 'write'), (1, 603, 'write');

-- 管理员 (role_id=2) - 所有新模块读写权限
INSERT IGNORE INTO role_permissions (role_id, module_id, permission_type) VALUES
(2, 501, 'write'), (2, 502, 'write'), (2, 503, 'write'),
(2, 601, 'write'), (2, 602, 'write'), (2, 603, 'write');

-- 财务经理 (role_id=3) - 所有新模块读写权限（因为都是财务类别）
INSERT IGNORE INTO role_permissions (role_id, module_id, permission_type) VALUES
(3, 501, 'write'), (3, 502, 'write'), (3, 503, 'write'),
(3, 601, 'write'), (3, 602, 'write'), (3, 603, 'write');

-- 财务专员 (role_id=7) - 所有新模块读写权限（因为都是财务类别）
INSERT IGNORE INTO role_permissions (role_id, module_id, permission_type) VALUES
(7, 501, 'write'), (7, 502, 'write'), (7, 503, 'write'),
(7, 601, 'write'), (7, 602, 'write'), (7, 603, 'write');

-- 领导 (role_id=11) - 所有新模块只读权限
INSERT IGNORE INTO role_permissions (role_id, module_id, permission_type) VALUES
(11, 501, 'read'), (11, 502, 'read'), (11, 503, 'read'),
(11, 601, 'read'), (11, 602, 'read'), (11, 603, 'read');

-- 查看者 (role_id=12) - 所有新模块只读权限
INSERT IGNORE INTO role_permissions (role_id, module_id, permission_type) VALUES
(12, 501, 'read'), (12, 502, 'read'), (12, 503, 'read'),
(12, 601, 'read'), (12, 602, 'read'), (12, 603, 'read');

-- 6. 验证结果
SELECT '=== 新添加的模块 ===' as info;
SELECT id, module_name, module_key, route_path FROM form_modules WHERE id IN (501, 502, 503, 601, 602, 603) ORDER BY id;

SELECT '=== 权限分配情况 ===' as info;
SELECT ur.role_name, fm.module_name, rp.permission_type 
FROM role_permissions rp
JOIN user_roles ur ON rp.role_id = ur.id
JOIN form_modules fm ON rp.module_id = fm.id
WHERE fm.id IN (501, 502, 503, 601, 602, 603)
ORDER BY ur.role_name, fm.id;

SELECT '=== 总模块数量 ===' as info;
SELECT COUNT(*) as total_modules FROM form_modules;
