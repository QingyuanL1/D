const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 拓源主营业务净利润自动计算接口
// 净利润 = 营业收入 - 累计直接成本 - 累计间接成本 - 营销费用 - 管理费用 - 财务费用

// 计算指定期间的净利润
router.get('/calculate/:period', async (req, res) => {
    try {
        const { period } = req.params;
        console.log(`计算拓源净利润 - 期间: ${period}`);

        // 解析期间，获取年份和月份
        const [year, month] = period.split('-');
        const currentMonth = parseInt(month);

        // 拓源的客户列表（根据实际业务调整）
        const customers = ['电业项目', '用户项目', '用户设备', '贸易', '代理设备', '代理工程', '代理设计', '其他'];

        // 获取成本中心费用（从成本中心结构表获取，按客户分配）
        let totalMarketingCost = 0;
        let totalManagementCost = 0;
        let totalFinanceCost = 0;

        for (let m = 1; m <= currentMonth; m++) {
            const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;

            const [centerRows] = await pool.execute(
                'SELECT marketing, management, finance FROM tuoyuan_cost_center_structure WHERE period = ?',
                [monthPeriod]
            );

            centerRows.forEach(row => {
                totalMarketingCost += parseFloat(row.marketing) || 0;
                totalManagementCost += parseFloat(row.management) || 0;
                totalFinanceCost += parseFloat(row.finance) || 0;
            });
        }

        const results = [];

        for (const customerName of customers) {
            console.log(`计算客户: ${customerName}`);

            // 1. 计算营业收入（订单转收入 + 存量订单转收入）
            let totalIncome = 0;

            // 获取订单转收入的累计值（从年初到当前月份累加当期值）
            for (let m = 1; m <= currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;
                
                // 订单转收入
                const [orderRows] = await pool.execute(
                    'SELECT current_period_income FROM tuoyuan_order_to_income WHERE period = ? AND customer_attribute = ?',
                    [monthPeriod, customerName]
                );

                if (orderRows.length > 0) {
                    totalIncome += parseFloat(orderRows[0].current_period_income) || 0;
                }

                // 存量订单转收入
                const [stockRows] = await pool.execute(
                    'SELECT current_period_income FROM tuoyuan_stock_order_to_income WHERE period = ? AND customer_attribute = ?',
                    [monthPeriod, customerName]
                );

                if (stockRows.length > 0) {
                    totalIncome += parseFloat(stockRows[0].current_period_income) || 0;
                }
            }

            // 2. 计算累计直接成本和间接成本（从主营业务成本表，通过当期值累加）
            let totalMaterialCost = 0; // 累计直接成本
            let totalLaborCost = 0;    // 累计间接成本

            for (let m = 1; m <= currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;
                
                // 获取主营业务成本数据（不限制category，因为不同月份可能有不同的category值）
                const [costRows] = await pool.execute(
                    'SELECT current_material_cost, current_labor_cost FROM tuoyuan_main_business_cost_structure_quality WHERE period = ? AND customer_type = ?',
                    [monthPeriod, customerName]
                );

                if (costRows.length > 0) {
                    totalMaterialCost += parseFloat(costRows[0].current_material_cost) || 0;
                    totalLaborCost += parseFloat(costRows[0].current_labor_cost) || 0;
                }
            }

            // 3. 成本中心费用按收入比例分摊（如果该客户有收入的话）
            let marketingCost = 0;
            let managementCost = 0;
            let financeCost = 0;

            // 暂时不分摊成本中心费用到具体客户，因为这是公司层面的费用
            // 在最后汇总时会显示总的成本中心费用

            // 4. 计算净利润
            const netProfit = totalIncome - totalMaterialCost - totalLaborCost - marketingCost - managementCost - financeCost;

            // 5. 计算净利率
            const netProfitMargin = totalIncome > 0 ? (netProfit / totalIncome * 100) : 0;

            results.push({
                customerName: customerName,
                totalIncome: parseFloat(totalIncome.toFixed(2)),
                cumulativeMaterialCost: parseFloat(totalMaterialCost.toFixed(2)),
                cumulativeLaborCost: parseFloat(totalLaborCost.toFixed(2)),
                marketingCost: parseFloat(marketingCost.toFixed(2)),
                managementCost: parseFloat(managementCost.toFixed(2)),
                financeCost: parseFloat(financeCost.toFixed(2)),
                netProfit: parseFloat(netProfit.toFixed(2)),
                netProfitMargin: parseFloat(netProfitMargin.toFixed(2))
            });
        }

        // 计算总计
        const totals = results.reduce((acc, item) => {
            acc.totalIncome += item.totalIncome;
            acc.totalDirectCosts += item.cumulativeMaterialCost + item.cumulativeLaborCost;
            acc.totalNetProfitBeforeCenterCosts += item.netProfit;
            return acc;
        }, { totalIncome: 0, totalDirectCosts: 0, totalNetProfitBeforeCenterCosts: 0 });

        // 减去公司层面的成本中心费用
        const finalNetProfit = totals.totalNetProfitBeforeCenterCosts - totalMarketingCost - totalManagementCost - totalFinanceCost;
        const totalCosts = totals.totalDirectCosts + totalMarketingCost + totalManagementCost + totalFinanceCost;
        const overallNetProfitMargin = totals.totalIncome > 0 ? (finalNetProfit / totals.totalIncome * 100) : 0;

        res.json({
            success: true,
            data: {
                customers: results,
                centerCosts: {
                    totalMarketingCost: parseFloat(totalMarketingCost.toFixed(2)),
                    totalManagementCost: parseFloat(totalManagementCost.toFixed(2)),
                    totalFinanceCost: parseFloat(totalFinanceCost.toFixed(2))
                },
                totals: {
                    totalIncome: parseFloat(totals.totalIncome.toFixed(2)),
                    totalDirectCosts: parseFloat(totals.totalDirectCosts.toFixed(2)),
                    totalCenterCosts: parseFloat((totalMarketingCost + totalManagementCost + totalFinanceCost).toFixed(2)),
                    totalCosts: parseFloat(totalCosts.toFixed(2)),
                    totalNetProfit: parseFloat(finalNetProfit.toFixed(2)),
                    overallNetProfitMargin: parseFloat(overallNetProfitMargin.toFixed(2))
                }
            },
            period: period,
            calculation: {
                formula: "净利润 = 营业收入 - 累计直接成本 - 累计间接成本 - 营销费用 - 管理费用 - 财务费用",
                description: "累计值通过当期值累加计算，成本中心费用从成本中心结构表获取",
                method: "cumulative_calculation"
            }
        });

    } catch (error) {
        console.error('计算拓源净利润失败:', error);
        res.status(500).json({
            success: false,
            message: '计算净利润失败',
            error: error.message
        });
    }
});

