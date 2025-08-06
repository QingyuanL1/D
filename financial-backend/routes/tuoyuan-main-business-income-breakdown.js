const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取拓源业务收入分解情况数据（改为计算值）
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        // 验证期间格式 (YYYY-MM)
        if (!/^\d{4}-\d{2}$/.test(period)) {
            return res.status(400).json({ error: '期间格式错误，应为 YYYY-MM' });
        }

        const [year, month] = period.split('-');
        
        // 定义默认数据结构
        const defaultData = {
            items: [
                { segmentAttribute: '设备', customerAttribute: '电业项目', annualPlan: 6017.70, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '用户项目', annualPlan: 0.00, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '贸易', annualPlan: 707.96, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理设备', annualPlan: 2654.87, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 },
                { segmentAttribute: '其他', customerAttribute: '代理工程', annualPlan: 0.00, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 },
                { segmentAttribute: '其他', customerAttribute: '代理设计', annualPlan: 73.58, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 }
            ]
        };

        // 计算当期收入 = 当年订单转收入 + 存量订单转收入
        try {
            // 1. 获取当年订单转收入数据
            const [orderToIncomeRows] = await pool.execute(
                'SELECT * FROM tuoyuan_order_to_income WHERE period = ?',
                [period]
            );

            // 2. 获取存量订单转收入数据
            const [stockOrderRows] = await pool.execute(
                'SELECT * FROM tuoyuan_stock_order_to_income WHERE period = ?',
                [period]
            );

            // 合并当年订单和存量订单的当期收入
            defaultData.items.forEach(item => {
                let currentPeriodIncome = 0;

                // 查找当年订单转收入
                const orderItem = orderToIncomeRows.find(row => 
                    row.segment_attribute === item.segmentAttribute && 
                    row.customer_attribute === item.customerAttribute
                );
                if (orderItem) {
                    currentPeriodIncome += parseFloat(orderItem.current_period_income) || 0;
                }

                // 查找存量订单转收入
                const stockItem = stockOrderRows.find(row => 
                    row.segment_attribute === item.segmentAttribute && 
                    row.customer_attribute === item.customerAttribute
                );
                if (stockItem) {
                    currentPeriodIncome += parseFloat(stockItem.current_period_income) || 0;
                }

                item.currentPeriod = currentPeriodIncome;
            });

            // 3. 计算累计收入（从年初到当前月份）
            for (let m = 1; m <= parseInt(month); m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;
                
                // 获取当月的当年订单转收入数据
                const [monthOrderRows] = await pool.execute(
                    'SELECT * FROM tuoyuan_order_to_income WHERE period = ?',
                    [monthPeriod]
                );
                
                // 获取当月的存量订单转收入数据
                const [monthStockRows] = await pool.execute(
                    'SELECT * FROM tuoyuan_stock_order_to_income WHERE period = ?',
                    [monthPeriod]
                );

                defaultData.items.forEach(item => {
                    let monthIncome = 0;

                    // 累计当年订单转收入
                    const monthOrderItem = monthOrderRows.find(row => 
                        row.segment_attribute === item.segmentAttribute && 
                        row.customer_attribute === item.customerAttribute
                    );
                    if (monthOrderItem) {
                        monthIncome += parseFloat(monthOrderItem.current_period_income) || 0;
                    }

                    // 累计存量订单转收入
                    const monthStockItem = monthStockRows.find(row => 
                        row.segment_attribute === item.segmentAttribute && 
                        row.customer_attribute === item.customerAttribute
                    );
                    if (monthStockItem) {
                        monthIncome += parseFloat(monthStockItem.current_period_income) || 0;
                    }

                    item.currentCumulative += monthIncome;
                });
            }

            // 4. 计算执行进度
            defaultData.items.forEach(item => {
                if (item.annualPlan && item.annualPlan > 0) {
                    item.executionProgress = (item.currentCumulative / item.annualPlan) * 100;
                } else {
                    item.executionProgress = 0;
                }
            });

        } catch (error) {
            console.error('计算订单转收入数据失败:', error);
        }

        // 同时获取当年订单转收入和存量订单转收入的详细数据
        let orderToIncomeData = null;
        let stockOrderData = null;

        try {
            const [orderResponse] = await pool.execute(
                'SELECT * FROM tuoyuan_order_to_income WHERE period = ? ORDER BY id ASC',
                [period]
            );
            
            if (orderResponse.length > 0) {
                orderToIncomeData = {
                    items: orderResponse.map(row => ({
                        segmentAttribute: row.segment_attribute,
                        customerAttribute: row.customer_attribute,
                        annualNewOrderCumulative: parseFloat(row.annual_new_order_cumulative) || 0,
                        currentPeriodIncome: parseFloat(row.current_period_income) || 0,
                        currentPeriodIncomeCumulative: parseFloat(row.current_period_income_cumulative) || 0,
                        orderToIncomeRatio: parseFloat(row.order_to_income_ratio) || 0
                    }))
                };
            }
        } catch (error) {
            console.error('获取当年订单转收入数据失败:', error);
        }

        try {
            const [stockResponse] = await pool.execute(
                'SELECT * FROM tuoyuan_stock_order_to_income WHERE period = ? ORDER BY id ASC',
                [period]
            );
            
            if (stockResponse.length > 0) {
                stockOrderData = {
                    items: stockResponse.map(row => ({
                        segmentAttribute: row.segment_attribute,
                        customerAttribute: row.customer_attribute,
                        initialStockOrderBalance: parseFloat(row.initial_stock_order_balance) || 0,
                        currentPeriodIncome: parseFloat(row.current_period_income) || 0,
                        currentIncomeCumulative: parseFloat(row.current_income_cumulative) || 0,
                        stockOrderIncomeRatio: parseFloat(row.stock_order_income_ratio) || 0
                    }))
                };
            }
        } catch (error) {
            console.error('获取存量订单转收入数据失败:', error);
        }

        res.json({
            success: true,
            data: defaultData,
            orderToIncomeData: orderToIncomeData,
            stockOrderData: stockOrderData,
            period: period,
            calculated: true,
            message: '数据基于当年订单转收入和存量订单转收入计算'
        });

    } catch (error) {
        console.error('获取拓源业务收入分解情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存拓源业务收入分解情况数据
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
            await connection.execute('DELETE FROM tuoyuan_main_business_income_breakdown WHERE period = ?', [period]);
            
            // 插入新数据
            for (const item of data.items) {
                await connection.execute(`
                    INSERT INTO tuoyuan_main_business_income_breakdown 
                    (period, segment_attribute, customer_attribute, annual_plan, 
                     current_period, current_cumulative, execution_progress)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    period,
                    item.segmentAttribute,
                    item.customerAttribute,
                    item.annualPlan || 0,
                    item.currentPeriod || 0,
                    item.currentCumulative || 0,
                    item.executionProgress || 0
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
        console.error('保存拓源业务收入分解情况数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

module.exports = router;