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

// 为南华公司提供计算净利润的接口
router.get('/calculate/:period', async (req, res) => {
    const { period } = req.params;

    // 验证period格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }

    try {
        console.log(`开始计算南华主营业务净利润，期间: ${period}`);

        // 1. 获取南华营业收入数据
        const [incomeRows] = await pool.execute(
            'SELECT customer_name, current_amount, accumulated_amount FROM nanhua_business_income WHERE period = ? AND category = "工程"',
            [period]
        );

        // 2. 获取南华主营业务成本数据
        const [costRows] = await pool.execute(
            'SELECT customer_type, current_material_cost, current_labor_cost FROM nanhua_main_business_cost WHERE period = ? AND category = "工程"',
            [period]
        );

        // 3. 获取南华成本中心结构数据
        const [centerRows] = await pool.execute(
            'SELECT customer_name, current_income, accumulated_income FROM nanhua_cost_center_structure WHERE period = ? AND category = "工程"',
            [period]
        );

        console.log(`数据获取结果: 收入${incomeRows.length}条, 成本${costRows.length}条, 成本中心${centerRows.length}条`);

        // 构建成本数据映射
        const costMap = {};
        costRows.forEach(row => {
            // 匹配客户类型，处理不同命名方式
            const key = row.customer_type;
            costMap[key] = {
                materialCost: parseFloat(row.current_material_cost) || 0,
                laborCost: parseFloat(row.current_labor_cost) || 0
            };
        });

        // 构建成本中心数据映射
        const centerMap = {};
        centerRows.forEach(row => {
            const key = row.customer_name;
            centerMap[key] = parseFloat(row.current_income) || 0;
        });

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

        // 计算净利润数据
        const result = {
            customers: []
        };

        // 处理工程板块数据
        incomeRows.forEach(incomeItem => {
            const customerName = incomeItem.customer_name;
            const currentAmount = parseFloat(incomeItem.current_amount) || 0;
            
            // 查找对应的成本数据（处理不同的命名映射）
            let materialCost = 0;
            let laborCost = 0;
            
            // 尝试多种匹配方式
            const costData = costMap[customerName] || 
                            costMap[customerName.replace('项目', '')] || 
                            costMap[customerName + '项目'] ||
                            { materialCost: 0, laborCost: 0 };
            
            materialCost = costData.materialCost;
            laborCost = costData.laborCost;

            // 查找成本中心数据
            const centerIncome = centerMap[customerName] || 0;

            // 计算净利润：当期收入 - 材料成本 - 人工成本 - 成本中心收入
            const netProfit = currentAmount - materialCost - laborCost - centerIncome;

            // 获取年度目标
            const yearlyPlan = yearlyPlanData[customerName] || 0;

            result.customers.push({
                customerName: customerName,
                yearlyPlan: yearlyPlan,
                currentPeriod: netProfit,
                cumulative: 0, // 将在前端或后续计算
                decompositionRatio: 0,
                annualRatio: 0,
                // 调试信息
                debug: {
                    currentAmount: currentAmount,
                    materialCost: materialCost,
                    laborCost: laborCost,
                    centerIncome: centerIncome,
                    calculation: `${currentAmount} - ${materialCost} - ${laborCost} - ${centerIncome} = ${netProfit}`
                }
            });
        });

        console.log(`计算完成，期间: ${period}, 结果数量: ${result.customers.length}`);

        res.json({
            success: true,
            data: result,
            period: period,
            calculation: {
                formula: '净利润 = 当期收入 - 材料成本 - 人工成本 - 成本中心收入',
                description: '基于nanhua_business_income.current_amount - nanhua_main_business_cost.current_material_cost - nanhua_main_business_cost.current_labor_cost - nanhua_cost_center_structure.current_income计算'
            }
        });

    } catch (error) {
        console.error('计算南华主营业务净利润失败:', error);
        res.status(500).json({ error: '计算失败: ' + error.message });
    }
});

module.exports = router;