// 获取单月净利润数据（用于验证）
router.get('/monthly/:period', async (req, res) => {
    try {
        const { period } = req.params;
        console.log(`获取拓源单月净利润数据 - 期间: ${period}`);

        const customers = ['电业项目', '用户项目', '用户设备', '贸易', '代理设备', '代理工程', '代理设计', '其他'];
        const results = [];

        for (const customerName of customers) {
            // 1. 获取营业收入（当期）
            let monthlyIncome = 0;
            
            const [orderRows] = await pool.execute(
                'SELECT current_period_income FROM tuoyuan_order_to_income WHERE period = ? AND customer_attribute = ?',
                [period, customerName]
            );

            if (orderRows.length > 0) {
                monthlyIncome += parseFloat(orderRows[0].current_period_income) || 0;
            }

            const [stockRows] = await pool.execute(
                'SELECT current_period_income FROM tuoyuan_stock_order_to_income WHERE period = ? AND customer_attribute = ?',
                [period, customerName]
            );

            if (stockRows.length > 0) {
                monthlyIncome += parseFloat(stockRows[0].current_period_income) || 0;
            }

            // 2. 获取主营业务成本数据（当期直接成本和间接成本）
            const [costRows] = await pool.execute(
                'SELECT current_material_cost, current_labor_cost FROM tuoyuan_main_business_cost_structure_quality WHERE period = ? AND customer_type = ?',
                [period, customerName]
            );

            let materialCost = 0;
            let laborCost = 0;
            if (costRows.length > 0) {
                materialCost = parseFloat(costRows[0].current_material_cost) || 0;
                laborCost = parseFloat(costRows[0].current_labor_cost) || 0;
            }

            // 3. 获取成本中心费用（从成本中心结构表）
            const [centerRows] = await pool.execute(
                'SELECT marketing, management, finance FROM tuoyuan_cost_center_structure WHERE period = ?',
                [period]
            );

            let marketingCost = 0;
            let managementCost = 0;
            let financeCost = 0;

            centerRows.forEach(row => {
                marketingCost += parseFloat(row.marketing) || 0;
                managementCost += parseFloat(row.management) || 0;
                financeCost += parseFloat(row.finance) || 0;
            });

            // 4. 计算净利润
            const netProfit = monthlyIncome - materialCost - laborCost - marketingCost - managementCost - financeCost;
            const netProfitMargin = monthlyIncome > 0 ? (netProfit / monthlyIncome * 100) : 0;

            results.push({
                customerName: customerName,
                monthlyIncome: parseFloat(monthlyIncome.toFixed(2)),
                materialCost: parseFloat(materialCost.toFixed(2)),
                laborCost: parseFloat(laborCost.toFixed(2)),
                marketingCost: parseFloat(marketingCost.toFixed(2)),
                managementCost: parseFloat(managementCost.toFixed(2)),
                financeCost: parseFloat(financeCost.toFixed(2)),
                netProfit: parseFloat(netProfit.toFixed(2)),
                netProfitMargin: parseFloat(netProfitMargin.toFixed(2))
            });
        }

        res.json({
            success: true,
            data: results,
            period: period
        });

    } catch (error) {
        console.error('获取拓源单月净利润数据失败:', error);
        res.status(500).json({
            success: false,
            message: '获取单月净利润数据失败',
            error: error.message
        });
    }
});

module.exports = router;
