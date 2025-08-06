const { pool } = require('../config/database');

/**
 * 测试新的数据格式
 */
async function testNewDataFormat() {
    console.log('=== 测试常州拓源利润表新数据格式 ===\n');

    // 测试数据
    const testPeriod = '2025-01';
    const testData = {
        main_business_revenue: {
            current_amount: 1000000,
            cumulative_amount: 1500000
        },
        main_business_cost: {
            current_amount: 600000,
            cumulative_amount: 900000
        },
        direct_materials: {
            current_amount: 300000,
            cumulative_amount: 450000
        },
        direct_labor: {
            current_amount: 150000,
            cumulative_amount: 225000
        },
        manufacturing_overhead: {
            current_amount: 150000,
            cumulative_amount: 225000
        },
        main_business_profit: {
            current_amount: 400000,
            cumulative_amount: 600000
        },
        net_profit: {
            current_amount: 350000,
            cumulative_amount: 525000
        }
    };

    try {
        console.log('1. 测试数据保存...');
        
        // 删除可能存在的测试数据
        await pool.query(
            'DELETE FROM changzhou_tuoyuan_income_statement WHERE period = ?',
            [`${testPeriod}-01`]
        );

        // 保存测试数据
        await pool.query(
            'INSERT INTO changzhou_tuoyuan_income_statement (period, data, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
            [`${testPeriod}-01`, JSON.stringify(testData)]
        );
        
        console.log('✓ 数据保存成功');

        console.log('\n2. 测试数据读取...');
        
        // 读取数据
        const [rows] = await pool.query(
            'SELECT period, data FROM changzhou_tuoyuan_income_statement WHERE period = ?',
            [`${testPeriod}-01`]
        );

        if (rows.length === 0) {
            throw new Error('没有找到保存的数据');
        }

        const savedData = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
        console.log('✓ 数据读取成功');

        console.log('\n3. 验证数据格式...');
        
        // 验证数据结构
        for (const [fieldName, fieldData] of Object.entries(savedData)) {
            if (!fieldData.hasOwnProperty('current_amount') || !fieldData.hasOwnProperty('cumulative_amount')) {
                throw new Error(`字段 ${fieldName} 格式不正确`);
            }
            
            console.log(`✓ ${fieldName}: 当月=${fieldData.current_amount}, 累计=${fieldData.cumulative_amount}`);
        }

        console.log('\n4. 测试API格式验证...');
        
        // 测试无效数据格式（缺少必需字段）
        const invalidData = {
            test_field: {
                current_amount: 100
                // 缺少 cumulative_amount
            }
        };

        try {
            await pool.query(
                'INSERT INTO changzhou_tuoyuan_income_statement (period, data, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
                [`${testPeriod}-02`, JSON.stringify(invalidData)]
            );
            
            // 如果到这里说明没有验证，需要在API层面进行验证
            console.log('⚠ 注意：数据库层面没有格式验证，需要在API层面验证');
        } catch (error) {
            console.log('✓ 数据库正确拒绝了无效格式');
        }

        console.log('\n5. 清理测试数据...');
        
        // 清理测试数据
        await pool.query(
            'DELETE FROM changzhou_tuoyuan_income_statement WHERE period LIKE ?',
            [`${testPeriod}%`]
        );
        
        console.log('✓ 测试数据清理完成');

        console.log('\n=== 所有测试通过！ ===');
        
    } catch (error) {
        console.error('✗ 测试失败:', error.message);
        throw error;
    }
}

/**
 * 生成测试数据样本
 */
function generateSampleData() {
    console.log('\n=== 新格式数据样本 ===');
    
    const sampleData = {
        main_business_revenue: {
            current_amount: 1000000,
            cumulative_amount: 1500000
        },
        main_business_cost: {
            current_amount: 600000,
            cumulative_amount: 900000
        },
        net_profit: {
            current_amount: 350000,
            cumulative_amount: 525000
        }
    };
    
    console.log('前端应该发送的数据格式:');
    console.log(JSON.stringify(sampleData, null, 2));
    
    console.log('\n数据字段说明:');
    console.log('- current_amount: 当月金额');
    console.log('- cumulative_amount: 累计金额');
    console.log('- 所有金额字段都可以是 number 或 null');
}

// 主函数
async function main() {
    const action = process.argv[2] || 'test';
    
    try {
        switch (action) {
            case 'test':
                await testNewDataFormat();
                break;
            case 'sample':
                generateSampleData();
                break;
            default:
                console.log('用法: node test-changzhou-tuoyuan-income-statement-new-format.js [test|sample]');
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
    testNewDataFormat,
    generateSampleData
}; 