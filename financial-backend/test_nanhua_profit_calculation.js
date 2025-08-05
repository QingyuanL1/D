const { pool } = require('./config/database');
const fetch = require('node-fetch');

async function testNanhuaProfitCalculation() {
    try {
        const period = '2025-08'; // 使用有数据的期间
        console.log(`测试南华业务利润率计算，期间: ${period}\n`);
        
        // 1. 调用计算API
        console.log('=== 调用计算API ===');
        const response = await fetch(`http://127.0.0.1:3000/nanhua-business-profit-margin-with-self-built/calculate/${period}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log('API返回成功:', result.success);
            
            if (result.success && result.data && result.data.customers) {
                console.log('\n=== 计算结果 ===');
                console.table(result.data.customers.map(customer => ({
                    客户名称: customer.customerName,
                    年度计划: customer.yearlyPlan + '%',
                    当期实际: customer.current + '%',
                    偏差: (customer.current - customer.yearlyPlan).toFixed(2) + '%'
                })));
                
                console.log('\n=== 详细计算信息 ===');
                if (result.calculation) {
                    console.log('计算公式:', result.calculation.formula);
                    console.log('计算说明:', result.calculation.description);
                }
            } else {
                console.log('API返回数据格式异常:', result);
            }
        } else {
            console.log('API调用失败:', response.status, response.statusText);
            const errorText = await response.text();
            console.log('错误详情:', errorText);
        }
        
        // 2. 手动验证计算逻辑
        console.log('\n=== 手动验证数据匹配 ===');
        
        // 获取收入数据
        const incomeResponse = await fetch(`http://127.0.0.1:3000/nanhua-business-income/${period}`);
        let incomeData = null;
        if (incomeResponse.ok) {
            const incomeResult = await incomeResponse.json();
            if (incomeResult.success) {
                incomeData = incomeResult.data;
            }
        }
        
        // 获取成本数据
        const costResponse = await fetch(`http://127.0.0.1:3000/nanhua-main-business-cost/${period}`);
        let costData = null;
        if (costResponse.ok) {
            const costResult = await costResponse.json();
            if (costResult.success) {
                costData = costResult.data;
            }
        }
        
        if (incomeData && costData) {
            console.log('\n收入数据客户:');
            if (incomeData.customers) {
                incomeData.customers.forEach(customer => {
                    console.log(`  ${customer.customerName}: 累计收入=${customer.accumulated || customer.accumulatedIncome || 0}`);
                });
            }
            
            console.log('\n成本数据客户:');
            console.log('设备类:');
            (costData.equipment || []).forEach(item => {
                const totalCost = (parseFloat(item.cumulativeMaterialCost || 0) + parseFloat(item.cumulativeLaborCost || 0));
                console.log(`  ${item.customerType}: 累计成本=${totalCost.toFixed(2)}`);
            });
            
            console.log('元件类:');
            (costData.component || []).forEach(item => {
                const totalCost = (parseFloat(item.cumulativeMaterialCost || 0) + parseFloat(item.cumulativeLaborCost || 0));
                console.log(`  ${item.customerType}: 累计成本=${totalCost.toFixed(2)}`);
            });
            
            console.log('工程类:');
            (costData.project || []).forEach(item => {
                const totalCost = (parseFloat(item.cumulativeMaterialCost || 0) + parseFloat(item.cumulativeLaborCost || 0));
                console.log(`  ${item.customerType}: 累计成本=${totalCost.toFixed(2)}`);
            });
        }
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

// 运行测试
testNanhuaProfitCalculation(); 