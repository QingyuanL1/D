const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const fetch = require('node-fetch');

// 获取数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        console.log(`获取拓源公司主营业务边际贡献率数据，期间: ${period}`);
        
        const query = `
            SELECT 
                id,
                period,
                segment_attribute,
                customer_attribute,
                yearly_plan,
                current_actual,
                deviation,
                created_at,
                updated_at
            FROM tuoyuan_main_business_contribution_rate 
            WHERE period = ?
            ORDER BY id ASC
        `;
        
        const [results] = await pool.execute(query, [period]);
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: '未找到数据'
            });
        }

        const items = results.map(row => ({
            id: row.id,
            segmentAttribute: row.segment_attribute,
            customerAttribute: row.customer_attribute,
            yearlyPlan: parseFloat(row.yearly_plan || 0),
            currentActual: parseFloat(row.current_actual || 0),
            deviation: parseFloat(row.deviation || 0)
        }));

        // 计算合计数据
        const totalData = calculateTotalData(items);

        // 获取实际的收入和成本数据用于加权计算
        let weightedData = null;
        try {
            const [incomeRows] = await pool.execute(`
                SELECT 
                    segment_attribute,
                    customer_attribute,
                    current_cumulative as cumulative_income
                FROM tuoyuan_main_business_income_breakdown 
                WHERE period = ?
            `, [period]);

            const [year, month] = period.split('-');
            const targetYear = parseInt(year);
            const targetMonth = parseInt(month);
            
            const [costRows] = await pool.execute(`
                SELECT 
                    category,
                    customer_type,
                    SUM(current_material_cost + current_labor_cost) as cumulative_direct_cost
                FROM tuoyuan_main_business_cost_structure_quality 
                WHERE SUBSTRING(period, 1, 4) = ? 
                AND CAST(SUBSTRING(period, 6, 2) AS UNSIGNED) <= ?
                GROUP BY category, customer_type
            `, [targetYear, targetMonth]);

            console.log(`找到${incomeRows.length}条收入数据，${costRows.length}条成本数据`);
            
            // 计算加权平均贡献率
            weightedData = calculateWeightedContributionRate(incomeRows, costRows);
        } catch (error) {
            console.error('获取加权数据失败:', error);
            weightedData = {
                totalIncome: 0,
                totalCost: 0,
                weightedContributionRate: 0,
                marginContribution: 0
            };
        }

        res.json({
            success: true,
            data: {
                period: period,
                items: items,
                total: totalData,
                weighted: weightedData
            }
        });

    } catch (error) {
        console.error('获取拓源公司主营业务边际贡献率数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取数据失败',
            error: error.message
        });
    }
});

