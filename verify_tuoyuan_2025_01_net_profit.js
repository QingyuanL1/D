const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: '47.111.95.19',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'finance',
  timezone: '+08:00',
  charset: 'utf8mb4'
};

// 验算拓源2025年1月净利润计算
async function verifyTuoyuan2025_01NetProfitCalculation() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log('=== 拓源2025年1月净利润详细计算 ===\n');
        
        const period = '2025-01';
        
        // 拓源的客户列表
        const customers = ['电业项目', '用户项目', '用户设备', '贸易', '代理设备', '代理工程', '代理设计', '其他'];

        // 先获取成本中心费用（公司层面）
        const [centerRows] = await connection.execute(
            'SELECT department_attribute, current_period FROM tuoyuan_cost_center_profit_loss WHERE period = ?',
            [period]
        );

        let totalMarketingCost = 0;  // 市场部
        let totalManagementCost = 0; // 企管部 + 总经理室
        let totalFinanceCost = 0;    // 财务部

        centerRows.forEach(row => {
            const dept = row.department_attribute;
            const cost = parseFloat(row.current_period) || 0;

            if (dept === '市场部') {
                totalMarketingCost += cost;
            } else if (dept === '企管部' || dept === '总经理室') {
                totalManagementCost += cost;
            } else if (dept === '财务部') {
                totalFinanceCost += cost;
            }
        });

        console.log('📊 各项目2025年1月净利润明细：\n');

        let totalIncome = 0;
        let totalDirectCost = 0;
        let totalNetProfitBeforeCenterCosts = 0;

        for (const customerName of customers) {
            console.log(`🏢 ${customerName}`);
            console.log('─'.repeat(60));
            
            // 1. 获取营业收入（订单转收入 + 存量订单转收入）
            let monthlyIncome = 0;
            
            const [orderRows] = await connection.execute(
                'SELECT current_period_income FROM tuoyuan_order_to_income WHERE period = ? AND customer_attribute = ?',
                [period, customerName]
            );
            
            if (orderRows.length > 0) {
                monthlyIncome += parseFloat(orderRows[0].current_period_income) || 0;
                console.log(`  📈 订单转收入: ${orderRows[0].current_period_income} 万元`);
            }
            
            const [stockRows] = await connection.execute(
                'SELECT current_period_income FROM tuoyuan_stock_order_to_income WHERE period = ? AND customer_attribute = ?',
                [period, customerName]
            );
            
            if (stockRows.length > 0) {
                monthlyIncome += parseFloat(stockRows[0].current_period_income) || 0;
                console.log(`  📈 存量订单转收入: ${stockRows[0].current_period_income} 万元`);
            }
            
            console.log(`  💰 营业收入合计: ${monthlyIncome.toFixed(2)} 万元`);
            
            // 2. 获取主营业务成本数据（当期直接成本和间接成本）
            const [costRows] = await connection.execute(
                'SELECT current_material_cost, current_labor_cost FROM tuoyuan_main_business_cost_structure_quality WHERE period = ? AND customer_type = ?',
                [period, customerName]
            );

            let materialCost = 0;
            let laborCost = 0;
            if (costRows.length > 0) {
                materialCost = parseFloat(costRows[0].current_material_cost) || 0;
                laborCost = parseFloat(costRows[0].current_labor_cost) || 0;
            }
            
            console.log(`  📉 直接成本(材料): ${materialCost.toFixed(2)} 万元`);
            console.log(`  📉 间接成本(人工): ${laborCost.toFixed(2)} 万元`);

            // 3. 计算项目层面净利润（不包含成本中心费用）
            const projectNetProfit = monthlyIncome - materialCost - laborCost;

            console.log(`  ✨ 项目净利润计算:`);
            console.log(`     ${monthlyIncome.toFixed(2)} - ${materialCost.toFixed(2)} - ${laborCost.toFixed(2)} = ${projectNetProfit.toFixed(2)} 万元`);

            // 4. 计算项目净利率
            const projectNetProfitMargin = monthlyIncome > 0 ? (projectNetProfit / monthlyIncome * 100) : 0;
            console.log(`  📊 项目净利率: ${projectNetProfitMargin.toFixed(2)}%`);

            // 累计统计
            totalIncome += monthlyIncome;
            totalDirectCost += materialCost + laborCost;
            totalNetProfitBeforeCenterCosts += projectNetProfit;
            
            console.log('');
        }
        
        // 汇总统计
        console.log('📋 拓源2025年1月汇总统计');
        console.log('='.repeat(60));

        // 计算最终净利润（减去成本中心费用）
        const finalNetProfit = totalNetProfitBeforeCenterCosts - totalMarketingCost - totalManagementCost - totalFinanceCost;
        const totalCenterCosts = totalMarketingCost + totalManagementCost + totalFinanceCost;
        const totalCosts = totalDirectCost + totalCenterCosts;
        const overallNetProfitMargin = totalIncome > 0 ? (finalNetProfit / totalIncome * 100) : 0;

        console.log(`总营业收入: ${totalIncome.toFixed(2)} 万元`);
        console.log(`总直接成本: ${totalDirectCost.toFixed(2)} 万元`);
        console.log('');
        console.log('📊 成本中心费用分解：');
        console.log(`  市场部费用: ${totalMarketingCost.toFixed(2)} 万元`);
        console.log(`  管理费用(企管部+总经理室): ${totalManagementCost.toFixed(2)} 万元`);
        console.log(`  财务部费用: ${totalFinanceCost.toFixed(2)} 万元`);
        console.log(`  成本中心费用小计: ${totalCenterCosts.toFixed(2)} 万元`);
        console.log('');
        console.log(`总成本费用: ${totalCosts.toFixed(2)} 万元`);
        console.log(`最终净利润: ${finalNetProfit.toFixed(2)} 万元`);
        console.log(`整体净利率: ${overallNetProfitMargin.toFixed(2)}%`);
        
        console.log('\n🔧 拓源净利润计算说明：');
        console.log('1. 净利润 = 营业收入 - 累计直接成本 - 累计间接成本 - 营销费用 - 管理费用 - 财务费用');
        console.log('2. 累计值通过当期值累加计算，不直接取累计数据');
        console.log('3. 拓源有四个成本中心费用字段，但净利润计算只使用营销、管理、财务三个');
        console.log('4. 生产制造费用不包含在净利润计算中');
        
        // 验证API结果
        console.log('\n🔍 API接口验证：');
        console.log('请访问: http://47.111.95.19:3000/tuoyuan-main-business-net-profit/calculate/2025-01');
        
        // 对比南华和拓源的差异
        console.log('\n📊 南华 vs 拓源净利润计算对比：');
        console.log('='.repeat(60));
        console.log('相同点：');
        console.log('  - 都使用相同的净利润计算公式');
        console.log('  - 都通过当期值累加计算累计值');
        console.log('  - 都包含营销、管理、财务三个成本中心费用');
        console.log('');
        console.log('不同点：');
        console.log('  - 拓源有额外的生产制造费用字段（但不用于净利润计算）');
        console.log('  - 拓源的表名和字段名略有不同');
        console.log('  - 拓源使用customer_attribute，南华使用customer_name');
        
    } catch (error) {
        console.error('验算失败:', error);
    } finally {
        await connection.end();
    }
}

// 运行验算
verifyTuoyuan2025_01NetProfitCalculation();
