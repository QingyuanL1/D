const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { attachNewOrdersBudget } = require('../middleware/budgetMiddleware');

// 计算累计收入的辅助函数
async function calculateCumulativeTotal(category, customer, currentPeriod, targetPeriod) {
    try {
        // 获取目标期间之前所有期间的当月收入
        // 注意：这里需要排除当前正在处理的期间，避免重复计算
        const [rows] = await pool.execute(`
            SELECT SUM(current_period) as total_before
            FROM new_orders
            WHERE category = ? AND customer = ? AND period < ?
        `, [category, customer, targetPeriod]);

        const totalBefore = parseFloat(rows[0]?.total_before || 0);
        const result = totalBefore + parseFloat(currentPeriod || 0);

        console.log(`计算累计值 - 客户: ${customer}, 类别: ${category}, 期间: ${targetPeriod}`);
        console.log(`历史累计: ${totalBefore}, 当期: ${currentPeriod}, 总累计: ${result}`);

        return result;
    } catch (error) {
        console.error('计算累计收入失败:', error);
        return parseFloat(currentPeriod || 0);
    }
}

// 计算到指定期间为止的累计收入（包括指定期间）
async function calculateCumulativeTotalUpTo(category, customer, targetPeriod) {
    try {
        const [rows] = await pool.execute(`
            SELECT SUM(current_period) as total_cumulative
            FROM new_orders
            WHERE category = ? AND customer = ? AND period <= ?
        `, [category, customer, targetPeriod]);

        return parseFloat(rows[0]?.total_cumulative || 0);
    } catch (error) {
        console.error('计算累计收入失败:', error);
        return 0;
    }
}

// 创建默认结构并计算累计收入
async function createDefaultStructureWithCumulative(targetPeriod) {
    // 默认的表格结构
    const defaultStructure = {
        equipment: [
            { customer: '上海项目', yearlyPlan: 30000.00 },
            { customer: '国网项目', yearlyPlan: 8000.00 },
            { customer: '江苏项目', yearlyPlan: 5000.00 },
            { customer: '输配电内配', yearlyPlan: 4000.00 },
            { customer: '西门子项目', yearlyPlan: 5000.00 },
            { customer: '同业项目', yearlyPlan: 5000.00 },
            { customer: '用户项目', yearlyPlan: 5000.00 },
            { customer: '其它项目', yearlyPlan: 0.00 }
        ],
        components: [
            { customer: '用户项目', yearlyPlan: 4000.00 },
            { customer: '一包项目', yearlyPlan: 3900.00 },
            { customer: '二包项目', yearlyPlan: 2200.00 }
        ],
        engineering: [
            { customer: '域内合作项目', yearlyPlan: 5000.00 },
            { customer: '域外合作项目', yearlyPlan: 1000.00 },
            { customer: '其它项目', yearlyPlan: 1900.00 }
        ]
    };

    // 为每个项目计算累计收入
    for (const item of defaultStructure.equipment) {
        item.currentPeriod = 0;
        item.cumulativeTotal = await calculateCumulativeTotalUpTo('设备', item.customer, targetPeriod);
        item.progress = 0;
    }

    for (const item of defaultStructure.components) {
        item.currentPeriod = 0;
        item.cumulativeTotal = await calculateCumulativeTotalUpTo('元件', item.customer, targetPeriod);
        item.progress = 0;
    }

    for (const item of defaultStructure.engineering) {
        item.currentPeriod = 0;
        item.cumulativeTotal = await calculateCumulativeTotalUpTo('工程', item.customer, targetPeriod);
        item.progress = 0;
    }

    return defaultStructure;
}

