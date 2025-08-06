const { pool } = require('../config/database');

/**
 * 迁移常州拓源利润表数据格式
 * 从旧格式（包含多个字段）转换为新格式（只包含当月和累计）
 */
async function migrateChangzhouTuoyuanIncomeStatementData() {
    console.log('开始迁移常州拓源利润表数据...');
    
    try {
        // 获取所有现有数据
        const [rows] = await pool.query(
            'SELECT id, period, data FROM changzhou_tuoyuan_income_statement'
        );

        console.log(`找到 ${rows.length} 条记录需要迁移`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const row of rows) {
            try {
                // 解析现有数据
                const oldData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
                
                // 检查是否已经是新格式
                const sampleField = Object.values(oldData)[0];
                if (sampleField && typeof sampleField === 'object' && 
                    sampleField.hasOwnProperty('current_amount') && 
                    sampleField.hasOwnProperty('cumulative_amount') &&
                    !sampleField.hasOwnProperty('year_amount')) {
                    console.log(`期间 ${row.period} 已经是新格式，跳过`);
                    skippedCount++;
                    continue;
                }

                // 转换数据格式
                const newData = {};
                
                for (const [fieldName, fieldData] of Object.entries(oldData)) {
                    if (fieldData && typeof fieldData === 'object') {
                        // 转换旧格式到新格式
                        newData[fieldName] = {
                            current_amount: fieldData.current_amount || null,
                            cumulative_amount: fieldData.current_amount_actual || fieldData.year_amount || null
                        };
                    } else {
                        // 如果是简单值，创建新格式
                        newData[fieldName] = {
                            current_amount: fieldData,
                            cumulative_amount: null
                        };
                    }
                }

                // 更新数据库
                await pool.query(
                    'UPDATE changzhou_tuoyuan_income_statement SET data = ?, updated_at = NOW() WHERE id = ?',
                    [JSON.stringify(newData), row.id]
                );

                console.log(`✓ 迁移期间 ${row.period} 的数据`);
                migratedCount++;

            } catch (error) {
                console.error(`✗ 迁移期间 ${row.period} 时出错:`, error.message);
            }
        }

        console.log('\n迁移完成！');
        console.log(`成功迁移: ${migratedCount} 条记录`);
        console.log(`跳过: ${skippedCount} 条记录`);
        
    } catch (error) {
        console.error('迁移过程中出错:', error);
        throw error;
    }
}

/**
 * 验证迁移结果
 */
async function validateMigration() {
    console.log('\n验证迁移结果...');
    
    try {
        const [rows] = await pool.query(
            'SELECT period, data FROM changzhou_tuoyuan_income_statement LIMIT 3'
        );

        for (const row of rows) {
            const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
            const sampleField = Object.values(data)[0];
            
            console.log(`期间 ${row.period}:`);
            console.log('  字段结构:', Object.keys(sampleField || {}));
            
            if (sampleField && sampleField.hasOwnProperty('current_amount') && 
                sampleField.hasOwnProperty('cumulative_amount')) {
                console.log('  ✓ 格式正确');
            } else {
                console.log('  ✗ 格式错误');
            }
        }
    } catch (error) {
        console.error('验证过程中出错:', error);
    }
}

/**
 * 回滚迁移（如果需要）
 */
async function rollbackMigration() {
    console.log('开始回滚迁移...');
    console.log('注意: 回滚功能需要根据具体需求实现');
    console.log('建议在迁移前备份数据库');
}

// 主函数
async function main() {
    const action = process.argv[2] || 'migrate';
    
    try {
        switch (action) {
            case 'migrate':
                await migrateChangzhouTuoyuanIncomeStatementData();
                await validateMigration();
                break;
            case 'validate':
                await validateMigration();
                break;
            case 'rollback':
                await rollbackMigration();
                break;
            default:
                console.log('用法: node migrate-changzhou-tuoyuan-income-statement-data.js [migrate|validate|rollback]');
                process.exit(1);
        }
        
        console.log('\n操作完成');
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
    migrateChangzhouTuoyuanIncomeStatementData,
    validateMigration,
    rollbackMigration
}; 