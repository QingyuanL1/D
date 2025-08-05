const { pool } = require('./config/database');

async function queryNanhuaProfitMarginData() {
    try {
        // 5. 先查看所有可用期间
        console.log('=== 查看数据库中的可用期间 ===');
        
        console.log('\n收入表期间:');
        const [incomePeriods] = await pool.execute('SELECT DISTINCT period FROM nanhua_business_income ORDER BY period DESC');
        if (incomePeriods.length > 0) {
            console.table(incomePeriods);
        } else {
            console.log('收入表无数据');
        }
        
        console.log('\n成本表期间:');
        const [costPeriods] = await pool.execute('SELECT DISTINCT period FROM nanhua_main_business_cost ORDER BY period DESC');
        if (costPeriods.length > 0) {
            console.table(costPeriods);
        } else {
            console.log('成本表无数据');
        }
        
        // 如果没有数据，提前返回
        if (incomePeriods.length === 0 && costPeriods.length === 0) {
            console.log('\n数据库中暂无南华业务数据，请先在前端页面填写数据');
            return;
        }
        
        // 选择一个有数据的期间
        let period = null;
        if (incomePeriods.length > 0) {
            period = incomePeriods[0].period;
        } else if (costPeriods.length > 0) {
            period = costPeriods[0].period;
        }
        
        if (!period) {
            console.log('未找到可用的期间数据');
            return;
        }
        
        console.log(`\n使用期间: ${period} 进行查询\n`);
        
        // 1. 查询南华主营业务收入数据
        console.log('=== 南华主营业务收入数据 (nanhua_business_income) ===');
        const [incomeRows] = await pool.execute(`
            SELECT 
                period,
                customer_name,
                yearly_plan,
                current_amount,
                category,
                created_at
            FROM nanhua_business_income 
            WHERE period = ?
            ORDER BY customer_name
        `, [period]);
        
        if (incomeRows.length > 0) {
            console.table(incomeRows);
        } else {
            console.log('未找到收入数据');
        }
        
        // 2. 查询累计收入数据
        console.log('\n=== 南华累计收入数据 (计算用) ===');
        const [accumulatedIncomeRows] = await pool.execute(`
            SELECT 
                customer_name,
                SUM(current_amount) as total_accumulated_income
            FROM nanhua_business_income 
            WHERE period <= ?
            GROUP BY customer_name
            ORDER BY customer_name
        `, [period]);
        
        if (accumulatedIncomeRows.length > 0) {
            console.table(accumulatedIncomeRows);
        } else {
            console.log('未找到累计收入数据');
        }
        
        // 3. 查询南华主营业务成本数据
        console.log('\n=== 南华主营业务成本数据 (nanhua_main_business_cost) ===');
        const [costRows] = await pool.execute(`
            SELECT 
                period,
                category,
                customer_type,
                yearly_plan,
                current_material_cost,
                cumulative_material_cost,
                current_labor_cost,
                cumulative_labor_cost,
                (cumulative_material_cost + cumulative_labor_cost) as total_cumulative_cost
            FROM nanhua_main_business_cost 
            WHERE period = ?
            ORDER BY category, customer_type
        `, [period]);
        
        if (costRows.length > 0) {
            console.table(costRows);
        } else {
            console.log('未找到成本数据');
        }
        
        // 4. 计算利润率验算
        if (accumulatedIncomeRows.length > 0 && costRows.length > 0) {
            console.log('\n=== 利润率计算验算 ===');
            
            // 客户映射关系
            const customerMapping = {
                '一包项目': '一包',
                '二包项目': '二包', 
                '域内合作项目': '域内合作',
                '域外合作项目': '域外合作',
                '新能源项目': '新能源',
                '苏州项目': '苏州',
                '抢修': '抢修',
                '运检项目': '运检项目',
                '自建项目': '自建项目'
            };
            
            const calculations = [];
            
            // 固定的客户列表
            const customers = [
                { customerName: '一包项目', yearlyPlan: 14.54 },
                { customerName: '二包项目', yearlyPlan: 15.50 },
                { customerName: '域内合作项目', yearlyPlan: 8.00 },
                { customerName: '域外合作项目', yearlyPlan: 5.48 },
                { customerName: '新能源项目', yearlyPlan: 17.25 },
                { customerName: '苏州项目', yearlyPlan: 6.00 },
                { customerName: '抢修', yearlyPlan: 33.52 },
                { customerName: '运检项目', yearlyPlan: 13.60 },
                { customerName: '自建项目', yearlyPlan: 0 }
            ];
            
            customers.forEach(customer => {
                const mappedName = customerMapping[customer.customerName] || customer.customerName;
                
                // 查找收入数据
                const incomeData = accumulatedIncomeRows.find(row => row.customer_name === mappedName);
                const totalIncome = incomeData ? parseFloat(incomeData.total_accumulated_income) : 0;
                
                // 查找成本数据
                const costData = costRows.find(row => row.customer_type === mappedName);
                const totalCost = costData ? parseFloat(costData.total_cumulative_cost) : 0;
                
                // 计算利润率
                let profitMargin = 0;
                if (totalIncome > 0) {
                    profitMargin = ((totalIncome - totalCost) / totalIncome) * 100;
                }
                
                calculations.push({
                    客户名称: customer.customerName,
                    映射名称: mappedName,
                    年度计划_百分比: customer.yearlyPlan + '%',
                    累计收入: totalIncome.toFixed(2),
                    累计成本: totalCost.toFixed(2),
                    利润: (totalIncome - totalCost).toFixed(2),
                    计算利润率_百分比: profitMargin.toFixed(2) + '%',
                    偏差_百分比: (profitMargin - customer.yearlyPlan).toFixed(2) + '%'
                });
            });
            
            console.table(calculations);
            
            // 显示计算公式
            console.log('\n计算公式: 利润率 = (累计收入 - 累计成本) / 累计收入 × 100%');
            console.log('偏差 = 计算利润率 - 年度计划');
        } else {
            console.log('\n无法进行利润率计算：缺少收入或成本数据');
        }
        
        // 6. 显示所有表的结构信息
        console.log('\n=== 表结构信息 ===');
        console.log('\n收入表字段:');
        const [incomeFields] = await pool.execute('DESCRIBE nanhua_business_income');
        console.table(incomeFields);
        
        console.log('\n成本表字段:');
        const [costFields] = await pool.execute('DESCRIBE nanhua_main_business_cost');
        console.table(costFields);
        
    } catch (error) {
        console.error('查询失败:', error);
    }
}

// 运行查询
queryNanhuaProfitMarginData(); 