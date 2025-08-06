const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

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

        res.json({
            success: true,
            data: {
                period: period,
                items: items
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

        // 1. 获取拓源公司主营业务收入数据 - 使用当期累计数据
        const [incomeRows] = await pool.execute(`
            SELECT 
                segment_attribute,
                customer_attribute,
                current_cumulative as current_income
            FROM tuoyuan_main_business_income_breakdown 
            WHERE period = ?
            ORDER BY segment_attribute, customer_attribute
        `, [period]);

        console.log(`找到拓源公司收入数据: ${incomeRows.length}条记录`);

        // 2. 获取拓源公司当期成本数据 - 使用当期数据
        const [costRows] = await pool.execute(`
            SELECT 
                category as segment_attribute,
                customer_type as customer_attribute, 
                current_material_cost as current_cost
            FROM tuoyuan_main_business_cost_structure_quality 
            WHERE period = ?
            ORDER BY category, customer_type
        `, [period]);

        console.log(`找到拓源公司成本数据: ${costRows.length}条记录`);
        console.log('收入数据:', incomeRows);
        console.log('成本数据:', costRows);

        // 3. 计算边际贡献率
        const calculatedItems = calculateTuoyuanContributionRates(incomeRows, costRows);

        // 4. 保存计算结果
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
                    items: calculatedItems
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

// 计算拓源公司边际贡献率的核心函数
function calculateTuoyuanContributionRates(incomeData, costData) {
    // 固定的年度计划数据
    const planData = [
        { segmentAttribute: '设备', customerAttribute: '申业项目', yearlyPlan: 15.47 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', yearlyPlan: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', yearlyPlan: 6.00 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', yearlyPlan: 26.67 },
        { segmentAttribute: '其他', customerAttribute: '代理工程', yearlyPlan: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理设计', yearlyPlan: 100.00 }
    ];

    // 收入数据映射 - 注意拓源公司用的是'申业项目'，但数据库可能存储为'电业项目'
    const incomeMap = {};
    if (Array.isArray(incomeData)) {
        incomeData.forEach(item => {
            let customerAttr = item.customer_attribute;
            // 数据兼容性处理：'电业项目' -> '申业项目'
            if (customerAttr === '电业项目') {
                customerAttr = '申业项目';
            }
            
            let segmentAttr = item.segment_attribute;
            // 对于代理工程和代理设计，归类到'其他'板块
            if (customerAttr === '代理工程' || customerAttr === '代理设计') {
                segmentAttr = '其他';
            }
            
            const key = `${segmentAttr}-${customerAttr}`;
            incomeMap[key] = parseFloat(item.current_income) || 0;
        });
    }

    // 成本数据映射
    const costMap = {};
    if (Array.isArray(costData)) {
        costData.forEach(item => {
            let customerAttr = item.customer_attribute;
            // 数据兼容性处理：'电业项目' -> '申业项目'
            if (customerAttr === '电业项目') {
                customerAttr = '申业项目';
            }
            
            let segmentAttr = item.segment_attribute;
            // 对于代理工程和代理设计，归类到'其他'板块
            if (customerAttr === '代理工程' || customerAttr === '代理设计') {
                segmentAttr = '其他';
            }
            
            const key = `${segmentAttr}-${customerAttr}`;
            costMap[key] = parseFloat(item.current_cost) || 0;
        });
    }

    console.log('收入映射:', incomeMap);
    console.log('成本映射:', costMap);

    // 计算各项目的边际贡献率
    const calculatedItems = planData.map(planItem => {
        const key = `${planItem.segmentAttribute}-${planItem.customerAttribute}`;
        const income = incomeMap[key] || 0;
        const cost = costMap[key] || 0;

        // 计算边际贡献率 = (收入 - 成本) / 收入 * 100
        let contributionRate = 0;
        if (income > 0) {
            contributionRate = ((income - cost) / income) * 100;
        }

        const currentActual = parseFloat(contributionRate.toFixed(2));
        const deviation = currentActual - planItem.yearlyPlan;

        console.log(`${planItem.segmentAttribute}-${planItem.customerAttribute}: 收入=${income}, 成本=${cost}, 贡献率=${currentActual}%`);

        return {
            segmentAttribute: planItem.segmentAttribute,
            customerAttribute: planItem.customerAttribute,
            yearlyPlan: planItem.yearlyPlan,
            currentActual: currentActual,
            deviation: parseFloat(deviation.toFixed(2))
        };
    });

    console.log('拓源公司边际贡献率计算结果:', calculatedItems);
    return calculatedItems;
}

module.exports = router;