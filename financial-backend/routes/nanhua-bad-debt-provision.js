const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取坏账准备数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        // 查询数据库中的数据
        const [rows] = await pool.execute(`
            SELECT customer_attribute, year_beginning_balance, current_period_new_addition, 
                   current_period_accumulated_collection, year_new_addition, collection_progress
            FROM nanhua_bad_debt_provision 
            WHERE period = ?
            ORDER BY id ASC
        `, [period]);

        // 查询自接项目数据
        const [selfBuiltRows] = await pool.execute(`
            SELECT year_beginning_balance, current_period_new_addition, 
                   current_period_accumulated_collection, year_new_addition, collection_progress
            FROM nanhua_bad_debt_provision_self_built 
            WHERE period = ?
        `, [period]);

        // 定义默认数据结构
        const defaultData = {
            items: [
                { customerAttribute: '一包项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0 },
                { customerAttribute: '二包项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0 },
                { customerAttribute: '域内合作项目', yearBeginningBalance: 7.48, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0 },
                { customerAttribute: '域外合作项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0 },
                { customerAttribute: '新能源项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0 },
                { customerAttribute: '苏州项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0 },
                { customerAttribute: '自接项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0 },
                { customerAttribute: '其他', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0 }
            ]
        };

        if (rows.length === 0 && selfBuiltRows.length === 0) {
            // 如果没有数据，返回默认数据
            return res.json({
                success: true,
                data: { items: defaultData.items }
            });
        }

        // 处理数据库数据
        const items = rows.map(row => ({
            customerAttribute: row.customer_attribute,
            yearBeginningBalance: parseFloat(row.year_beginning_balance) || 0,
            currentPeriodNewAddition: parseFloat(row.current_period_new_addition) || 0,
            currentPeriodAccumulatedCollection: parseFloat(row.current_period_accumulated_collection) || 0,
            yearNewAddition: parseFloat(row.year_new_addition) || 0,
            collectionProgress: parseFloat(row.collection_progress) || 0
        }));

        // 确保所有默认项目都存在
        const mergedItems = [...defaultData.items];
        
        // 用数据库数据覆盖默认数据
        items.forEach(dbItem => {
            const index = mergedItems.findIndex(item => item.customerAttribute === dbItem.customerAttribute);
            if (index !== -1) {
                mergedItems[index] = dbItem;
            }
        });

        // 如果有自接项目数据（从旧的selfBuiltProject表），合并到"自接项目"项中
        if (selfBuiltRows.length > 0) {
            const selfBuiltIndex = mergedItems.findIndex(item => item.customerAttribute === '自接项目');
            if (selfBuiltIndex !== -1) {
                mergedItems[selfBuiltIndex] = {
                    customerAttribute: '自接项目',
                    yearBeginningBalance: parseFloat(selfBuiltRows[0].year_beginning_balance) || 0,
                    currentPeriodNewAddition: parseFloat(selfBuiltRows[0].current_period_new_addition) || 0,
                    currentPeriodAccumulatedCollection: parseFloat(selfBuiltRows[0].current_period_accumulated_collection) || 0,
                    yearNewAddition: parseFloat(selfBuiltRows[0].year_new_addition) || 0,
                    collectionProgress: parseFloat(selfBuiltRows[0].collection_progress) || 0
                };
            }
        }

        res.json({
            success: true,
            data: { items: mergedItems }
        });
    } catch (error) {
        console.error('获取坏账准备数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存坏账准备数据
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
            await connection.execute('DELETE FROM nanhua_bad_debt_provision WHERE period = ?', [period]);
            await connection.execute('DELETE FROM nanhua_bad_debt_provision_self_built WHERE period = ?', [period]);
            
            // 插入新数据
            for (const item of data.items) {
                await connection.execute(`
                    INSERT INTO nanhua_bad_debt_provision 
                    (period, customer_attribute, year_beginning_balance, current_period_new_addition, 
                     current_period_accumulated_collection, year_new_addition, collection_progress)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    period,
                    item.customerAttribute,
                    item.yearBeginningBalance || 0,
                    item.currentPeriodNewAddition || 0,
                    item.currentPeriodAccumulatedCollection || 0,
                    item.yearNewAddition || 0,
                    item.collectionProgress || 0
                ]);
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
        console.error('保存坏账准备数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router;