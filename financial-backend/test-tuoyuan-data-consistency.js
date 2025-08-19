/**
 * 测试拓源毛利率数据一致性
 * 对比原始API和优化后的计算结果
 */

const fetch = require('node-fetch');
const { pool } = require('./config/database');

const BASE_URL = 'http://47.111.95.19:3000';

// 拓源年度计划配置
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

// 直接计算拓源毛利率（完全复制原始API逻辑）
async function calculateTuoyuanProfitMarginDirect(period) {
  try {
    console.log(`\n📊 直接计算拓源毛利率，期间: ${period}`);

    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
      console.log('❌ 无效的期间格式，应为YYYY-MM');
      return null;
    }

    // 1. 获取主营业务收入数据 - 调用收入API而不是直接查数据库
    const incomeResponse = await fetch(`${BASE_URL}/tuoyuan-main-business-income-breakdown/${period}`);
    let incomeData = null;

    if (incomeResponse.ok) {
      const incomeResult = await incomeResponse.json();
      if (incomeResult.success) {
        incomeData = incomeResult.data;
      }
    }

    if (!incomeData) {
      console.log(`❌ 未找到${period}期间的主营业务收入数据`);
      return null;
    }

    // 2. 获取主营业务成本数据 - 调用成本API而不是直接查数据库
    const costResponse = await fetch(`${BASE_URL}/tuoyuan-main-business-cost-structure-quality/${period}`);
    let costData = null;

    if (costResponse.ok) {
      const costResult = await costResponse.json();
      if (costResult.success) {
        costData = costResult.data;
      }
    }

    if (!costData) {
      console.log(`❌ 未找到${period}期间的主营业务成本数据`);
      return null;
    }

    console.log(`✅ 找到收入数据${incomeData.items.length}条，成本数据${costData.equipment.length}条`);

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

          // 如果累计成本为0，则计算前面所有月份的当期成本总和
          if (materialCost === 0) {
            materialCost = await calculateHistoricalCosts(period, customerAttribute, 'material');
          }
          if (laborCost === 0) {
            laborCost = await calculateHistoricalCosts(period, customerAttribute, 'labor');
          }

          // 总成本 = 材料成本（直接费用） + 人工成本（制造费用）
          totalCost = materialCost + laborCost;

          console.log(`   ${customerAttribute}: 收入=${cumulativeIncome}, 材料成本=${materialCost}, 人工成本=${laborCost}, 总成本=${totalCost}`);
        } else {
          console.log(`   ${customerAttribute}: 收入=${cumulativeIncome}, 未找到成本数据`);
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

      const item = {
        segmentAttribute: segmentAttribute,
        customerAttribute: customerAttribute,
        yearlyPlan: yearlyPlan,
        currentActual: Number(profitMargin.toFixed(2)),
        deviation: Number(deviation.toFixed(2))
      };

      calculatedItems.push(item);
      console.log(`   计算结果: 毛利率=${item.currentActual}%, 计划=${item.yearlyPlan}%, 偏差=${item.deviation}%`);
    }

    return {
      success: true,
      data: {
        period: period,
        items: calculatedItems
      },
      calculation: {
        formula: '毛利率 = (累计收入 - 累计材料成本 - 累计人工成本) / 累计收入 * 100%',
        description: '基于tuoyuan_main_business_income_breakdown.currentCumulative和tuoyuan_main_business_cost_structure_quality.cumulative_material_cost、cumulative_labor_cost计算'
      }
    };

  } catch (error) {
    console.error('直接计算失败:', error);
    return null;
  }
}

// 计算历史累计成本的辅助函数
async function calculateHistoricalCosts(currentPeriod, customerAttribute, costType) {
  try {
    const [year, month] = currentPeriod.split('-');
    const currentMonth = parseInt(month);
    let totalCost = 0;
    let monthsWithData = [];

    // 累计从年初到当前月份的所有当期成本
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
            monthsWithData.push(`${monthPeriod}:${monthCost}`);
          }
        }
      } catch (monthError) {
        // 继续处理下一个月份
        continue;
      }
    }

    if (monthsWithData.length > 0) {
      console.log(`     ${customerAttribute} ${costType}成本累计: ${totalCost} (数据月份: ${monthsWithData.join(', ')})`);
    } else {
      console.log(`     ${customerAttribute} ${costType}成本累计: 0 (${year}年1-${currentMonth}月均无数据)`);
    }

    return totalCost;

  } catch (error) {
    console.error('计算历史累计成本失败:', error);
    return 0;
  }
}

