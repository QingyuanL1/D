const { pool } = require('../config/database');

/**
 * 测试上海南华兰陵现金流量表累计值自动计算功能
 */
async function testShanghaiNanhuaLanlingCumulative() {
    console.log('=== 测试上海南华兰陵现金流量表累计值自动计算功能 ===\n');

    try {
        // 清理测试数据
        await pool.query('DELETE FROM shanghai_nanhua_lanling_cash_flow WHERE period LIKE ?', ['2025-%']);
        console.log('清理已有测试数据\n');

        // 1. 插入第一个月的数据 (2025-01)
        console.log('1. 插入2025年1月数据...');
        const jan2025Data = {
            contract_sales_cash: {
                current_amount: 5000000,
                year_amount: 5000000
            },
            tax_refund_received: {
                current_amount: 100000,
                year_amount: 100000
            },
            other_operating_cash_received: {
                current_amount: 200000,
                year_amount: 200000
            },
            operating_cash_inflow_subtotal: {
                current_amount: 5300000,
                year_amount: 5300000
            }
        };

        await pool.query(
            'INSERT INTO shanghai_nanhua_lanling_cash_flow (period, data) VALUES (?, ?)',
            ['2025-01', JSON.stringify(jan2025Data)]
        );
        console.log('✓ 1月数据插入成功');

        // 2. 插入第二个月的数据 (2025-02)
        console.log('\n2. 插入2025年2月数据...');
        const feb2025Data = {
            contract_sales_cash: {
                current_amount: 6000000,
                year_amount: 6000000  // 这个值应该被重新计算
            },
            tax_refund_received: {
                current_amount: 150000,
                year_amount: 150000   // 这个值应该被重新计算
            },
            other_operating_cash_received: {
                current_amount: 250000,
                year_amount: 250000   // 这个值应该被重新计算
            },
            operating_cash_inflow_subtotal: {
                current_amount: 6400000,
                year_amount: 6400000  // 这个值应该被重新计算
            }
        };

        await pool.query(
            'INSERT INTO shanghai_nanhua_lanling_cash_flow (period, data) VALUES (?, ?)',
            ['2025-02', JSON.stringify(feb2025Data)]
        );
        console.log('✓ 2月数据插入成功');

        // 3. 测试计算3月份的累计值
        console.log('\n3. 测试计算2025年3月累计值...');
        const mar2025CurrentData = {
            contract_sales_cash: {
                current_amount: 7000000,
                cumulative_amount: null  // 待计算
            },
            tax_refund_received: {
                current_amount: 80000,
                cumulative_amount: null  // 待计算
            },
            other_operating_cash_received: {
                current_amount: 300000,
                cumulative_amount: null  // 待计算
            },
            operating_cash_inflow_subtotal: {
                current_amount: 7380000,
                cumulative_amount: null  // 待计算
            }
        };

        // 调用计算API
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('http://127.0.0.1:3000/shanghai-nanhua-lanling-cash-flow/calculate-cumulative', {
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
        // 承包工程收入累计 = 5000000 + 6000000 + 7000000 = 18000000
        // 税费返还累计 = 100000 + 150000 + 80000 = 330000
        // 其他经营活动现金累计 = 200000 + 250000 + 300000 = 750000
        // 经营活动现金流入小计累计 = 5300000 + 6400000 + 7380000 = 19080000

        const expectedResults = {
            contract_sales_cash: 18000000,
            tax_refund_received: 330000,
            other_operating_cash_received: 750000,
            operating_cash_inflow_subtotal: 19080000
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
        const saveResponse = await fetch('http://127.0.0.1:3000/shanghai-nanhua-lanling-cash-flow', {
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
                'SELECT data FROM shanghai_nanhua_lanling_cash_flow WHERE period = ?',
                ['2025-03']
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
        await pool.query('DELETE FROM shanghai_nanhua_lanling_cash_flow WHERE period LIKE ?', ['2025-%']);
        console.log('✓ 测试数据清理完成');

        console.log('\n=== 测试结果 ===');
        if (allCorrect) {
            console.log('🎉 所有测试通过！上海南华兰陵现金流量表累计值自动计算功能工作正常。');
        } else {
            console.log('❌ 部分测试失败，请检查计算逻辑。');
        }

    } catch (error) {
        console.error('❌ 测试过程中出错:', error);
        
        // 清理测试数据
        try {
            await pool.query('DELETE FROM shanghai_nanhua_lanling_cash_flow WHERE period LIKE ?', ['2025-%']);
            console.log('测试数据已清理');
        } catch (cleanupError) {
            console.error('清理测试数据失败:', cleanupError);
        }
        
        throw error;
    }
}

// 主函数
async function main() {
    const action = process.argv[2] || 'test';
    
    try {
        switch (action) {
            case 'test':
                await testShanghaiNanhuaLanlingCumulative();
                break;
            default:
                console.log('用法: node test-shanghai-nanhua-lanling-cumulative.js [test]');
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
    testShanghaiNanhuaLanlingCumulative
}; 