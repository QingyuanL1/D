/**
 * 预算数据测试助手
 * 用于验证前端是否正确获取和显示预算数据
 */

export interface BudgetTestResult {
  success: boolean;
  message: string;
  data?: any;
  hasYearlyPlan?: boolean;
  sampleData?: any;
}

/**
 * 测试新签订单预算数据
 */
export async function testNewOrdersBudget(period: string): Promise<BudgetTestResult> {
  try {
    const response = await fetch(`http://47.111.95.19:3000/new-orders/${period}`);
    const result = await response.json();
    
    if (!result.success) {
      return {
        success: false,
        message: `新签订单接口错误: ${result.message}`
      };
    }
    
    // 检查设备数据是否包含 yearlyPlan
    const hasYearlyPlan = result.data.equipment?.some((item: any) => 
      item.yearlyPlan !== undefined && item.yearlyPlan !== null
    );
    
    const sampleData = result.data.equipment?.[0] || null;
    
    return {
      success: true,
      message: '新签订单预算数据获取成功',
      data: result.data,
      hasYearlyPlan,
      sampleData
    };
    
  } catch (error) {
    return {
      success: false,
      message: `新签订单接口请求失败: ${error}`
    };
  }
}

/**
 * 测试项目跟踪预算数据
 */
export async function testProjectTrackingBudget(period: string): Promise<BudgetTestResult> {
  try {
    const response = await fetch(`http://47.111.95.19:3000/project-tracking/${period}`);
    const result = await response.json();
    
    if (!result.success) {
      return {
        success: false,
        message: `项目跟踪接口错误: ${result.message}`
      };
    }
    
    // 检查设备数据是否包含 yearlyPlan
    const hasYearlyPlan = result.data.equipment?.some((item: any) => 
      item.yearlyPlan !== undefined && item.yearlyPlan !== null
    );
    
    const sampleData = result.data.equipment?.[0] || null;
    
    return {
      success: true,
      message: '项目跟踪预算数据获取成功',
      data: result.data,
      hasYearlyPlan,
      sampleData
    };
    
  } catch (error) {
    return {
      success: false,
      message: `项目跟踪接口请求失败: ${error}`
    };
  }
}

/**
 * 测试营业收入结构预算数据
 */
export async function testBusinessIncomeBudget(period: string): Promise<BudgetTestResult> {
  try {
    const response = await fetch(`http://47.111.95.19:3000/business-income/${period}`);
    const result = await response.json();
    
    if (!result.success) {
      return {
        success: false,
        message: `营业收入结构接口错误: ${result.message}`
      };
    }
    
    // 检查数据是否包含 yearlyPlan
    const hasYearlyPlan = Array.isArray(result.data) && result.data.some((item: any) => 
      item.yearlyPlan !== undefined && item.yearlyPlan !== null
    );
    
    const sampleData = Array.isArray(result.data) ? result.data[0] : null;
    
    return {
      success: true,
      message: '营业收入结构预算数据获取成功',
      data: result.data,
      hasYearlyPlan,
      sampleData
    };
    
  } catch (error) {
    return {
      success: false,
      message: `营业收入结构接口请求失败: ${error}`
    };
  }
}

/**
 * 运行所有预算测试
 */
export async function runAllBudgetTests(period: string) {
  console.log(`=== 开始测试预算数据集成 (期间: ${period}) ===`);
  
  const tests = [
    { name: '新签订单', func: testNewOrdersBudget },
    { name: '项目跟踪', func: testProjectTrackingBudget },
    { name: '营业收入结构', func: testBusinessIncomeBudget }
  ];
  
  for (const test of tests) {
    console.log(`\n测试 ${test.name}...`);
    const result = await test.func(period);
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      console.log(`   包含预算数据: ${result.hasYearlyPlan ? '是' : '否'}`);
      
      if (result.sampleData) {
        console.log('   样例数据:');
        console.log(`     - 客户: ${result.sampleData.customer || result.sampleData.category}`);
        console.log(`     - 年度计划: ${result.sampleData.yearlyPlan}`);
        console.log(`     - 当期累计: ${result.sampleData.currentTotal}`);
      }
    } else {
      console.log(`❌ ${result.message}`);
    }
  }
  
  console.log('\n=== 预算数据集成测试完成 ===');
}

/**
 * 在组件中使用的简化测试函数
 */
export async function quickBudgetTest(period: string = '2024-01') {
  const result = await testNewOrdersBudget(period);
  
  if (result.success && result.hasYearlyPlan) {
    console.log('✅ 预算数据集成正常工作');
    return true;
  } else {
    console.log('❌ 预算数据集成可能存在问题');
    return false;
  }
}