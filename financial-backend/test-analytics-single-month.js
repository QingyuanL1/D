/**
 * 测试analytics API中单个月份的计算
 */

const fetch = require('node-fetch');
const { pool } = require('./config/database');

// 复制analytics.js中的所有相关函数
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

async function calculateTuoyuanHistoricalCosts(currentPeriod, customerAttribute, costType) {
  try {
    const [year, month] = currentPeriod.split('-');
    const currentMonth = parseInt(month);
    let totalCost = 0;

    for (let m = 1; m <= currentMonth; m++) {
      const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;
      
      try {
        const [rows] = await pool.execute(
          'SELECT * FROM tuoyuan_main_business_cost_structure_quality WHERE period = ?',
          [monthPeriod]
        );

        const monthCostItem = rows.find(row => row.customer_type === customerAttribute);
        if (monthCostItem) {
          let monthCost = 0;
          if (costType === 'labor') {
            monthCost = parseFloat(monthCostItem.current_labor_cost || 0);
          } else if (costType === 'material') {
            monthCost = parseFloat(monthCostItem.current_material_cost || 0);
          }
          
          if (monthCost > 0) {
            totalCost += monthCost;
          }
        }
      } catch (monthError) {
        continue;
      }
    }
    
    return totalCost;
    
  } catch (error) {
    console.error('计算历史累计成本失败:', error);
    return 0;
  }
}

async function calculateTuoyuanMonthlyProfitMargin(period) {
  try {
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return null;
    }

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

    const calculatedItems = [];

    for (const incomeItem of incomeData.items) {
      const segmentAttribute = incomeItem.segmentAttribute;
      const customerAttribute = incomeItem.customerAttribute;
      const cumulativeIncome = incomeItem.currentCumulative || 0;

      let totalCost = 0;
      if (costData.equipment) {
        const costItem = costData.equipment.find(cost => 
          cost.customerType === customerAttribute
        );
        
        if (costItem) {
          const cumulativeMaterialCost = parseFloat(costItem.cumulativeMaterialCost || 0);
          const cumulativeLaborCost = parseFloat(costItem.cumulativeLaborCost || 0);
          
          let materialCost = cumulativeMaterialCost;
          let laborCost = cumulativeLaborCost;
          
          if (materialCost === 0) {
            materialCost = await calculateTuoyuanHistoricalCosts(period, customerAttribute, 'material');
          }
          if (laborCost === 0) {
            laborCost = await calculateTuoyuanHistoricalCosts(period, customerAttribute, 'labor');
          }
          
          totalCost = materialCost + laborCost;
        }
      }

      let profitMargin = 0;
      if (cumulativeIncome > 0) {
        profitMargin = ((cumulativeIncome - totalCost) / cumulativeIncome) * 100;
      }

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

// 模拟analytics.js中的月度计算逻辑
async function simulateAnalyticsMonthCalculation(period) {
  console.log(`🔍 模拟analytics.js中${period}的计算过程...`);
  
  try {
    // 直接计算该月数据 - 替代API调用
    console.log(`🔍 开始计算${period}数据...`);
    const result = await calculateTuoyuanMonthlyProfitMargin(period);
    
    if (result && result.success && result.data && result.data.items) {
      console.log(`✅ ${period}计算成功，获得${result.data.items.length}条数据`);
      
      // 计算该月的加权平均毛利率
      let totalWeightedRate = 0;
      let totalWeight = 0;
      
      console.log(`📊 ${period}加权计算过程:`);
      result.data.items.forEach(item => {
        const rate = item.currentActual || 0;
        const weight = item.yearlyPlan > 0 ? item.yearlyPlan : 1; // 使用年度计划作为权重
        const weightedValue = rate * weight;
        
        totalWeightedRate += weightedValue;
        totalWeight += weight;
        
        console.log(`   ${item.customerAttribute}: ${rate}% × ${weight} = ${weightedValue.toFixed(2)}`);
      });
      
      const monthRate = totalWeight > 0 ? totalWeightedRate / totalWeight : 0;
      console.log(`   总加权值: ${totalWeightedRate.toFixed(2)}, 总权重: ${totalWeight}, 加权平均: ${monthRate.toFixed(2)}%`);
      
      return Number(monthRate.toFixed(2));
    } else {
      console.log(`❌ ${period}计算失败或无数据`);
      return null;
    }
  } catch (error) {
    console.error(`计算${period}拓源毛利率数据失败:`, error);
    return null;
  }
}

async function testAnalyticsSingleMonth() {
  console.log('🧪 测试analytics API中单个月份的计算');
  console.log('='.repeat(60));

  try {
    const period = '2025-01';
    
    // 1. 模拟analytics.js的计算过程
    console.log('\n1️⃣ 模拟analytics.js的计算过程...');
    const analyticsResult = await simulateAnalyticsMonthCalculation(period);
    
    // 2. 调用原始API对比
    console.log('\n2️⃣ 调用原始API对比...');
    const originalResponse = await fetch(`http://47.111.95.19:3000/tuoyuan-main-business-profit-margin/calculate/${period}`);
    const originalResult = await originalResponse.json();
    
    if (originalResult.success) {
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
      
      // 3. 对比结果
      console.log('\n3️⃣ 对比结果...');
      console.log(`Analytics模拟结果: ${analyticsResult}%`);
      console.log(`原始API结果: ${originalAvg.toFixed(2)}%`);
      
      if (analyticsResult !== null && Math.abs(analyticsResult - originalAvg) < 0.01) {
        console.log('✅ 结果一致！');
      } else {
        console.log('❌ 结果不一致！');
        console.log(`差异: ${analyticsResult !== null ? Math.abs(analyticsResult - originalAvg).toFixed(2) : 'N/A'}%`);
      }
    }
    
    // 4. 调用实际的analytics API
    console.log('\n4️⃣ 调用实际的analytics API...');
    const analyticsApiResponse = await fetch(`http://47.111.95.19:3000/analytics/tuoyuan-profit-margin/2025`);
    const analyticsApiResult = await analyticsApiResponse.json();
    
    if (analyticsApiResult.success && analyticsApiResult.data.monthlyData) {
      const actualAnalyticsResult = analyticsApiResult.data.monthlyData[0]; // 1月份
      console.log(`实际Analytics API 1月结果: ${actualAnalyticsResult}%`);
      
      console.log('\n📊 最终对比:');
      console.log(`模拟Analytics计算: ${analyticsResult}%`);
      console.log(`实际Analytics API: ${actualAnalyticsResult}%`);
      console.log(`原始API: ${originalAvg.toFixed(2)}%`);
      
      if (analyticsResult !== null && Math.abs(analyticsResult - actualAnalyticsResult) < 0.01) {
        console.log('✅ 模拟与实际Analytics API一致！');
      } else {
        console.log('❌ 模拟与实际Analytics API不一致！');
        console.log('这说明analytics.js中可能有其他问题');
      }
    }

  } catch (error) {
    console.error('测试过程出错:', error);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// 运行测试
if (require.main === module) {
  testAnalyticsSingleMonth()
    .then(() => {
      console.log('\n✅ 测试完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ 测试失败:', error);
      process.exit(1);
    });
}

module.exports = { testAnalyticsSingleMonth };
