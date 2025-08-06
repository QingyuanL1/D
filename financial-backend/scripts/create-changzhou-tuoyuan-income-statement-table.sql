-- 创建常州拓源利润表数据库表
DROP TABLE IF EXISTS `changzhou_tuoyuan_income_statement`;
CREATE TABLE `changzhou_tuoyuan_income_statement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` date NOT NULL,
  `data` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 