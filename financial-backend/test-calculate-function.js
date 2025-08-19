/**
 * 测试calculateTuoyuanMonthlyProfitMargin函数
 */

const fetch = require('node-fetch');

// 复制analytics.js中的函数
function getTuoyuanYearlyPlan(segmentAttribute, customerAttribute) {
  const plans = {
    '设备': {
      '电业项目': 8.00,
      '用户项目': 0,
      '贸易': 0,
      '代理设备': 24.99
    },
    '其他': {
      '代理工程': 0,
      '代理设计': 100
    }
  };

  return plans[segmentAttribute] && plans[segmentAttribute][customerAttribute] !== undefined 
    ? plans[segmentAttribute][customerAttribute] 
    : 0;
}

async function calculateTuoyuanMonthlyProfitMargin(period) {
  try {
    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return null;
    }

    // 1. 获取主营业务收入数据 - 调用收入API
    const incomeResponse = await fetch(`http://47.111.95.19:3000/tuoyuan-main-business-income-breakdown/${period}`);
    let incomeData = null;

    if (incomeResponse.ok) {
      const incomeResult = await incomeResponse.json();
      if (incomeResult.success) {
        incomeData = incomeResult.data;
      }
    }

    if (!incomeData) {
      return null;
    }

    // 2. 获取主营业务成本数据 - 调用成本API
    const costResponse = await fetch(`http://47.111.95.19:3000/tuoyuan-main-business-cost-structure-quality/${period}`);
    let costData = null;

    if (costResponse.ok) {
      const costResult = await costResponse.json();
      if (costResult.success) {
        costData = costResult.data;
      }
    }

    if (!costData) {
      return null;
    }

    // 3. 计算各板块的毛利率 - 完全复制原始逻辑
    const calculatedItems = [];

    // 遍历收入数据计算毛利率
    for (const incomeItem of incomeData.items) {
      const segmentAttribute = incomeItem.segmentAttribute;
      const customerAttribute = incomeItem.customerAttribute;
      const cumulativeIncome = incomeItem.currentCumulative || 0;

      // 查找对应的成本数据
      let totalCost = 0;
      if (costData.equipment) {
        const costItem = costData.equipment.find(cost => 
          cost.customerType === customerAttribute
        );
        
        if (costItem) {
          // 获取累计材料成本（直接费用）和累计人工成本（制造费用）
          const cumulativeMaterialCost = parseFloat(costItem.cumulativeMaterialCost || 0);
          const cumulativeLaborCost = parseFloat(costItem.cumulativeLaborCost || 0);
          
          let materialCost = cumulativeMaterialCost;
          let laborCost = cumulativeLaborCost;
          
          // 总成本 = 材料成本（直接费用） + 人工成本（制造费用）
          totalCost = materialCost + laborCost;
        }
      }

      // 计算毛利率：(收入-成本)/收入 * 100%
      let profitMargin = 0;
      if (cumulativeIncome > 0) {
        profitMargin = ((cumulativeIncome - totalCost) / cumulativeIncome) * 100;
      }

      // 获取年度计划值
      const yearlyPlan = getTuoyuanYearlyPlan(segmentAttribute, customerAttribute);
      const deviation = profitMargin - yearlyPlan;

      calculatedItems.push({
        segmentAttribute: segmentAttribute,
        customerAttribute: customerAttribute,
        yearlyPlan: yearlyPlan,
        currentActual: Number(profitMargin.toFixed(2)),
        deviation: Number(deviation.toFixed(2))
      });
    }

    return {
      success: true,
      data: {
        period: period,
        items: calculatedItems
      }
    };

  } catch (error) {
    console.error('计算拓源公司毛利率失败:', error);
    return null;
  }
}

