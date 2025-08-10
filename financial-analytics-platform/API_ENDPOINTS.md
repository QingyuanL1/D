# 财务分析平台 API 接口文档

## 📊 后端API接口列表

### ✅ **预算数据正常工作的API接口（22个）**

#### 1. 新签订单结构与质量
- **接口**: `GET http://47.111.95.19:3000/new-orders/{period}`
- **示例**: http://47.111.95.19:3000/new-orders/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: equipment, components, engineering 各类别的年度计划
```json
{
  "success": true,
  "data": {
    "equipment": [
      {
        "customer": "上海项目",
        "yearlyPlan": 30000,
        "currentTotal": 5593,
        "progress": "18.64%"
      }
    ]
  }
}
```

#### 2. 主营业务收入分解情况
- **接口**: `GET http://47.111.95.19:3000/main-business-income/{period}`
- **示例**: http://47.111.95.19:3000/main-business-income/2025-07
- **状态**: ✅ 预算数据正常
- **返回数据**: 设备、元件、工程的年度计划和执行进度
```json
{
  "success": true,
  "data": {
    "equipment": [
      {
        "customer": "上海",
        "yearlyPlan": 22000,
        "currentTotal": 2363.98,
        "progress": "10.75%"
      }
    ]
  }
}
```

#### 3. 项目跟踪情况
- **接口**: `GET http://47.111.95.19:3000/project-tracking/{period}`
- **示例**: http://47.111.95.19:3000/project-tracking/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 各客户的项目跟踪预算数据
```json
{
  "success": true,
  "data": {
    "equipment": [
      {
        "customer": "上海",
        "yearlyPlan": 500000,
        "currentTotal": 869.12,
        "progress": "0.17%"
      }
    ]
  }
}
```

#### 4. 当年订单转收入
- **接口**: `GET http://47.111.95.19:3000/order-to-income/{period}`
- **示例**: http://47.111.95.19:3000/order-to-income/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: signedOrder 和 yearlyPlan 数据
```json
{
  "success": true,
  "data": {
    "equipment": [
      {
        "customer": "上海",
        "signedOrder": 5593.15,
        "yearlyPlan": 5593.15,
        "incomeTotal": 2000,
        "incomeRate": 35.76
      }
    ]
  }
}
```

#### 5. 存量订单转收入
- **接口**: `GET http://47.111.95.19:3000/stock-order-to-income/{period}`
- **示例**: http://47.111.95.19:3000/stock-order-to-income/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 存量订单的预算数据
```json
{
  "success": true,
  "data": {
    "equipment": [
      {
        "customer": "上海",
        "yearlyPlan": 39050.53,
        "stockOrder": 3000,
        "incomeTotal": 999,
        "incomeRate": 33.3
      }
    ]
  }
}
```

#### 6. 营业收入结构与质量
- **接口**: `GET http://47.111.95.19:3000/business-income/{period}`
- **示例**: http://47.111.95.19:3000/business-income/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 主营业务的年度预算
```json
{
  "success": true,
  "data": [
    {
      "category": "主营业务",
      "yearlyPlan": 59400,
      "currentTotal": 514
    }
  ]
}
```

#### 7. 非主营业务情况
- **接口**: `GET http://47.111.95.19:3000/non-main-business/{period}`
- **示例**: http://47.111.95.19:3000/non-main-business/2025-06
- **状态**: ✅ 预算数据部分正常
- **返回数据**: 各类非主营业务的预算数据
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "category": "固定收入",
      "yearlyPlan": 1222,
      "currentTotal": 33
    }
  ]
}
```

#### 8. 主营业务成本结构
- **接口**: `GET http://47.111.95.19:3000/main-business-cost/{period}`
- **示例**: http://47.111.95.19:3000/main-business-cost/2025-06
- **状态**: ✅ 预算数据基本正常
- **返回数据**: 成本结构的预算数据

---

#### 21. 主营业务贡献率结构
- **接口**: `GET http://47.111.95.19:3000/business-contribution/{period}`
- **示例**: http://47.111.95.19:3000/business-contribution/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 各板块各客户类型的主营业务贡献率预算数据
```json
{
  "success": true,
  "data": {
    "equipment": {
      "shanghai": {"plan": "28.22%", "actual": "38.02%", "difference": "9.80%"},
      "national": {"plan": "20.19%", "actual": "20.05%", "difference": "-0.14%"}
    },
    "automation": {
      "siemens": {"plan": "25.00%", "actual": "0%", "difference": "-25.00%"},
      "peers": {"plan": "25.92%", "actual": "33.00%", "difference": "7.08%"}
    },
    "components": {
      "users": {"plan": "30.00%", "actual": "59.65%", "difference": "29.65%"}
    },
    "engineering": {
      "package1": {"plan": "26.00%", "actual": "25.90%", "difference": "-0.10%"},
      "package2": {"plan": "15.00%", "actual": "4.18%", "difference": "-10.82%"}
    }
  }
}
```

