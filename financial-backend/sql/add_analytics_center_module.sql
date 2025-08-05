-- 添加数据分析中心模块权限
-- 只给领导角色配置查看权限

-- 1. 添加数据分析中心模块到form_modules表
INSERT IGNORE INTO form_modules (module_name, module_key, module_category, route_path, description, display_order) VALUES 
('数据分析中心', 'analytics_center', '财务', '/analytics', '财务数据综合分析与可视化展示', 1);

-- 2. 获取刚插入的模块ID和领导角色ID
SET @analytics_module_id = (SELECT id FROM form_modules WHERE module_key = 'analytics_center');
SET @leader_role_id = (SELECT id FROM user_roles WHERE role_name = 'leader');

-- 3. 为领导角色添加数据分析中心的只读权限
INSERT IGNORE INTO role_permissions (role_id, module_id, permission_type) VALUES 
(@leader_role_id, @analytics_module_id, 'read');

-- 4. 验证插入结果
SELECT 
    fm.module_name,
    fm.module_key,
    fm.module_category,
    fm.route_path,
    fm.description,
    ur.role_name,
    ur.role_description,
    rp.permission_type
FROM form_modules fm
JOIN role_permissions rp ON fm.id = rp.module_id
JOIN user_roles ur ON rp.role_id = ur.id
WHERE fm.module_key = 'analytics_center'
ORDER BY ur.role_name;
