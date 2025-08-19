const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');

// 获取南华主营业务净利润贡献情况数据
router.get('/:period', createBudgetMiddleware('南华主营业务净利润贡献'), async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的客户列表
    const fixedData = {
      customers: [
        { customerName: '一包项目', yearlyPlan: 156.95, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '二包项目', yearlyPlan: 30.25, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '域内合作项目', yearlyPlan: 103.14, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '域外合作项目', yearlyPlan: 12.21, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '新能源项目', yearlyPlan: 235.15, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '苏州项目', yearlyPlan: -54.77, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '自接项目', yearlyPlan: -61.08, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 },
        { customerName: '其他', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, decompositionRatio: 0, annualRatio: 0 }
      ]
    };
    
    // 从数据库获取数据
    const [rows] = await pool.execute(
      'SELECT customer_name, yearly_plan, current_period, cumulative, decomposition_ratio, annual_ratio FROM nanhua_main_business_net_profit WHERE period = ?',
      [period]
    );

    const result = {
      customers: fixedData.customers.map(item => {
        const dbItem = rows.find(row => row.customer_name === item.customerName);
        return {
          customerName: item.customerName,
          yearlyPlan: item.yearlyPlan,
          currentPeriod: dbItem ? parseFloat(dbItem.current_period) : 0,
          cumulative: dbItem ? parseFloat(dbItem.cumulative) : 0,
          decompositionRatio: dbItem ? parseFloat(dbItem.decomposition_ratio) : 0,
          annualRatio: dbItem ? parseFloat(dbItem.annual_ratio) : 0
        };
      })
    };

    res.json({
      success: true,
      data: result,
      period: period
    });
  } catch (error) {
    console.error('获取南华主营业务净利润贡献情况数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 保存南华主营业务净利润贡献情况数据
router.post('/', async (req, res) => {
  try {
    const { period, data } = req.body;
    
    if (!period || !data || !data.customers) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数' 
      });
    }
    
    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 删除该期间的现有数据
      await connection.execute('DELETE FROM nanhua_main_business_net_profit WHERE period = ?', [period]);
      
      // 准备批量插入数据
      const insertQuery = `
        INSERT INTO nanhua_main_business_net_profit 
        (period, customer_name, yearly_plan, current_period, cumulative, decomposition_ratio, annual_ratio) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      // 处理客户数据
      for (const item of data.customers) {
        await connection.execute(insertQuery, [
          period,
          item.customerName,
          item.yearlyPlan || 0,
          item.currentPeriod || 0,
          item.cumulative || 0,
          item.decompositionRatio || 0,
          item.annualRatio || 0
        ]);
      }
      
      // 提交事务
      await connection.commit();
      
      res.json({ 
        success: true, 
        message: '保存成功' 
      });
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      throw error;
    } finally {
      // 释放连接
      connection.release();
    }
  } catch (error) {
    console.error('保存南华主营业务净利润贡献情况数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 为南华公司提供计算净利润的接口 - 新版本：累计值通过当期值累加计算
router.get('/calculate/:period', async (req, res) => {
    const { period } = req.params;

    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }

    try {
        console.log(`开始计算南华主营业务净利润，期间: ${period}`);

        const [year, month] = period.split('-');
        const currentMonth = parseInt(month);

        // 固定的年度目标数据
        const yearlyPlanData = {
            '一包项目': 156.95,
            '二包项目': 30.25,
            '域内合作项目': 103.14,
            '域外合作项目': 12.21,
            '新能源项目': 235.15,
            '苏州项目': -54.77,
            '自接项目': -61.08,
            '其他': 0
        };

        // 固定的客户列表
        const customerList = Object.keys(yearlyPlanData);

        // 计算净利润数据
        const result = {
            customers: []
        };

        // 为每个客户计算净利润
        for (const customerName of customerList) {
            let currentPeriodNetProfit = 0;
            let cumulativeNetProfit = 0;

            // 计算当期净利润（当前月份）
            currentPeriodNetProfit = await calculateMonthlyNetProfit(period, customerName);

            // 计算累计净利润（从年初到当前月份的当期净利润总和）
            for (let m = 1; m <= currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;
                const monthlyNetProfit = await calculateMonthlyNetProfit(monthPeriod, customerName);
                cumulativeNetProfit += monthlyNetProfit;
            }

            // 计算年度完成率
            const yearlyPlan = yearlyPlanData[customerName] || 0;
            const annualRatio = yearlyPlan !== 0 ? (cumulativeNetProfit / yearlyPlan * 100) : 0;

            result.customers.push({
                customerName: customerName,
                yearlyPlan: yearlyPlan,
                currentPeriod: parseFloat(currentPeriodNetProfit.toFixed(2)),
                cumulative: parseFloat(cumulativeNetProfit.toFixed(2)),
                decompositionRatio: 0, // 可以后续计算
                annualRatio: parseFloat(annualRatio.toFixed(2))
            });
        }

        console.log(`计算完成，期间: ${period}, 结果数量: ${result.customers.length}`);

        res.json({
            success: true,
            data: result,
            period: period,
            calculation: {
                formula: '净利润 = 营业收入 - 累计直接成本 - 累计间接成本 - 营销费用 - 管理费用 - 财务费用',
                description: '累计值通过当期值累加计算，不直接取累计数据',
                method: 'cumulative_calculation'
            }
        });

    } catch (error) {
        console.error('计算南华主营业务净利润失败:', error);
        res.status(500).json({ error: '计算失败: ' + error.message });
    }
});

// 计算单月净利润的辅助函数
async function calculateMonthlyNetProfit(period, customerName) {
    try {
        // 1. 获取营业收入（从订单转收入数据计算）
        let monthlyIncome = 0;

        // 获取当月订单转收入
        const [orderRows] = await pool.execute(
            'SELECT current_amount FROM nanhua_order_to_income WHERE period = ? AND customer_name = ?',
            [period, customerName]
        );

        if (orderRows.length > 0) {
            monthlyIncome += parseFloat(orderRows[0].current_amount) || 0;
        }

        // 获取存量订单转收入
        const [stockRows] = await pool.execute(
            'SELECT current_amount FROM nanhua_stock_order_to_income WHERE period = ? AND customer_name = ?',
            [period, customerName]
        );

        if (stockRows.length > 0) {
            monthlyIncome += parseFloat(stockRows[0].current_amount) || 0;
        }

        // 2. 获取主营业务成本数据（当期直接成本和间接成本）- 移除category限制，因为不同月份的category可能不同
        const [costRows] = await pool.execute(
            'SELECT current_material_cost, current_labor_cost FROM nanhua_main_business_cost WHERE period = ? AND customer_type = ?',
            [period, customerName]
        );

        let materialCost = 0;
        let laborCost = 0;
        if (costRows.length > 0) {
            materialCost = parseFloat(costRows[0].current_material_cost) || 0;
            laborCost = parseFloat(costRows[0].current_labor_cost) || 0;
        }

        // 3. 获取成本中心费用（营销、管理、财务）- 移除category限制
        const [centerRows] = await pool.execute(
            'SELECT marketing, management, finance FROM nanhua_cost_center_structure WHERE period = ? AND customer_name = ?',
            [period, customerName]
        );

        let marketingCost = 0;
        let managementCost = 0;
        let financeCost = 0;
        if (centerRows.length > 0) {
            marketingCost = parseFloat(centerRows[0].marketing) || 0;
            managementCost = parseFloat(centerRows[0].management) || 0;
            financeCost = parseFloat(centerRows[0].finance) || 0;
        }

        // 4. 计算净利润
        // 净利润 = 营业收入 - 直接成本 - 间接成本 - 营销费用 - 管理费用 - 财务费用
        const netProfit = monthlyIncome - materialCost - laborCost - marketingCost - managementCost - financeCost;

        console.log(`${customerName} ${period}: 收入=${monthlyIncome}, 材料=${materialCost}, 人工=${laborCost}, 营销=${marketingCost}, 管理=${managementCost}, 财务=${financeCost}, 净利润=${netProfit}`);

        return netProfit;

    } catch (error) {
        console.error(`计算${customerName} ${period}净利润失败:`, error);
        return 0;
    }
}

module.exports = router;