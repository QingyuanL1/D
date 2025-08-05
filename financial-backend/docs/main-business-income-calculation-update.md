# 主营业务收入计算方式更新

## 更新时间
2024年12月19日

## 更新内容
将主营业务收入分解的当期值计算方式修改为基于订单转收入数据的自动计算。

## 修改前
- 主营业务收入分解的当期值需要手工输入
- 数据存储在 `main_business_income` 表中
- 营业收入结构从 `main_business_income` 表读取数据

## 修改后
- 主营业务收入分解的当期值 = **当月订单转收入（本月）+ 存量订单转收入（本月）**
- 数据从以下两个表自动计算：
  - `order_to_income` - 当月订单转收入表
  - `stock_order_to_income` - 存量订单转收入表

## 修改的文件

### 1. financial-backend/routes/businessIncome.js
- 修改主营业务收入的计算逻辑
- 从订单转收入表获取当期和累计数据
- 支持按月累计计算

### 2. financial-backend/routes/mainBusinessIncome.js  
- 重写GET路由，改为计算订单转收入数据
- 初始化标准数据结构（设备、元件、工程板块）
- 自动计算当月收入、累计收入和执行进度

## 数据计算逻辑

### 当月收入计算
```javascript
当月收入 = order_to_income.currentIncome + stock_order_to_income.currentMonthIncome
```

### 累计收入计算
```javascript
累计收入 = sum(从年初到当前月份的所有当月收入)
```

### 执行进度计算
```javascript
执行进度 = (累计收入 / 年度计划) * 100%
```

## 数据一致性
- 营业收入结构中的主营业务收入 = 主营业务收入分解各项之和
- 测试验证显示数据计算一致性良好

## API变更
- GET `/business-income/:period` - 现在基于订单转收入计算
- GET `/main-business-income/:period` - 现在返回计算数据而非存储数据
- 响应增加 `calculated: true` 和计算说明信息

## 影响范围
- 前端页面无需修改，API接口保持兼容
- 数据现在是实时计算的，更加准确
- 主营业务收入数据与订单转收入数据保持同步

## 测试验证
✅ 营业收入结构API正常工作  
✅ 主营业务收入分解API正常工作  
✅ 数据一致性检查通过  
✅ 前端兼容性良好 