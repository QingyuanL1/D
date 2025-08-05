# 南华公司营业收入自动计算实施文档

## 实施时间
2024年12月19日

## 需求概述
为南华公司的营业收入结构与质量页面实现自动计算功能，当期值改为计算值：
> 当期值 = 当月订单转收入（本月）+ 存量订单转收入（本月）

## ✅ 完成的工作

### 1. 后端修改
**文件**: `financial-backend/routes/nanhuaBusinessIncome.js`

**修改内容**:
- 重写GET路由，改为基于订单转收入数据实时计算
- 数据来源：`nanhua_order_to_income` + `nanhua_stock_order_to_income` 表
- 支持累计收入按月计算
- 添加计算标识和说明信息

### 2. 前端修改
**文件**: `financial-analytics-platform/src/views/nanhua/BusinessIncome.vue`

**修改内容**:
- 将当期收入input框改为span显示
- 添加蓝色字体样式突出显示自动计算数据
- 当期字段下方添加"自动计算"提示文字
- 页面标题旁添加提示框："✨ 当期收入自动计算"

## 🎯 数据结构

### 南华订单转收入表
- **表名**: `nanhua_order_to_income`
- **关键字段**: `current_amount` (当期金额)
- **客户列表**: 一包项目、二包项目、域内合作项目、域外合作项目、新能源项目、苏州项目、抢修、运检、自建项目

### 南华存量订单转收入表
- **表名**: `nanhua_stock_order_to_income`  
- **关键字段**: `current_amount` (当期金额)
- **客户列表**: 同上

### 南华营业收入表
- **表名**: `nanhua_business_income`
- **新计算逻辑**: 不再直接存储当期数据，改为实时计算

## 🔄 计算公式

### 当期收入计算
```sql
当期收入 = nanhua_order_to_income.current_amount + nanhua_stock_order_to_income.current_amount
```

### 累计收入计算
```sql
累计收入 = SUM(从年初到当前月份的所有当期收入)
```

### 完成率计算
```sql
完成率 = (累计收入 / 年度计划) × 100%
```

## ✅ 验证结果

### API测试
- ✅ 南华营业收入结构API正常
- ✅ 南华当月订单转收入API正常  
- ✅ 南华存量订单转收入API正常
- ✅ 数据计算逻辑验证通过
- ✅ 响应包含计算标识：`"calculated": true`

### 前端UI
- ✅ 输入框 → 只读span
- ✅ 蓝色字体标识 (`text-blue-600`)
- ✅ "自动计算"提示文字
- ✅ 页面说明提示框

### 示例数据 (2025-06)
- 当期总收入：0.00 万元
- 累计总收入：1524.84 万元
- 主要客户累计收入：
  - 二包项目：772.60 万元 (26.73%)
  - 域外合作项目：370.76 万元 (14.54%)
  - 一包项目：254.07 万元 (4.74%)

## 🎨 前端UI变更

### 变更前
```html
<input v-model="item.current" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" min="-999999999" />
```

### 变更后
```html
<span class="font-medium text-blue-600 text-right block">{{ formatNumber(item.current) }}</span>
<small class="block text-gray-500 text-xs mt-1 text-center">自动计算</small>
```

### 新增提示框
```html
<div class="bg-blue-50 px-3 py-1 rounded-lg">
    <span class="text-blue-600 text-sm font-medium">✨ 当期收入自动计算</span>
    <small class="block text-blue-500 text-xs">基于订单转收入数据</small>
</div>
```

## 🔗 相关文件

### 后端路由
- `nanhuaBusinessIncome.js` - 南华营业收入（已修改）
- `nanhuaOrderToIncome.js` - 南华当月订单转收入（数据源）
- `nanhuaStockOrderToIncome.js` - 南华存量订单转收入（数据源）

### 前端页面
- `BusinessIncome.vue` - 南华营业收入页面（已修改）

### 数据库表
- `nanhua_business_income` - 南华营业收入表
- `nanhua_order_to_income` - 南华当月订单转收入表
- `nanhua_stock_order_to_income` - 南华存量订单转收入表

## ✨ 技术特点

1. **实时计算**: 数据不再存储，每次请求时实时计算
2. **数据一致性**: 确保与订单转收入数据同步
3. **向后兼容**: API接口保持不变，前端页面布局基本不变
4. **用户体验**: 清晰的视觉标识和提示信息

## 📋 对比总结

| 项目 | 修改前 | 修改后 |
|------|--------|--------|
| 数据来源 | 手工输入存储 | 订单转收入表计算 |
| 数据准确性 | 依赖人工输入 | 自动计算，减少错误 |
| 数据及时性 | 需要手动更新 | 实时计算 |
| 用户界面 | 可编辑输入框 | 只读span显示 |
| 计算标识 | 无 | 蓝色字体+提示 |

---
**状态**: ✅ 已完成并验证通过  
**部署状态**: 可随时部署到生产环境  
**测试结果**: 所有功能正常，数据计算逻辑正确 