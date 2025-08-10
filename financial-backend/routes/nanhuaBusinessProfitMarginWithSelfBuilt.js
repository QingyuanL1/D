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

    // 2. 获取南华主营业务成本数据
    const costResponse = await fetch(`http://47.111.95.19:3000/nanhua-main-business-cost/${period}`);
    let costData = null;

    if (costResponse.ok) {
      const costResult = await costResponse.json();
      if (costResult.success) {
        costData = costResult.data;
      }
    }

    if (!incomeData || !costData) {
      return res.status(404).json({ error: `未找到${period}期间的收入或成本数据` });
    }

    console.log('收入数据:', incomeData);
    console.log('成本数据:', costData);

    // 3. 计算各客户的利润率
    const result = {
      customers: [
        { customerName: '一包项目', yearlyPlan: 14.54, current: 0 },
        { customerName: '二包项目', yearlyPlan: 15.50, current: 0 },
        { customerName: '域内合作项目', yearlyPlan: 8.00, current: 0 },
        { customerName: '域外合作项目', yearlyPlan: 5.48, current: 0 },
        { customerName: '新能源项目', yearlyPlan: 17.25, current: 0 },
        { customerName: '苏州项目', yearlyPlan: 6.00, current: 0 },
        { customerName: '抢修', yearlyPlan: 33.52, current: 0 },
        { customerName: '运检项目', yearlyPlan: 13.60, current: 0 },
        { customerName: '自建项目', yearlyPlan: 0, current: 0 }
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
        '抢修': '抢修项目',          // 收入表 -> 成本表
        '运检项目': '运检项目',      // 收入表 -> 成本表
        '自建项目': '自建项目'       // 收入表 -> 成本表
    };

    // 计算每个客户的利润率
    result.customers.forEach(customer => {
        const mappedName = customerMapping[customer.customerName] || customer.customerName;
        
        // 从收入数据中查找对应客户的收入
        let totalIncome = 0;
        if (incomeData.customers) {
            // 收入表和成本表客户名称映射
            let incomeCustomerName = customer.customerName;
            if (customer.customerName === '运检项目') {
                incomeCustomerName = '运检'; // 收入表中是"运检"
            } else if (customer.customerName === '抢修') {
                incomeCustomerName = '抢修'; // 收入表中也是"抢修"
            }
            
            const incomeCustomer = incomeData.customers.find(item => item.customerName === incomeCustomerName);
            if (incomeCustomer) {
                totalIncome = incomeCustomer.accumulated || incomeCustomer.accumulatedIncome || incomeCustomer.currentMonthIncome || 0;
            }
        }

        // 从成本数据中查找对应客户的成本
        let totalCost = 0;
        
        // 根据客户类型确定在哪个类别中查找
        let costCategory = [];
        if (['一包项目', '二包项目', '域内合作项目', '域外合作项目'].includes(customer.customerName)) {
            costCategory = costData.equipment || [];
        } else if (['新能源项目', '苏州项目'].includes(customer.customerName)) {
            costCategory = costData.component || [];
        } else if (['抢修', '运检项目', '自建项目'].includes(customer.customerName)) {
            costCategory = costData.project || [];
        }
        
        const costCustomer = costCategory.find(item => item.customerType === mappedName);
        if (costCustomer) {
            const materialCost = parseFloat(costCustomer.cumulativeMaterialCost || 0) || parseFloat(costCustomer.currentMaterialCost || 0);
            const laborCost = parseFloat(costCustomer.cumulativeLaborCost || 0) || parseFloat(costCustomer.currentLaborCost || 0);
            totalCost = materialCost + laborCost;
        }

        // 计算利润率：(收入-成本)/收入 * 100%
        let profitMargin = 0;
        if (totalIncome > 0) {
            profitMargin = ((totalIncome - totalCost) / totalIncome) * 100;
        }

        customer.current = parseFloat(profitMargin.toFixed(2));
    });

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