const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取南华营业收入结构与质量数据 - 改为基于订单转收入数据计算
router.get('/:period', async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的客户列表和年度计划 (根据实际截图数据)
    const fixedData = {
      customers: [
        { customerName: '一包项目', yearlyPlan: 5355.05 },
        { customerName: '二包项目', yearlyPlan: 2889.91 },
        { customerName: '域内合作项目', yearlyPlan: 4165.14 },
        { customerName: '域外合作项目', yearlyPlan: 2550.46 },
        { customerName: '新能源项目', yearlyPlan: 3744.54 },
        { customerName: '苏州项目', yearlyPlan: 752.29 },
        { customerName: '抢修', yearlyPlan: 137.61 },
        { customerName: '运检', yearlyPlan: 1238.54 },
        { customerName: '自建项目', yearlyPlan: 0 }
      ]
    };
    
    // 计算当期收入 = 当月订单转收入 + 存量订单转收入
    const [year, month] = period.split('-');
    
    // 合并数据并计算当期收入
    const result = {
      customers: await Promise.all(fixedData.customers.map(async (item) => {
        let currentIncome = 0;
        
        // 1. 获取当月订单转收入
        const [orderRows] = await pool.execute(
          'SELECT current_amount FROM nanhua_order_to_income WHERE period = ? AND customer_name = ?',
          [period, item.customerName]
        );
        
        if (orderRows.length > 0) {
          currentIncome += parseFloat(orderRows[0].current_amount) || 0;
        }
        
        // 2. 获取存量订单转收入
        const [stockRows] = await pool.execute(
          'SELECT current_amount FROM nanhua_stock_order_to_income WHERE period = ? AND customer_name = ?',
          [period, item.customerName]
        );
        
        if (stockRows.length > 0) {
          currentIncome += parseFloat(stockRows[0].current_amount) || 0;
        }
        
        // 3. 计算累计收入（从年初到当前月份）
        let accumulatedIncome = 0;
        
        for (let m = 1; m <= parseInt(month); m++) {
          const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;
          
          // 累计当月订单转收入
          const [monthOrderRows] = await pool.execute(
            'SELECT current_amount FROM nanhua_order_to_income WHERE period = ? AND customer_name = ?',
            [monthPeriod, item.customerName]
          );
          
          if (monthOrderRows.length > 0) {
            accumulatedIncome += parseFloat(monthOrderRows[0].current_amount) || 0;
          }
          
          // 累计存量订单转收入
          const [monthStockRows] = await pool.execute(
            'SELECT current_amount FROM nanhua_stock_order_to_income WHERE period = ? AND customer_name = ?',
            [monthPeriod, item.customerName]
          );
          
          if (monthStockRows.length > 0) {
            accumulatedIncome += parseFloat(monthStockRows[0].current_amount) || 0;
          }
        }
        
        // 4. 计算完成率
        const completionRate = item.yearlyPlan > 0 ? (accumulatedIncome / item.yearlyPlan * 100) : 0;
        
        return {
          customerName: item.customerName,
          yearlyPlan: item.yearlyPlan,
          current: currentIncome,
          accumulated: accumulatedIncome,
          completionRate: parseFloat(completionRate.toFixed(2))
        };
      }))
    };

    res.json({
      success: true,
      data: result,
      calculated: true,
      message: '数据基于订单转收入计算'
    });
  } catch (error) {
    console.error('获取南华营业收入结构与质量数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// 保存南华营业收入结构与质量数据
router.post('/', async (req, res) => {
  const { period, data } = req.body;
  
  if (!period || !data || !data.customers) {
    return res.status(400).json({
      success: false,
      message: '缺少必要的参数'
    });
  }

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 删除该期间的旧数据
    await connection.execute(
      'DELETE FROM nanhua_business_income WHERE period = ?',
      [period]
    );

    // 插入新数据
    for (const item of data.customers) {
      if (item.current !== 0 && item.current !== null && item.current !== undefined) {
        await connection.execute(
          `INSERT INTO nanhua_business_income 
           (period, customer_name, yearly_plan, current_amount, category) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            period,
            item.customerName,
            item.yearlyPlan || 0,
            item.current || 0,
            '工程'
          ]
        );
      }
    }

    await connection.commit();
    
    res.json({
      success: true,
      message: '数据保存成功'
    });
  } catch (error) {
    await connection.rollback();
    console.error('保存南华营业收入结构与质量数据失败:', error);
    res.status(500).json({
      success: false,
      message: '保存数据失败'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;