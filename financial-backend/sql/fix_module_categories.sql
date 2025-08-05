-- 修复模块分类，按公司分开
USE finance;

-- 更新南华公司模块分类
UPDATE form_modules SET module_category = '南华公司' WHERE id IN (501, 502, 503);

-- 更新拓源公司模块分类  
UPDATE form_modules SET module_category = '拓源公司' WHERE id IN (601, 602, 603);

-- 验证更新结果
SELECT '=== 更新后的模块分类 ===' as info;
SELECT id, module_name, module_category, route_path 
FROM form_modules 
WHERE id IN (501, 502, 503, 601, 602, 603) 
ORDER BY module_category, id;

-- 查看所有分类
SELECT '=== 所有可用分类 ===' as info;
SELECT DISTINCT module_category, COUNT(*) as module_count 
FROM form_modules 
GROUP BY module_category 
ORDER BY module_category;
