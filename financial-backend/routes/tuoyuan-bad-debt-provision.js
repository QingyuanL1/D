const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        console.log(`获取拓源公司坏账准备情况数据，期间: ${period}`);
        
        // 定义默认数据结构
        const defaultData = {
            items: [
                { segmentAttribute: '设备', customerAttribute: '电业项目', yearBeginningBalance: 0, yearNewIncrease: 0, currentCollected: 0, cumulativeCollected: 0, provisionBalance: 0 },
                { segmentAttribute: '设备', customerAttribute: '用户项目', yearBeginningBalance: 0, yearNewIncrease: 0, currentCollected: 0, cumulativeCollected: 0, provisionBalance: 0 },
                { segmentAttribute: '设备', customerAttribute: '贸易', yearBeginningBalance: 0, yearNewIncrease: 0, currentCollected: 0, cumulativeCollected: 0, provisionBalance: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理设备', yearBeginningBalance: 0, yearNewIncrease: 0, currentCollected: 0, cumulativeCollected: 0, provisionBalance: 0 },
                { segmentAttribute: '其他', customerAttribute: '代理工程', yearBeginningBalance: 0, yearNewIncrease: 0, currentCollected: 0, cumulativeCollected: 0, provisionBalance: 0 },
                { segmentAttribute: '其他', customerAttribute: '代理设计', yearBeginningBalance: 0, yearNewIncrease: 0, currentCollected: 0, cumulativeCollected: 0, provisionBalance: 0 }
            ]
        };

        const query = `
            SELECT 
                id,
                period,
                segment_attribute,
                customer_attribute,
                year_beginning_balance,
                year_new_increase,
                current_collected,
                cumulative_collected,
                provision_balance,
                created_at,
                updated_at
            FROM tuoyuan_bad_debt_provision 
            WHERE period = ?
            ORDER BY id ASC
        `;
        
        const [results] = await pool.execute(query, [period]);
        
        let items = [];
        let isCalculated = false;
        
        // 如果没有当月数据，计算累计值并生成数据
        if (results.length === 0) {
            console.log(`没有${period}的拓源坏账准备数据，计算累计值...`);
            
            // 计算累计值
            items = await calculateTuoyuanBadDebtCumulativeData(defaultData.items, period);
            isCalculated = true;
        } else {
            // 有数据的月份，也要重新计算累计值
            console.log(`${period}有拓源坏账准备数据，重新计算累计值...`);
            
            items = results.map(row => ({
            id: row.id,
            segmentAttribute: row.segment_attribute,
            customerAttribute: row.customer_attribute,
            yearBeginningBalance: parseFloat(row.year_beginning_balance || 0),
            yearNewIncrease: parseFloat(row.year_new_increase || 0),
            currentCollected: parseFloat(row.current_collected || 0),
            cumulativeCollected: parseFloat(row.cumulative_collected || 0),
            provisionBalance: parseFloat(row.provision_balance || 0)
        }));
            
            // 重新计算累计值
            items = await recalculateTuoyuanBadDebtCumulativeData(items, period);
        }

        res.json({
            success: true,
            data: { items },
            isCalculated: isCalculated
        });

    } catch (error) {
        console.error('获取拓源公司坏账准备情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 计算拓源坏账准备累计值的辅助函数
async function calculateTuoyuanBadDebtCumulativeData(baseData, targetPeriod) {
    const [year, month] = targetPeriod.split('-');
    const targetMonth = parseInt(month);
    
    const result = [];
    
    for (const baseItem of baseData) {
        // 计算累计已收款
        let totalCollected = 0;
        
        // 查询从1月到目标月份的所有数据
        for (let i = 1; i <= targetMonth; i++) {
            const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`;
            
            try {
                const [monthRows] = await pool.execute(
                    'SELECT * FROM tuoyuan_bad_debt_provision WHERE period = ? AND segment_attribute = ? AND customer_attribute = ?',
                    [monthPeriod, baseItem.segmentAttribute, baseItem.customerAttribute]
                );
                
                if (monthRows.length > 0) {
                    const monthItem = monthRows[0];
                    const currentCollected = parseFloat(monthItem.current_collected) || 0;
                    
                    totalCollected += currentCollected;
                }
            } catch (error) {
                console.log(`跳过月份 ${monthPeriod}:`, error.message);
            }
        }
        
        // 年初余额（固定值）
        const yearBeginningBalance = baseItem.yearBeginningBalance || 0;
        const yearNewIncrease = baseItem.yearNewIncrease || 0;
        
        // 计算坏账准备余额 = 年初余额 + 本年新增 - 累计已收款
        const provisionBalance = yearBeginningBalance + yearNewIncrease - totalCollected;
        
        result.push({
            segmentAttribute: baseItem.segmentAttribute,
            customerAttribute: baseItem.customerAttribute,
            yearBeginningBalance: yearBeginningBalance,
            yearNewIncrease: yearNewIncrease,
            currentCollected: 0, // 当月已收款为0（因为没有当月数据）
            cumulativeCollected: totalCollected,
            provisionBalance: provisionBalance
        });
    }
    
    return result;
}

// 重新计算现有数据的累计值
async function recalculateTuoyuanBadDebtCumulativeData(items, targetPeriod) {
    const [year, month] = targetPeriod.split('-');
    const targetMonth = parseInt(month);
    
    for (let item of items) {
        // 计算累计已收款
        let totalCollected = 0;
        
        // 查询从1月到目标月份的所有数据
        for (let i = 1; i <= targetMonth; i++) {
            const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`;
            
            try {
                const [monthRows] = await pool.execute(
                    'SELECT * FROM tuoyuan_bad_debt_provision WHERE period = ? AND segment_attribute = ? AND customer_attribute = ?',
                    [monthPeriod, item.segmentAttribute, item.customerAttribute]
                );
                
                if (monthRows.length > 0) {
                    const monthItem = monthRows[0];
                    const currentCollected = parseFloat(monthItem.current_collected) || 0;
                    
                    totalCollected += currentCollected;
                }
            } catch (error) {
                console.log(`跳过月份 ${monthPeriod}:`, error.message);
            }
        }
        
        // 更新累计值
        item.cumulativeCollected = totalCollected;
        
        // 重新计算坏账准备余额 = 年初余额 + 本年新增 - 累计已收款
        item.provisionBalance = item.yearBeginningBalance + item.yearNewIncrease - totalCollected;
    }
    
    return items;
}

// 本年新增现在作为输入值，由用户手动填写

// 保存数据
router.post('/', async (req, res) => {
    try {
        const { period, data } = req.body;
        console.log(`保存拓源公司坏账准备情况数据，期间: ${period}`);
        
        if (!period || !data || !data.items) {
            return res.status(400).json({
                success: false,
                message: '请求参数不完整'
            });
        }

        // 开始事务
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 删除现有数据
            await connection.execute(
                'DELETE FROM tuoyuan_bad_debt_provision WHERE period = ?',
                [period]
            );

            // 插入新数据
            const insertQuery = `
                INSERT INTO tuoyuan_bad_debt_provision 
                (period, segment_attribute, customer_attribute, year_beginning_balance, year_new_increase, current_collected, cumulative_collected, provision_balance, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;

            for (const item of data.items) {
                // 重新计算坏账准备余额以确保数据一致性
                const provisionBalance = (item.yearBeginningBalance || 0) + (item.yearNewIncrease || 0) - (item.cumulativeCollected || 0);
                
                await connection.execute(insertQuery, [
                    period,
                    item.segmentAttribute,
                    item.customerAttribute,
                    item.yearBeginningBalance || 0,
                    item.yearNewIncrease || 0,
                    item.currentCollected || 0,
                    item.cumulativeCollected || 0,
                    provisionBalance
                ]);
            }

            // 提交事务
            await connection.commit();
            connection.release();

            res.json({
                success: true,
                message: '数据保存成功',
                data: {
                    period: period,
                    itemCount: data.items.length
                }
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('保存拓源公司坏账准备情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router;