// 保存数据
router.post('/', async (req, res) => {
    try {
        const { period, data } = req.body;
        console.log(`保存拓源公司主营业务边际贡献率数据，期间: ${period}`);
        
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
                'DELETE FROM tuoyuan_main_business_contribution_rate WHERE period = ?',
                [period]
            );

            // 插入新数据
            const insertQuery = `
                INSERT INTO tuoyuan_main_business_contribution_rate 
                (period, segment_attribute, customer_attribute, yearly_plan, current_actual, deviation, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;

            for (const item of data.items) {
                await connection.execute(insertQuery, [
                    period,
                    item.segmentAttribute,
                    item.customerAttribute,
                    item.yearlyPlan || 0,
                    item.currentActual || 0,
                    item.deviation || 0
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
        console.error('保存拓源公司主营业务边际贡献率数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

// 自动计算拓源公司边际贡献率
router.post('/calculate/:period', async (req, res) => {
    try {
        const { period } = req.params;
        console.log(`开始自动计算拓源公司${period}期间的边际贡献率`);

        // 1. 获取拓源收入数据
        const [incomeRows] = await pool.execute(`
            SELECT 
                segment_attribute,
                customer_attribute,
                current_cumulative as cumulative_income
            FROM tuoyuan_main_business_income_breakdown 
            WHERE period = ?
        `, [period]);

        // 2. 获取拓源成本数据（材料成本 + 人工成本）
        const [year, month] = period.split('-');
        const targetYear = parseInt(year);
        const targetMonth = parseInt(month);
        
        // 计算累计成本（从年初到当前月份）
        const [costRows] = await pool.execute(`
            SELECT 
                category,
                customer_type,
                SUM(current_material_cost) as cumulative_material_cost,
                SUM(current_labor_cost) as cumulative_labor_cost,
                SUM(current_material_cost + current_labor_cost) as cumulative_direct_cost
            FROM tuoyuan_main_business_cost_structure_quality 
            WHERE SUBSTRING(period, 1, 4) = ? 
            AND CAST(SUBSTRING(period, 6, 2) AS UNSIGNED) <= ?
            GROUP BY category, customer_type
        `, [targetYear, targetMonth]);

        console.log(`获取到${incomeRows.length}条收入数据，${costRows.length}条成本数据`);

        // 3. 数据映射和计算
        const incomeMap = {};
        const costMap = {};
        
        // 收入数据映射
        incomeRows.forEach(row => {
            let customerAttr = row.customer_attribute;
            // 数据兼容性处理：'电业项目' -> '申业项目'
            if (customerAttr === '电业项目') {
                customerAttr = '申业项目';
            }
            
            let segmentAttr = row.segment_attribute;
            // 对于代理工程和代理设计，归类到'其他'板块
            if (customerAttr === '代理工程' || customerAttr === '代理设计') {
                segmentAttr = '其他';
            }
            
            const key = `${segmentAttr}-${customerAttr}`;
            incomeMap[key] = parseFloat(row.cumulative_income) || 0;
        });

        // 成本数据映射
        costRows.forEach(row => {
            let customerAttr = row.customer_type;
            // 数据兼容性处理：'电业项目' -> '申业项目'
            if (customerAttr === '电业项目') {
                customerAttr = '申业项目';
            }
            
            let segmentAttr = row.category;
            // 对于代理工程和代理设计，归类到'其他'板块
            if (customerAttr === '代理工程' || customerAttr === '代理设计') {
                segmentAttr = '其他';
            }
            
            const key = `${segmentAttr}-${customerAttr}`;
            costMap[key] = parseFloat(row.cumulative_direct_cost) || 0;
        });

        console.log('收入映射:', incomeMap);
        console.log('成本映射:', costMap);

        // 4. 计算边际贡献率
        const calculatedItems = calculateTuoyuanContributionRatesNew(incomeMap, costMap);

        // 5. 保存计算结果
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 删除现有数据
            await connection.execute(
                'DELETE FROM tuoyuan_main_business_contribution_rate WHERE period = ?',
                [period]
            );

            // 插入计算结果
            const insertQuery = `
                INSERT INTO tuoyuan_main_business_contribution_rate 
                (period, segment_attribute, customer_attribute, yearly_plan, current_actual, deviation, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;

            for (const item of calculatedItems) {
                await connection.execute(insertQuery, [
                    period,
                    item.segmentAttribute,
                    item.customerAttribute,
                    item.yearlyPlan,
                    item.currentActual,
                    item.deviation
                ]);
            }

            await connection.commit();
            connection.release();

            res.json({
                success: true,
                message: '拓源公司边际贡献率计算完成',
                data: {
                    period: period,
                    items: calculatedItems,
                    summary: {
                        totalIncome: Object.values(incomeMap).reduce((sum, val) => sum + val, 0),
                        totalCost: Object.values(costMap).reduce((sum, val) => sum + val, 0),
                        weightedContributionRate: calculateWeightedRateSimple(incomeMap, costMap)
                    }
                }
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('自动计算拓源公司边际贡献率失败:', error);
        res.status(500).json({
            success: false,
            message: '自动计算失败',
            error: error.message
        });
    }
});

// 新的计算函数 - 使用完整成本（材料成本+人工成本）
function calculateTuoyuanContributionRatesNew(incomeMap, costMap) {
    // 固定的年度计划数据
    const planData = [
        { segmentAttribute: '设备', customerAttribute: '申业项目', yearlyPlan: 15.47 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', yearlyPlan: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', yearlyPlan: 6.00 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', yearlyPlan: 26.67 },
        { segmentAttribute: '其他', customerAttribute: '代理工程', yearlyPlan: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理设计', yearlyPlan: 100.00 }
    ];

    // 计算各项目的边际贡献率
    const calculatedItems = planData.map(planItem => {
        const key = `${planItem.segmentAttribute}-${planItem.customerAttribute}`;
        const income = incomeMap[key] || 0;
        const cost = costMap[key] || 0;

        // 计算边际贡献率 = (累计收入 - 累计直接成本) / 累计收入 * 100
        let contributionRate = 0;
        if (income > 0) {
            contributionRate = ((income - cost) / income) * 100;
        } else if (income === 0 && cost > 0) {
            // 如果收入为0但成本大于0，边际贡献率为-100%
            contributionRate = -100;
        }

        const currentActual = parseFloat(contributionRate.toFixed(2));
        const deviation = currentActual - planItem.yearlyPlan;

        console.log(`${planItem.segmentAttribute}-${planItem.customerAttribute}: 累计收入=${income}, 累计直接成本=${cost}, 贡献率=${currentActual}%`);

        return {
            segmentAttribute: planItem.segmentAttribute,
            customerAttribute: planItem.customerAttribute,
            yearlyPlan: planItem.yearlyPlan,
            currentActual: currentActual,
            deviation: parseFloat(deviation.toFixed(2))
        };
    });

    console.log('拓源公司边际贡献率计算结果(基于完整成本):', calculatedItems);
    return calculatedItems;
}

// 计算合计数据
function calculateTotalData(items) {
    const total = {
        yearlyPlan: 0,
        currentActual: 0,
        deviation: 0,
        count: items.length
    };
    
    // 简单平均
    items.forEach(item => {
        total.yearlyPlan += item.yearlyPlan || 0;
        total.currentActual += item.currentActual || 0;
    });
    
    total.deviation = total.currentActual - total.yearlyPlan;
    
    return {
        yearlyPlan: parseFloat(total.yearlyPlan.toFixed(2)),
        currentActual: parseFloat(total.currentActual.toFixed(2)),
        deviation: parseFloat(total.deviation.toFixed(2)),
        simpleAverage: parseFloat((total.currentActual / items.length).toFixed(2))
    };
}

// 计算加权平均边际贡献率
function calculateWeightedContributionRate(incomeRows, costRows) {
    const incomeMap = {};
    const costMap = {};
    
    // 收入数据映射
    incomeRows.forEach(row => {
        let customerAttr = row.customer_attribute;
        if (customerAttr === '电业项目') {
            customerAttr = '申业项目';
        }
        
        let segmentAttr = row.segment_attribute;
        if (customerAttr === '代理工程' || customerAttr === '代理设计') {
            segmentAttr = '其他';
        }
        
        const key = `${segmentAttr}-${customerAttr}`;
        incomeMap[key] = parseFloat(row.cumulative_income) || 0;
    });

    // 成本数据映射
    costRows.forEach(row => {
        let customerAttr = row.customer_type;
        if (customerAttr === '电业项目') {
            customerAttr = '申业项目';
        }
        
        let segmentAttr = row.category;
        if (customerAttr === '代理工程' || customerAttr === '代理设计') {
            segmentAttr = '其他';
        }
        
        const key = `${segmentAttr}-${customerAttr}`;
        costMap[key] = parseFloat(row.cumulative_direct_cost) || 0;
    });

    const totalIncome = Object.values(incomeMap).reduce((sum, val) => sum + val, 0);
    const totalCost = Object.values(costMap).reduce((sum, val) => sum + val, 0);
    
    let weightedRate = 0;
    if (totalIncome > 0) {
        weightedRate = ((totalIncome - totalCost) / totalIncome) * 100;
    }
    
    return {
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        weightedContributionRate: parseFloat(weightedRate.toFixed(2)),
        marginContribution: parseFloat((totalIncome - totalCost).toFixed(2))
    };
}

// 简单的加权计算函数（用于calculate接口）
function calculateWeightedRateSimple(incomeMap, costMap) {
    const totalIncome = Object.values(incomeMap).reduce((sum, val) => sum + val, 0);
    const totalCost = Object.values(costMap).reduce((sum, val) => sum + val, 0);
    
    if (totalIncome > 0) {
        return parseFloat(((totalIncome - totalCost) / totalIncome * 100).toFixed(2));
    }
    return 0;
}

module.exports = router;