const express = require('express');
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');
const router = express.Router();

// 获取主营业务存量订单转收入数据
router.get('/:period', createBudgetMiddleware('stock_order_to_income'), async (req, res) => {
    const { period } = req.params;
    
    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }
    
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM stock_order_to_income WHERE period = ? ORDER BY created_at DESC LIMIT 1',
            [period]
        );
        
        if (rows.length === 0) {
            // 当没有数据时，计算累计转收入并返回基础数据结构
            const defaultData = {
                equipment: [
                    { customer: '上海', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
                    { customer: '国网', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
                    { customer: '江苏', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
                    { customer: '输配电内配', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
                    { customer: '西门子', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
                    { customer: '同业', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
                    { customer: '用户', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
                    { customer: '其它', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 }
                ],
                components: [
                    { customer: '用户', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 }
                ],
                engineering: [
                    { customer: '一包', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
                    { customer: '二包', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
                    { customer: '域内合作', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
                    { customer: '域外合作', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 },
                    { customer: '其它', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0, yearlyPlan: 0 }
                ]
            };

            // 计算累计转收入（从年初到当前月份的前一个月）
            try {
                const currentYear = period.substring(0, 4);
                const currentMonth = parseInt(period.substring(5, 7));

                // 查询从年初到当前月份前一个月的所有数据
                for (let month = 1; month < currentMonth; month++) {
                    const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`;
                    const [monthRows] = await pool.execute(
                        'SELECT data FROM stock_order_to_income WHERE period = ? ORDER BY created_at DESC LIMIT 1',
                        [monthPeriod]
                    );

                    if (monthRows.length > 0) {
                        const monthData = monthRows[0].data;
                        
                        // 累加设备板块数据
                        if (monthData.equipment) {
                            defaultData.equipment.forEach(defaultItem => {
                                const monthItem = monthData.equipment.find(item => item.customer === defaultItem.customer);
                                if (monthItem && monthItem.currentMonthIncome) {
                                    defaultItem.incomeTotal += parseFloat(monthItem.currentMonthIncome) || 0;
                                }
                            });
                        }

                        // 累加元件板块数据
                        if (monthData.components) {
                            defaultData.components.forEach(defaultItem => {
                                const monthItem = monthData.components.find(item => item.customer === defaultItem.customer);
                                if (monthItem && monthItem.currentMonthIncome) {
                                    defaultItem.incomeTotal += parseFloat(monthItem.currentMonthIncome) || 0;
                                }
                            });
                        }

                        // 累加工程板块数据
                        if (monthData.engineering) {
                            defaultData.engineering.forEach(defaultItem => {
                                const monthItem = monthData.engineering.find(item => item.customer === defaultItem.customer);
                                if (monthItem && monthItem.currentMonthIncome) {
                                    defaultItem.incomeTotal += parseFloat(monthItem.currentMonthIncome) || 0;
                                }
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('计算累计转收入失败:', error);
            }
            
            return res.json({
                success: true,
                data: defaultData,
                period: period,
                updated_at: null
            });
        }
        
        res.json({
            success: true,
            data: rows[0].data,
            period: rows[0].period,
            updated_at: rows[0].updated_at
        });
        
    } catch (error) {
        console.error('获取数据失败:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 保存主营业务存量订单转收入数据
router.post('/', async (req, res) => {
    const { period, data } = req.body;
    
    // 验证必填字段
    if (!period || !data) {
        return res.status(400).json({ error: '期间和数据不能为空' });
    }
    
    // 验证period格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }
    
    try {
        // 检查是否已存在该期间的数据
        const [existingRows] = await pool.execute(
            'SELECT id FROM stock_order_to_income WHERE period = ?',
            [period]
        );
        
        if (existingRows.length > 0) {
            // 更新现有数据
            await pool.execute(
                'UPDATE stock_order_to_income SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE period = ?',
                [JSON.stringify(data), period]
            );
        } else {
            // 插入新数据
            await pool.execute(
                'INSERT INTO stock_order_to_income (period, data) VALUES (?, ?)',
                [period, JSON.stringify(data)]
            );
        }
        
        res.json({
            success: true,
            message: '数据保存成功',
            period
        });
        
    } catch (error) {
        console.error('保存数据失败:', error);
        res.status(500).json({ error: '保存数据失败' });
    }
});

// 删除指定期间的数据
router.delete('/:period', async (req, res) => {
    const { period } = req.params;
    
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }
    
    try {
        const [result] = await pool.execute(
            'DELETE FROM stock_order_to_income WHERE period = ?',
            [period]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '未找到指定期间的数据' });
        }
        
        res.json({
            success: true,
            message: '数据删除成功'
        });
        
    } catch (error) {
        console.error('删除数据失败:', error);
        res.status(500).json({ error: '删除数据失败' });
    }
});

// 获取所有期间列表
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT period, created_at, updated_at FROM stock_order_to_income ORDER BY period DESC'
        );
        
        res.json({
            success: true,
            data: rows
        });
        
    } catch (error) {
        console.error('获取期间列表失败:', error);
        res.status(500).json({ error: '获取期间列表失败' });
    }
});

module.exports = router;