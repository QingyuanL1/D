// 资产负债表数据模板
// 注意：实际的数据结构在 Vue 组件中定义，这里仅作为参考
export default {
  assets: {
    current: [
      { name: '货币资金', endBalance: 0, beginBalance: 0 },
      { name: '交易性金融资产', endBalance: 0, beginBalance: 0 },
      { name: '衍生金融资产', endBalance: 0, beginBalance: 0 },
      { name: '应收票据', endBalance: 0, beginBalance: 0 },
      { name: '应收账款', endBalance: 0, beginBalance: 0 },
      // ... 其他流动资产项
    ],
    currentTotal: {
      endBalance: 0,
      beginBalance: 0,
    },
    nonCurrent: [
      { name: '债权投资', endBalance: 0, beginBalance: 0 },
      { name: '长期应收款', endBalance: 0, beginBalance: 0 },
      { name: '长期股权投资', endBalance: 0, beginBalance: 0 },
      { name: '固定资产', endBalance: 0, beginBalance: 0 },
      // ... 其他非流动资产项
    ],
    nonCurrentTotal: {
      endBalance: 0,
      beginBalance: 0,
    },
  },
  liabilities: {
    current: [
      { name: '短期借款', endBalance: 0, beginBalance: 0 },
      { name: '交易性金融负债', endBalance: 0, beginBalance: 0 },
      { name: '应付票据', endBalance: 0, beginBalance: 0 },
      { name: '应付账款', endBalance: 0, beginBalance: 0 },
      // ... 其他流动负债项
    ],
    currentTotal: {
      endBalance: 0,
      beginBalance: 0,
    },
    nonCurrent: [
      { name: '长期借款', endBalance: 0, beginBalance: 0 },
      { name: '应付债券', endBalance: 0, beginBalance: 0 },
      { name: '租赁负债', endBalance: 0, beginBalance: 0 },
      // ... 其他非流动负债项
    ],
    nonCurrentTotal: {
      endBalance: 0,
      beginBalance: 0,
    },
  },
  equity: [
    { name: '实收资本（或股本）', endBalance: 0, beginBalance: 0 },
    { name: '资本公积', endBalance: 0, beginBalance: 0 },
    { name: '盈余公积', endBalance: 0, beginBalance: 0 },
    { name: '未分配利润', endBalance: 0, beginBalance: 0 },
    // ... 其他所有者权益项
  ],
  equityTotal: {
    endBalance: 0,
    beginBalance: 0,
  },
  total: {
    endBalance: 0,
    beginBalance: 0,
  },
};