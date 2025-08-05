# 主营业务净利润当期金额计算接口

## 接口说明

这个新接口用于计算主营业务净利润的当期金额，基于以下公式：

**当期金额 = 累计收入 - 当期材料成本 - 成本中心累计收入**

## 接口地址

```
GET /main-business-net-profit/calculate/{period}
```

## 参数说明

- `period`: 期间，格式为 YYYY-MM（如：2025-01）

## 数据来源

1. **累计收入**: 来自 `main_business_income` 表中的 `data.{segment}.accumulatedIncome`
2. **当期材料成本**: 来自 `main_business_cost` 表中的 `current_material_cost`
3. **成本中心累计收入**: 来自 `cost_center_structure` 表中的 `data.{segment}Data.cumulativeIncome`

## 返回数据结构

```json
{
  "success": true,
  "data": {
    "equipment": [
      {
        "customer": "上海",
        "yearlyPlan": 22000,
        "accumulatedIncome": 430.57,
        "materialCost": 233.86,
        "centerIncome": 10,
        "currentAmount": 186.71,
        "progress": "1.96%"
      }
    ],
    "components": [...],
    "engineering": [...]
  },
  "period": "2025-01",
  "calculation": {
    "formula": "当期金额 = 累计收入 - 当期材料成本 - 成本中心累计收入",
    "description": "基于main_business_income.accumulatedIncome - main_business_cost.current_material_cost - cost_center_structure.cumulativeIncome计算"
  }
}
```

## 使用示例

### 获取2025年1月的计算结果

```bash
curl -X GET "http://localhost:3000/main-business-net-profit/calculate/2025-01" \
     -H "Content-Type: application/json"
```

### 获取2025年2月的计算结果

```bash
curl -X GET "http://localhost:3000/main-business-net-profit/calculate/2025-02" \
     -H "Content-Type: application/json"
```

## 错误处理

- 如果期间格式不正确，返回 400 错误
- 如果找不到对应期间的数据，返回 404 错误
- 如果计算过程中出现错误，返回 500 错误

## 注意事项

1. 该接口会自动处理客户类型名称的匹配，包括"其它"和"其他"的互换匹配
2. 计算结果中的 `currentAmount` 可能为负数，这是正常的业务情况
3. 接口会返回详细的计算过程数据，便于调试和验证
4. 主营业务收入数据使用日期格式（YYYY-MM-01），其他数据使用期间格式（YYYY-MM）

## 板块映射关系

- **设备板块**: `equipment` -> `equipmentData`
- **元件板块**: `components` -> `componentData`  
- **工程板块**: `engineering` -> `engineeringData`

## 计算逻辑

对于每个客户和板块组合：

1. 从主营业务收入数据中获取累计收入
2. 从主营业务成本数据中获取对应的当期材料成本
3. 从成本中心结构数据中获取对应的累计收入
4. 按公式计算：当期金额 = 累计收入 - 当期材料成本 - 成本中心累计收入

这个计算结果可以直接用于前端的主营业务净利润贡献情况表格显示。
