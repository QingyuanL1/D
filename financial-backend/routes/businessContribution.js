const express = require('express');
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');
const router = express.Router();

// 获取主营业务边际贡献率数据
router.get('/:period', createBudgetMiddleware('main_business_contribution_rate_structure'), async (req, res) => {
    const { period } = req.params;
    
    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }
    
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM business_contribution WHERE period = ? ORDER BY created_at DESC LIMIT 1',
            [period]
        );
        
        if (rows.length === 0) {
            // 没有数据时，返回空的数据结构，让中间件填充预算数据
            const defaultData = {
                equipment: {
                    shanghai: { plan: '0%', actual: '0%', difference: '0%' },
                    national: { plan: '0%', actual: '0%', difference: '0%' },
                    jiangsu: { plan: '0%', actual: '0%', difference: '0%' },
                    power: { plan: '0%', actual: '0%', difference: '0%' },
                    siemens: { plan: '0%', actual: '0%', difference: '0%' },
                    peers: { plan: '0%', actual: '0%', difference: '0%' },
                    users: { plan: '0%', actual: '0%', difference: '0%' },
                    others: { plan: '0%', actual: '0%', difference: '0%' }
                },
                components: {
                    users: { plan: '0%', actual: '0%', difference: '0%' }
                },
                engineering: {
                    package1: { plan: '0%', actual: '0%', difference: '0%' },
                    package2: { plan: '0%', actual: '0%', difference: '0%' },
                    domestic: { plan: '0%', actual: '0%', difference: '0%' },
                    international: { plan: '0%', actual: '0%', difference: '0%' },
                    others: { plan: '0%', actual: '0%', difference: '0%' }
                },
                total: { plan: '0%', actual: '0%', difference: '0%' }
            };
            
            return res.json({
                success: true,
                data: defaultData,
                period: period
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

// 保存主营业务边际贡献率数据
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
            'SELECT id FROM business_contribution WHERE period = ?',
            [period]
        );
        
        if (existingRows.length > 0) {
            // 更新现有数据
            await pool.execute(
                'UPDATE business_contribution SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE period = ?',
                [JSON.stringify(data), period]
            );
        } else {
            // 插入新数据
            await pool.execute(
                'INSERT INTO business_contribution (period, data) VALUES (?, ?)',
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
            'DELETE FROM business_contribution WHERE period = ?',
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

// 自动计算边际贡献率
router.post('/calculate/:period', async (req, res) => {
    const { period } = req.params;

    // 验证period格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }

    try {
        console.log(`开始自动计算${period}期间的边际贡献率`);

        // 1. 通过API获取重新计算的主营业务收入数据
        const fetch = require('node-fetch');
        let incomeData = null;
        
        try {
            const incomeApiUrl = `http://47.111.95.19:3000/main-business-income/${period}`;
            const incomeResponse = await fetch(incomeApiUrl);
            if (incomeResponse.ok) {
                const incomeResult = await incomeResponse.json();
                if (incomeResult.success && incomeResult.data) {
                    incomeData = incomeResult.data;
                    console.log('通过API获取的收入数据:', incomeData);
                } else {
                    throw new Error('API返回数据格式错误');
                }
            } else {
                throw new Error('API请求失败');
            }
        } catch (error) {
            console.error('通过API获取收入数据失败，尝试使用数据库数据:', error);
            
            // fallback到数据库数据
            const [incomeRows] = await pool.execute(
                'SELECT data FROM main_business_income WHERE DATE_FORMAT(period, "%Y-%m") = ?',
                [period]
            );

            if (incomeRows.length === 0) {
                return res.status(404).json({
                    error: `未找到${period}期间的主营业务收入数据，请先录入收入数据`
                });
            }
            
            incomeData = typeof incomeRows[0].data === 'string' ? JSON.parse(incomeRows[0].data) : incomeRows[0].data;
            console.log('使用数据库收入数据:', incomeData);
        }

        // 2. 先重新计算成本累计值，然后获取主营业务成本数据
        
        // 2.1 重新计算累计成本
        try {
            console.log('重新计算累计成本...');
            const recalcResponse = await fetch(`http://47.111.95.19:3000/main-business-cost/recalculate-cumulative/${period}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (recalcResponse.ok) {
                const recalcResult = await recalcResponse.json();
                console.log('累计成本重新计算完成:', recalcResult.success);
            } else {
                console.log('累计成本重新计算失败，继续使用现有数据');
            }
        } catch (error) {
            console.log('累计成本重新计算失败:', error.message);
        }
        
        // 2.2 获取重新计算后的成本数据
        const costApiUrl = `http://47.111.95.19:3000/main-business-cost/${period}`;
        let costData = [];
        
        try {
            const costResponse = await fetch(costApiUrl);
            if (costResponse.ok) {
                const costResult = await costResponse.json();
                if (costResult.success && costResult.data) {
                    // 转换API数据格式
                    costData = [];
                    
                    // 处理设备板块成本
                    if (costResult.data.equipment && Array.isArray(costResult.data.equipment)) {
                        costResult.data.equipment.forEach(item => {
                            // cumulativeMaterialCost 已经是累计直接成本，不需要再加人工成本
                            const cumulativeDirectCost = item.cumulativeMaterialCost || 0;
                            costData.push({
                                category: '设备',
                                customer_type: item.customerType,
                                cumulative_material_cost: item.cumulativeMaterialCost || 0,
                                cumulative_labor_cost: item.cumulativeLaborCost || 0,
                                cumulative_direct_cost: cumulativeDirectCost
                            });
                            console.log(`设备-${item.customerType}: 累计直接成本=${cumulativeDirectCost}`);
                        });
                    }
                    
                    // 处理元件板块成本
                    if (costResult.data.component && Array.isArray(costResult.data.component)) {
                        costResult.data.component.forEach(item => {
                            // cumulativeMaterialCost 已经是累计直接成本，不需要再加人工成本
                            const cumulativeDirectCost = item.cumulativeMaterialCost || 0;
                            costData.push({
                                category: '元件',
                                customer_type: item.customerType,
                                cumulative_material_cost: item.cumulativeMaterialCost || 0,
                                cumulative_labor_cost: item.cumulativeLaborCost || 0,
                                cumulative_direct_cost: cumulativeDirectCost
                            });
                            console.log(`元件-${item.customerType}: 累计直接成本=${cumulativeDirectCost}`);
                        });
                    }
                    
                    // 处理工程板块成本
                    if (costResult.data.project && Array.isArray(costResult.data.project)) {
                        costResult.data.project.forEach(item => {
                            // cumulativeMaterialCost 已经是累计直接成本，不需要再加人工成本
                            const cumulativeDirectCost = item.cumulativeMaterialCost || 0;
                            costData.push({
                                category: '工程',
                                customer_type: item.customerType,
                                cumulative_material_cost: item.cumulativeMaterialCost || 0,
                                cumulative_labor_cost: item.cumulativeLaborCost || 0,
                                cumulative_direct_cost: cumulativeDirectCost
                            });
                            console.log(`工程-${item.customerType}: 累计直接成本=${cumulativeDirectCost}`);
                        });
                    }
                }
            }
        } catch (error) {
            console.error('获取成本数据失败:', error);
        }

        console.log(`找到收入数据，期间格式: ${period}`);
        console.log(`获取成本数据，共${costData.length}项成本记录`);

        console.log('收入数据:', incomeData);
        console.log('成本数据:', costData);

        // 3. 计算边际贡献率
        const calculatedData = calculateContributionRates(incomeData, costData, period);

        // 4. 获取现有数据（保留年度计划）
        const [existingRows] = await pool.execute(
            'SELECT data FROM business_contribution WHERE period = ? ORDER BY created_at DESC LIMIT 1',
            [period]
        );

        let finalData = calculatedData;
        if (existingRows.length > 0) {
            const existingData = typeof existingRows[0].data === 'string' ?
                JSON.parse(existingRows[0].data) : existingRows[0].data;

            // 合并数据，保留现有的plan字段，更新actual和difference字段
            finalData = mergeCalculatedData(existingData, calculatedData);
        } else {
            // 如果没有现有数据，确保总计字段存在并计算偏差
            if (finalData.total) {
                const planValue = parseFloat(finalData.total.plan.replace('%', '')) || 32.00;
                const actualValue = parseFloat(finalData.total.actual.replace('%', '')) || 0;
                finalData.total.difference = (actualValue - planValue).toFixed(2) + '%';
            }
        }

        // 5. 保存计算结果
        if (existingRows.length > 0) {
            await pool.execute(
                'UPDATE business_contribution SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE period = ?',
                [JSON.stringify(finalData), period]
            );
        } else {
            await pool.execute(
                'INSERT INTO business_contribution (period, data) VALUES (?, ?)',
                [period, JSON.stringify(finalData)]
            );
        }

        res.json({
            success: true,
            message: '边际贡献率计算完成',
            data: finalData,
            period
        });

    } catch (error) {
        console.error('自动计算边际贡献率失败:', error);
        res.status(500).json({
            error: '自动计算失败',
            details: error.message
        });
    }
});

// 计算边际贡献率的核心函数
function calculateContributionRates(incomeData, costData, period) {
    const result = {
        equipment: {},
        components: {},
        engineering: {},
        total: { plan: '32.00%', actual: '0%', difference: '0%' }
    };

    console.log(`开始计算${period}期间边际贡献率`);
    console.log('收入数据结构:', JSON.stringify(incomeData, null, 2));
    console.log('成本数据结构:', JSON.stringify(costData, null, 2));

    // 收入数据映射 - 处理主营业务收入数据
    const incomeMap = {};
    let totalIncomeFromData = 0;

    // 检查数据结构：如果是数组，按segment处理；如果是对象，按原逻辑处理
    if (Array.isArray(incomeData)) {
        console.log('收入数据是数组格式，按segment处理');
        incomeData.forEach(item => {
            const segment = item.segment === '设备' ? 'equipment' : 
                           item.segment === '元件' ? 'components' : 'engineering';
            const key = getCustomerKey(item.customer || item.customerType);
            const cumulativeIncome = parseFloat(item.accumulatedIncome) || 0;
            
            incomeMap[`${segment}-${key}`] = {
                income: parseFloat(item.currentMonthIncome) || 0,
                cumulative: cumulativeIncome
            };
            totalIncomeFromData += cumulativeIncome;
            console.log(`${item.segment}-${item.customer}-${key}: 当月收入=${item.currentMonthIncome}, 累计收入=${cumulativeIncome}`);
        });
    } else {
        // 原有的处理逻辑，处理按板块分组的数据结构
        // 处理设备板块收入
        if (incomeData.equipment && Array.isArray(incomeData.equipment)) {
            console.log('设备板块收入数据:', incomeData.equipment);
            incomeData.equipment.forEach(item => {
                const key = getCustomerKey(item.customer || item.customerType);
                const cumulativeIncome = parseFloat(item.accumulatedIncome) || 0;
                incomeMap[`equipment-${key}`] = {
                    income: parseFloat(item.currentMonthIncome) || 0,
                    cumulative: cumulativeIncome
                };
                totalIncomeFromData += cumulativeIncome;
                console.log(`设备-${item.customer}-${key}: 当月收入=${item.currentMonthIncome}, 累计收入=${cumulativeIncome}`);
            });
        } else {
            console.log('没有设备板块收入数据');
        }

        // 处理元件板块收入
        if (incomeData.components && Array.isArray(incomeData.components)) {
            incomeData.components.forEach(item => {
                const key = getCustomerKey(item.customer || item.customerType);
                const cumulativeIncome = parseFloat(item.accumulatedIncome) || 0;
                incomeMap[`components-${key}`] = {
                    income: parseFloat(item.currentMonthIncome) || 0,
                    cumulative: cumulativeIncome
                };
                totalIncomeFromData += cumulativeIncome;
                console.log(`元件-${key}: 当月收入=${item.currentMonthIncome}, 累计收入=${cumulativeIncome}`);
            });
        }

        // 处理工程板块收入
        if (incomeData.engineering && Array.isArray(incomeData.engineering)) {
            incomeData.engineering.forEach(item => {
                const key = getCustomerKey(item.customer || item.customerType);
                const cumulativeIncome = parseFloat(item.accumulatedIncome) || 0;
                incomeMap[`engineering-${key}`] = {
                    income: parseFloat(item.currentMonthIncome) || 0,
                    cumulative: cumulativeIncome
                };
                totalIncomeFromData += cumulativeIncome;
                console.log(`工程-${key}: 当月收入=${item.currentMonthIncome}, 累计收入=${cumulativeIncome}`);
            });
        }
    }

    console.log(`总收入（从收入数据计算）: ${totalIncomeFromData}`);

    // 成本数据映射 - 处理累计成本数据
    const costMap = {};
    let totalCostFromData = 0;

    // 处理累计成本数据（已经按类别和客户类型分组求和）
    if (Array.isArray(costData)) {
        costData.forEach(item => {
            const categoryKey = item.category === '设备' ? 'equipment' :
                               item.category === '元件' ? 'components' : 'engineering';
            const customerKey = getCustomerKey(item.customer_type);
            // 使用 cumulative_material_cost 作为累计直接成本
            const cumulativeCost = parseFloat(item.cumulative_material_cost) || 0;
            
            costMap[`${categoryKey}-${customerKey}`] = {
                cost: parseFloat(item.cumulative_material_cost) || 0,
                cumulative: cumulativeCost
            };
            totalCostFromData += cumulativeCost;
            console.log(`${categoryKey}-${customerKey}: 累计直接成本=${cumulativeCost}`);
        });
    }

    console.log(`总成本（从成本数据计算）: ${totalCostFromData}`);
    console.log('收入映射表:', incomeMap);
    console.log('成本映射表:', costMap);

    // 计算各板块的边际贡献率
    const segments = ['equipment', 'components', 'engineering'];
    const customerKeys = {
        equipment: ['shanghai', 'national', 'jiangsu', 'power', 'siemens', 'peers', 'users', 'others'],
        components: ['users'],
        engineering: ['package1', 'package2', 'domestic', 'international', 'others']
    };

    let totalIncome = 0;
    let totalCost = 0;

    segments.forEach(segment => {
        result[segment] = {};
        let segmentIncome = 0;
        let segmentCost = 0;
        
        customerKeys[segment].forEach(customerKey => {
            const mapKey = `${segment}-${customerKey}`;
            const incomeItem = incomeMap[mapKey];
            const costItem = costMap[mapKey];

            const income = incomeItem?.cumulative || 0;
            const cost = costItem?.cumulative || 0;

            segmentIncome += income;
            segmentCost += cost;
            totalIncome += income;
            totalCost += cost;

            // 计算边际贡献率：(收入 - 成本) / 收入 * 100
            let contributionRate = 0;
            if (income > 0) {
                contributionRate = ((income - cost) / income) * 100;
            }

            result[segment][customerKey] = {
                plan: '0%', // 保持默认值，后续会被合并
                actual: income > 0 ? contributionRate.toFixed(2) + '%' : (income === 0 && cost === 0 ? '0%' : '/'),
                difference: '0%' // 将在合并时计算
            };

            console.log(`${segment}-${customerKey}: 收入=${income}, 成本=${cost}, 贡献率=${contributionRate.toFixed(2)}%`);
        });
        
        console.log(`${segment}板块汇总: 收入=${segmentIncome}, 成本=${segmentCost}, 边际贡献=${segmentIncome - segmentCost}`);
    });

    // 计算总体边际贡献率
    console.log(`计算总体边际贡献率: 总收入=${totalIncome}, 总成本=${totalCost}`);
    
    if (totalIncome > 0) {
        const marginContribution = totalIncome - totalCost;
        const totalContributionRate = (marginContribution / totalIncome) * 100;
        
        console.log(`总体边际贡献率计算结果: 边际贡献=${marginContribution}, 贡献率=${totalContributionRate.toFixed(2)}%`);
        
        result.total.actual = totalContributionRate.toFixed(2) + '%';
    } else {
        console.log('总收入为0，无法计算总体边际贡献率');
        result.total.actual = '0%';
    }

    console.log('最终计算结果:', JSON.stringify(result, null, 2));
    return result;
}

// 合并计算数据和现有数据
function mergeCalculatedData(existingData, calculatedData) {
    const merged = JSON.parse(JSON.stringify(existingData));

    // 合并各板块数据
    Object.keys(calculatedData).forEach(segment => {
        if (segment === 'total') {
            // 更新总计的actual字段
            if (merged.total) {
                merged.total.actual = calculatedData.total.actual;
                // 计算偏差
                const planValue = parseFloat(merged.total.plan.replace('%', '')) || 0;
                const actualValue = parseFloat(calculatedData.total.actual.replace('%', '')) || 0;
                merged.total.difference = (actualValue - planValue).toFixed(2) + '%';
            } else {
                // 如果merged中没有total字段，创建一个
                merged.total = {
                    plan: '32.00%',
                    actual: calculatedData.total.actual,
                    difference: '0%'
                };
                const planValue = 32.00;
                const actualValue = parseFloat(calculatedData.total.actual.replace('%', '')) || 0;
                merged.total.difference = (actualValue - planValue).toFixed(2) + '%';
            }
        } else if (merged[segment] && calculatedData[segment]) {
            // 更新各客户的actual字段
            Object.keys(calculatedData[segment]).forEach(customerKey => {
                if (merged[segment][customerKey]) {
                    merged[segment][customerKey].actual = calculatedData[segment][customerKey].actual;

                    // 计算偏差
                    const planStr = merged[segment][customerKey].plan;
                    if (planStr !== '/') {
                        const planValue = parseFloat(planStr.replace('%', '')) || 0;
                        const actualValue = parseFloat(calculatedData[segment][customerKey].actual.replace('%', '')) || 0;
                        merged[segment][customerKey].difference = (actualValue - planValue).toFixed(2) + '%';
                    } else {
                        merged[segment][customerKey].difference = '/';
                    }
                } else {
                    // 如果merged中没有这个客户，创建一个
                    merged[segment][customerKey] = {
                        plan: '0%',
                        actual: calculatedData[segment][customerKey].actual,
                        difference: calculatedData[segment][customerKey].actual
                    };
                }
            });
        } else if (calculatedData[segment]) {
            // 如果merged中没有这个板块，创建一个
            merged[segment] = calculatedData[segment];
        }
    });

    return merged;
}

// 客户类型映射函数
function getCustomerKey(customerType) {
    // 先去除空格和特殊字符
    const cleanCustomerType = customerType ? customerType.trim() : '';
    
    const mapping = {
        '上海': 'shanghai',
        '国网': 'national',
        '江苏': 'jiangsu',
        '输配电内配': 'power',
        '西门子': 'siemens',
        '同业': 'peers',
        '用户': 'users',
        '其它': 'others',
        '一包': 'package1',
        '二包': 'package2',
        '域内合作': 'domestic',
        '域外合作': 'international'
    };

    return mapping[cleanCustomerType] || 'others';
}

// 获取所有期间列表
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT period, created_at, updated_at FROM business_contribution ORDER BY period DESC'
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

// 调试端点：检查边际贡献率计算的原始数据
router.get('/debug/:period', async (req, res) => {
    const { period } = req.params;

    // 验证period格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }

    try {
        console.log(`调试${period}期间的边际贡献率数据`);

        // 1. 获取主营业务收入数据
        const [incomeRows] = await pool.execute(
            'SELECT data FROM main_business_income WHERE DATE_FORMAT(period, "%Y-%m") = ?',
            [period]
        );

        // 2. 获取累计主营业务成本数据
        const year = period.split('-')[0];
        const [costRows] = await pool.execute(`
            SELECT 
                category, 
                customer_type, 
                SUM(current_material_cost) as cumulative_material_cost,
                SUM(current_material_cost) as cumulative_direct_cost
            FROM main_business_cost 
            WHERE period <= ? AND SUBSTRING(period, 1, 4) = ?
            GROUP BY category, customer_type
            ORDER BY category, customer_type
        `, [period, year]);

        // 3. 获取已存在的边际贡献率数据
        const [contributionRows] = await pool.execute(
            'SELECT data FROM business_contribution WHERE period = ? ORDER BY created_at DESC LIMIT 1',
            [period]
        );

        const debugInfo = {
            period,
            hasIncomeData: incomeRows.length > 0,
            hasCostData: costRows.length > 0,
            hasContributionData: contributionRows.length > 0,
            incomeData: incomeRows.length > 0 ? 
                (typeof incomeRows[0].data === 'string' ? JSON.parse(incomeRows[0].data) : incomeRows[0].data) : null,
            costData: costRows,
            contributionData: contributionRows.length > 0 ? 
                (typeof contributionRows[0].data === 'string' ? JSON.parse(contributionRows[0].data) : contributionRows[0].data) : null
        };

        // 4. 如果有收入和成本数据，进行计算测试
        if (incomeRows.length > 0 && costRows.length > 0) {
            const incomeData = typeof incomeRows[0].data === 'string' ?
                JSON.parse(incomeRows[0].data) : incomeRows[0].data;
            
            const testCalculation = calculateContributionRates(incomeData, costRows, period);
            debugInfo.testCalculation = testCalculation;
        }

        res.json({
            success: true,
            data: debugInfo
        });

    } catch (error) {
        console.error('调试边际贡献率数据失败:', error);
        res.status(500).json({
            error: '调试失败',
            details: error.message
        });
    }
});

module.exports = router;