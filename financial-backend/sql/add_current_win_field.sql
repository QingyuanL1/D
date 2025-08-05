-- 添加 current_win 字段到 bidding_status 表
-- 这个字段用于存储当期中标金额

-- 检查字段是否已存在，如果不存在则添加
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'bidding_status' 
     AND COLUMN_NAME = 'current_win') = 0,
    'ALTER TABLE bidding_status ADD COLUMN current_win DECIMAL(15,2) DEFAULT 0.00 AFTER bid_amount',
    'SELECT "current_win field already exists" as message'
));

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 更新现有数据，将 win_amount 的值复制到 current_win（如果需要的话）
-- 这里假设现有的 win_amount 实际上是当期中标数据
-- UPDATE bidding_status SET current_win = win_amount WHERE current_win = 0 AND win_amount > 0;