async function testCalculateFunction() {
  console.log('🧪 测试calculateTuoyuanMonthlyProfitMargin函数');
  console.log('='.repeat(60));

  try {
    const period = '2025-01';
    
    // 1. 调用我的函数
    console.log('\n1️⃣ 调用我的计算函数...');
    const myResult = await calculateTuoyuanMonthlyProfitMargin(period);
    
    if (myResult && myResult.success) {
      console.log('✅ 我的函数计算成功');
      console.log('我的函数返回的数据:');
      myResult.data.items.forEach(item => {
        console.log(`  ${item.segmentAttribute}-${item.customerAttribute}: 毛利率=${item.currentActual}%, 计划=${item.yearlyPlan}%`);
      });
      
      // 计算我的函数的加权平均
      let myTotalWeightedRate = 0;
      let myTotalWeight = 0;
      
      myResult.data.items.forEach(item => {
        const rate = item.currentActual || 0;
        const weight = item.yearlyPlan > 0 ? item.yearlyPlan : 1;
        myTotalWeightedRate += rate * weight;
        myTotalWeight += weight;
      });
      
      const myAvg = myTotalWeight > 0 ? myTotalWeightedRate / myTotalWeight : 0;
      console.log(`我的函数加权平均: ${myAvg.toFixed(2)}%`);
      
    } else {
      console.log('❌ 我的函数计算失败');
      return;
    }
    
    // 2. 调用原始API
    console.log('\n2️⃣ 调用原始API...');
    const originalResponse = await fetch(`http://47.111.95.19:3000/tuoyuan-main-business-profit-margin/calculate/${period}`);
    const originalResult = await originalResponse.json();
    
    if (originalResult.success) {
      console.log('✅ 原始API调用成功');
      console.log('原始API返回的数据:');
      originalResult.data.items.forEach(item => {
        console.log(`  ${item.segmentAttribute}-${item.customerAttribute}: 毛利率=${item.currentActual}%, 计划=${item.yearlyPlan}%`);
      });
      
      // 计算原始API的加权平均
      let originalTotalWeightedRate = 0;
      let originalTotalWeight = 0;
      
      originalResult.data.items.forEach(item => {
        const rate = item.currentActual || 0;
        const weight = item.yearlyPlan > 0 ? item.yearlyPlan : 1;
        originalTotalWeightedRate += rate * weight;
        originalTotalWeight += weight;
      });
      
      const originalAvg = originalTotalWeight > 0 ? originalTotalWeightedRate / originalTotalWeight : 0;
      console.log(`原始API加权平均: ${originalAvg.toFixed(2)}%`);
      
    } else {
      console.log('❌ 原始API调用失败');
      return;
    }
    
    // 3. 对比结果
    console.log('\n3️⃣ 对比结果...');
    
    if (myResult.data.items.length !== originalResult.data.items.length) {
      console.log(`❌ 数据条数不一致: 我的${myResult.data.items.length}条 vs 原始${originalResult.data.items.length}条`);
      return;
    }
    
    let allMatch = true;
    for (let i = 0; i < originalResult.data.items.length; i++) {
      const original = originalResult.data.items[i];
      const mine = myResult.data.items.find(item => 
        item.segmentAttribute === original.segmentAttribute && 
        item.customerAttribute === original.customerAttribute
      );
      
      if (!mine) {
        console.log(`❌ 未找到匹配项: ${original.segmentAttribute}-${original.customerAttribute}`);
        allMatch = false;
        continue;
      }
      
      const rateMatch = Math.abs(original.currentActual - mine.currentActual) < 0.01;
      const planMatch = original.yearlyPlan === mine.yearlyPlan;
      
      if (!rateMatch || !planMatch) {
        console.log(`❌ ${original.customerAttribute}: 原始${original.currentActual}%/${original.yearlyPlan}% vs 我的${mine.currentActual}%/${mine.yearlyPlan}%`);
        allMatch = false;
      } else {
        console.log(`✅ ${original.customerAttribute}: 数据一致`);
      }
    }
    
    if (allMatch) {
      console.log('\n🎉 所有数据完全一致！我的函数工作正常！');
    } else {
      console.log('\n⚠️  存在数据不一致，需要进一步调试');
    }

  } catch (error) {
    console.error('测试过程出错:', error);
  }
}

// 运行测试
if (require.main === module) {
  testCalculateFunction()
    .then(() => {
      console.log('\n✅ 测试完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ 测试失败:', error);
      process.exit(1);
    });
}

module.exports = { testCalculateFunction };
