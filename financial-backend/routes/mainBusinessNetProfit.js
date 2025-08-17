const express = require('express');
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');
const router = express.Router();

// 获取主营业务净利润贡献情况数据
router.get('/:period', createBudgetMiddleware('main_business_net_profit_contribution'), async (req, res) => {
    const { period } = req.params;
    
    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }
    
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM main_business_net_profit WHERE period = ? ORDER BY created_at DESC LIMIT 1',
            [period]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: '未找到指定期间的数据' });
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

// 保存主营业务净利润贡献情况数据
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
            'SELECT id FROM main_business_net_profit WHERE period = ?',
            [period]
        );
        
        if (existingRows.length > 0) {
            // 更新现有数据
            await pool.execute(
                'UPDATE main_business_net_profit SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE period = ?',
                [JSON.stringify(data), period]
            );
        } else {
            // 插入新数据
            await pool.execute(
                'INSERT INTO main_business_net_profit (period, data) VALUES (?, ?)',
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
            'DELETE FROM main_business_net_profit WHERE period = ?',
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
            'SELECT period, created_at, updated_at FROM main_business_net_profit ORDER BY period DESC'
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

// 为前端组件提供当月值和累计值的接口
router.get('/monthly-data/:period', async (req, res) => {
    const { period } = req.params;

    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }

    try {
        console.log(`开始计算主营业务净利润月度数据，期间: ${period}`);

        const [year, month] = period.split('-');
        const currentMonth = parseInt(month);

        // 计算当月值（使用当前期间）
        const currentMonthData = await calculatePeriodData(period);

        // 计算累计值（从1月到当前月）
        const cumulativeData = {
            equipment: [],
            components: [],
            engineering: []
        };

        // 获取从1月到当前月的所有数据并累计
        for (let m = 1; m <= currentMonth; m++) {
            const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;
            const monthData = await calculatePeriodData(monthPeriod);

            // 累计设备数据
            monthData.equipment.forEach(item => {
                let existingItem = cumulativeData.equipment.find(c => c.customer === item.customer);
                if (!existingItem) {
                    existingItem = {
                        customer: item.customer,
                        yearlyPlan: item.yearlyPlan,
                        currentMonthValue: 0,
                        cumulativeValue: 0,
                        progress: item.progress
                    };
                    cumulativeData.equipment.push(existingItem);
                }
                existingItem.cumulativeValue += item.currentAmount;
                // 如果是当前月，设置当月值
                if (m === currentMonth) {
                    existingItem.currentMonthValue = item.currentAmount;
                }
            });

            // 累计元件数据
            monthData.components.forEach(item => {
                let existingItem = cumulativeData.components.find(c => c.customer === item.customer);
                if (!existingItem) {
                    existingItem = {
                        customer: item.customer,
                        yearlyPlan: item.yearlyPlan,
                        currentMonthValue: 0,
                        cumulativeValue: 0,
                        progress: item.progress
                    };
                    cumulativeData.components.push(existingItem);
                }
                existingItem.cumulativeValue += item.currentAmount;
                if (m === currentMonth) {
                    existingItem.currentMonthValue = item.currentAmount;
                }
            });

            // 累计工程数据
            monthData.engineering.forEach(item => {
                let existingItem = cumulativeData.engineering.find(c => c.customer === item.customer);
                if (!existingItem) {
                    existingItem = {
                        customer: item.customer,
                        yearlyPlan: item.yearlyPlan,
                        currentMonthValue: 0,
                        cumulativeValue: 0,
                        progress: item.progress
                    };
                    cumulativeData.engineering.push(existingItem);
                }
                existingItem.cumulativeValue += item.currentAmount;
                if (m === currentMonth) {
                    existingItem.currentMonthValue = item.currentAmount;
                }
            });
        }

        // 计算贡献占比
        cumulativeData.equipment.forEach(item => {
            if (item.yearlyPlan && item.yearlyPlan > 0) {
                const contribution = (item.cumulativeValue / item.yearlyPlan * 100).toFixed(2);
                item.contribution = `${contribution}%`;
            } else {
                item.contribution = '0.00%';
            }
        });

        cumulativeData.components.forEach(item => {
            if (item.yearlyPlan && item.yearlyPlan > 0) {
                const contribution = (item.cumulativeValue / item.yearlyPlan * 100).toFixed(2);
                item.contribution = `${contribution}%`;
            } else {
                item.contribution = '0.00%';
            }
        });

        cumulativeData.engineering.forEach(item => {
            if (item.yearlyPlan && item.yearlyPlan > 0) {
                const contribution = (item.cumulativeValue / item.yearlyPlan * 100).toFixed(2);
                item.contribution = `${contribution}%`;
            } else {
                item.contribution = '0.00%';
            }
        });

        console.log(`月度数据计算完成，期间: ${period}`);

        res.json({
            success: true,
            data: cumulativeData,
            period: period,
            description: '当月值为当期净利润，累计值为年初至当前月的累计净利润'
        });

    } catch (error) {
        console.error('计算月度数据失败:', error);
        res.status(500).json({ error: '计算失败: ' + error.message });
    }
});

// 计算指定期间的净利润数据（内部函数）
async function calculatePeriodData(period) {
    // 1. 获取主营业务收入数据 (需要转换为日期格式)
    const incomeDate = `${period}-01`;
    const [incomeRows] = await pool.execute(
        'SELECT data FROM main_business_income WHERE period = ?',
        [incomeDate]
    );

    // 2. 获取主营业务成本数据
    const [costRows] = await pool.execute(
        'SELECT category, customer_type, current_material_cost FROM main_business_cost WHERE period = ?',
        [period]
    );

    // 3. 获取成本中心结构数据
    const [centerRows] = await pool.execute(
        'SELECT data FROM cost_center_structure WHERE period = ?',
        [period]
    );

    // 如果没有数据，返回空结果
    if (incomeRows.length === 0 || costRows.length === 0 || centerRows.length === 0) {
        return {
            equipment: [],
            components: [],
            engineering: []
        };
    }

    // 解析数据
    let incomeData = incomeRows[0].data;
    const centerData = centerRows[0].data;

    // 处理不同的数据格式
    if (Array.isArray(incomeData)) {
        // 新格式：数组格式，需要转换为对象格式
        const convertedData = {
            equipment: [],
            components: [],
            engineering: []
        };

        incomeData.forEach(item => {
            const dataItem = {
                customer: item.customer,
                accumulatedIncome: item.accumulatedIncome || 0,
                currentMonthIncome: item.currentMonthIncome || 0,
                progress: item.progress || '0.00%',
                yearlyPlan: item.yearlyPlan || 0
            };

            if (item.segment === '设备') {
                convertedData.equipment.push(dataItem);
            } else if (item.segment === '元件') {
                convertedData.components.push(dataItem);
            } else if (item.segment === '工程') {
                convertedData.engineering.push(dataItem);
            }
        });

        incomeData = convertedData;
    }

    // 构建成本数据映射
    const costMap = {};
    costRows.forEach(row => {
        const key = `${row.category}-${row.customer_type}`;
        costMap[key] = parseFloat(row.current_material_cost) || 0;
    });

    // 计算结果
    const result = {
        equipment: [],
        components: [],
        engineering: []
    };

    // 处理设备板块
    if (incomeData.equipment && Array.isArray(incomeData.equipment)) {
        result.equipment = incomeData.equipment.map(item => {
            const currentMonthIncome = parseFloat(item.currentMonthIncome) || 0; // 使用当月收入而不是累计收入
            const materialCost = costMap[`设备-${item.customer}`] || 0;

            // 从成本中心数据中查找对应的当月收入
            let centerIncome = 0;
            if (centerData.equipmentData && Array.isArray(centerData.equipmentData)) {
                const centerItem = centerData.equipmentData.find(c =>
                    c.customerType === item.customer ||
                    (c.customerType === '其他' && item.customer === '其它') ||
                    (c.customerType === '其它' && item.customer === '其他')
                );
                if (centerItem) {
                    centerIncome = parseFloat(centerItem.currentMonthIncome) || 0; // 使用当月收入
                }
            }

            const currentAmount = currentMonthIncome - materialCost - centerIncome;

            return {
                customer: item.customer,
                yearlyPlan: item.yearlyPlan || 0,
                currentAmount: currentAmount,
                progress: item.progress || '0.00%'
            };
        });
    }

    // 处理元件板块
    if (incomeData.components && Array.isArray(incomeData.components)) {
        result.components = incomeData.components.map(item => {
            const currentMonthIncome = parseFloat(item.currentMonthIncome) || 0;
            const materialCost = costMap[`元件-${item.customer}`] || 0;

            let centerIncome = 0;
            if (centerData.componentData && Array.isArray(centerData.componentData)) {
                const centerItem = centerData.componentData.find(c =>
                    c.customerType === item.customer ||
                    (c.customerType === '其他' && item.customer === '其它') ||
                    (c.customerType === '其它' && item.customer === '其他')
                );
                if (centerItem) {
                    centerIncome = parseFloat(centerItem.currentMonthIncome) || 0;
                }
            }

            const currentAmount = currentMonthIncome - materialCost - centerIncome;

            return {
                customer: item.customer,
                yearlyPlan: item.yearlyPlan || 0,
                currentAmount: currentAmount,
                progress: item.progress || '0.00%'
            };
        });
    }

    // 处理工程板块
    if (incomeData.engineering && Array.isArray(incomeData.engineering)) {
        result.engineering = incomeData.engineering.map(item => {
            const currentMonthIncome = parseFloat(item.currentMonthIncome) || 0;
            const materialCost = costMap[`工程-${item.customer}`] || 0;

            let centerIncome = 0;
            if (centerData.engineeringData && Array.isArray(centerData.engineeringData)) {
                const centerItem = centerData.engineeringData.find(c =>
                    c.customerType === item.customer ||
                    (c.customerType === '其他' && item.customer === '其它') ||
                    (c.customerType === '其它' && item.customer === '其他')
                );
                if (centerItem) {
                    centerIncome = parseFloat(centerItem.currentMonthIncome) || 0;
                }
            }

            const currentAmount = currentMonthIncome - materialCost - centerIncome;

            return {
                customer: item.customer,
                yearlyPlan: item.yearlyPlan || 0,
                currentAmount: currentAmount,
                progress: item.progress || '0.00%'
            };
        });
    }

    return result;
}

// 计算主营业务净利润当期金额的新接口
router.get('/calculate/:period', async (req, res) => {
    const { period } = req.params;

    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }

    try {
        console.log(`开始计算主营业务净利润当期金额，期间: ${period}`);

        // 1. 获取主营业务收入数据 (需要转换为日期格式)
        const incomeDate = `${period}-01`;
        const [incomeRows] = await pool.execute(
            'SELECT data FROM main_business_income WHERE period = ?',
            [incomeDate]
        );

        // 2. 获取主营业务成本数据
        const [costRows] = await pool.execute(
            'SELECT category, customer_type, current_material_cost FROM main_business_cost WHERE period = ?',
            [period]
        );

        // 3. 获取成本中心结构数据
        const [centerRows] = await pool.execute(
            'SELECT data FROM cost_center_structure WHERE period = ?',
            [period]
        );

        // 检查数据是否存在
        if (incomeRows.length === 0) {
            return res.status(404).json({ error: `未找到${period}期间的主营业务收入数据` });
        }
        if (costRows.length === 0) {
            return res.status(404).json({ error: `未找到${period}期间的主营业务成本数据` });
        }
        if (centerRows.length === 0) {
            return res.status(404).json({ error: `未找到${period}期间的成本中心结构数据` });
        }

        // 解析数据
        let incomeData = incomeRows[0].data;
        const centerData = centerRows[0].data;

        // 处理不同的数据格式
        if (Array.isArray(incomeData)) {
            // 新格式：数组格式，需要转换为对象格式
            const convertedData = {
                equipment: [],
                components: [],
                engineering: []
            };

            incomeData.forEach(item => {
                const dataItem = {
                    customer: item.customer,
                    accumulatedIncome: item.accumulatedIncome || 0,
                    currentMonthIncome: item.currentMonthIncome || 0,
                    progress: item.progress || '0.00%',
                    yearlyPlan: item.yearlyPlan || 0
                };

                if (item.segment === '设备') {
                    convertedData.equipment.push(dataItem);
                } else if (item.segment === '元件') {
                    convertedData.components.push(dataItem);
                } else if (item.segment === '工程') {
                    convertedData.engineering.push(dataItem);
                }
            });

            incomeData = convertedData;
        }

        // 构建成本数据映射
        const costMap = {};
        costRows.forEach(row => {
            const key = `${row.category}-${row.customer_type}`;
            costMap[key] = parseFloat(row.current_material_cost) || 0;
        });

        // 计算结果
        const result = {
            equipment: [],
            components: [],
            engineering: []
        };

        // 处理设备板块
        if (incomeData.equipment && Array.isArray(incomeData.equipment)) {
            result.equipment = incomeData.equipment.map(item => {
                const accumulatedIncome = parseFloat(item.accumulatedIncome) || 0;
                const materialCost = costMap[`设备-${item.customer}`] || 0;

                // 从成本中心数据中查找对应的累计收入
                let centerIncome = 0;
                if (centerData.equipmentData && Array.isArray(centerData.equipmentData)) {
                    const centerItem = centerData.equipmentData.find(c =>
                        c.customerType === item.customer ||
                        (c.customerType === '其他' && item.customer === '其它') ||
                        (c.customerType === '其它' && item.customer === '其他')
                    );
                    if (centerItem) {
                        centerIncome = parseFloat(centerItem.cumulativeIncome) || 0;
                    }
                }

                const currentAmount = accumulatedIncome - materialCost - centerIncome;

                return {
                    customer: item.customer,
                    yearlyPlan: item.yearlyPlan || 0,
                    accumulatedIncome: accumulatedIncome,
                    materialCost: materialCost,
                    centerIncome: centerIncome,
                    currentAmount: currentAmount,
                    progress: item.progress || '0.00%'
                };
            });
        }

        // 处理元件板块
        if (incomeData.components && Array.isArray(incomeData.components)) {
            result.components = incomeData.components.map(item => {
                const accumulatedIncome = parseFloat(item.accumulatedIncome) || 0;
                const materialCost = costMap[`元件-${item.customer}`] || 0;

                // 从成本中心数据中查找对应的累计收入
                let centerIncome = 0;
                if (centerData.componentData && Array.isArray(centerData.componentData)) {
                    const centerItem = centerData.componentData.find(c =>
                        c.customerType === item.customer ||
                        (c.customerType === '其他' && item.customer === '其它') ||
                        (c.customerType === '其它' && item.customer === '其他')
                    );
                    if (centerItem) {
                        centerIncome = parseFloat(centerItem.cumulativeIncome) || 0;
                    }
                }

                const currentAmount = accumulatedIncome - materialCost - centerIncome;

                return {
                    customer: item.customer,
                    yearlyPlan: item.yearlyPlan || 0,
                    accumulatedIncome: accumulatedIncome,
                    materialCost: materialCost,
                    centerIncome: centerIncome,
                    currentAmount: currentAmount,
                    progress: item.progress || '0.00%'
                };
            });
        }

        // 处理工程板块
        if (incomeData.engineering && Array.isArray(incomeData.engineering)) {
            result.engineering = incomeData.engineering.map(item => {
                const accumulatedIncome = parseFloat(item.accumulatedIncome) || 0;
                const materialCost = costMap[`工程-${item.customer}`] || 0;

                // 从成本中心数据中查找对应的累计收入
                let centerIncome = 0;
                if (centerData.engineeringData && Array.isArray(centerData.engineeringData)) {
                    const centerItem = centerData.engineeringData.find(c =>
                        c.customerType === item.customer ||
                        (c.customerType === '其他' && item.customer === '其它') ||
                        (c.customerType === '其它' && item.customer === '其他')
                    );
                    if (centerItem) {
                        centerIncome = parseFloat(centerItem.cumulativeIncome) || 0;
                    }
                }

                const currentAmount = accumulatedIncome - materialCost - centerIncome;

                return {
                    customer: item.customer,
                    yearlyPlan: item.yearlyPlan || 0,
                    accumulatedIncome: accumulatedIncome,
                    materialCost: materialCost,
                    centerIncome: centerIncome,
                    currentAmount: currentAmount,
                    progress: item.progress || '0.00%'
                };
            });
        }

        console.log(`计算完成，期间: ${period}`);
        console.log('计算结果:', {
            equipment: result.equipment.length,
            components: result.components.length,
            engineering: result.engineering.length
        });

        res.json({
            success: true,
            data: result,
            period: period,
            calculation: {
                formula: '当期金额 = 累计收入 - 当期材料成本 - 成本中心累计收入',
                description: '基于main_business_income.accumulatedIncome - main_business_cost.current_material_cost - cost_center_structure.cumulativeIncome计算'
            }
        });

    } catch (error) {
        console.error('计算主营业务净利润当期金额失败:', error);
        res.status(500).json({ error: '计算失败: ' + error.message });
    }
});

module.exports = router;