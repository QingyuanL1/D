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

// 验算南华净利润计算
async function verifyNetProfitCalculation() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log('=== 南华净利润计算验算 ===\n');
        
        const period = '2025-07';
        const [year, month] = period.split('-');
        const currentMonth = parseInt(month);
        
        // 固定的客户列表
        const customers = ['一包项目', '二包项目', '域内合作项目', '域外合作项目', '新能源项目', '苏州项目', '自接项目', '其他'];
        
        for (const customerName of customers) {
            console.log(`\n--- ${customerName} ---`);
            
            let totalIncome = 0;
            let totalMaterialCost = 0;
            let totalLaborCost = 0;
            let totalMarketingCost = 0;
            let totalManagementCost = 0;
            let totalFinanceCost = 0;
            
            // 计算从年初到当前月份的累计数据
            for (let m = 1; m <= currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;
                console.log(`  ${monthPeriod}:`);
                
                // 1. 获取营业收入（订单转收入 + 存量订单转收入）
                let monthlyIncome = 0;
                
                const [orderRows] = await connection.execute(
                    'SELECT current_amount FROM nanhua_order_to_income WHERE period = ? AND customer_name = ?',
                    [monthPeriod, customerName]
                );
                
                if (orderRows.length > 0) {
                    monthlyIncome += parseFloat(orderRows[0].current_amount) || 0;
                    console.log(`    订单转收入: ${orderRows[0].current_amount}`);
                }
                
                const [stockRows] = await connection.execute(
                    'SELECT current_amount FROM nanhua_stock_order_to_income WHERE period = ? AND customer_name = ?',
                    [monthPeriod, customerName]
                );
                
                if (stockRows.length > 0) {
                    monthlyIncome += parseFloat(stockRows[0].current_amount) || 0;
                    console.log(`    存量订单转收入: ${stockRows[0].current_amount}`);
                }
                
                totalIncome += monthlyIncome;
                console.log(`    当月收入小计: ${monthlyIncome}`);
                
                // 2. 获取主营业务成本
                const [costRows] = await connection.execute(
                    'SELECT current_material_cost, current_labor_cost FROM nanhua_main_business_cost WHERE period = ? AND category = "工程" AND customer_type = ?',
                    [monthPeriod, customerName]
                );
                
                let materialCost = 0;
                let laborCost = 0;
                if (costRows.length > 0) {
                    materialCost = parseFloat(costRows[0].current_material_cost) || 0;
                    laborCost = parseFloat(costRows[0].current_labor_cost) || 0;
                    console.log(`    材料成本: ${materialCost}, 人工成本: ${laborCost}`);
                }
                
                totalMaterialCost += materialCost;
                totalLaborCost += laborCost;
                
                // 3. 获取成本中心费用
                const [centerRows] = await connection.execute(
                    'SELECT marketing, management, finance FROM nanhua_cost_center_structure WHERE period = ? AND category = "工程" AND customer_name = ?',
                    [monthPeriod, customerName]
                );
                
                let marketingCost = 0;
                let managementCost = 0;
                let financeCost = 0;
                if (centerRows.length > 0) {
                    marketingCost = parseFloat(centerRows[0].marketing) || 0;
                    managementCost = parseFloat(centerRows[0].management) || 0;
                    financeCost = parseFloat(centerRows[0].finance) || 0;
                    console.log(`    营销: ${marketingCost}, 管理: ${managementCost}, 财务: ${financeCost}`);
                }
                
                totalMarketingCost += marketingCost;
                totalManagementCost += managementCost;
                totalFinanceCost += financeCost;
            }
            
            // 计算净利润
            const netProfit = totalIncome - totalMaterialCost - totalLaborCost - totalMarketingCost - totalManagementCost - totalFinanceCost;
            
            console.log(`  累计收入: ${totalIncome.toFixed(2)}`);
            console.log(`  累计材料成本: ${totalMaterialCost.toFixed(2)}`);
            console.log(`  累计人工成本: ${totalLaborCost.toFixed(2)}`);
            console.log(`  累计营销费用: ${totalMarketingCost.toFixed(2)}`);
            console.log(`  累计管理费用: ${totalManagementCost.toFixed(2)}`);
            console.log(`  累计财务费用: ${totalFinanceCost.toFixed(2)}`);
            console.log(`  净利润: ${netProfit.toFixed(2)}`);
            console.log(`  计算公式: ${totalIncome.toFixed(2)} - ${totalMaterialCost.toFixed(2)} - ${totalLaborCost.toFixed(2)} - ${totalMarketingCost.toFixed(2)} - ${totalManagementCost.toFixed(2)} - ${totalFinanceCost.toFixed(2)} = ${netProfit.toFixed(2)}`);
        }
        
    } catch (error) {
        console.error('验算失败:', error);
    } finally {
        await connection.end();
    }
}

// 运行验算
verifyNetProfitCalculation();
