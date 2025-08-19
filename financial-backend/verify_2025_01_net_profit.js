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

// 验算2025年1月南华净利润计算
async function verify2025_01NetProfitCalculation() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log('=== 南华2025年1月净利润详细计算 ===\n');
        
        const period = '2025-01';
        
        // 固定的客户列表
        const customers = ['一包项目', '二包项目', '域内合作项目', '域外合作项目', '新能源项目', '苏州项目', '自接项目', '其他'];
        
        console.log('📊 各项目2025年1月净利润明细：\n');
        
        for (const customerName of customers) {
            console.log(`🏢 ${customerName}`);
            console.log('─'.repeat(50));
            
            // 1. 获取营业收入（订单转收入 + 存量订单转收入）
            let monthlyIncome = 0;
            
            const [orderRows] = await connection.execute(
                'SELECT current_amount FROM nanhua_order_to_income WHERE period = ? AND customer_name = ?',
                [period, customerName]
            );
            
            if (orderRows.length > 0) {
                monthlyIncome += parseFloat(orderRows[0].current_amount) || 0;
                console.log(`  📈 订单转收入: ${orderRows[0].current_amount} 万元`);
            }
            
            const [stockRows] = await connection.execute(
                'SELECT current_amount FROM nanhua_stock_order_to_income WHERE period = ? AND customer_name = ?',
                [period, customerName]
            );
            
            if (stockRows.length > 0) {
                monthlyIncome += parseFloat(stockRows[0].current_amount) || 0;
                console.log(`  📈 存量订单转收入: ${stockRows[0].current_amount} 万元`);
            }
            
            console.log(`  💰 营业收入合计: ${monthlyIncome.toFixed(2)} 万元`);
            
            // 2. 获取主营业务成本数据（当期直接成本和间接成本）
            const [costRows] = await connection.execute(
                'SELECT current_material_cost, current_labor_cost FROM nanhua_main_business_cost WHERE period = ? AND category = "工程" AND customer_type = ?',
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

            // 3. 获取成本中心费用（营销、管理、财务）
            const [centerRows] = await connection.execute(
                'SELECT marketing, management, finance FROM nanhua_cost_center_structure WHERE period = ? AND category = "工程" AND customer_name = ?',
                [period, customerName]
            );

            let marketingCost = 0;
            let managementCost = 0;
            let financeCost = 0;
            if (centerRows.length > 0) {
                marketingCost = parseFloat(centerRows[0].marketing) || 0;
                managementCost = parseFloat(centerRows[0].management) || 0;
                financeCost = parseFloat(centerRows[0].finance) || 0;
            }
            
            console.log(`  📉 营销费用: ${marketingCost.toFixed(2)} 万元`);
            console.log(`  📉 管理费用: ${managementCost.toFixed(2)} 万元`);
            console.log(`  📉 财务费用: ${financeCost.toFixed(2)} 万元`);

            // 4. 计算净利润
            const netProfit = monthlyIncome - materialCost - laborCost - marketingCost - managementCost - financeCost;
            
            console.log(`  ✨ 净利润计算:`);
            console.log(`     ${monthlyIncome.toFixed(2)} - ${materialCost.toFixed(2)} - ${laborCost.toFixed(2)} - ${marketingCost.toFixed(2)} - ${managementCost.toFixed(2)} - ${financeCost.toFixed(2)} = ${netProfit.toFixed(2)} 万元`);
            
            // 5. 计算净利率
            const netProfitMargin = monthlyIncome > 0 ? (netProfit / monthlyIncome * 100) : 0;
            console.log(`  📊 净利率: ${netProfitMargin.toFixed(2)}%`);
            
            console.log('');
        }
        
        // 汇总统计
        console.log('📋 汇总统计');
        console.log('='.repeat(50));
        
        let totalIncome = 0;
        let totalCost = 0;
        let totalNetProfit = 0;
        
        for (const customerName of customers) {
            // 重新计算每个客户的数据用于汇总
            let monthlyIncome = 0;
            
            const [orderRows] = await connection.execute(
                'SELECT current_amount FROM nanhua_order_to_income WHERE period = ? AND customer_name = ?',
                [period, customerName]
            );
            
            if (orderRows.length > 0) {
                monthlyIncome += parseFloat(orderRows[0].current_amount) || 0;
            }
            
            const [stockRows] = await connection.execute(
                'SELECT current_amount FROM nanhua_stock_order_to_income WHERE period = ? AND customer_name = ?',
                [period, customerName]
            );
            
            if (stockRows.length > 0) {
                monthlyIncome += parseFloat(stockRows[0].current_amount) || 0;
            }
            
            const [costRows] = await connection.execute(
                'SELECT current_material_cost, current_labor_cost FROM nanhua_main_business_cost WHERE period = ? AND category = "工程" AND customer_type = ?',
                [period, customerName]
            );

            let materialCost = 0;
            let laborCost = 0;
            if (costRows.length > 0) {
                materialCost = parseFloat(costRows[0].current_material_cost) || 0;
                laborCost = parseFloat(costRows[0].current_labor_cost) || 0;
            }

            const [centerRows] = await connection.execute(
                'SELECT marketing, management, finance FROM nanhua_cost_center_structure WHERE period = ? AND category = "工程" AND customer_name = ?',
                [period, customerName]
            );

            let marketingCost = 0;
            let managementCost = 0;
            let financeCost = 0;
            if (centerRows.length > 0) {
                marketingCost = parseFloat(centerRows[0].marketing) || 0;
                managementCost = parseFloat(centerRows[0].management) || 0;
                financeCost = parseFloat(centerRows[0].finance) || 0;
            }
            
            const totalCustomerCost = materialCost + laborCost + marketingCost + managementCost + financeCost;
            const netProfit = monthlyIncome - totalCustomerCost;
            
            totalIncome += monthlyIncome;
            totalCost += totalCustomerCost;
            totalNetProfit += netProfit;
        }
        
        const overallNetProfitMargin = totalIncome > 0 ? (totalNetProfit / totalIncome * 100) : 0;
        
        console.log(`总营业收入: ${totalIncome.toFixed(2)} 万元`);
        console.log(`总成本费用: ${totalCost.toFixed(2)} 万元`);
        console.log(`总净利润: ${totalNetProfit.toFixed(2)} 万元`);
        console.log(`整体净利率: ${overallNetProfitMargin.toFixed(2)}%`);
        
    } catch (error) {
        console.error('验算失败:', error);
    } finally {
        await connection.end();
    }
}

// 运行验算
verify2025_01NetProfitCalculation();
