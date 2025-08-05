# 主营业务边际贡献率自动计算功能

## 功能概述

为主营业务边际贡献率组件添加了自动计算功能，能够从营业收入和成本中心数据自动计算各板块的边际贡献率。

## 计算公式

**边际贡献率 = (营业收入 - 变动成本) / 营业收入 × 100%**

## 数据来源

### 收入数据来源
- **表名**: `main_business_income`
- **数据结构**: 
  ```json
  {
    "equipment": [
      {"customer": "上海", "accumulatedIncome": 430.57, "currentMonthIncome": 0},
      {"customer": "国网", "accumulatedIncome": 654, "currentMonthIncome": 0}
    ],
    "components": [
      {"customer": "用户", "accumulatedIncome": 3.09, "currentMonthIncome": 0}
    ],
    "engineering": [
      {"customer": "二包", "accumulatedIncome": 283.85, "currentMonthIncome": 0},
      {"customer": "域内合作", "accumulatedIncome": 551.66, "currentMonthIncome": 0}
    ]
  }
  ```

### 成本数据来源
- **表名**: `cost_center_structure`
- **数据结构**:
  ```json
  {
    "equipmentData": [
      {"customerType": "上海", "cumulativeIncome": 464.09, "currentMonthIncome": 0}
    ],
    "componentData": [
      {"customerType": "用户", "cumulativeIncome": 0, "currentMonthIncome": 0}
    ],
    "engineeringData": [
      {"customerType": "二包", "cumulativeIncome": 0, "currentMonthIncome": 0}
    ]
  }
  ```

## API接口

### 自动计算接口
- **URL**: `POST /business-contribution/calculate/:period`
- **参数**: period (格式: YYYY-MM)
- **功能**: 从收入和成本数据自动计算边际贡献率

### 请求示例
```bash
curl -X POST "http://localhost:3000/business-contribution/calculate/2025-01" \
     -H "Content-Type: application/json"
```

### 响应示例
```json
{
  "success": true,
  "message": "边际贡献率计算完成",
  "data": {
    "equipment": {
      "shanghai": {"plan": "28.00%", "actual": "-7.79%", "difference": "-35.79%"},
      "national": {"plan": "18.50%", "actual": "100.00%", "difference": "81.50%"}
    },
    "components": {
      "users": {"plan": "/", "actual": "100.00%", "difference": "/"}
    },
    "engineering": {
      "package2": {"plan": "20.00%", "actual": "100.00%", "difference": "80.00%"},
      "domestic": {"plan": "12.00%", "actual": "100.00%", "difference": "88.00%"}
    },
    "total": {"plan": "32.00%", "actual": "76.20%", "difference": "44.20%"}
  },
  "period": "2025-01"
}
```

## 前端功能

### 自动计算按钮
在主营业务边际贡献率页面添加了"自动计算"按钮，点击后：
1. 调用后端自动计算API
2. 获取计算结果并更新表格数据
3. 自动计算偏差值（当期实际 - 年度计划）
4. 保留原有的年度计划数据

### 使用方法
1. 确保已录入对应期间的主营业务收入数据
2. 确保已录入对应期间的成本中心数据
3. 在边际贡献率页面点击"自动计算"按钮
4. 系统自动计算并填充当期实际数据
5. 点击"保存"按钮保存计算结果

## 计算逻辑

### 客户类型映射
```javascript
const mapping = {
    '上海': 'shanghai',
    '国网': 'national', 
    '江苏': 'jiangsu',
    '输配电内配': 'power',
    '西门子': 'siemens',
    '同业': 'peers',
    '用户': 'users',
    '其它': 'others',
    '一包': 'package1',
    '二包': 'package2', 
    '域内合作': 'domestic',
    '域外合作': 'international'
};
```

### 计算步骤
1. **数据提取**: 从主营业务收入和成本中心数据中提取各客户的收入和成本
2. **数据映射**: 将客户名称映射到标准的键值
3. **贡献率计算**: 对每个客户计算 (收入-成本)/收入 × 100%
4. **特殊处理**: 
   - 收入为0且成本为0：显示0%
   - 收入为0但成本不为0：显示"/"
   - 收入为负数：显示"/"
5. **总体计算**: 汇总所有收入和成本，计算总体边际贡献率

## 测试结果

基于2025-01期间的实际数据测试：
- **总体边际贡献率**: 76.20%（超出年度计划44.20%）
- **设备板块**: 上海-7.79%（成本超收入），国网100.00%
- **元件板块**: 用户100.00%
- **工程板块**: 二包100.00%，域内合作100.00%

## 注意事项

1. **数据依赖**: 必须先录入主营业务收入和成本中心数据
2. **数据完整性**: 确保收入和成本数据的客户类型命名一致
3. **计算精度**: 结果保留2位小数
4. **异常处理**: 对无收入、负收入等异常情况进行特殊处理
5. **数据保护**: 自动计算不会覆盖手动设置的年度计划数据

## 文件修改清单

### 后端文件
- `financial-backend/routes/businessContribution.js`: 添加自动计算API和计算逻辑

### 前端文件
- `financial-analytics-platform/src/views/newTable/BusinessContribution.vue`: 添加自动计算按钮和前端逻辑

## 部署说明

修改完成后需要重启后端服务：
```bash
pm2 restart financial-backend
```

前端修改会自动热更新，无需重启。
