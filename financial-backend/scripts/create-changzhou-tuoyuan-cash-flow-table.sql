-- 常州拓源现金流量表数据库表结构
-- 创建时间: 2025年
-- 用途: 存储常州拓源电气有限公司的现金流量表数据

-- 删除表（如果存在）
DROP TABLE IF EXISTS `changzhou_tuoyuan_cash_flow`;

-- 创建常州拓源现金流量表
CREATE TABLE `changzhou_tuoyuan_cash_flow` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `period` varchar(7) NOT NULL COMMENT '期间，格式：YYYY-MM',
  `data` longtext NOT NULL COMMENT '现金流量表数据，JSON格式存储',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` varchar(100) DEFAULT NULL COMMENT '创建人',
  `updated_by` varchar(100) DEFAULT NULL COMMENT '更新人',
  `version` int(11) DEFAULT 1 COMMENT '版本号',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-正常，0-删除',
  `remarks` text DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_period` (`period`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_updated_at` (`updated_at`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='常州拓源现金流量表';

-- 创建索引以提高查询性能
ALTER TABLE `changzhou_tuoyuan_cash_flow` 
ADD INDEX `idx_period_status` (`period`, `status`),
ADD INDEX `idx_created_updated` (`created_at`, `updated_at`);

-- 插入示例数据（可选）
INSERT INTO `changzhou_tuoyuan_cash_flow` (`period`, `data`, `created_by`, `remarks`) VALUES 
('2025-01', '{}', 'system', '初始化数据'),
('2025-02', '{}', 'system', '初始化数据');

-- 添加表注释和字段注释的详细说明
ALTER TABLE `changzhou_tuoyuan_cash_flow` COMMENT = '常州拓源电气有限公司现金流量表数据存储表，用于保存各期间的现金流量数据';

-- 创建视图以便于查询最新数据
CREATE OR REPLACE VIEW `v_changzhou_tuoyuan_cash_flow_latest` AS
SELECT 
    `id`,
    `period`,
    `data`,
    `created_at`,
    `updated_at`,
    `created_by`,
    `updated_by`,
    `version`,
    `status`,
    `remarks`,
    ROW_NUMBER() OVER (PARTITION BY `period` ORDER BY `updated_at` DESC) as rn
FROM `changzhou_tuoyuan_cash_flow`
WHERE `status` = 1;

-- 创建存储过程用于数据备份
DELIMITER //
CREATE PROCEDURE `backup_changzhou_tuoyuan_cash_flow`(
    IN backup_period VARCHAR(7)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- 创建备份表（如果不存在）
    CREATE TABLE IF NOT EXISTS `changzhou_tuoyuan_cash_flow_backup` LIKE `changzhou_tuoyuan_cash_flow`;
    
    -- 插入备份数据
    INSERT INTO `changzhou_tuoyuan_cash_flow_backup`
    SELECT * FROM `changzhou_tuoyuan_cash_flow` 
    WHERE `period` = backup_period;
    
    COMMIT;
    
    SELECT CONCAT('Period ', backup_period, ' backed up successfully') AS message;
END //
DELIMITER ;

-- 创建存储过程用于数据清理
DELIMITER //
CREATE PROCEDURE `cleanup_changzhou_tuoyuan_cash_flow`(
    IN cleanup_days INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- 软删除过期数据
    UPDATE `changzhou_tuoyuan_cash_flow`
    SET `status` = 0
    WHERE `created_at` < DATE_SUB(NOW(), INTERVAL cleanup_days DAY)
    AND `status` = 1;
    
    COMMIT;
    
    SELECT ROW_COUNT() AS affected_rows, 
           CONCAT('Data older than ', cleanup_days, ' days marked as deleted') AS message;
END //
DELIMITER ;

-- 创建触发器记录数据变更
DELIMITER //
CREATE TRIGGER `tr_changzhou_tuoyuan_cash_flow_update`
    BEFORE UPDATE ON `changzhou_tuoyuan_cash_flow`
    FOR EACH ROW
BEGIN
    SET NEW.version = OLD.version + 1;
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- 创建函数获取最新期间
DELIMITER //
CREATE FUNCTION `get_latest_changzhou_tuoyuan_period`()
RETURNS VARCHAR(7)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE latest_period VARCHAR(7);
    
    SELECT `period` INTO latest_period
    FROM `changzhou_tuoyuan_cash_flow`
    WHERE `status` = 1
    ORDER BY `period` DESC
    LIMIT 1;
    
    RETURN IFNULL(latest_period, '');
END //
DELIMITER ;

-- 权限设置（根据实际需要调整）
-- GRANT SELECT, INSERT, UPDATE ON `changzhou_tuoyuan_cash_flow` TO 'app_user'@'%';
-- GRANT SELECT ON `v_changzhou_tuoyuan_cash_flow_latest` TO 'app_user'@'%';

-- 显示表结构
DESCRIBE `changzhou_tuoyuan_cash_flow`;

-- 显示创建的索引
SHOW INDEX FROM `changzhou_tuoyuan_cash_flow`;

-- 显示表的统计信息
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH,
    CREATE_TIME,
    UPDATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'changzhou_tuoyuan_cash_flow';

-- 验证表结构和数据
SELECT COUNT(*) as total_records FROM `changzhou_tuoyuan_cash_flow`;
SELECT * FROM `changzhou_tuoyuan_cash_flow` LIMIT 5;

-- 完成提示
SELECT 'Changzhou Tuoyuan Cash Flow table created successfully!' as status; 