// 对比原始API和直接计算的结果
async function compareResults(period) {
  console.log(`\n🔍 对比期间 ${period} 的计算结果`);
  console.log('='.repeat(60));

  try {
    // 1. 调用原始API
    console.log('\n1️⃣ 调用原始API...');
    const originalResponse = await fetch(`${BASE_URL}/tuoyuan-main-business-profit-margin/calculate/${period}`);
    let originalResult = null;
    
    if (originalResponse.ok) {
      originalResult = await originalResponse.json();
      console.log(`✅ 原始API调用成功`);
      if (originalResult.success && originalResult.data && originalResult.data.items) {
        console.log(`📊 原始API返回${originalResult.data.items.length}条数据`);
      }
    } else {
      console.log(`❌ 原始API调用失败: ${originalResponse.status}`);
    }

    // 2. 直接计算
    console.log('\n2️⃣ 直接计算...');
    const directResult = await calculateTuoyuanProfitMarginDirect(period);

    // 3. 对比结果
    console.log('\n3️⃣ 对比结果...');
    
    if (!originalResult || !originalResult.success) {
      console.log('❌ 原始API无有效数据，无法对比');
      return false;
    }

    if (!directResult || !directResult.success) {
      console.log('❌ 直接计算无有效数据，无法对比');
      return false;
    }

    const originalItems = originalResult.data.items;
    const directItems = directResult.data.items;

    if (originalItems.length !== directItems.length) {
      console.log(`❌ 数据条数不一致: 原始${originalItems.length}条 vs 直接${directItems.length}条`);
      return false;
    }

    let allMatch = true;
    console.log('\n📋 详细对比:');
    
    for (let i = 0; i < originalItems.length; i++) {
      const original = originalItems[i];
      const direct = directItems.find(item => 
        item.segmentAttribute === original.segmentAttribute && 
        item.customerAttribute === original.customerAttribute
      );

      if (!direct) {
        console.log(`❌ 未找到匹配项: ${original.segmentAttribute}-${original.customerAttribute}`);
        allMatch = false;
        continue;
      }

      const actualMatch = Math.abs(original.currentActual - direct.currentActual) < 0.01;
      const planMatch = original.yearlyPlan === direct.yearlyPlan;
      const deviationMatch = Math.abs(original.deviation - direct.deviation) < 0.01;

      const status = actualMatch && planMatch && deviationMatch ? '✅' : '❌';
      
      console.log(`${status} ${original.segmentAttribute}-${original.customerAttribute}:`);
      console.log(`     毛利率: 原始${original.currentActual}% vs 直接${direct.currentActual}% ${actualMatch ? '✅' : '❌'}`);
      console.log(`     年度计划: 原始${original.yearlyPlan}% vs 直接${direct.yearlyPlan}% ${planMatch ? '✅' : '❌'}`);
      console.log(`     偏差: 原始${original.deviation}% vs 直接${direct.deviation}% ${deviationMatch ? '✅' : '❌'}`);

      if (!actualMatch || !planMatch || !deviationMatch) {
        allMatch = false;
      }
    }

    if (allMatch) {
      console.log('\n🎉 所有数据完全一致！');
    } else {
      console.log('\n⚠️  存在数据不一致');
    }

    return allMatch;

  } catch (error) {
    console.error('对比过程出错:', error);
    return false;
  }
}

// 测试年度数据
async function testYearlyData(year) {
  console.log(`\n🗓️  测试${year}年度数据`);
  console.log('='.repeat(60));

  try {
    // 测试analytics API
    console.log('\n📊 测试analytics年度API...');
    const analyticsResponse = await fetch(`${BASE_URL}/analytics/tuoyuan-profit-margin/${year}`);
    
    if (analyticsResponse.ok) {
      const analyticsResult = await analyticsResponse.json();
      console.log(`✅ Analytics API调用成功`);
      
      if (analyticsResult.success && analyticsResult.data) {
        console.log(`📈 年度数据概览:`);
        console.log(`   - 有效月份: ${analyticsResult.data.months?.length || 0}个月`);
        console.log(`   - 当前毛利率: ${analyticsResult.data.currentRate || 0}%`);
        console.log(`   - 目标毛利率: ${analyticsResult.data.targetRate || 0}%`);
        
        if (analyticsResult.data.monthlyData) {
          const validData = analyticsResult.data.monthlyData.filter(data => data !== null);
          console.log(`   - 有数据月份: ${validData.length}个月`);
          if (validData.length > 0) {
            console.log(`   - 月度数据: [${validData.join(', ')}]`);
          }
        }
        
        if (analyticsResult.data.segmentData) {
          console.log(`   - 板块数据:`);
          analyticsResult.data.segmentData.forEach(segment => {
            console.log(`     * ${segment.name}: 计划${segment.plan}%, 实际${segment.actual}%, 完成率${segment.rate}%`);
          });
        }
      }
    } else {
      console.log(`❌ Analytics API调用失败: ${analyticsResponse.status}`);
    }

  } catch (error) {
    console.error('年度数据测试失败:', error);
  }
}

// 主测试函数
async function runDataConsistencyTest() {
  console.log('🧪 拓源毛利率数据一致性测试');
  console.log('='.repeat(60));

  try {
    // 测试2025年的几个月份
    const testPeriods = ['2025-01', '2025-07'];
    let allConsistent = true;

    for (const period of testPeriods) {
      const isConsistent = await compareResults(period);
      if (!isConsistent) {
        allConsistent = false;
      }
    }

    // 测试年度数据
    await testYearlyData('2025');

    console.log('\n📋 测试总结:');
    console.log('='.repeat(60));
    
    if (allConsistent) {
      console.log('🎉 所有测试通过！数据完全一致！');
      console.log('✅ 优化版本可以安全替换原始API调用');
    } else {
      console.log('⚠️  存在数据不一致，需要进一步调试');
      console.log('🔧 建议检查计算逻辑和数据处理');
    }

  } catch (error) {
    console.error('测试过程出错:', error);
  } finally {
    // 关闭数据库连接
    if (pool) {
      await pool.end();
    }
  }
}

// 运行测试
if (require.main === module) {
  runDataConsistencyTest()
    .then(() => {
      console.log('\n✅ 测试完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ 测试失败:', error);
      process.exit(1);
    });
}

module.exports = { runDataConsistencyTest, compareResults, calculateTuoyuanProfitMarginDirect };
