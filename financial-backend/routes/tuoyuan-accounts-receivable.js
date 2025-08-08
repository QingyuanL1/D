const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        console.log(`获取拓源公司应收账款数据，期间: ${period}`);
        
        const query = `
            SELECT 
                id,
                period,
                segment_attribute,
                customer_attribute,
                year_beginning_balance,
                current_invoicing,
                cumulative_invoicing,
                current_collection,
                cumulative_collection,
                current_receivable_balance,
                created_at,
                updated_at
            FROM tuoyuan_accounts_receivable 
            WHERE period = ?
            ORDER BY id ASC
        `;
        
        const [results] = await pool.execute(query, [period]);
        
        // 获取坏账准备数据
        let badDebtProvisionData = [];
        try {
            const badDebtQuery = `
                SELECT 
                    segment_attribute,
                    customer_attribute,
                    year_new_increase,
                    current_collected,
                    provision_balance
                FROM tuoyuan_bad_debt_provision 
                WHERE period = ?
                ORDER BY id ASC
            `;
            const [badDebtRows] = await pool.execute(badDebtQuery, [period]);
            badDebtProvisionData = badDebtRows;
        } catch (badDebtError) {
            console.warn('获取拓源坏账准备数据失败，使用空数组:', badDebtError.message);
        }
        
        let items = [];
        let isCalculated = false;
        
        // 如果没有当月数据，计算累计值并生成数据
        if (results.length === 0) {
            console.log(`没有${period}的拓源应收账款数据，计算累计值...`);
            
            // 生成基础数据结构
            const baseData = [
                { segmentAttribute: '设备', customerAttribute: '申业项目' },
                { segmentAttribute: '设备', customerAttribute: '用户项目' },
                { segmentAttribute: '设备', customerAttribute: '贸易' },
                { segmentAttribute: '设备', customerAttribute: '代理设备' },
                { segmentAttribute: '其他', customerAttribute: '代理工程' },
                { segmentAttribute: '其他', customerAttribute: '代理设计' }
            ];
            
            // 计算累计值
            items = await calculateTuoyuanCumulativeData(baseData, period);
            isCalculated = true;
        } else {
            // 有数据的月份，也要重新计算累计值
            console.log(`${period}有拓源应收账款数据，重新计算累计值...`);
            
            items = results.map(row => ({
                id: row.id,
                segmentAttribute: row.segment_attribute,
                customerAttribute: row.customer_attribute,
                yearBeginningBalance: parseFloat(row.year_beginning_balance || 0),
                currentInvoicing: parseFloat(row.current_invoicing || 0),
                cumulativeInvoicing: parseFloat(row.cumulative_invoicing || 0),
                currentCollection: parseFloat(row.current_collection || 0),
                cumulativeCollection: parseFloat(row.cumulative_collection || 0),
                currentReceivableBalance: parseFloat(row.current_receivable_balance || 0)
            }));
            
            // 重新计算累计值
            items = await recalculateTuoyuanCumulativeData(items, period);
        }
        
        // 应用坏账准备扣减
        items = await applyBadDebtDeduction(items, badDebtProvisionData, period, pool);

        res.json({
            success: true,
            data: {
                period: period,
                items: items
            },
            isCalculated: isCalculated,
            badDebtProvisionData: badDebtProvisionData
        });

    } catch (error) {
        console.error('获取拓源公司应收账款数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存数据
router.post('/', async (req, res) => {
    try {
        const { period, data } = req.body;
        console.log(`保存拓源公司应收账款数据，期间: ${period}`);
        
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
                'DELETE FROM tuoyuan_accounts_receivable WHERE period = ?',
                [period]
            );

            // 插入新数据
            const insertQuery = `
                INSERT INTO tuoyuan_accounts_receivable 
                (period, segment_attribute, customer_attribute, year_beginning_balance, current_invoicing, cumulative_invoicing, current_collection, cumulative_collection, current_receivable_balance, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;

            for (const item of data.items) {
                await connection.execute(insertQuery, [
                    period,
                    item.segmentAttribute,
                    item.customerAttribute,
                    item.yearBeginningBalance || 0,
                    item.currentInvoicing || 0,
                    item.cumulativeInvoicing || 0,
                    item.currentCollection || 0,
                    item.cumulativeCollection || 0,
                    item.currentReceivableBalance || 0
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
        console.error('保存拓源公司应收账款数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

// 计算拓源累计值的辅助函数
async function calculateTuoyuanCumulativeData(baseData, targetPeriod) {
    const [year, month] = targetPeriod.split('-');
    const targetMonth = parseInt(month);
    
    const result = [];
    
    for (const baseItem of baseData) {
        // 计算累计开票和累计收款
        let totalInvoicing = 0;
        let totalCollection = 0;
        
        // 查询从1月到目标月份的所有数据
        for (let i = 1; i <= targetMonth; i++) {
            const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`;
            
            try {
                const [monthRows] = await pool.execute(
                    'SELECT * FROM tuoyuan_accounts_receivable WHERE period = ? AND segment_attribute = ? AND customer_attribute = ?',
                    [monthPeriod, baseItem.segmentAttribute, baseItem.customerAttribute]
                );
                
                if (monthRows.length > 0) {
                    const monthItem = monthRows[0];
                    const currentInvoicing = parseFloat(monthItem.current_invoicing) || 0;
                    const currentCollection = parseFloat(monthItem.current_collection) || 0;
                    
                    totalInvoicing += currentInvoicing;
                    totalCollection += currentCollection;
                }
            } catch (error) {
                console.log(`跳过月份 ${monthPeriod}:`, error.message);
            }
        }
        
        // 年初余额（固定值）
        const yearBeginningBalance = 0; // 拓源公司的年初余额
        
        // 计算当期应收余额
        const currentReceivableBalance = yearBeginningBalance + totalInvoicing - totalCollection;
        
        result.push({
            segmentAttribute: baseItem.segmentAttribute,
            customerAttribute: baseItem.customerAttribute,
            yearBeginningBalance: yearBeginningBalance,
            currentInvoicing: 0, // 当月开票为0（因为没有当月数据）
            cumulativeInvoicing: totalInvoicing,
            currentCollection: 0, // 当月收款为0（因为没有当月数据）
            cumulativeCollection: totalCollection,
            currentReceivableBalance: currentReceivableBalance
        });
    }
    
    return result;
}

// 重新计算现有数据的累计值
async function recalculateTuoyuanCumulativeData(items, targetPeriod) {
    const [year, month] = targetPeriod.split('-');
    const targetMonth = parseInt(month);
    
    for (let item of items) {
        // 计算累计开票和累计收款
        let totalInvoicing = 0;
        let totalCollection = 0;
        
        // 查询从1月到目标月份的所有数据
        for (let i = 1; i <= targetMonth; i++) {
            const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`;
            
            try {
                const [monthRows] = await pool.execute(
                    'SELECT * FROM tuoyuan_accounts_receivable WHERE period = ? AND segment_attribute = ? AND customer_attribute = ?',
                    [monthPeriod, item.segmentAttribute, item.customerAttribute]
                );
                
                if (monthRows.length > 0) {
                    const monthItem = monthRows[0];
                    const currentInvoicing = parseFloat(monthItem.current_invoicing) || 0;
                    const currentCollection = parseFloat(monthItem.current_collection) || 0;
                    
                    totalInvoicing += currentInvoicing;
                    totalCollection += currentCollection;
                }
            } catch (error) {
                console.log(`跳过月份 ${monthPeriod}:`, error.message);
            }
        }
        
        // 更新累计值
        item.cumulativeInvoicing = totalInvoicing;
        item.cumulativeCollection = totalCollection;
        
        // 重新计算当期应收余额
        item.currentReceivableBalance = item.yearBeginningBalance + totalInvoicing - totalCollection;
    }
    
    return items;
}

// 应用坏账准备扣减的函数
async function applyBadDebtDeduction(items, badDebtProvisionData, period, pool) {
    const results = [];
    
    for (const item of items) {
        // 查找对应的坏账准备数据
        const badDebtItem = badDebtProvisionData.find(bd => 
            bd.segment_attribute === item.segmentAttribute && 
            bd.customer_attribute === item.customerAttribute
        );
        
        // 计算坏账准备的影响
        let badDebtAdjustment = 0;
        let badDebtProvisionBalance = 0;
        
        if (badDebtItem) {
            badDebtProvisionBalance = parseFloat(badDebtItem.provision_balance || 0);
            
            // 如果坏账准备余额是负数（如-293），那就是+293，要加上去
            // 如果坏账准备余额是正数（如+149），那就是-149，要减去
            if (badDebtProvisionBalance < 0) {
                // 负数变正数，加上去：-30 + 293 = 263
                badDebtAdjustment = Math.abs(badDebtProvisionBalance);
            } else {
                // 正数变负数，减去：-10 - 149 = -159
                badDebtAdjustment = -badDebtProvisionBalance;
            }
        }
        
        // 保存原始当期应收余额
        const originalCurrentBalance = item.currentReceivableBalance;
        
        // 重新计算当期应收余额
        // 如果坏账准备余额是负数（-293），加上293
        // 如果坏账准备余额是正数（+149），减去149
        const adjustedCurrentBalance = originalCurrentBalance + badDebtAdjustment;
        
        results.push({
            ...item,
            currentReceivableBalance: adjustedCurrentBalance,
            badDebtProvisionDeduction: badDebtAdjustment, // 显示坏账准备调整金额
            originalCurrentBalance: originalCurrentBalance // 保留原始余额用于对比
        });
    }
    
    return results;
}

module.exports = router;