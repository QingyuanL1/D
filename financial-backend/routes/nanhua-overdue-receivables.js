const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取逾期应收账款数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        // 查询数据库中的数据（包括自建项目）
        const [rows] = await pool.execute(`
            SELECT customer_attribute, year_beginning_balance, current_period_new_addition, 
                   current_period_accumulated_collection, year_new_addition, collection_progress,
                   cumulative_new_overdue
            FROM nanhua_overdue_receivables 
            WHERE period = ?
            ORDER BY id ASC
        `, [period]);

        // 查询自建项目数据
        const [selfBuiltRows] = await pool.execute(`
            SELECT year_beginning_balance, current_period_new_addition, 
                   current_period_accumulated_collection, year_new_addition, collection_progress,
                   cumulative_new_overdue
            FROM nanhua_overdue_receivables_self_built 
            WHERE period = ?
        `, [period]);

        // 定义默认数据结构（工程板块包含所有项目，包括自建项目）
        const defaultData = {
            items: [
                { customerAttribute: '一包项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
                { customerAttribute: '二包项目', yearBeginningBalance: 5.94, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
                { customerAttribute: '域内合作项目', yearBeginningBalance: 129.30, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
                { customerAttribute: '域外合作项目', yearBeginningBalance: 12.28, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
                { customerAttribute: '新能源项目', yearBeginningBalance: 1.42, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
                { customerAttribute: '苏州项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
                { customerAttribute: '抢修项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
                { customerAttribute: '运检项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
                { customerAttribute: '自建项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 }
            ]
        };

        // 如果没有数据，返回默认数据
        if (rows.length === 0 && selfBuiltRows.length === 0) {
            return res.json({
                success: true,
                data: defaultData
            });
        }

        // 处理数据库数据
        const items = [];
        
        // 处理主表数据
        defaultData.items.forEach(defaultItem => {
            const dbItem = rows.find(row => row.customer_attribute === defaultItem.customerAttribute);
            if (dbItem) {
                items.push({
                    customerAttribute: dbItem.customer_attribute,
                    yearBeginningBalance: parseFloat(dbItem.year_beginning_balance) || 0,
                    currentPeriodNewAddition: parseFloat(dbItem.current_period_new_addition) || 0,
                    currentPeriodAccumulatedCollection: parseFloat(dbItem.current_period_accumulated_collection) || 0,
                    yearNewAddition: parseFloat(dbItem.year_new_addition) || 0,
                    collectionProgress: parseFloat(dbItem.collection_progress) || 0,
                    cumulativeNewOverdue: parseFloat(dbItem.cumulative_new_overdue) || 0
                });
            } else {
                items.push(defaultItem);
            }
        });

        // 处理自建项目数据（如果有的话，合并到items中）
        if (selfBuiltRows.length > 0) {
            const selfBuiltItem = items.find(item => item.customerAttribute === '自建项目');
            if (selfBuiltItem) {
                selfBuiltItem.yearBeginningBalance = parseFloat(selfBuiltRows[0].year_beginning_balance) || 0;
                selfBuiltItem.currentPeriodNewAddition = parseFloat(selfBuiltRows[0].current_period_new_addition) || 0;
                selfBuiltItem.currentPeriodAccumulatedCollection = parseFloat(selfBuiltRows[0].current_period_accumulated_collection) || 0;
                selfBuiltItem.yearNewAddition = parseFloat(selfBuiltRows[0].year_new_addition) || 0;
                selfBuiltItem.collectionProgress = parseFloat(selfBuiltRows[0].collection_progress) || 0;
                selfBuiltItem.cumulativeNewOverdue = parseFloat(selfBuiltRows[0].cumulative_new_overdue) || 0;
            }
        }

        res.json({
            success: true,
            data: { items }
        });
    } catch (error) {
        console.error('获取逾期应收账款数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存逾期应收账款数据
router.post('/', async (req, res) => {
    try {
        const { period, data } = req.body;
        
        if (!period || !data || !data.items) {
            return res.status(400).json({
                success: false,
                message: '请提供有效的期间和数据'
            });
        }

        // 开始事务
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 删除现有数据
            await connection.execute('DELETE FROM nanhua_overdue_receivables WHERE period = ?', [period]);
            await connection.execute('DELETE FROM nanhua_overdue_receivables_self_built WHERE period = ?', [period]);
            
            // 插入新数据
            for (const item of data.items) {
                if (item.customerAttribute === '自建项目') {
                    // 自建项目单独保存到自建项目表
                    await connection.execute(`
                        INSERT INTO nanhua_overdue_receivables_self_built 
                        (period, year_beginning_balance, current_period_new_addition, 
                         current_period_accumulated_collection, year_new_addition, collection_progress, cumulative_new_overdue)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [
                        period,
                        item.yearBeginningBalance || 0,
                        item.currentPeriodNewAddition || 0,
                        item.currentPeriodAccumulatedCollection || 0,
                        item.yearNewAddition || 0,
                        item.collectionProgress || 0,
                        item.cumulativeNewOverdue || 0
                    ]);
                } else {
                    // 其他项目保存到主表
                    await connection.execute(`
                        INSERT INTO nanhua_overdue_receivables 
                        (period, customer_attribute, year_beginning_balance, current_period_new_addition, 
                         current_period_accumulated_collection, year_new_addition, collection_progress, cumulative_new_overdue)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        period,
                        item.customerAttribute,
                        item.yearBeginningBalance || 0,
                        item.currentPeriodNewAddition || 0,
                        item.currentPeriodAccumulatedCollection || 0,
                        item.yearNewAddition || 0,
                        item.collectionProgress || 0,
                        item.cumulativeNewOverdue || 0
                    ]);
                }
            }

            await connection.commit();
            connection.release();

            res.json({
                success: true,
                message: '数据保存成功'
            });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('保存逾期应收账款数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router;