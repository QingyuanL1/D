const express = require('express');
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');
const fetch = require('node-fetch');
const router = express.Router();

// 获取主营业务毛利率数据
router.get('/:period', createBudgetMiddleware('main_business_gross_profit_rate_structure'), async (req, res) => {
    const { period } = req.params;
    
    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }
    
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM business_profit_margin WHERE period = ? ORDER BY created_at DESC LIMIT 1',
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

// 保存主营业务毛利率数据
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
            'SELECT id FROM business_profit_margin WHERE period = ?',
            [period]
        );
        
        if (existingRows.length > 0) {
            // 更新现有数据
            await pool.execute(
                'UPDATE business_profit_margin SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE period = ?',
                [JSON.stringify(data), period]
            );
        } else {
            // 插入新数据
            await pool.execute(
                'INSERT INTO business_profit_margin (period, data) VALUES (?, ?)',
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
            'DELETE FROM business_profit_margin WHERE period = ?',
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
            'SELECT period, created_at, updated_at FROM business_profit_margin ORDER BY period DESC'
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

// 计算指定期间的业务利润率数据
router.get('/calculate/:period', async (req, res) => {
    const { period } = req.params;

    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }

    try {
        console.log(`开始计算业务利润率，期间: ${period}`);

        // 1. 获取主营业务收入数据 (需要转换为日期格式)
        const incomeDate = `${period}-01`;
        const [incomeRows] = await pool.execute(
            'SELECT data FROM main_business_income WHERE period = ?',
            [incomeDate]
        );

        // 2. 获取主营业务成本数据（使用API而不是直接查询数据库）
        const costResponse = await fetch(`http://47.111.95.19:3000/main-business-cost/${period}`);
        let costData = null;

        if (costResponse.ok) {
            const costResult = await costResponse.json();
            if (costResult.success) {
                costData = costResult.data;
            }
        }

        if (!costData) {
            return res.status(404).json({ error: `未找到${period}期间的主营业务成本数据` });
        }

        // 检查数据是否存在
        if (incomeRows.length === 0) {
            return res.status(404).json({ error: `未找到${period}期间的主营业务收入数据` });
        }

        let incomeData = typeof incomeRows[0].data === 'string' ? JSON.parse(incomeRows[0].data) : incomeRows[0].data;

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

        console.log('收入数据:', incomeData);
        console.log('成本数据:', costData);

        // 3. 计算各板块的利润率
        const result = {
            equipment: {},
            components: {},
            engineering: {},
            total: { plan: '24.00%', actual: '0%', difference: '0%' }
        };

        // 客户映射关系
        const customerMapping = {
            // 设备板块
            '上海': 'shanghai',
            '国网': 'national',
            '江苏': 'jiangsu',
            '输配电内配': 'power',
            '西门子': 'siemens',
            '同业': 'peers',
            '用户': 'users',
            '其它': 'others'
        };

        const engineeringMapping = {
            '一包': 'package1',
            '二包': 'package2',
            '域内合作': 'domestic',
            '域外合作': 'international',
            '其它': 'others'
        };

        // 计算设备板块利润率
        if (incomeData.equipment) {
            incomeData.equipment.forEach(item => {
                const key = customerMapping[item.customer];
                if (key) {
                    const accumulatedIncome = item.accumulatedIncome || 0;

                    // 查找对应的成本数据
                    const equipmentCosts = costData.equipment ? costData.equipment.filter(cost =>
                        cost.customerType === item.customer
                    ) : [];

                    let totalCost = 0;
                    equipmentCosts.forEach(cost => {
                        // 优先使用累计成本，如果为0则使用当期成本
                        const materialCost = parseFloat(cost.cumulativeMaterialCost || 0) || parseFloat(cost.currentMaterialCost || 0);
                        const laborCost = parseFloat(cost.cumulativeLaborCost || 0) || parseFloat(cost.currentLaborCost || 0);
                        totalCost += materialCost + laborCost;
                    });

                    // 计算利润率：(收入-成本)/收入 * 100%
                    let profitMargin = 0;
                    if (accumulatedIncome > 0) {
                        profitMargin = ((accumulatedIncome - totalCost) / accumulatedIncome) * 100;
                    }

                    result.equipment[key] = {
                        plan: getInitialPlan('equipment', key),
                        actual: profitMargin.toFixed(2) + '%',
                        difference: '0%' // 将在前端计算
                    };
                }
            });
        }

        // 计算元件板块利润率
        if (incomeData.components) {
            incomeData.components.forEach(item => {
                if (item.customer === '用户') {
                    const accumulatedIncome = item.accumulatedIncome || 0;

                    // 从成本数据中查找元件成本
                    const componentCosts = costData.component ? costData.component.filter(cost =>
                        cost.customerType === '用户'
                    ) : [];

                    let totalCost = 0;
                    componentCosts.forEach(cost => {
                        // 优先使用累计成本，如果为0则使用当期成本
                        const materialCost = parseFloat(cost.cumulativeMaterialCost || 0) || parseFloat(cost.currentMaterialCost || 0);
                        const laborCost = parseFloat(cost.cumulativeLaborCost || 0) || parseFloat(cost.currentLaborCost || 0);
                        totalCost += materialCost + laborCost;
                    });

                    let profitMargin = 0;
                    if (accumulatedIncome > 0) {
                        profitMargin = ((accumulatedIncome - totalCost) / accumulatedIncome) * 100;
                    }

                    result.components.users = {
                        plan: '/',
                        actual: profitMargin.toFixed(2) + '%',
                        difference: '/'
                    };
                }
            });
        }

        // 计算工程板块利润率
        if (incomeData.engineering) {
            incomeData.engineering.forEach(item => {
                const key = engineeringMapping[item.customer];
                if (key) {
                    const accumulatedIncome = item.accumulatedIncome || 0;

                    const engineeringCosts = costData.project ? costData.project.filter(cost =>
                        cost.customerType === item.customer
                    ) : [];

                    let totalCost = 0;
                    engineeringCosts.forEach(cost => {
                        // 优先使用累计成本，如果为0则使用当期成本
                        const materialCost = parseFloat(cost.cumulativeMaterialCost || 0) || parseFloat(cost.currentMaterialCost || 0);
                        const laborCost = parseFloat(cost.cumulativeLaborCost || 0) || parseFloat(cost.currentLaborCost || 0);
                        totalCost += materialCost + laborCost;
                    });

                    let profitMargin = 0;
                    if (accumulatedIncome > 0) {
                        profitMargin = ((accumulatedIncome - totalCost) / accumulatedIncome) * 100;
                    }

                    result.engineering[key] = {
                        plan: getInitialPlan('engineering', key),
                        actual: profitMargin.toFixed(2) + '%',
                        difference: '0%' // 将在前端计算
                    };
                }
            });
        }

        // 计算总体利润率
        let totalIncome = 0;
        let totalCost = 0;

        // 汇总所有收入
        if (incomeData.equipment) {
            incomeData.equipment.forEach(item => {
                totalIncome += item.accumulatedIncome || 0;
            });
        }
        if (incomeData.components) {
            incomeData.components.forEach(item => {
                totalIncome += item.accumulatedIncome || 0;
            });
        }
        if (incomeData.engineering) {
            incomeData.engineering.forEach(item => {
                totalIncome += item.accumulatedIncome || 0;
            });
        }

        // 汇总所有成本
        if (costData.equipment) {
            costData.equipment.forEach(cost => {
                const materialCost = parseFloat(cost.cumulativeMaterialCost || 0) || parseFloat(cost.currentMaterialCost || 0);
                const laborCost = parseFloat(cost.cumulativeLaborCost || 0) || parseFloat(cost.currentLaborCost || 0);
                totalCost += materialCost + laborCost;
            });
        }
        if (costData.component) {
            costData.component.forEach(cost => {
                const materialCost = parseFloat(cost.cumulativeMaterialCost || 0) || parseFloat(cost.currentMaterialCost || 0);
                const laborCost = parseFloat(cost.cumulativeLaborCost || 0) || parseFloat(cost.currentLaborCost || 0);
                totalCost += materialCost + laborCost;
            });
        }
        if (costData.project) {
            costData.project.forEach(cost => {
                const materialCost = parseFloat(cost.cumulativeMaterialCost || 0) || parseFloat(cost.currentMaterialCost || 0);
                const laborCost = parseFloat(cost.cumulativeLaborCost || 0) || parseFloat(cost.currentLaborCost || 0);
                totalCost += materialCost + laborCost;
            });
        }

        // 计算总体利润率
        let totalProfitMargin = 0;
        if (totalIncome > 0) {
            totalProfitMargin = ((totalIncome - totalCost) / totalIncome) * 100;
        }

        result.total.actual = totalProfitMargin.toFixed(2) + '%';

        console.log('计算结果:', result);

        res.json({
            success: true,
            data: result,
            period: period,
            calculation: {
                formula: '利润率 = (累计收入 - 累计成本) / 累计收入 * 100%',
                description: '基于main_business_income.accumulatedIncome和main_business_cost(cumulative_material_cost + cumulative_labor_cost)计算',
                totalIncome: totalIncome,
                totalCost: totalCost
            }
        });

    } catch (error) {
        console.error('计算业务利润率失败:', error);
        console.error('错误堆栈:', error.stack);
        res.status(500).json({ error: '计算失败', details: error.message });
    }
});

// 获取初始计划值的辅助函数
function getInitialPlan(segment, key) {
    const plans = {
        equipment: {
            shanghai: '21.99%',
            national: '13.83%',
            jiangsu: '8.00%',
            power: '/',
            siemens: '/',
            peers: '22.43%',
            users: '11.68%',
            others: '/'
        },
        components: {
            users: '/'
        },
        engineering: {
            package1: '26.00%',
            package2: '15.00%',
            domestic: '8.00%',
            international: '6.00%',
            others: '15.00%'
        }
    };

    return plans[segment] && plans[segment][key] ? plans[segment][key] : '/';
}

module.exports = router;