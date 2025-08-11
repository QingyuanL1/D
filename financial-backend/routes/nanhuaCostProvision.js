const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取南华成本计提情况数据
router.get('/:period', async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的客户列表
    const fixedData = {
      customers: [
        { customerName: '一包项目', yearBeginBalance: 1164.76, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '二包项目', yearBeginBalance: 426.90, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '域内合作项目', yearBeginBalance: 474.41, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '域外合作项目', yearBeginBalance: 661.56, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '新能源项目', yearBeginBalance: 730.12, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '苏州项目', yearBeginBalance: 93.99, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '自接项目', yearBeginBalance: 242.66, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '其他', yearBeginBalance: 19.50, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 }
      ]
    };
    
    // 从数据库获取数据
    const [rows] = await pool.execute(
      'SELECT customer_name, year_begin_balance, monthly_increase, monthly_write_off, yearly_accumulated, provision_rate FROM nanhua_cost_provision WHERE period = ?',
      [period]
    );

    // 合并数据
    const result = {
      customers: fixedData.customers.map(item => {
        const dbItem = rows.find(row => row.customer_name === item.customerName);
        return {
          customerName: item.customerName,
          yearBeginBalance: item.yearBeginBalance,
          monthlyIncrease: dbItem ? parseFloat(dbItem.monthly_increase) : 0,
          monthlyWriteOff: dbItem ? parseFloat(dbItem.monthly_write_off) : 0,
          yearlyAccumulated: dbItem ? parseFloat(dbItem.yearly_accumulated) : 0,
          provisionRate: dbItem ? parseFloat(dbItem.provision_rate) : 0
        };
      })
    };

    res.json({
      success: true,
      data: result,
      period: period
    });
  } catch (error) {
    console.error('获取南华成本计提情况数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 获取全年累计数据的优化接口
router.get('/accumulated/:period', async (req, res) => {
  const { period } = req.params;
  
  try {
    const [year, month] = period.split('-');
    const currentMonth = parseInt(month);
    
    // 固定的客户列表
    const fixedData = {
      customers: [
        { customerName: '一包项目', yearBeginBalance: 1164.76, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '二包项目', yearBeginBalance: 426.90, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '域内合作项目', yearBeginBalance: 474.41, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '域外合作项目', yearBeginBalance: 661.56, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '新能源项目', yearBeginBalance: 730.12, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '苏州项目', yearBeginBalance: 93.99, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '自接项目', yearBeginBalance: 242.66, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '其他', yearBeginBalance: 19.50, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 }
      ]
    };

    // 查询从年初到当前月份的所有月份累计数据（正确的累计逻辑）
    const [accumulatedRows] = await pool.execute(
      `SELECT customer_name, 
              SUM(monthly_increase) as cumulative_increase, 
              SUM(monthly_write_off) as cumulative_write_off 
       FROM nanhua_cost_provision 
       WHERE period LIKE ? AND period <= ?
       GROUP BY customer_name`,
      [`${year}-%`, period]
    );

    // 获取当期数据
    const [currentRows] = await pool.execute(
      'SELECT customer_name, monthly_increase, monthly_write_off FROM nanhua_cost_provision WHERE period = ?',
      [period]
    );

    // 合并数据
    const result = {
      customers: fixedData.customers.map(item => {
        const accumulatedItem = accumulatedRows.find(row => row.customer_name === item.customerName);
        const currentItem = currentRows.find(row => row.customer_name === item.customerName);
        
        // 累计新增 = 从年初到当前月份所有月份的新增之和
        const cumulativeIncrease = accumulatedItem ? parseFloat(accumulatedItem.cumulative_increase) : 0;
        // 累计冲销 = 从年初到当前月份所有月份的冲销之和
        const cumulativeWriteOff = accumulatedItem ? parseFloat(accumulatedItem.cumulative_write_off) : 0;
        // 本年累计 = 年初余额 + 累计新增 - 累计冲销
        const yearlyAccumulated = item.yearBeginBalance + cumulativeIncrease - cumulativeWriteOff;
        
        return {
          customerName: item.customerName,
          yearBeginBalance: item.yearBeginBalance,
          monthlyIncrease: currentItem ? parseFloat(currentItem.monthly_increase) : 0,
          monthlyWriteOff: currentItem ? parseFloat(currentItem.monthly_write_off) : 0,
          yearlyAccumulated: yearlyAccumulated,
          provisionRate: item.yearBeginBalance > 0 ? (yearlyAccumulated / item.yearBeginBalance) * 100 : 0
        };
      })
    };

    res.json({
      success: true,
      data: result,
      period: period
    });
  } catch (error) {
    console.error('获取南华成本计提累计数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 保存南华成本计提情况数据
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
      await connection.execute('DELETE FROM nanhua_cost_provision WHERE period = ?', [period]);
      
      // 准备批量插入数据
      const insertQuery = `
        INSERT INTO nanhua_cost_provision 
        (period, customer_name, year_begin_balance, monthly_increase, monthly_write_off, yearly_accumulated, provision_rate) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      // 处理客户数据
      for (const item of data.customers) {
        await connection.execute(insertQuery, [
          period,
          item.customerName,
          item.yearBeginBalance || 0,
          item.monthlyIncrease || 0,
          item.monthlyWriteOff || 0,
          item.yearlyAccumulated || 0,
          item.provisionRate || 0
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
    console.error('保存南华成本计提情况数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

module.exports = router;
