# 常州拓源利润表数据结构更新

## 概述

本文档描述了常州拓源利润表数据结构的简化更新，从复杂的多字段格式简化为当月和累计两个字段的格式。

## 数据结构变化

### 旧格式（已废弃）
```json
{
  "field_name": {
    "current_amount": 1000,
    "year_amount": 2000,
    "current_amount_actual": 1100,
    "year_amount_actual": 2200,
    "completion_rate": 0.95,
    "year_budget": 2400,
    "product_inventory": 500
  }
}
```

### 新格式（当前使用）
```json
{
  "field_name": {
    "current_amount": 1000,
    "cumulative_amount": 1500
  }
}
```

## 字段说明

- `current_amount`: 当月金额，类型为 `number` 或 `null`
- `cumulative_amount`: 累计金额，类型为 `number` 或 `null`

## 数据库表结构

数据库表结构本身不需要修改，因为使用了 JSON 字段来存储数据：

```sql
CREATE TABLE `changzhou_tuoyuan_income_statement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period` date NOT NULL,
  `data` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 迁移过程

### 1. 数据迁移脚本

使用以下脚本迁移现有数据：

```bash
# 迁移数据
node scripts/migrate-changzhou-tuoyuan-income-statement-data.js migrate

# 验证迁移结果
node scripts/migrate-changzhou-tuoyuan-income-statement-data.js validate
```

### 2. 测试新格式

使用测试脚本验证新格式：

```bash
# 运行完整测试
node scripts/test-changzhou-tuoyuan-income-statement-new-format.js test

# 查看数据格式示例
node scripts/test-changzhou-tuoyuan-income-statement-new-format.js sample
```

## API 更新

### 数据验证

后端 API 现在包含数据格式验证，确保：

1. 每个字段必须包含 `current_amount` 和 `cumulative_amount` 属性
2. 金额值必须是 `number` 类型或 `null`
3. 数据结构必须是对象格式

### 错误处理

如果提交的数据格式不正确，API 会返回详细的错误信息：

```json
{
  "error": "数据格式错误：字段 field_name 缺少必需的属性：current_amount 或 cumulative_amount"
}
```

## 前端组件更新

### 表格列简化

前端表格从 10 列简化为 3 列：
- 项目
- 当月
- 累计

### 数据绑定更新

```vue
<!-- 旧格式 -->
<input v-model="item.yearAmount" />
<input v-model="item.currentAmountActual" />
<input v-model="item.yearAmountActual" />
<!-- ... 其他字段 -->

<!-- 新格式 -->
<input v-model="item.currentAmount" />
<input v-model="item.cumulativeAmount" />
```

## 兼容性说明

- 新系统与旧数据兼容，迁移脚本会自动转换数据格式
- 如果需要回滚，建议在迁移前备份数据库
- API 层面增加了严格的格式验证，确保数据一致性

## 维护指南

1. **数据验证**: 确保所有新数据符合新格式要求
2. **定期备份**: 在任何结构性变更前备份数据库
3. **测试覆盖**: 使用提供的测试脚本定期验证数据完整性
4. **监控**: 监控 API 错误日志，及时发现格式问题

## 相关文件

- 迁移脚本: `scripts/migrate-changzhou-tuoyuan-income-statement-data.js`
- 测试脚本: `scripts/test-changzhou-tuoyuan-income-statement-new-format.js`
- API 路由: `routes/changzhouTuoyuanIncomeStatement.js`
- 前端组件: `financial-analytics-platform/src/views/example/ChangzhouTuoyuanIncomeStatement.vue`
- 数据结构: `financial-analytics-platform/src/views/example/changzhouTuoyuanIncomeStatementData.ts`
- 类型定义: `financial-analytics-platform/src/views/example/types/incomeStatement.ts` 