/**
 * 测试资产负债表期初余额功能
 * 验证期初余额是否正确从前一个月的期末余额获取
 */

const BASE_URL = 'http://47.111.95.19:3000';

// 测试数据：2024年1月的资产负债表数据
const testData2024_01 = {
  assets: {
    current: [
      { name: '货币资金', endBalance: 100000, beginBalance: 0 },
      { name: '应收账款', endBalance: 50000, beginBalance: 0 },
      { name: '存货', endBalance: 30000, beginBalance: 0 }
    ],
    currentTotal: { endBalance: 180000, beginBalance: 0 },
    nonCurrent: [
      { name: '固定资产', endBalance: 200000, beginBalance: 0 },
      { name: '无形资产', endBalance: 20000, beginBalance: 0 }
    ],
    nonCurrentTotal: { endBalance: 220000, beginBalance: 0 }
  },
  liabilities: {
    current: [
      { name: '应付账款', endBalance: 40000, beginBalance: 0 },
      { name: '短期借款', endBalance: 60000, beginBalance: 0 }
    ],
    currentTotal: { endBalance: 100000, beginBalance: 0 },
    nonCurrent: [
      { name: '长期借款', endBalance: 80000, beginBalance: 0 }
    ],
    nonCurrentTotal: { endBalance: 80000, beginBalance: 0 }
  },
  equity: [
    { name: '实收资本', endBalance: 150000, beginBalance: 0 },
    { name: '未分配利润', endBalance: 70000, beginBalance: 0 }
  ],
  equityTotal: { endBalance: 220000, beginBalance: 0 },
  total: { endBalance: 400000, beginBalance: 0 }
};

// 测试函数
async function testBalanceSheetBeginBalance() {
  console.log('🧪 开始测试资产负债表期初余额功能...\n');

  try {
    // 1. 保存2024年1月的数据
    console.log('📝 步骤1: 保存2024年1月的资产负债表数据...');
    const saveResponse = await fetch(`${BASE_URL}/balance-sheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        period: '2024-01',
        data: testData2024_01
      })
    });

    if (!saveResponse.ok) {
      throw new Error(`保存失败: ${saveResponse.status}`);
    }

    const saveResult = await saveResponse.json();
    console.log('✅ 2024年1月数据保存成功:', saveResult.message);

    // 2. 测试获取前一个月的期末余额（2024年2月获取2024年1月的期末余额）
    console.log('\n📊 步骤2: 测试获取前一个月的期末余额...');
    const previousResponse = await fetch(`${BASE_URL}/balance-sheet/2024-02/previous-end-balance`);

    if (!previousResponse.ok) {
      throw new Error(`获取前一个月数据失败: ${previousResponse.status}`);
    }

    const previousResult = await previousResponse.json();
    console.log('✅ 成功获取前一个月数据:', previousResult.message);
    console.log('📅 前一个月期间:', previousResult.previousPeriod);

    // 3. 验证数据是否正确
    console.log('\n🔍 步骤3: 验证数据正确性...');
    const previousData = previousResult.data;
    
    // 验证流动资产
    if (previousData.assets.current[0].endBalance === 100000) {
      console.log('✅ 货币资金期末余额正确: 100000');
    } else {
      console.log('❌ 货币资金期末余额错误:', previousData.assets.current[0].endBalance);
    }

    // 验证总计
    if (previousData.total.endBalance === 400000) {
      console.log('✅ 总计期末余额正确: 400000');
    } else {
      console.log('❌ 总计期末余额错误:', previousData.total.endBalance);
    }

    // 4. 测试1月份的特殊情况（应该返回404）
    console.log('\n🗓️ 步骤4: 测试1月份的特殊情况...');
    const januaryResponse = await fetch(`${BASE_URL}/balance-sheet/2024-01/previous-end-balance`);
    
    if (januaryResponse.status === 404) {
      const januaryResult = await januaryResponse.json();
      console.log('✅ 1月份正确返回404:', januaryResult.error);
      console.log('📅 查找的前一个月期间:', januaryResult.previousPeriod);
    } else {
      console.log('❌ 1月份应该返回404，但返回了:', januaryResponse.status);
    }

    // 5. 测试跨年的情况（2024年1月获取2023年12月）
    console.log('\n🎆 步骤5: 测试跨年情况...');
    const crossYearResponse = await fetch(`${BASE_URL}/balance-sheet/2024-01/previous-end-balance`);
    
    if (crossYearResponse.status === 404) {
      const crossYearResult = await crossYearResponse.json();
      console.log('✅ 跨年情况正确处理:', crossYearResult.error);
      console.log('📅 查找的前一个月期间:', crossYearResult.previousPeriod);
      
      if (crossYearResult.previousPeriod === '2023-12') {
        console.log('✅ 跨年月份计算正确: 2023-12');
      } else {
        console.log('❌ 跨年月份计算错误:', crossYearResult.previousPeriod);
      }
    }

    console.log('\n🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testBalanceSheetBeginBalance();