// 获取新签订单数据
router.get('/:period', attachNewOrdersBudget, async (req, res) => {
    try {
        const { period } = req.params;
        
        const query = `
            SELECT category, customer, yearly_plan, current_period, cumulative_total, progress
            FROM new_orders
            WHERE period = ?
            ORDER BY
                CASE category
                    WHEN '设备' THEN 1
                    WHEN '元件' THEN 2
                    WHEN '工程' THEN 3
                END,
                id
        `;
        
        const [rows] = await pool.execute(query, [period]);

        // 如果没有当前期间的数据，创建默认结构并计算累计收入
        if (rows.length === 0) {
            const defaultStructure = await createDefaultStructureWithCumulative(period);
            return res.json({
                success: true,
                data: defaultStructure,
                period: period
            });
        }
        
        // 按类别分组数据
        const data = {
            equipment: rows.filter(row => row.category === '设备').map(row => ({
                customer: row.customer,
                yearlyPlan: parseFloat(row.yearly_plan),
                currentPeriod: parseFloat(row.current_period),
                cumulativeTotal: parseFloat(row.cumulative_total),
                progress: parseFloat(row.progress)
            })),
            components: rows.filter(row => row.category === '元件').map(row => ({
                customer: row.customer,
                yearlyPlan: parseFloat(row.yearly_plan),
                currentPeriod: parseFloat(row.current_period),
                cumulativeTotal: parseFloat(row.cumulative_total),
                progress: parseFloat(row.progress)
            })),
            engineering: rows.filter(row => row.category === '工程').map(row => ({
                customer: row.customer,
                yearlyPlan: parseFloat(row.yearly_plan),
                currentPeriod: parseFloat(row.current_period),
                cumulativeTotal: parseFloat(row.cumulative_total),
                progress: parseFloat(row.progress)
            }))
        };
        
        res.json({
            success: true,
            data: data,
            period: period
        });
    } catch (error) {
        console.error('获取新签订单数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 保存新签订单数据
router.post('/', async (req, res) => {
    try {
        const { period, data } = req.body;
        
        if (!period || !data) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少必要参数' 
            });
        }
        
        // 删除该期间的现有数据
        await pool.execute('DELETE FROM new_orders WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            for (const item of data.equipment) {
                const cumulativeTotal = await calculateCumulativeTotal('设备', item.customer, item.currentPeriod, period);
                insertData.push([
                    period,
                    '设备',
                    item.customer,
                    item.yearlyPlan || 0,
                    item.currentPeriod || 0,
                    cumulativeTotal,
                    item.progress || 0
                ]);
            }
        }
        
        // 处理元件类数据
        if (data.components) {
            for (const item of data.components) {
                const cumulativeTotal = await calculateCumulativeTotal('元件', item.customer, item.currentPeriod, period);
                insertData.push([
                    period,
                    '元件',
                    item.customer,
                    item.yearlyPlan || 0,
                    item.currentPeriod || 0,
                    cumulativeTotal,
                    item.progress || 0
                ]);
            }
        }
        
        // 处理工程类数据
        if (data.engineering) {
            for (const item of data.engineering) {
                const cumulativeTotal = await calculateCumulativeTotal('工程', item.customer, item.currentPeriod, period);
                insertData.push([
                    period,
                    '工程',
                    item.customer,
                    item.yearlyPlan || 0,
                    item.currentPeriod || 0,
                    cumulativeTotal,
                    item.progress || 0
                ]);
            }
        }
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO new_orders (period, category, customer, yearly_plan, current_period, cumulative_total, progress)
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '新签订单数据保存成功',
            period: period
        });
    } catch (error) {
        console.error('保存新签订单数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 更新新签订单数据
router.put('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        const { data } = req.body;
        
        if (!data) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少数据参数' 
            });
        }
        
        // 删除该期间的现有数据
        await pool.execute('DELETE FROM new_orders WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            for (const item of data.equipment) {
                const cumulativeTotal = await calculateCumulativeTotal('设备', item.customer, item.currentPeriod, period);
                insertData.push([
                    period,
                    '设备',
                    item.customer,
                    item.yearlyPlan || 0,
                    item.currentPeriod || 0,
                    cumulativeTotal,
                    item.progress || 0
                ]);
            }
        }

        // 处理元件类数据
        if (data.components) {
            for (const item of data.components) {
                const cumulativeTotal = await calculateCumulativeTotal('元件', item.customer, item.currentPeriod, period);
                insertData.push([
                    period,
                    '元件',
                    item.customer,
                    item.yearlyPlan || 0,
                    item.currentPeriod || 0,
                    cumulativeTotal,
                    item.progress || 0
                ]);
            }
        }

        // 处理工程类数据
        if (data.engineering) {
            for (const item of data.engineering) {
                const cumulativeTotal = await calculateCumulativeTotal('工程', item.customer, item.currentPeriod, period);
                insertData.push([
                    period,
                    '工程',
                    item.customer,
                    item.yearlyPlan || 0,
                    item.currentPeriod || 0,
                    cumulativeTotal,
                    item.progress || 0
                ]);
            }
        }
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO new_orders (period, category, customer, yearly_plan, current_period, cumulative_total, progress)
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '新签订单数据更新成功',
            period: period
        });
    } catch (error) {
        console.error('更新新签订单数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 删除新签订单数据
router.delete('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        const deleteQuery = 'DELETE FROM new_orders WHERE period = ?';
        const [result] = await pool.execute(deleteQuery, [period]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '未找到指定期间的数据' 
            });
        }
        
        res.json({
            success: true,
            message: '新签订单数据删除成功',
            period: period
        });
    } catch (error) {
        console.error('删除新签订单数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

module.exports = router;