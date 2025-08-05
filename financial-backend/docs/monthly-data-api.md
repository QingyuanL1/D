# 主营业务净利润月度数据接口

## 接口说明

这个接口专门为前端组件提供主营业务净利润的当月值和累计值数据，完全符合前端组件的数据结构要求。

## 接口地址

```
GET /main-business-net-profit/monthly-data/{period}
```

## 参数说明

- `period`: 期间，格式为 YYYY-MM（如：2025-01, 2025-07）

## 计算逻辑

### 当月值计算
**当月值 = 当月收入 - 当月材料成本 - 当月成本中心收入**

- 当月收入：来自 `main_business_income.data.{segment}.currentMonthIncome`
- 当月材料成本：来自 `main_business_cost.current_material_cost`
- 当月成本中心收入：来自 `cost_center_structure.data.{segment}Data.currentMonthIncome`

### 累计值计算
**累计值 = 1月当月值 + 2月当月值 + ... + 当前月当月值**

例如：7月的累计值 = 1月到7月每个月当月值的总和

## 返回数据结构

```json
{
  "success": true,
  "data": {
    "equipment": [
      {
        "customer": "上海",
        "yearlyPlan": 22000,
        "currentMonthValue": 186.71,    // 当月净利润
        "cumulativeValue": 266.71,      // 累计净利润
        "progress": "1.96%",
        "contribution": "1.21%"         // 累计值占年度计划的比例
      }
    ],
    "components": [...],
    "engineering": [...]
  },
  "period": "2025-02",
  "description": "当月值为当期净利润，累计值为年初至当前月的累计净利润"
}
```

## 使用示例

### 获取2025年1月数据
```bash
curl -X GET "http://localhost:3000/main-business-net-profit/monthly-data/2025-01"
```

**结果：**
- 上海客户：当月值 186.71，累计值 186.71（1月=累计）

### 获取2025年2月数据
```bash
curl -X GET "http://localhost:3000/main-business-net-profit/monthly-data/2025-02"
```

**结果：**
- 上海客户：当月值 80.00，累计值 266.71（1月186.71 + 2月80.00）

### 获取2025年7月数据
```bash
curl -X GET "http://localhost:3000/main-business-net-profit/monthly-data/2025-07"
```

**结果：**
- 累计值 = 1月到7月每个月当月值的总和

## 前端组件集成

这个接口返回的数据结构完全匹配前端组件的需求：

```javascript
// 前端可以直接使用返回的数据
const response = await fetch('/main-business-net-profit/monthly-data/2025-07');
const { data } = await response.json();

// 设置组件数据
equipmentData.value = data.equipment.map(item => ({
    customerType: item.customer,
    plan: item.yearlyPlan.toString(),
    currentMonthValue: item.currentMonthValue.toFixed(2),
    actual: item.cumulativeValue.toFixed(2),
    contribution: item.contribution
}));
```

## 优势

1. **准确计算**：基于实际的收入、成本和成本中心数据
2. **自动累计**：自动计算年初至当前月的累计值
3. **数据一致性**：确保当月值和累计值的逻辑一致性
4. **前端友好**：返回格式直接匹配前端组件需求
5. **性能优化**：一次请求获取所有需要的数据

## 注意事项

- 如果某个月份没有数据，该月的当月值为0，不影响累计计算
- 负数是正常的业务情况（如成本超过收入）
- 贡献占比基于累计值计算：`累计值 / 年度计划 * 100%`
