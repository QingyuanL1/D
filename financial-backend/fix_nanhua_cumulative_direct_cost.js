const { pool } = require('./config/database');

async function fixNanhuaCumulativeCost() {
    try {
        console.log('开始修复南华主营业务成本累计数据...\n');
        
        // 1. 查看当前数据状况
        console.log('=== 当前累计成本数据状况 ===');
        const [currentData] = await pool.execute(`
            SELECT 
                period,
                customer_type,
                current_material_cost,
                cumulative_material_cost,
                current_labor_cost,
                cumulative_labor_cost,
                (cumulative_material_cost + cumulative_labor_cost) as total_cumulative
            FROM nanhua_main_business_cost 
            ORDER BY customer_type, period
        `);
        
        console.table(currentData);
        
        // 2. 获取所有需要修复的记录
        const [allRecords] = await pool.execute(`
            SELECT id, period, customer_type, category, current_material_cost, current_labor_cost
            FROM nanhua_main_business_cost
            ORDER BY customer_type, period
        `);
        
        console.log(`\n找到 ${allRecords.length} 条记录需要处理\n`);
        
        // 3. 按客户分组计算累计值
        const customerGroups = {};
        
        // 按客户和类别分组
        allRecords.forEach(record => {
            const key = `${record.customer_type}_${record.category}`;
            if (!customerGroups[key]) {
                customerGroups[key] = [];
            }
            customerGroups[key].push(record);
        });
        
        // 4. 为每个客户计算累计值并更新
        console.log('=== 开始计算和更新累计直接费用 ===');
        
        for (const [customerKey, records] of Object.entries(customerGroups)) {
            const [customerType, category] = customerKey.split('_');
            console.log(`\n处理客户: ${customerType} (${category})`);
            
            // 按期间排序
            records.sort((a, b) => a.period.localeCompare(b.period));
            
            let cumulativeMaterial = 0;
            let cumulativeLabor = 0;
            
            for (const record of records) {
                // 累加当期直接费用
                cumulativeMaterial += parseFloat(record.current_material_cost || 0);
                cumulativeLabor += parseFloat(record.current_labor_cost || 0);
                
                // 更新数据库中的累计值
                await pool.execute(`
                    UPDATE nanhua_main_business_cost 
                    SET 
                        cumulative_material_cost = ?,
                        cumulative_labor_cost = ?
                    WHERE id = ?
                `, [cumulativeMaterial, cumulativeLabor, record.id]);
                
                console.log(`  期间 ${record.period}: 累计材料=${cumulativeMaterial.toFixed(2)}, 累计人工=${cumulativeLabor.toFixed(2)}, 累计直接费用=${(cumulativeMaterial + cumulativeLabor).toFixed(2)}`);
            }
        }
        
        // 5. 显示修复后的数据
        console.log('\n=== 修复后的累计成本数据 ===');
        const [fixedData] = await pool.execute(`
            SELECT 
                period,
                customer_type,
                category,
                current_material_cost,
                cumulative_material_cost,
                current_labor_cost,
                cumulative_labor_cost,
                (cumulative_material_cost + cumulative_labor_cost) as total_cumulative_direct_cost
            FROM nanhua_main_business_cost 
            ORDER BY customer_type, period
        `);
        
        console.table(fixedData);
        
        // 6. 验证计算结果
        console.log('\n=== 验证累计计算是否正确 ===');
        for (const [customerKey, records] of Object.entries(customerGroups)) {
            const [customerType, category] = customerKey.split('_');
            
            // 手动计算总计
            const totalMaterial = records.reduce((sum, r) => sum + parseFloat(r.current_material_cost || 0), 0);
            const totalLabor = records.reduce((sum, r) => sum + parseFloat(r.current_labor_cost || 0), 0);
            
            // 获取数据库中最后一期的累计值
            const lastRecord = records[records.length - 1];
            const [dbResult] = await pool.execute(`
                SELECT cumulative_material_cost, cumulative_labor_cost 
                FROM nanhua_main_business_cost 
                WHERE id = ?
            `, [lastRecord.id]);
            
            const dbMaterial = parseFloat(dbResult[0].cumulative_material_cost);
            const dbLabor = parseFloat(dbResult[0].cumulative_labor_cost);
            
            const isCorrect = Math.abs(totalMaterial - dbMaterial) < 0.01 && Math.abs(totalLabor - dbLabor) < 0.01;
            
            console.log(`${customerType} (${category}): ${isCorrect ? '✅ 正确' : '❌ 错误'} - 手工计算: 材料=${totalMaterial.toFixed(2)}, 人工=${totalLabor.toFixed(2)} | 数据库: 材料=${dbMaterial.toFixed(2)}, 人工=${dbLabor.toFixed(2)}`);
        }
        
        console.log('\n✅ 南华主营业务成本累计数据修复完成！');
        console.log('📋 修复说明：');
        console.log('   - 累计材料成本 = 历史所有期间的当期材料成本之和');
        console.log('   - 累计人工成本 = 历史所有期间的当期人工成本之和'); 
        console.log('   - 累计直接费用 = 累计材料成本 + 累计人工成本');
        console.log('   - 不包含制造费用');
        
    } catch (error) {
        console.error('修复累计成本数据失败:', error);
    }
}

// 运行修复
fixNanhuaCumulativeCost(); 