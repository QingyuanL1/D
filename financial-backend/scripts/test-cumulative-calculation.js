const { pool } = require('../config/database');

/**
 * 测试累计值自动计算功能
 */
async function testCumulativeCalculation() {
    console.log('=== 测试累计值自动计算功能 ===\n');

    try {
        // 清理测试数据
        await pool.query('DELETE FROM changzhou_tuoyuan_income_statement WHERE period LIKE ?', ['2025-%']);
        console.log('清理已有测试数据\n');

        // 1. 插入第一个月的数据 (2025-01)
        console.log('1. 插入2025年1月数据...');
        const jan2025Data = {
            main_business_revenue: {
                current_amount: 1000000,
                cumulative_amount: 1000000
            },
            main_business_cost: {
                current_amount: 600000,
                cumulative_amount: 600000
            },
            net_profit: {
                current_amount: 300000,
                cumulative_amount: 300000
            }
        };

        await pool.query(
            'INSERT INTO changzhou_tuoyuan_income_statement (period, data) VALUES (?, ?)',
            ['2025-01-01', JSON.stringify(jan2025Data)]
        );
        console.log('✓ 1月数据插入成功');

        // 2. 插入第二个月的数据 (2025-02)
        console.log('\n2. 插入2025年2月数据...');
        const feb2025Data = {
            main_business_revenue: {
                current_amount: 1200000,
                cumulative_amount: 1200000  // 这个值应该被重新计算
            },
            main_business_cost: {
                current_amount: 720000,
                cumulative_amount: 720000   // 这个值应该被重新计算
            },
            net_profit: {
                current_amount: 360000,
                cumulative_amount: 360000   // 这个值应该被重新计算
            }
        };

        await pool.query(
            'INSERT INTO changzhou_tuoyuan_income_statement (period, data) VALUES (?, ?)',
            ['2025-02-01', JSON.stringify(feb2025Data)]
        );
        console.log('✓ 2月数据插入成功');

        // 3. 测试计算3月份的累计值
        console.log('\n3. 测试计算2025年3月累计值...');
        const mar2025CurrentData = {
            main_business_revenue: {
                current_amount: 1500000,
                cumulative_amount: null  // 待计算
            },
            main_business_cost: {
                current_amount: 900000,
                cumulative_amount: null  // 待计算
            },
            net_profit: {
                current_amount: 450000,
                cumulative_amount: null  // 待计算
            }
        };

        // 调用计算API  
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('http://127.0.0.1:3000/changzhou-tuoyuan-income-statement/calculate-cumulative', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: '2025-03',
                data: mar2025CurrentData
            })
        });

        if (!response.ok) {
            throw new Error('计算API调用失败');
        }

        const result = await response.json();
        console.log('✓ 计算API调用成功');

        // 4. 验证计算结果
        console.log('\n4. 验证计算结果...');
        const calculatedData = result.data;
        
        // 预期结果：
        // 主营业务收入累计 = 1000000 + 1200000 + 1500000 = 3700000
        // 主营业务成本累计 = 600000 + 720000 + 900000 = 2220000
        // 净利润累计 = 300000 + 360000 + 450000 = 1110000

        const expectedResults = {
            main_business_revenue: 3700000,
            main_business_cost: 2220000,
            net_profit: 1110000
        };

        let allCorrect = true;
        for (const [fieldName, expectedValue] of Object.entries(expectedResults)) {
            const actualValue = calculatedData[fieldName].cumulative_amount;
            if (actualValue === expectedValue) {
                console.log(`✓ ${fieldName}: 预期=${expectedValue}, 实际=${actualValue}`);
            } else {
                console.log(`✗ ${fieldName}: 预期=${expectedValue}, 实际=${actualValue}`);
                allCorrect = false;
            }
        }

        // 5. 测试自动计算保存
        console.log('\n5. 测试自动计算保存功能...');
        const saveResponse = await fetch('http://127.0.0.1:3000/changzhou-tuoyuan-income-statement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: '2025-03',
                data: mar2025CurrentData,
                autoCalculateCumulative: true
            })
        });

        if (!saveResponse.ok) {
            throw new Error('自动计算保存失败');
        }

        const saveResult = await saveResponse.json();
        console.log('✓ 自动计算保存成功');

        if (saveResult.calculatedData) {
            console.log('✓ 返回了计算后的数据');
            
            // 验证保存后的数据
            const [savedRows] = await pool.query(
                'SELECT data FROM changzhou_tuoyuan_income_statement WHERE period = ?',
                ['2025-03-01']
            );

            if (savedRows.length > 0) {
                const savedData = typeof savedRows[0].data === 'string' ? JSON.parse(savedRows[0].data) : savedRows[0].data;
                console.log('✓ 数据已正确保存到数据库');
                
                // 验证保存的累计值
                for (const [fieldName, expectedValue] of Object.entries(expectedResults)) {
                    const savedValue = savedData[fieldName].cumulative_amount;
                    if (savedValue === expectedValue) {
                        console.log(`✓ 保存的${fieldName}累计值正确: ${savedValue}`);
                    } else {
                        console.log(`✗ 保存的${fieldName}累计值错误: 预期=${expectedValue}, 实际=${savedValue}`);
                        allCorrect = false;
                    }
                }
            }
        }

        // 6. 清理测试数据
        console.log('\n6. 清理测试数据...');
        await pool.query('DELETE FROM changzhou_tuoyuan_income_statement WHERE period LIKE ?', ['2025-%']);
        console.log('✓ 测试数据清理完成');

        console.log('\n=== 测试结果 ===');
        if (allCorrect) {
            console.log('🎉 所有测试通过！累计值自动计算功能工作正常。');
        } else {
            console.log('❌ 部分测试失败，请检查计算逻辑。');
        }

    } catch (error) {
        console.error('❌ 测试过程中出错:', error);
        
        // 清理测试数据
        try {
            await pool.query('DELETE FROM changzhou_tuoyuan_income_statement WHERE period LIKE ?', ['2025-%']);
            console.log('测试数据已清理');
        } catch (cleanupError) {
            console.error('清理测试数据失败:', cleanupError);
        }
        
        throw error;
    }
}

/**
 * 演示累计值计算逻辑
 */
function demonstrateCalculationLogic() {
    console.log('\n=== 累计值计算逻辑说明 ===');
    console.log('累计值 = 本年度1月到当前月的所有当月金额之和');
    console.log('');
    console.log('示例：');
    console.log('1月当月: 1000000, 累计: 1000000');
    console.log('2月当月: 1200000, 累计: 1000000 + 1200000 = 2200000');
    console.log('3月当月: 1500000, 累计: 1000000 + 1200000 + 1500000 = 3700000');
    console.log('');
    console.log('注意事项：');
    console.log('- 累计值按自然年计算（1月到12月）');
    console.log('- 只计算当年度的数据');
    console.log('- 如果历史月份有数据修改，需要重新计算后续月份的累计值');
}

// 主函数
async function main() {
    const action = process.argv[2] || 'test';
    
    try {
        switch (action) {
            case 'test':
                await testCumulativeCalculation();
                break;
            case 'demo':
                demonstrateCalculationLogic();
                break;
            default:
                console.log('用法: node test-cumulative-calculation.js [test|demo]');
                process.exit(1);
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('操作失败:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = {
    testCumulativeCalculation,
    demonstrateCalculationLogic
}; 