---

#### 22. 部门成本中心盈亏
- **接口**: `GET http://47.111.95.19:3000/department-cost-input/{period}`
- **示例**: http://47.111.95.19:3000/department-cost-input/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 各部门的年度预算数据
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "department": "总经理室",
        "yearlyBudget": "1200000",
        "currentTotal": "",
        "executionProgress": "",
        "budgetToOutputRatio": "",
        "actualToOutputRatio": ""
      },
      {
        "department": "财务部",
        "yearlyBudget": "800000",
        "currentTotal": "",
        "executionProgress": "",
        "budgetToOutputRatio": "",
        "actualToOutputRatio": ""
      }
    ],
    "total": {
      "department": "合计",
      "yearlyBudget": "15000000",
      "currentTotal": "",
      "executionProgress": "",
      "budgetToOutputRatio": "",
      "actualToOutputRatio": ""
    }
  }
}
```

---

### ⚠️ **需要修复的API接口（1个）**

#### 23. 成本估算人员提取
- **接口**: `GET http://47.111.95.19:3000/cost-estimation/{period}`
- **示例**: http://47.111.95.19:3000/cost-estimation/2025-06
- **状态**: ⚠️ 预算数据未显示

#### 9. 主营业务毛利率结构
- **接口**: `GET http://47.111.95.19:3000/business-profit-margin/{period}`
- **示例**: http://47.111.95.19:3000/business-profit-margin/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 毛利率结构的预算百分比数据
```json
{
  "success": true,
  "data": {
    "equipment": {
      "shanghai": {"plan": "21.99%", "actual": "31.06%", "difference": "9.07%"},
      "national": {"plan": "13.83%", "actual": "15.72%", "difference": "1.89%"}
    }
  }
}
```

#### 10. 净利润结构质量
- **接口**: `GET http://47.111.95.19:3000/net-profit-structure/{period}`
- **示例**: http://47.111.95.19:3000/net-profit-structure/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 净利润的预算数据
```json
{
  "success": true,
  "data": {
    "mainBusiness": {"plan": "3,871.58", "actual": "240.20", "progress": "6.20%"},
    "nonMainBusiness": {"plan": "128.42", "actual": "77", "progress": "59.96%"}
  }
}
```

#### 11. 主营业务净利润贡献
- **接口**: `GET http://47.111.95.19:3000/main-business-net-profit/{period}`
- **示例**: http://47.111.95.19:3000/main-business-net-profit/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 各板块的净利润贡献预算
```json
{
  "success": true,
  "data": {
    "equipment": [
      {"customerType": "上海", "plan": "2,145.03", "actual": "176.38", "contribution": "8.22%"}
    ]
  }
}
```

#### 12. 回款结构质量
- **接口**: `GET http://47.111.95.19:3000/receipt-structure/{period}`
- **示例**: http://47.111.95.19:3000/receipt-structure/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 回款结构的预算数据（总计61000万元）
```json
{
  "success": true,
  "data": {
    "equipment": [
      {"customerType": "上海", "plan": "25,000.00", "actual": "2,863.84", "progress": "11.46%"}
    ]
  }
}
```

#### 13. 应收账款情况
- **接口**: `GET http://47.111.95.19:3000/accounts-receivable/{period}`
- **示例**: http://47.111.95.19:3000/accounts-receivable/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 应收账款的预算数据

#### 14. 逾期应收账款情况
- **接口**: `GET http://47.111.95.19:3000/overdue-receivables/{period}`
- **示例**: http://47.111.95.19:3000/overdue-receivables/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 逾期应收账款的预算数据

#### 15. 坏账准备情况
- **接口**: `GET http://47.111.95.19:3000/bad-debt-provision/{period}`
- **示例**: http://47.111.95.19:3000/bad-debt-provision/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 坏账准备的预算数据

