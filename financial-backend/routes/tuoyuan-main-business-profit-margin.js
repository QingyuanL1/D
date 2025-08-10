const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const fetch = require('node-fetch');

// 获取数据
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        console.log(`获取拓源公司主营业务毛利率数据，期间: ${period}`);
        
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
            FROM tuoyuan_main_business_profit_margin 
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
        console.error('获取拓源公司主营业务毛利率数据失败:', error);
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
        console.log(`保存拓源公司主营业务毛利率数据，期间: ${period}`);
        
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
                'DELETE FROM tuoyuan_main_business_profit_margin WHERE period = ?',
                [period]
            );

            // 插入新数据
            const insertQuery = `
                INSERT INTO tuoyuan_main_business_profit_margin 
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
        console.error('保存拓源公司主营业务毛利率数据失败:', error);
        res.status(500).json({
            success: false,
            message: '保存数据失败',
            error: error.message
        });
    }
});

// 计算指定期间的毛利率数据
router.get('/calculate/:period', async (req, res) => {
    try {
        const { period } = req.params;
        console.log(`开始计算拓源公司毛利率，期间: ${period}`);

        // 验证period格式 (YYYY-MM)
        if (!/^\d{4}-\d{2}$/.test(period)) {
            return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
        }

        // 1. 获取主营业务收入数据
        const incomeResponse = await fetch(`http://47.111.95.19:3000/tuoyuan-main-business-income-breakdown/${period}`);
        let incomeData = null;

        if (incomeResponse.ok) {
            const incomeResult = await incomeResponse.json();
            if (incomeResult.success) {
                incomeData = incomeResult.data;
            }
        }

        if (!incomeData) {
            return res.status(404).json({ error: `未找到${period}期间的主营业务收入数据` });
        }

        // 2. 获取主营业务成本数据
        const costResponse = await fetch(`http://47.111.95.19:3000/tuoyuan-main-business-cost-structure-quality/${period}`);
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

        // 3. 计算各板块的毛利率
        const calculatedItems = [];

        // 客户映射关系
        const customerMapping = {
            '电业项目': 'electrical_project',
            '用户项目': 'user_project', 
            '贸易': 'trade',
            '代理设备': 'agent_equipment',
            '代理工程': 'agent_engineering',
            '代理设计': 'agent_design'
        };

        // 遍历收入数据计算毛利率
        for (const incomeItem of incomeData.items) {
            const segmentAttribute = incomeItem.segmentAttribute;
            const customerAttribute = incomeItem.customerAttribute;
            const cumulativeIncome = incomeItem.currentCumulative || 0;

            // 查找对应的成本数据
            let totalCost = 0;
            if (costData.equipment) {
                const costItem = costData.equipment.find(cost => 
                    cost.customerType === customerAttribute
                );
                
                if (costItem) {
                    // 优先使用累计人工成本（电气公司不计算材料成本）
                    const cumulativeLaborCost = parseFloat(costItem.cumulativeLaborCost || 0);
                    let laborCost = cumulativeLaborCost;
                    
                    // 如果累计人工成本为0，则计算前面所有月份的当期人工成本总和
                    if (laborCost === 0) {
                        laborCost = await calculateHistoricalCosts(period, customerAttribute, 'labor');
                    }
                    
                    totalCost = laborCost; // 只使用人工成本，不包含材料成本
                }
            }

            // 计算毛利率：(收入-成本)/收入 * 100%
            let profitMargin = 0;
            if (cumulativeIncome > 0) {
                profitMargin = ((cumulativeIncome - totalCost) / cumulativeIncome) * 100;
            }

            // 获取年度计划值
            const yearlyPlan = getYearlyPlan(segmentAttribute, customerAttribute);
            const deviation = profitMargin - yearlyPlan;

            calculatedItems.push({
                segmentAttribute: segmentAttribute,
                customerAttribute: customerAttribute,
                yearlyPlan: yearlyPlan,
                currentActual: Number(profitMargin.toFixed(2)),
                deviation: Number(deviation.toFixed(2))
            });
        }

        res.json({
            success: true,
            data: {
                period: period,
                items: calculatedItems
            },
            calculation: {
                formula: '毛利率 = (累计收入 - 累计人工成本) / 累计收入 * 100%',
                description: '基于tuoyuan_main_business_income_breakdown.currentCumulative和tuoyuan_main_business_cost_structure_quality.cumulative_labor_cost计算（电气公司仅计算人工成本，不包含材料成本）'
            }
        });

    } catch (error) {
        console.error('计算拓源公司毛利率失败:', error);
        console.error('错误堆栈:', error.stack);
        res.status(500).json({ error: '计算失败', details: error.message });
    }
});

// 获取年度计划值的辅助函数
function getYearlyPlan(segmentAttribute, customerAttribute) {
    const plans = {
        '设备': {
            '电业项目': 8.00,
            '用户项目': 0,
            '贸易': 0,
            '代理设备': 24.99
        },
        '其他': {
            '代理工程': 0,
            '代理设计': 100
        }
    };

    return plans[segmentAttribute] && plans[segmentAttribute][customerAttribute] !== undefined 
        ? plans[segmentAttribute][customerAttribute] 
        : 0;
}

// 计算历史累计成本的辅助函数（仅计算人工成本，电气公司不计算材料成本）
async function calculateHistoricalCosts(currentPeriod, customerAttribute, costType) {
    try {
        const [year, month] = currentPeriod.split('-');
        const currentMonth = parseInt(month);
        let totalCost = 0;
        let monthsWithData = [];

        // 累计从年初到当前月份的所有当期人工成本
        for (let m = 1; m <= currentMonth; m++) {
            const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;
            
            try {
                const [rows] = await pool.execute(
                    'SELECT * FROM tuoyuan_main_business_cost_structure_quality WHERE period = ?',
                    [monthPeriod]
                );

                const monthCostItem = rows.find(row => row.customer_type === customerAttribute);
                if (monthCostItem) {
                    let monthCost = 0;
                    // 只计算人工成本，不计算材料成本
                    if (costType === 'labor') {
                        monthCost = parseFloat(monthCostItem.current_labor_cost || 0);
                    }
                    // 注意：材料成本(material)不再参与计算
                    
                    if (monthCost > 0) {
                        totalCost += monthCost;
                        monthsWithData.push(`${monthPeriod}:${monthCost}`);
                    }
                }
            } catch (monthError) {
                // 继续处理下一个月份
                continue;
            }
        }

        if (monthsWithData.length > 0) {
            console.log(`${customerAttribute} ${costType}成本累计: ${totalCost} (数据月份: ${monthsWithData.join(', ')})`);
        } else {
            console.log(`${customerAttribute} ${costType}成本累计: 0 (${year}年1-${currentMonth}月均无数据)`);
        }
        
        return totalCost;
        
    } catch (error) {
        console.error('计算历史累计成本失败:', error);
        return 0;
    }
}

module.exports = router;