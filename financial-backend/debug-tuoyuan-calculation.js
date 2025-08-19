/**
 * 调试拓源毛利率计算差异
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://47.111.95.19:3000';

async function debugTuoyuanCalculation() {
  console.log('🔍 调试拓源毛利率计算差异');
  console.log('='.repeat(60));

  try {
    const period = '2025-01';
    
    // 1. 获取原始API数据
    console.log('\n1️⃣ 获取原始API数据...');
    const originalResponse = await fetch(`${BASE_URL}/tuoyuan-main-business-profit-margin/calculate/${period}`);
    const originalResult = await originalResponse.json();
    
    console.log('原始API数据:');
    originalResult.data.items.forEach(item => {
      console.log(`  ${item.segmentAttribute}-${item.customerAttribute}: 毛利率=${item.currentActual}%, 计划=${item.yearlyPlan}%`);
    });
    
    // 手动计算原始API的加权平均
    let originalTotalWeightedRate = 0;
    let originalTotalWeight = 0;
    
    console.log('\n原始API加权计算过程:');
    originalResult.data.items.forEach(item => {
      const rate = item.currentActual || 0;
      const weight = item.yearlyPlan > 0 ? item.yearlyPlan : 1;
      const weightedValue = rate * weight;
      
      originalTotalWeightedRate += weightedValue;
      originalTotalWeight += weight;
      
      console.log(`  ${item.customerAttribute}: ${rate}% × ${weight} = ${weightedValue.toFixed(2)}`);
    });
    
    const originalAvg = originalTotalWeight > 0 ? originalTotalWeightedRate / originalTotalWeight : 0;
    console.log(`总加权值: ${originalTotalWeightedRate.toFixed(2)}`);
    console.log(`总权重: ${originalTotalWeight}`);
    console.log(`加权平均: ${originalAvg.toFixed(2)}%`);

    // 2. 获取收入和成本数据，手动计算
    console.log('\n2️⃣ 获取基础数据并手动计算...');
    
    const incomeResponse = await fetch(`${BASE_URL}/tuoyuan-main-business-income-breakdown/${period}`);
    const incomeResult = await incomeResponse.json();
    
    const costResponse = await fetch(`${BASE_URL}/tuoyuan-main-business-cost-structure-quality/${period}`);
    const costResult = await costResponse.json();
    
    console.log('\n收入数据:');
    incomeResult.data.items.forEach(item => {
      console.log(`  ${item.segmentAttribute}-${item.customerAttribute}: 收入=${item.currentCumulative}`);
    });
    
    console.log('\n成本数据:');
    costResult.data.equipment.forEach(item => {
      console.log(`  ${item.customerType}: 材料=${item.cumulativeMaterialCost}, 人工=${item.cumulativeLaborCost}, 总成本=${item.cumulativeMaterialCost + item.cumulativeLaborCost}`);
    });
    
    // 3. 手动计算毛利率
    console.log('\n3️⃣ 手动计算毛利率...');
    const manualItems = [];
    
    for (const incomeItem of incomeResult.data.items) {
      const segmentAttribute = incomeItem.segmentAttribute;
      const customerAttribute = incomeItem.customerAttribute;
      const cumulativeIncome = incomeItem.currentCumulative || 0;
      
      // 查找对应的成本数据
      let totalCost = 0;
      const costItem = costResult.data.equipment.find(cost => 
        cost.customerType === customerAttribute
      );
      
      if (costItem) {
        const materialCost = parseFloat(costItem.cumulativeMaterialCost || 0);
        const laborCost = parseFloat(costItem.cumulativeLaborCost || 0);
        totalCost = materialCost + laborCost;
      }
      
      // 计算毛利率
      let profitMargin = 0;
      if (cumulativeIncome > 0) {
        profitMargin = ((cumulativeIncome - totalCost) / cumulativeIncome) * 100;
      }
      
      // 获取年度计划值
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
      
      const yearlyPlan = plans[segmentAttribute] && plans[segmentAttribute][customerAttribute] !== undefined 
        ? plans[segmentAttribute][customerAttribute] 
        : 0;
      
      const item = {
        segmentAttribute: segmentAttribute,
        customerAttribute: customerAttribute,
        yearlyPlan: yearlyPlan,
        currentActual: Number(profitMargin.toFixed(2)),
        income: cumulativeIncome,
        cost: totalCost
      };
      
      manualItems.push(item);
      
      console.log(`  ${customerAttribute}:`);
      console.log(`    收入: ${cumulativeIncome}, 成本: ${totalCost}`);
      console.log(`    毛利率: ${profitMargin.toFixed(2)}%, 计划: ${yearlyPlan}%`);
    }
    
    // 4. 手动计算加权平均
    console.log('\n4️⃣ 手动计算加权平均...');
    let manualTotalWeightedRate = 0;
    let manualTotalWeight = 0;
    
    manualItems.forEach(item => {
      const rate = item.currentActual || 0;
      const weight = item.yearlyPlan > 0 ? item.yearlyPlan : 1;
      const weightedValue = rate * weight;
      
      manualTotalWeightedRate += weightedValue;
      manualTotalWeight += weight;
      
      console.log(`  ${item.customerAttribute}: ${rate}% × ${weight} = ${weightedValue.toFixed(2)}`);
    });
    
    const manualAvg = manualTotalWeight > 0 ? manualTotalWeightedRate / manualTotalWeight : 0;
    console.log(`总加权值: ${manualTotalWeightedRate.toFixed(2)}`);
    console.log(`总权重: ${manualTotalWeight}`);
    console.log(`加权平均: ${manualAvg.toFixed(2)}%`);
    
    // 5. 对比结果
    console.log('\n5️⃣ 对比结果...');
    console.log(`原始API加权平均: ${originalAvg.toFixed(2)}%`);
    console.log(`手动计算加权平均: ${manualAvg.toFixed(2)}%`);
    console.log(`差异: ${Math.abs(originalAvg - manualAvg).toFixed(2)}%`);
    
    if (Math.abs(originalAvg - manualAvg) < 0.01) {
      console.log('✅ 计算结果一致！');
    } else {
      console.log('❌ 计算结果不一致，需要进一步调试');
      
      // 详细对比每个项目
      console.log('\n详细项目对比:');
      for (let i = 0; i < originalResult.data.items.length; i++) {
        const original = originalResult.data.items[i];
        const manual = manualItems.find(item => 
          item.segmentAttribute === original.segmentAttribute && 
          item.customerAttribute === original.customerAttribute
        );
        
        if (manual) {
          const rateMatch = Math.abs(original.currentActual - manual.currentActual) < 0.01;
          console.log(`  ${original.customerAttribute}: 原始${original.currentActual}% vs 手动${manual.currentActual}% ${rateMatch ? '✅' : '❌'}`);
        }
      }
    }

  } catch (error) {
    console.error('调试过程出错:', error);
  }
}

// 运行调试
if (require.main === module) {
  debugTuoyuanCalculation()
    .then(() => {
      console.log('\n✅ 调试完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ 调试失败:', error);
      process.exit(1);
    });
}

module.exports = { debugTuoyuanCalculation };
