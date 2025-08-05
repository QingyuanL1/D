-- 数据迁移脚本：将自动化板块数据合并到设备板块中
-- 用于主营业务边际贡献率结构与质量表

-- 更新business_contribution表中的数据
UPDATE business_contribution 
SET data = JSON_SET(
    -- 首先将automation的数据合并到equipment中
    JSON_SET(
        JSON_SET(
            JSON_SET(
                JSON_SET(
                    data,
                    '$.equipment.siemens', JSON_EXTRACT(data, '$.automation.siemens')
                ),
                '$.equipment.peers', JSON_EXTRACT(data, '$.automation.peers')
            ),
            '$.equipment.users', JSON_EXTRACT(data, '$.automation.users')
        ),
        '$.equipment.others', JSON_EXTRACT(data, '$.automation.others')
    ),
    -- 然后移除automation字段
    '$.automation', NULL
)
WHERE JSON_EXTRACT(data, '$.automation') IS NOT NULL;

-- 验证迁移结果的查询（可选执行）
-- SELECT 
--     period,
--     JSON_EXTRACT(data, '$.equipment') as equipment_data,
--     JSON_EXTRACT(data, '$.automation') as automation_data
-- FROM business_contribution 
-- WHERE period = '2024-01';

-- 如果需要回滚，可以使用以下脚本（请谨慎使用）
-- UPDATE business_contribution 
-- SET data = JSON_SET(
--     data,
--     '$.automation', JSON_OBJECT(
--         'siemens', JSON_EXTRACT(data, '$.equipment.siemens'),
--         'peers', JSON_EXTRACT(data, '$.equipment.peers'),
--         'users', JSON_EXTRACT(data, '$.equipment.users'),
--         'others', JSON_EXTRACT(data, '$.equipment.others')
--     )
-- )
-- WHERE JSON_EXTRACT(data, '$.equipment.siemens') IS NOT NULL;

-- 然后移除equipment中的这些字段
-- UPDATE business_contribution 
-- SET data = JSON_REMOVE(
--     JSON_REMOVE(
--         JSON_REMOVE(
--             JSON_REMOVE(data, '$.equipment.siemens'),
--             '$.equipment.peers'
--         ),
--         '$.equipment.users'
--     ),
--     '$.equipment.others'
-- )
-- WHERE JSON_EXTRACT(data, '$.equipment.siemens') IS NOT NULL;
