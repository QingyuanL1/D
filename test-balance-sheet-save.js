// 测试资产负债表保存功能
const testData = {
  period: "2025-08",
  data: {
    total: {
      endBalance: 1000,
      beginBalance: 1000
    },
    assets: {
      current: [
        { name: "货币资金", endBalance: 500, beginBalance: 500 },
        { name: "交易性金融资产", endBalance: 0, beginBalance: 0 }
      ],
      nonCurrent: [
        { name: "固定资产", endBalance: 500, beginBalance: 500 }
      ],
      currentTotal: {
        endBalance: 500,
        beginBalance: 500
      },
      nonCurrentTotal: {
        endBalance: 500,
        beginBalance: 500
      }
    },
    equity: [
      { name: "实收资本（或股本）", endBalance: 800, beginBalance: 800 },
      { name: "未分配利润", endBalance: 0, beginBalance: 0 }
    ],
    equityTotal: {
      endBalance: 800,
      beginBalance: 800
    },
    liabilities: {
      current: [
        { name: "短期借款", endBalance: 200, beginBalance: 200 }
      ],
      nonCurrent: [],
      currentTotal: {
        endBalance: 200,
        beginBalance: 200
      },
      nonCurrentTotal: {
        endBalance: 0,
        beginBalance: 0
      }
    }
  }
};

async function testSave() {
  try {
    console.log('开始测试保存功能...');
    
    const response = await fetch('http://127.0.0.1:3000/balance-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    console.log('响应状态:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('保存失败:', error);
      return;
    }

    const result = await response.json();
    console.log('保存成功:', result);
    
    // 测试读取
    console.log('测试读取数据...');
    const getResponse = await fetch(`http://127.0.0.1:3000/balance-sheet/${testData.period}`);
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('读取成功:', getData);
    } else {
      console.error('读取失败:', getResponse.status);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 在Node.js环境中运行
if (typeof window === 'undefined') {
  // Node.js环境
  const fetch = require('node-fetch');
  testSave();
} else {
  // 浏览器环境
  window.testBalanceSheetSave = testSave;
  console.log('测试函数已加载，请在控制台运行: testBalanceSheetSave()');
}
