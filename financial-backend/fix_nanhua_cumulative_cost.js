const { pool } = require('./config/database');

async function fixNanhuaCumulativeCost() {
    try {
        console.log('=== 开始修复南华主营业务成本累计数据 ===\n');
        
        // 1. 查看当前所有数据
        console.log('1. 查看当前数据状况:');
        const [allData] = await pool.execute(`
            SELECT 
                period,
                category,
                customer_type,
                current_material_cost,
                cumulative_material_cost,
                current_labor_cost,
                cumulative_labor_cost
            FROM nanhua_main_business_cost 
            ORDER BY customer_type, period
        `);
        
        console.table(allData);
        
        // 2. 按客户类型分组，重新计算累计数据
        console.log('\n2. 开始重新计算累计数据...');
        
        // 获取所有唯一的客户类型和类别组合
        const [customerTypes] = await pool.execute(`
            SELECT DISTINCT category, customer_type 
            FROM nanhua_main_business_cost 
            ORDER BY category, customer_type
        `);
        
        for (const customer of customerTypes) {
            console.log(`\n处理客户: ${customer.category} - ${customer.customer_type}`);
            
            // 获取该客户的所有期间数据，按期间排序
            const [customerData] = await pool.execute(`
                SELECT 
                    id,
                    period,
                    current_material_cost,
                    current_labor_cost
                FROM nanhua_main_business_cost 
                WHERE category = ? AND customer_type = ?
                ORDER BY period ASC
            `, [customer.category, customer.customer_type]);
            
            let cumulativeMaterial = 0;
            let cumulativeLabor = 0;
            
            // 重新计算并更新每条记录的累计值
            for (const record of customerData) {
                cumulativeMaterial += parseFloat(record.current_material_cost || 0);
                cumulativeLabor += parseFloat(record.current_labor_cost || 0);
                
                // 更新数据库
                await pool.execute(`
                    UPDATE nanhua_main_business_cost 
                    SET 
                        cumulative_material_cost = ?,
                        cumulative_labor_cost = ?
                    WHERE id = ?
                `, [cumulativeMaterial, cumulativeLabor, record.id]);
                
                console.log(`  ${record.period}: 材料 ${record.current_material_cost} -> 累计 ${cumulativeMaterial}, 人工 ${record.current_labor_cost} -> 累计 ${cumulativeLabor}`);
            }
        }
        
        // 3. 验证修复结果
        console.log('\n3. 验证修复结果:');
        const [fixedData] = await pool.execute(`
            SELECT 
                period,
                category,
                customer_type,
                current_material_cost,
                cumulative_material_cost,
                current_labor_cost,
                cumulative_labor_cost,
                (cumulative_material_cost + cumulative_labor_cost) as total_cumulative_cost
            FROM nanhua_main_business_cost 
            WHERE period = '2025-08'
            ORDER BY category, customer_type
        `);
        
        console.table(fixedData);
        
        // 4. 重新运行利润率计算验证
        console.log('\n4. 重新验证利润率计算:');
        
        // 获取收入数据
        const [incomeData] = await pool.execute(`
            SELECT 
                customer_name,
                SUM(current_amount) as total_accumulated_income
            FROM nanhua_business_income 
            WHERE period <= '2025-08'
            GROUP BY customer_name
            ORDER BY customer_name
        `);
        
        // 客户映射关系（修正版本）
        const customerMapping = {
            '一包项目': '一包项目',
            '二包项目': '二包项目', 
            '域内合作项目': '域内合作项目',
            '域外合作项目': '域外合作项目',
            '新能源项目': '新能源项目',
            '苏州项目': '苏州项目',
            '抢修': '抢修项目',  // 收入表是'抢修'，成本表是'抢修项目'
            '运检': '运检项目',  // 收入表是'运检'，成本表是'运检项目'
            '自建项目': '自建项目'
        };
        
        const calculations = [];
        const customers = [
            { customerName: '一包项目', yearlyPlan: 14.54 },
            { customerName: '二包项目', yearlyPlan: 15.50 },
            { customerName: '域内合作项目', yearlyPlan: 8.00 },
            { customerName: '域外合作项目', yearlyPlan: 5.48 },
            { customerName: '新能源项目', yearlyPlan: 17.25 },
            { customerName: '苏州项目', yearlyPlan: 6.00 },
            { customerName: '抢修', yearlyPlan: 33.52 },
            { customerName: '运检', yearlyPlan: 13.60 },
            { customerName: '自建项目', yearlyPlan: 0 }
        ];
        
        customers.forEach(customer => {
            const mappedName = customerMapping[customer.customerName] || customer.customerName;
            
            // 查找收入数据
            const income = incomeData.find(row => row.customer_name === customer.customerName);
            const totalIncome = income ? parseFloat(income.total_accumulated_income) : 0;
            
            // 查找成本数据
            const cost = fixedData.find(row => row.customer_type === mappedName);
            const totalCost = cost ? parseFloat(cost.total_cumulative_cost) : 0;
            
            // 计算利润率
            let profitMargin = 0;
            if (totalIncome > 0) {
                profitMargin = ((totalIncome - totalCost) / totalIncome) * 100;
            }
            
            calculations.push({
                客户名称: customer.customerName,
                收入表名称: customer.customerName,
                成本表名称: mappedName,
                累计收入: totalIncome.toFixed(2),
                累计成本: totalCost.toFixed(2),
                利润: (totalIncome - totalCost).toFixed(2),
                计算利润率: profitMargin.toFixed(2) + '%',
                年度计划: customer.yearlyPlan + '%',
                偏差: (profitMargin - customer.yearlyPlan).toFixed(2) + '%'
            });
        });
        
        console.table(calculations);
        
        console.log('\n✅ 累计数据修复完成！');
        
    } catch (error) {
        console.error('修复失败:', error);
    }
}

// 运行修复
fixNanhuaCumulativeCost(); 