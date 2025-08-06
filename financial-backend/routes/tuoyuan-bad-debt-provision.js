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
        
        // 如果没有数据，返回默认数据
        if (results.length === 0) {
            return res.json({
                success: true,
                data: defaultData
            });
        }

        const items = results.map(row => ({
            id: row.id,
            segmentAttribute: row.segment_attribute,
            customerAttribute: row.customer_attribute,
            yearBeginningBalance: parseFloat(row.year_beginning_balance || 0),
            yearNewIncrease: parseFloat(row.year_new_increase || 0),
            currentCollected: parseFloat(row.current_collected || 0),
            cumulativeCollected: parseFloat(row.cumulative_collected || 0),
            provisionBalance: parseFloat(row.provision_balance || 0)
        }));

        res.json({
            success: true,
            data: { items }
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

// 简化版：本年新增现在直接从数据库读取，不需要复杂计算
// 如果需要自动计算，可以根据业务需求从其他相关表获取

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