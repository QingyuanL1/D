const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取南华资产负债表数据
router.get('/balance-sheet/:period', async (req, res) => {
  try {
    const { period } = req.params;
    // 将 YYYY-MM 格式转换为 YYYY-MM-01 格式
    const formattedPeriod = period.length === 7 ? `${period}-01` : period;
    const [rows] = await pool.execute(
      'SELECT * FROM nanhua_balance_sheet WHERE period = ? ORDER BY created_at DESC LIMIT 1',
      [formattedPeriod]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: {},
        message: '暂无数据'
      });
    }

    const data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
    
    res.json({
      success: true,
      data: data,
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取南华资产负债表数据失败:', error);
    res.status(500).json({
      error: '获取数据失败'
    });
  }
});

// 获取南华现金流量表数据
router.get('/cash-flow/:period', async (req, res) => {
  try {
    const { period } = req.params;
    // 将 YYYY-MM 格式转换为 YYYY-MM-01 格式
    const formattedPeriod = period.length === 7 ? `${period}-01` : period;
    const [rows] = await pool.execute(
      'SELECT * FROM nanhua_cash_flow WHERE period = ? ORDER BY created_at DESC LIMIT 1',
      [formattedPeriod]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: {},
        message: '暂无数据'
      });
    }

    const data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
    
    res.json({
      success: true,
      data: data,
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取南华现金流量表数据失败:', error);
    res.status(500).json({
      error: '获取数据失败'
    });
  }
});

// 获取南华利润表数据
router.get('/income-statement/:period', async (req, res) => {
  try {
    const { period } = req.params;
    // 将 YYYY-MM 格式转换为 YYYY-MM-01 格式
    const formattedPeriod = period.length === 7 ? `${period}-01` : period;
    const [rows] = await pool.execute(
      'SELECT * FROM nanhua_income_statement WHERE period = ? ORDER BY created_at DESC LIMIT 1',
      [formattedPeriod]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: {},
        message: '暂无数据'
      });
    }

    const data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
    
    res.json({
      success: true,
      data: data,
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取南华利润表数据失败:', error);
    res.status(500).json({
      error: '获取数据失败'
    });
  }
});

// 保存南华资产负债表数据
router.post('/balance-sheet', async (req, res) => {
  try {
    const { period, data } = req.body;
    // 将 YYYY-MM 格式转换为 YYYY-MM-01 格式
    const formattedPeriod = period.length === 7 ? `${period}-01` : period;

    await pool.execute(
      'INSERT INTO nanhua_balance_sheet (period, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = CURRENT_TIMESTAMP',
      [formattedPeriod, JSON.stringify(data)]
    );

    res.json({
      success: true,
      message: '保存成功'
    });
  } catch (error) {
    console.error('保存南华资产负债表数据失败:', error);
    res.status(500).json({
      error: '保存数据失败'
    });
  }
});

// 保存南华现金流量表数据
router.post('/cash-flow', async (req, res) => {
  try {
    const { period, data } = req.body;
    // 将 YYYY-MM 格式转换为 YYYY-MM-01 格式
    const formattedPeriod = period.length === 7 ? `${period}-01` : period;

    await pool.execute(
      'INSERT INTO nanhua_cash_flow (period, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = CURRENT_TIMESTAMP',
      [formattedPeriod, JSON.stringify(data)]
    );

    res.json({
      success: true,
      message: '保存成功'
    });
  } catch (error) {
    console.error('保存南华现金流量表数据失败:', error);
    res.status(500).json({
      error: '保存数据失败'
    });
  }
});

// 保存南华利润表数据
router.post('/income-statement', async (req, res) => {
  try {
    const { period, data } = req.body;
    // 将 YYYY-MM 格式转换为 YYYY-MM-01 格式
    const formattedPeriod = period.length === 7 ? `${period}-01` : period;

    console.log(`保存南华利润表数据 - 原始期间: ${period}, 格式化期间: ${formattedPeriod}`);

    await pool.execute(
      'INSERT INTO nanhua_income_statement (period, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = CURRENT_TIMESTAMP',
      [formattedPeriod, JSON.stringify(data)]
    );

    res.json({
      success: true,
      message: '保存成功'
    });
  } catch (error) {
    console.error('保存南华利润表数据失败:', error);
    res.status(500).json({
      error: '保存数据失败'
    });
  }
});

module.exports = router;
