const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// 获取指定期间的资产负债表
router.get('/:period', async (req, res) => {
  try {
    const { period } = req.params;
    
    // 验证期间格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为 YYYY-MM' });
    }

    // 转换为日期格式 (YYYY-MM-01)
    const periodDate = `${period}-01`;
    
    const [rows] = await pool.execute(
      'SELECT * FROM balance_sheet WHERE period = ?',
      [periodDate]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '该期间的资产负债表数据不存在' });
    }

    res.json({
      success: true,
      data: rows[0].data,
      period: rows[0].period,
      updated_at: rows[0].updated_at
    });
  } catch (error) {
    console.error('获取资产负债表失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 保存/更新资产负债表
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
      `INSERT INTO balance_sheet (period, data) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE 
       data = VALUES(data), 
       updated_at = CURRENT_TIMESTAMP`,
      [periodDate, jsonData]
    );

    res.json({
      success: true,
      message: result.insertId ? '资产负债表创建成功' : '资产负债表更新成功',
      id: result.insertId,
      period: periodDate
    });
  } catch (error) {
    console.error('保存资产负债表失败:', error);
    res.status(500).json({ error: '保存失败' });
  }
});

// 获取前一个月的期末余额作为期初余额
router.get('/:period/previous-end-balance', async (req, res) => {
  try {
    const { period } = req.params;

    // 验证期间格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为 YYYY-MM' });
    }

    // 计算前一个月
    const [year, month] = period.split('-').map(Number);
    let prevYear = year;
    let prevMonth = month - 1;

    if (prevMonth === 0) {
      prevYear = year - 1;
      prevMonth = 12;
    }

    const prevPeriod = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-01`;

    const [rows] = await pool.execute(
      'SELECT data FROM balance_sheet WHERE period = ?',
      [prevPeriod]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: '前一个月的资产负债表数据不存在',
        previousPeriod: `${prevYear}-${prevMonth.toString().padStart(2, '0')}`
      });
    }

    // 解析数据并提取期末余额
    const data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;

    res.json({
      success: true,
      data: data,
      previousPeriod: `${prevYear}-${prevMonth.toString().padStart(2, '0')}`,
      message: '成功获取前一个月的期末余额'
    });
  } catch (error) {
    console.error('获取前一个月期末余额失败:', error);
    res.status(500).json({ error: '获取前一个月数据失败' });
  }
});

// 获取所有资产负债表列表
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, period, created_at, updated_at FROM balance_sheet ORDER BY period DESC'
    );

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('获取资产负债表列表失败:', error);
    res.status(500).json({ error: '获取列表失败' });
  }
});

// 删除指定期间的资产负债表
router.delete('/:period', async (req, res) => {
  try {
    const { period } = req.params;
    
    // 验证期间格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为 YYYY-MM' });
    }

    const periodDate = `${period}-01`;
    
    const [result] = await pool.execute(
      'DELETE FROM balance_sheet WHERE period = ?',
      [periodDate]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '该期间的资产负债表不存在' });
    }

    res.json({
      success: true,
      message: '资产负债表删除成功'
    });
  } catch (error) {
    console.error('删除资产负债表失败:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;