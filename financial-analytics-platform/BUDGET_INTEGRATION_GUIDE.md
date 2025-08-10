# 预算数据集成指南

## 概述

本项目已成功集成预算数据中间件，在获取业务数据时自动附加年度预算计划数据。

## 已完成的工作

### 1. 数据库层面
- ✅ 创建 `budget_planning` 表存储年度预算数据
- ✅ 导入23个表格的完整预算数据（92条记录）
- ✅ 建立预算表与业务表的映射关系

### 2. 后端中间件
- ✅ 实现 `budgetMiddleware.js` 预算中间件
- ✅ 集成到以下3个API接口：
  - `new-orders` - 新签订单结构与质量
  - `project-tracking` - 项目跟踪情况  
  - `business-income` - 营业收入结构与质量

### 3. 前端组件
- ✅ 前端组件已支持 `yearlyPlan` 字段显示
- ✅ 路由配置完整，可正确导航到对应页面

## 使用方法

### 前端获取预算数据

当前端组件调用API时，会自动获得包含预算数据的响应：

```javascript
// 获取新签订单数据
const response = await fetch('http://47.111.95.19:3000/new-orders/2024-01');
const result = await response.json();

// 数据结构示例
{
  "success": true,
  "data": {
    "equipment": [
      {
        "customer": "上海项目",
        "yearlyPlan": 30000,      // 来自预算表的年度计划
        "currentTotal": 2500,     // 来自业务表的当期累计
        "progress": 8.33          // 计算得出的执行进度
      }
    ]
  }
}
```

### 测试预算数据

可以使用提供的测试助手验证预算数据：

```javascript
import { runAllBudgetTests } from '@/utils/budgetTestHelper';

// 在组件中测试
await runAllBudgetTests('2024-01');
```

## 支持的API接口

### 1. 新签订单接口
- **路径**: `GET /new-orders/:period`
- **期间格式**: `YYYY-MM`
- **预算表key**: `new_orders`
- **前端页面**: `/new-order`

### 2. 项目跟踪接口
- **路径**: `GET /project-tracking/:period`
- **期间格式**: `YYYY-MM`
- **预算表key**: `project_tracking`
- **前端页面**: `/projecttracking`

### 3. 营业收入结构接口
- **路径**: `GET /business-income/:period`
- **期间格式**: `YYYY-MM`
- **预算表key**: `business_income_structure`
- **前端页面**: `/business-income-structure`

## 数据映射关系

预算中间件通过以下规则匹配预算数据：

1. **提取年份**: 从期间 `YYYY-MM` 中提取年份 `YYYY`
2. **查询预算**: 在 `budget_planning` 表中查找对应的年度预算
3. **匹配规则**: 按 `类别-客户` 的组合进行匹配
4. **数据合并**: 将预算数据附加到业务数据的 `yearlyPlan` 字段

## 验证步骤

### 1. 后端验证
```bash
# 测试新签订单接口
curl -X GET "http://47.111.95.19:3000/new-orders/2024-01" | jq '.'

# 测试项目跟踪接口
curl -X GET "http://47.111.95.19:3000/project-tracking/2025-06" | jq '.'

# 测试营业收入结构接口
curl -X GET "http://47.111.95.19:3000/business-income/2025-06" | jq '.'
```

### 2. 前端验证
1. 访问 `/view` 页面
2. 选择对应的表单模块
3. 选择期间并查看数据
4. 验证 `年度计划` 列是否显示正确的预算数据

## 扩展到其他表格

要为其他表格添加预算数据支持：

1. **添加预算数据**:
   ```sql
   INSERT INTO budget_planning (period, table_key, category, customer, yearly_budget) 
   VALUES ('2025', 'your_table_key', '类别', '客户', 预算金额);
   ```

2. **创建中间件**:
   ```javascript
   const middleware = createBudgetMiddleware('your_table_key');
   ```

3. **应用到路由**:
   ```javascript
   router.get('/:period', middleware, async (req, res) => {
     // 你的业务逻辑
   });
   ```

## 注意事项

1. **期间格式**: 确保前端传递的期间格式为 `YYYY-MM`
2. **数据匹配**: 预算数据按 `类别-客户` 组合匹配，确保命名一致
3. **错误处理**: 中间件会优雅处理预算数据缺失的情况
4. **性能考虑**: 预算数据在每次请求时查询，考虑添加缓存机制

## 已测试的数据期间

- 新签订单: `2024-01` 到 `2024-12`
- 项目跟踪: `2025-06`
- 营业收入结构: `2025-06`, `2025-07`

## 状态总结

✅ **完成**: 前三个表格的预算数据集成  
🔄 **进行中**: 可扩展到其他20个表格  
📋 **待优化**: 缓存机制、错误处理增强