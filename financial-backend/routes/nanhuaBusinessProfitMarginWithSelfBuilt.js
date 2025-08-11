const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');
const fetch = require('node-fetch');

// 获取南华主营业务毛利率结构与质量数据（含自建项目）
router.get('/:period', createBudgetMiddleware('nanhua_business_profit_margin_with_self_built'), async (req, res) => {
  const { period } = req.params;
  
  // 验证period格式 (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
  }
  
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM nanhua_business_profit_margin_with_self_built WHERE period = ? ORDER BY created_at DESC LIMIT 1',
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

// 保存南华主营业务毛利率结构与质量数据（含自建项目）
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
      'SELECT id FROM nanhua_business_profit_margin_with_self_built WHERE period = ?',
      [period]
    );
    
    if (existingRows.length > 0) {
      // 更新现有数据
      await pool.execute(
        'UPDATE nanhua_business_profit_margin_with_self_built SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE period = ?',
        [JSON.stringify(data), period]
      );
    } else {
      // 插入新数据
      await pool.execute(
        'INSERT INTO nanhua_business_profit_margin_with_self_built (period, data) VALUES (?, ?)',
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
      'DELETE FROM nanhua_business_profit_margin_with_self_built WHERE period = ?',
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
      'SELECT period, created_at, updated_at FROM nanhua_business_profit_margin_with_self_built ORDER BY period DESC'
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

// 计算累计成本的辅助函数
const calculateCumulativeCosts = async (period, customerName, customerMapping) => {
  try {
    const [year, month] = period.split('-');
    const mappedName = customerMapping[customerName] || customerName;
    let totalMaterialCost = 0;
    let totalLaborCost = 0;

    // 累加从1月到当前月份的所有当期成本
    for (let m = 1; m <= parseInt(month); m++) {
      const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;
      
      try {
        const monthCostResponse = await fetch(`http://47.111.95.19:3000/nanhua-main-business-cost/${monthPeriod}`);
        if (monthCostResponse.ok) {
          const monthCostResult = await monthCostResponse.json();
          if (monthCostResult.success && monthCostResult.data) {
            // 根据客户类型确定在哪个类别中查找
            let costCategory = [];
            if (['一包项目', '二包项目', '域内合作项目', '域外合作项目'].includes(customerName)) {
              costCategory = monthCostResult.data.equipment || [];
            } else if (['新能源项目', '苏州项目'].includes(customerName)) {
              costCategory = monthCostResult.data.component || [];
            } else if (['自接项目', '其他'].includes(customerName)) {
              costCategory = monthCostResult.data.project || [];
            }
            
            const costCustomer = costCategory.find(item => item.customerType === mappedName);
            if (costCustomer) {
              totalMaterialCost += parseFloat(costCustomer.currentMaterialCost || 0);
              totalLaborCost += parseFloat(costCustomer.currentLaborCost || 0);
            }
          }
        }
      } catch (error) {
        console.error(`获取${monthPeriod}成本数据失败:`, error);
      }
    }

    return totalMaterialCost + totalLaborCost;
  } catch (error) {
    console.error(`计算${customerName}累计成本失败:`, error);
    return 0;
  }
};

// 计算指定期间的南华业务利润率数据
router.get('/calculate/:period', async (req, res) => {
  const { period } = req.params;

  // 验证period格式 (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
  }

  try {
    console.log(`开始计算南华业务利润率，期间: ${period}`);

    // 1. 获取南华主营业务收入数据
    const incomeResponse = await fetch(`http://47.111.95.19:3000/nanhua-business-income/${period}`);
    let incomeData = null;

    if (incomeResponse.ok) {
      const incomeResult = await incomeResponse.json();
      if (incomeResult.success) {
        incomeData = incomeResult.data;
      }
    }

    if (!incomeData) {
      return res.status(404).json({ error: `未找到${period}期间的收入数据` });
    }

    console.log('收入数据:', incomeData);

    // 3. 计算各客户的利润率
    const result = {
      customers: [
        { customerName: '一包项目', yearlyPlan: 14.54, current: 0 },
        { customerName: '二包项目', yearlyPlan: 15.50, current: 0 },
        { customerName: '域内合作项目', yearlyPlan: 8.00, current: 0 },
        { customerName: '域外合作项目', yearlyPlan: 5.48, current: 0 },
        { customerName: '新能源项目', yearlyPlan: 17.25, current: 0 },
        { customerName: '苏州项目', yearlyPlan: 6.00, current: 0 },
        { customerName: '自接项目', yearlyPlan: 47.12, current: 0 },
        { customerName: '其他', yearlyPlan: 0.00, current: 0 }
      ]
    };

    // 客户映射关系（修复版本）
    const customerMapping = {
        '一包项目': '一包项目',      // 收入表 -> 成本表
        '二包项目': '二包项目',      // 收入表 -> 成本表
        '域内合作项目': '域内合作项目', // 收入表 -> 成本表
        '域外合作项目': '域外合作项目', // 收入表 -> 成本表
        '新能源项目': '新能源项目',   // 收入表 -> 成本表
        '苏州项目': '苏州项目',      // 收入表 -> 成本表
        '自接项目': '自接项目',      // 收入表 -> 成本表
        '其他': '其他'              // 收入表 -> 成本表
    };

    // 计算每个客户的利润率
    for (const customer of result.customers) {
        // 从收入数据中查找对应客户的收入
        let totalIncome = 0;
        if (incomeData.customers) {
            // 收入表和成本表客户名称映射
            let incomeCustomerName = customer.customerName;
            
            const incomeCustomer = incomeData.customers.find(item => item.customerName === incomeCustomerName);
            if (incomeCustomer) {
                totalIncome = incomeCustomer.accumulated || incomeCustomer.accumulatedIncome || incomeCustomer.currentMonthIncome || 0;
            }
        }

        // 使用累计成本计算函数获取正确的累计成本（从1月到当前月份的当期成本总和）
        const totalCost = await calculateCumulativeCosts(period, customer.customerName, customerMapping);

        // 计算利润率：(收入-成本)/收入 * 100%
        let profitMargin = 0;
        if (totalIncome > 0) {
            profitMargin = ((totalIncome - totalCost) / totalIncome) * 100;
        }

        customer.current = parseFloat(profitMargin.toFixed(2));
        console.log(`${customer.customerName}: 收入=${totalIncome}, 成本=${totalCost}, 利润率=${profitMargin.toFixed(2)}%`);
    }

    console.log('计算结果:', result);

    res.json({
      success: true,
      data: result,
      period: period,
      calculation: {
        formula: '利润率 = (累计收入 - 累计成本) / 累计收入 * 100%',
        description: '基于南华主营业务收入和主营业务成本数据计算'
      }
    });

  } catch (error) {
    console.error('计算南华业务利润率失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '计算失败', details: error.message });
  }
});

module.exports = router;