#### 16. 非主营业务净利润贡献
- **接口**: `GET http://47.111.95.19:3000/non-main-business-net-profit/{period}`
- **示例**: http://47.111.95.19:3000/non-main-business-net-profit/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 各项非主营业务净利润贡献的预算数据
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "固废收入",
      "plan": "0",
      "actual": "0",
      "progress": "0.00%",
      "yearlyPlan": 12.83
    },
    {
      "id": 2,
      "name": "房屋租金",
      "plan": "1000",
      "actual": "123",
      "progress": "480.84%",
      "yearlyPlan": 25.58
    }
  ]
}
```

#### 17. 库存结构质量
- **接口**: `GET http://47.111.95.19:3000/inventory-structure/{period}`
- **示例**: http://47.111.95.19:3000/inventory-structure/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 设备、元件、工程各类别的库存结构预算数据
```json
{
  "success": true,
  "data": {
    "equipment": [
      {
        "customerType": "上海",
        "initialAmount": 39151.53,
        "currentAmount": 32606.27,
        "yearlyPlan": 39151.53,
        "progress": "83.28%"
      }
    ],
    "component": [
      {
        "customerType": "用户",
        "initialAmount": 26.6,
        "currentAmount": 103.44,
        "yearlyPlan": 26.6,
        "progress": "388.87%"
      }
    ]
  }
}
```

#### 18. 标书履约状况
- **接口**: `GET http://47.111.95.19:3000/bid-fulfillment/{period}`
- **示例**: http://47.111.95.19:3000/bid-fulfillment/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 设备、元件、工程各类别的标书履约预算数据
```json
{
  "success": true,
  "data": {
    "equipment": [
      {
        "customerType": "上海",
        "initialAmount": 0,
        "currentAmount": 0,
        "yearlyPlan": 31055.26,
        "progress": "0.00%"
      }
    ],
    "project": [
      {
        "customerType": "一包",
        "initialAmount": 0,
        "currentAmount": 0,
        "yearlyPlan": 8281.13,
        "progress": "0.00%"
      }
    ]
  }
}
```

#### 19. 在制品
- **接口**: `GET http://47.111.95.19:3000/inventory-in-progress/{period}`
- **示例**: http://47.111.95.19:3000/inventory-in-progress/2025-06
- **状态**: ✅ 预算数据正常
- **返回数据**: 设备、元件、工程各类别的在制品预算数据
```json
{
  "success": true,
  "data": {
    "equipment": [
      {
        "customerType": "上海",
        "initialAmount": 0,
        "currentAmount": 0,
        "yearlyPlan": 31055.26,
        "progress": "0.00%"
      }
    ],
    "component": [
      {
        "customerType": "用户",
        "initialAmount": 0,
        "currentAmount": 0,
        "yearlyPlan": 26.6,
        "progress": "0.00%"
      }
    ],
    "project": [
      {
        "customerType": "一包",
        "initialAmount": 0,
        "currentAmount": 0,
        "yearlyPlan": 8281.13,
        "progress": "0.00%"
      }
    ]
  }
}
```

---

### ⚠️ **需要修复的API接口（4个）**

---

## 🔧 API测试命令

### curl 测试命令示例

```bash
# 测试正常工作的API
curl "http://47.111.95.19:3000/main-business-income/2025-07" | jq '.data.equipment[0]'
curl "http://47.111.95.19:3000/new-orders/2025-06" | jq '.data.equipment[0]'
curl "http://47.111.95.19:3000/project-tracking/2025-06" | jq '.data.equipment[0]'

# 测试有问题的API
curl "http://47.111.95.19:3000/non-main-business-net-profit/2025-06" | jq '.data[0]'
```

### 浏览器测试

直接在浏览器中访问以下URL：
- http://47.111.95.19:3000/main-business-income/2025-07
- http://47.111.95.19:3000/new-orders/2025-06
- http://47.111.95.19:3000/project-tracking/2025-06

---

## 📊 统计信息

- **总API数量**: 23个
- **预算数据正常**: 22个 (96%)
- **需要修复**: 1个 (4%)
- **预算数据总量**: 277条记录
- **中间件集成**: 100% 完成

---

## 📝 使用说明

### 期间格式
- 格式: `YYYY-MM`
- 示例: `2025-06`, `2025-07`

### 响应格式
所有API返回统一格式：
```json
{
  "success": true,
  "data": { /* 具体数据 */ },
  "period": "2025-06-30T16:00:00.000Z",
  "updated_at": "2025-06-27T06:31:35.000Z"
}
```

### 预算数据字段
- `yearlyPlan`: 年度预算计划
- `currentTotal`: 当期累计完成
- `progress`: 执行进度百分比