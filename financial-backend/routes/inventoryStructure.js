const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');

// 获取存量结构与质量数据
router.get('/:period', createBudgetMiddleware('inventory_structure_quality'), async (req, res) => {
    try {
        const { period } = req.params;
        
        // 获取中标未履约当期余额
        const bidFulfillmentQuery = `
            SELECT category, customer_type, current_amount as bid_current_amount
            FROM bid_fulfillment 
            WHERE period = ?
        `;
        
        // 获取新签订单已排产未入库的当期执行金额
        const inventoryInProgressQuery = `
            SELECT category, customer_type, current_amount as progress_current_amount
            FROM inventory_in_progress 
            WHERE period = ?
        `;
        
        // 获取库存情况中的当期库存（需要计算累计库存）
        // 首先获取年初余量（静态数据）
        const staticInitialAmounts = {
            '设备': {
                '上海': 1200.50,
                '国网': 2300.75,
                '江苏': 800.25,
                '输配电内配': 150.00,
                '西门子': 0.00,
                '同业': 950.60,
                '用户': 750.40,
                '其它': 200.30
            },
            '元件': {
                '用户': 500.80
            },
            '工程': {
                '一包': 300.20,
                '二包': 150.10,
                '域内合作': 1100.90,
                '域外合作': 650.75,
                '其它': 400.50
            }
        };

        // 获取从年初到当前期间的所有contract_inventory数据来计算累计库存
        const currentYear = period.substring(0, 4);
        const currentMonth = parseInt(period.substring(5, 7));

        const contractInventoryQuery = `
            SELECT category, customer_type, current_amount
            FROM contract_inventory
            WHERE period LIKE ? AND period <= ?
            ORDER BY period
        `;
        
        // 获取存量结构基础数据（年初金额）
        const baseQuery = `
            SELECT category, customer_type, initial_amount
            FROM inventory_structure 
            WHERE period = ?
        `;
        
        const [bidFulfillmentRows] = await pool.execute(bidFulfillmentQuery, [period]);
        const [inventoryInProgressRows] = await pool.execute(inventoryInProgressQuery, [period]);
        const [contractInventoryRows] = await pool.execute(contractInventoryQuery, [`${currentYear}%`, period]);
        const [baseRows] = await pool.execute(baseQuery, [period]);
        
        // 创建数据映射
        const createDataMap = (rows, valueField) => {
            const map = {};
            rows.forEach(row => {
                const key = `${row.category}_${row.customer_type}`;
                map[key] = parseFloat(row[valueField]) || 0;
            });
            return map;
        };

        // 计算累计库存的函数
        const calculateCumulativeInventory = (category, customerType) => {
            // 获取年初余量
            let initialAmount = 0;
            if (staticInitialAmounts[category] && staticInitialAmounts[category][customerType] !== undefined) {
                initialAmount = staticInitialAmounts[category][customerType];
            }

            // 累加所有月份的当期新增
            let totalIncrease = 0;
            contractInventoryRows.forEach(row => {
                if (row.category === category && row.customer_type === customerType) {
                    totalIncrease += parseFloat(row.current_amount) || 0;
                }
            });

            return initialAmount + totalIncrease;
        };

        const bidFulfillmentMap = createDataMap(bidFulfillmentRows, 'bid_current_amount');
        const inventoryInProgressMap = createDataMap(inventoryInProgressRows, 'progress_current_amount');
        const baseMap = createDataMap(baseRows, 'initial_amount');
        
        // 定义客户类型模板
        const customerTypes = {
            equipment: ['上海', '国网', '江苏', '输配电内配', '西门子', '同业', '用户', '其它'],
            component: ['用户'],
            project: ['一包', '二包', '域内合作', '域外合作', '其它']
        };
        
        // 计算当期金额并构造数据
        const calculateData = (category, customerTypeList) => {
            return customerTypeList.map(customerType => {
                const key = `${category}_${customerType}`;
                const bidAmount = bidFulfillmentMap[key] || 0;
                const progressAmount = inventoryInProgressMap[key] || 0;
                const contractAmount = calculateCumulativeInventory(category, customerType);
                const initialAmount = baseMap[key] || 0;

                // 计算当期金额：中标未履约当期余额 + 新签订单已排产未入库的当期执行金额 + 库存情况中的当期库存
                const currentAmount = bidAmount + progressAmount + contractAmount;

                console.log(`计算 ${category}-${customerType}: 中标未履约=${bidAmount}, 在产=${progressAmount}, 库存=${contractAmount}, 总计=${currentAmount}`);

                return {
                    customerType,
                    initialAmount,
                    currentAmount
                };
            });
        };
        
        const data = {
            equipment: calculateData('设备', customerTypes.equipment),
            component: calculateData('元件', customerTypes.component),
            project: calculateData('工程', customerTypes.project)
        };
        
        res.json({
            success: true,
            data: data,
            period: period
        });
    } catch (error) {
        console.error('获取存量结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 保存存量结构与质量数据
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
        await pool.execute('DELETE FROM inventory_structure WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            data.equipment.forEach(item => {
                insertData.push([
                    period,
                    '设备',
                    item.customerType,
                    item.initialAmount || 0,
                    item.currentAmount || 0
                ]);
            });
        }
        
        // 处理元件类数据
        if (data.component) {
            data.component.forEach(item => {
                insertData.push([
                    period,
                    '元件',
                    item.customerType,
                    item.initialAmount || 0,
                    item.currentAmount || 0
                ]);
            });
        }
        
        // 处理工程类数据
        if (data.project) {
            data.project.forEach(item => {
                insertData.push([
                    period,
                    '工程',
                    item.customerType,
                    item.initialAmount || 0,
                    item.currentAmount || 0
                ]);
            });
        }
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO inventory_structure (period, category, customer_type, initial_amount, current_amount) 
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '存量结构与质量数据保存成功',
            period: period
        });
    } catch (error) {
        console.error('保存存量结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 更新存量结构与质量数据
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
        await pool.execute('DELETE FROM inventory_structure WHERE period = ?', [period]);
        
        // 准备批量插入数据
        const insertData = [];
        
        // 处理设备类数据
        if (data.equipment) {
            data.equipment.forEach(item => {
                insertData.push([
                    period,
                    '设备',
                    item.customerType,
                    item.initialAmount || 0,
                    item.currentAmount || 0
                ]);
            });
        }
        
        // 处理元件类数据
        if (data.component) {
            data.component.forEach(item => {
                insertData.push([
                    period,
                    '元件',
                    item.customerType,
                    item.initialAmount || 0,
                    item.currentAmount || 0
                ]);
            });
        }
        
        // 处理工程类数据
        if (data.project) {
            data.project.forEach(item => {
                insertData.push([
                    period,
                    '工程',
                    item.customerType,
                    item.initialAmount || 0,
                    item.currentAmount || 0
                ]);
            });
        }
        
        if (insertData.length > 0) {
            const placeholders = insertData.map(() => '(?, ?, ?, ?, ?)').join(', ');
            const insertQuery = `
                INSERT INTO inventory_structure (period, category, customer_type, initial_amount, current_amount) 
                VALUES ${placeholders}
            `;
            const flattenedData = insertData.flat();
            await pool.execute(insertQuery, flattenedData);
        }
        
        res.json({
            success: true,
            message: '存量结构与质量数据更新成功',
            period: period
        });
    } catch (error) {
        console.error('更新存量结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 删除存量结构与质量数据
router.delete('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        const deleteQuery = 'DELETE FROM inventory_structure WHERE period = ?';
        const [result] = await pool.execute(deleteQuery, [period]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: '未找到指定期间的数据' 
            });
        }
        
        res.json({
            success: true,
            message: '存量结构与质量数据删除成功',
            period: period
        });
    } catch (error) {
        console.error('删除存量结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

module.exports = router;