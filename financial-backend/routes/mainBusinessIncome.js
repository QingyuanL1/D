const express = require('express');
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');
const router = express.Router();

// 获取指定期间的主营业务收入分解情况数据 - 改为计算订单转收入数据
router.get('/:period', createBudgetMiddleware('main_business_income_breakdown'), async (req, res) => {
  try {
    const { period } = req.params;
    
    // 验证期间格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为 YYYY-MM' });
    }

    // 转换为日期格式 (YYYY-MM-01)
    const periodDate = `${period}-01`;
    const [year, month] = period.split('-');
    
    // 初始化结果数据结构
    const resultData = {
      equipment: [
        { customer: '上海', yearlyPlan: 22000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
        { customer: '国网', yearlyPlan: 5000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
        { customer: '江苏', yearlyPlan: 3000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
        { customer: '输配电内配', yearlyPlan: 2000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
        { customer: '西门子', yearlyPlan: 1000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
        { customer: '同业', yearlyPlan: 3000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
        { customer: '用户', yearlyPlan: 2000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
        { customer: '其它', yearlyPlan: 0, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' }
      ],
      components: [
        { customer: '用户', yearlyPlan: 1000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' }
      ],
      engineering: [
        { customer: '一包', yearlyPlan: 3800, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
        { customer: '二包', yearlyPlan: 700, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
        { customer: '域内合作', yearlyPlan: 10000, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
        { customer: '域外合作', yearlyPlan: 0, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' },
        { customer: '其它', yearlyPlan: 1500, currentMonthIncome: 0, accumulatedIncome: 0, progress: '/' }
      ]
    };

    // 计算当月收入 = 当月订单转收入 + 存量订单转收入
    try {
      // 1. 获取当月订单转收入数据
      const [orderToIncomeRows] = await pool.execute(
        'SELECT data FROM order_to_income WHERE period = ?',
        [periodDate]
      );

      if (orderToIncomeRows.length > 0) {
        const orderData = typeof orderToIncomeRows[0].data === 'string' ? JSON.parse(orderToIncomeRows[0].data) : orderToIncomeRows[0].data;
        
        ['equipment', 'components', 'engineering'].forEach(category => {
          if (orderData[category] && Array.isArray(orderData[category])) {
            orderData[category].forEach(orderItem => {
              const resultItem = resultData[category].find(item => item.customer === orderItem.customer);
              if (resultItem) {
                resultItem.currentMonthIncome += Number(orderItem.currentIncome || 0);
              }
            });
          }
        });
      }

      // 2. 获取存量订单转收入数据
      const [stockOrderRows] = await pool.execute(
        'SELECT data FROM stock_order_to_income WHERE period = ?',
        [period]
      );

      if (stockOrderRows.length > 0) {
        const stockData = typeof stockOrderRows[0].data === 'string' ? JSON.parse(stockOrderRows[0].data) : stockOrderRows[0].data;
        
        ['equipment', 'components', 'engineering'].forEach(category => {
          if (stockData[category] && Array.isArray(stockData[category])) {
            stockData[category].forEach(stockItem => {
              const resultItem = resultData[category].find(item => item.customer === stockItem.customer);
              if (resultItem) {
                resultItem.currentMonthIncome += Number(stockItem.currentMonthIncome || 0);
              }
            });
          }
        });
      }

      // 3. 计算累计收入（从年初到当前月份）
      for (let m = 1; m <= parseInt(month); m++) {
        const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;
        const monthPeriodDate = `${monthPeriod}-01`;
        
        // 3.1 累计当月订单转收入
        const [monthOrderRows] = await pool.execute(
          'SELECT data FROM order_to_income WHERE period = ?',
          [monthPeriodDate]
        );
        
        if (monthOrderRows.length > 0) {
          const orderData = typeof monthOrderRows[0].data === 'string' ? JSON.parse(monthOrderRows[0].data) : monthOrderRows[0].data;
          
          ['equipment', 'components', 'engineering'].forEach(category => {
            if (orderData[category] && Array.isArray(orderData[category])) {
              orderData[category].forEach(orderItem => {
                const resultItem = resultData[category].find(item => item.customer === orderItem.customer);
                if (resultItem) {
                  resultItem.accumulatedIncome += Number(orderItem.currentIncome || 0);
                }
              });
            }
          });
        }

        // 3.2 累计存量订单转收入
        const [monthStockRows] = await pool.execute(
          'SELECT data FROM stock_order_to_income WHERE period = ?',
          [monthPeriod]
        );
        
        if (monthStockRows.length > 0) {
          const stockData = typeof monthStockRows[0].data === 'string' ? JSON.parse(monthStockRows[0].data) : monthStockRows[0].data;
          
          ['equipment', 'components', 'engineering'].forEach(category => {
            if (stockData[category] && Array.isArray(stockData[category])) {
              stockData[category].forEach(stockItem => {
                const resultItem = resultData[category].find(item => item.customer === stockItem.customer);
                if (resultItem) {
                  resultItem.accumulatedIncome += Number(stockItem.currentMonthIncome || 0);
                }
              });
            }
          });
        }
      }

      // 4. 计算进度
      ['equipment', 'components', 'engineering'].forEach(category => {
        resultData[category].forEach(item => {
          if (item.yearlyPlan && item.yearlyPlan > 0) {
            const progress = (item.accumulatedIncome / item.yearlyPlan) * 100;
            item.progress = progress.toFixed(2) + '%';
          } else {
            item.progress = '/';
          }
        });
      });

    } catch (error) {
      console.error('计算订单转收入数据失败:', error);
    }

    res.json({
      success: true,
      data: resultData,
      period: periodDate,
      calculated: true,
      message: '数据基于订单转收入计算'
    });
  } catch (error) {
    console.error('获取主营业务收入分解情况数据失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 保存/更新主营业务收入分解情况数据
router.post('/', async (req, res) => {
  try {
    const { period, data } = req.body;

    // 验证输入
    if (!period || !data) {
      return res.status(400).json({ error: '期间和数据都是必需的' });
    }

    // 验证期间格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为 YYYY-MM' });
    }

    // 转换为日期格式
    const periodDate = `${period}-01`;
    
    // 将数据转换为JSON字符串
    const jsonData = typeof data === 'string' ? data : JSON.stringify(data);

    // 使用 ON DUPLICATE KEY UPDATE 语法进行插入或更新
    const [result] = await pool.execute(
      `INSERT INTO main_business_income (period, data) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE 
       data = VALUES(data), 
       updated_at = CURRENT_TIMESTAMP`,
      [periodDate, jsonData]
    );

    res.json({
      success: true,
      message: result.insertId ? '主营业务收入分解情况数据创建成功' : '主营业务收入分解情况数据更新成功',
      id: result.insertId || result.insertId,
      period: periodDate
    });
  } catch (error) {
    console.error('保存主营业务收入分解情况数据失败:', error);
    res.status(500).json({ error: '保存失败' });
  }
});

// 获取所有主营业务收入分解情况数据列表
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, period, created_at, updated_at FROM main_business_income ORDER BY period DESC'
    );

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('获取主营业务收入分解情况数据列表失败:', error);
    res.status(500).json({ error: '获取列表失败' });
  }
});

// 删除指定期间的主营业务收入分解情况数据
router.delete('/:period', async (req, res) => {
  try {
    const { period } = req.params;
    
    // 验证期间格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为 YYYY-MM' });
    }

    const periodDate = `${period}-01`;
    
    const [result] = await pool.execute(
      'DELETE FROM main_business_income WHERE period = ?',
      [periodDate]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '该期间的主营业务收入分解情况数据不存在' });
    }

    res.json({
      success: true,
      message: '主营业务收入分解情况数据删除成功'
    });
  } catch (error) {
    console.error('删除主营业务收入分解情况数据失败:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;