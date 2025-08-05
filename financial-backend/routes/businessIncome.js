const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// 获取指定期间的营业收入结构与质量数据
router.get('/:period', async (req, res) => {
  try {
    const { period } = req.params;

    // 验证期间格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为 YYYY-MM' });
    }

    // 计算主营业务和非主营业务的当期和累计收入
    const [year, month] = period.split('-');

    // 1. 计算主营业务收入
    let mainBusinessCurrentPeriod = 0;
    let mainBusinessCumulative = 0;

    try {
      // 获取主营业务当期收入
      const mainPeriodDate = `${period}-01`;
      const [mainCurrentRows] = await pool.execute(
        'SELECT data FROM main_business_income WHERE period = ?',
        [mainPeriodDate]
      );

      if (mainCurrentRows.length > 0) {
        const data = typeof mainCurrentRows[0].data === 'string' ? JSON.parse(mainCurrentRows[0].data) : mainCurrentRows[0].data;
        ['equipment', 'components', 'engineering'].forEach(category => {
          if (data[category] && Array.isArray(data[category])) {
            data[category].forEach(item => {
              mainBusinessCurrentPeriod += Number(item.currentMonthIncome || 0);
            });
          }
        });
      }

      // 获取主营业务累计收入（从年初到当前期间）
      const [mainCumulativeRows] = await pool.execute(
        'SELECT data FROM main_business_income WHERE period >= ? AND period <= ? ORDER BY period',
        [`${year}-01-01`, mainPeriodDate]
      );

      mainCumulativeRows.forEach(row => {
        try {
          const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          ['equipment', 'components', 'engineering'].forEach(category => {
            if (data[category] && Array.isArray(data[category])) {
              data[category].forEach(item => {
                mainBusinessCumulative += Number(item.currentMonthIncome || 0);
              });
            }
          });
        } catch (e) {
          console.error('解析主营业务数据失败:', e);
        }
      });
    } catch (error) {
      console.error('获取主营业务数据失败:', error);
    }

    // 2. 计算非主营业务收入
    let nonMainBusinessCurrentPeriod = 0;
    let nonMainBusinessCumulative = 0;

    try {
      // 获取非主营业务当期收入
      const [nonMainCurrentRows] = await pool.execute(
        'SELECT data FROM non_main_business WHERE period = ?',
        [period]
      );

      if (nonMainCurrentRows.length > 0) {
        const data = typeof nonMainCurrentRows[0].data === 'string' ? JSON.parse(nonMainCurrentRows[0].data) : nonMainCurrentRows[0].data;
        if (Array.isArray(data)) {
          data.forEach(item => {
            nonMainBusinessCurrentPeriod += Number(item.currentPeriod || 0);
          });
        }
      }

      // 获取非主营业务累计收入（从年初到当前期间）
      const [nonMainCumulativeRows] = await pool.execute(
        'SELECT data FROM non_main_business WHERE period >= ? AND period <= ? ORDER BY period',
        [`${year}-01`, period]
      );

      nonMainCumulativeRows.forEach(row => {
        try {
          const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          if (Array.isArray(data)) {
            data.forEach(item => {
              nonMainBusinessCumulative += Number(item.currentPeriod || 0);
            });
          }
        } catch (e) {
          console.error('解析非主营业务数据失败:', e);
        }
      });
    } catch (error) {
      console.error('获取非主营业务数据失败:', error);
    }

    // 3. 获取预算数据
    let mainBusinessYearlyPlan = 0;
    let nonMainBusinessYearlyPlan = 0;

    try {
      const [budgetRows] = await pool.execute(
        'SELECT category, customer, yearly_budget FROM budget_planning WHERE table_key = ? AND period = ?',
        ['business_income_structure_quality', year]
      );

      budgetRows.forEach(row => {
        if (row.customer === '主营业务' || row.category === '主营业务') {
          mainBusinessYearlyPlan = parseFloat(row.yearly_budget) || 0;
        } else if (row.customer === '非主营业务' || row.category === '非主营业务') {
          nonMainBusinessYearlyPlan = parseFloat(row.yearly_budget) || 0;
        }
      });
    } catch (budgetError) {
      console.error('获取预算数据失败:', budgetError);
    }

    // 4. 构建返回数据
    const responseData = [
      {
        id: 1,
        category: '主营业务',
        yearlyPlan: mainBusinessYearlyPlan,
        currentMonthIncome: mainBusinessCurrentPeriod,
        accumulatedIncome: mainBusinessCumulative
      },
      {
        id: 2,
        category: '非主营业务',
        yearlyPlan: nonMainBusinessYearlyPlan,
        currentMonthIncome: nonMainBusinessCurrentPeriod,
        accumulatedIncome: nonMainBusinessCumulative
      }
    ];

    res.json({
      success: true,
      data: responseData,
      period: period,
      calculated: true
    });
  } catch (error) {
    console.error('获取营业收入结构与质量数据失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 保存/更新营业收入结构与质量数据
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
      `INSERT INTO business_income_structure (period, data) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE 
       data = VALUES(data), 
       updated_at = CURRENT_TIMESTAMP`,
      [periodDate, jsonData]
    );

    res.json({
      success: true,
      message: result.insertId ? '营业收入结构与质量数据创建成功' : '营业收入结构与质量数据更新成功',
      id: result.insertId || result.insertId,
      period: periodDate
    });
  } catch (error) {
    console.error('保存营业收入结构与质量数据失败:', error);
    res.status(500).json({ error: '保存失败' });
  }
});

// 获取所有营业收入结构与质量数据列表
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, period, created_at, updated_at FROM business_income_structure ORDER BY period DESC'
    );

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('获取营业收入结构与质量数据列表失败:', error);
    res.status(500).json({ error: '获取列表失败' });
  }
});

// 删除指定期间的营业收入结构与质量数据
router.delete('/:period', async (req, res) => {
  try {
    const { period } = req.params;
    
    // 验证期间格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为 YYYY-MM' });
    }

    const periodDate = `${period}-01`;
    
    const [result] = await pool.execute(
      'DELETE FROM business_income_structure WHERE period = ?',
      [periodDate]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '该期间的营业收入结构与质量数据不存在' });
    }

    res.json({
      success: true,
      message: '营业收入结构与质量数据删除成功'
    });
  } catch (error) {
    console.error('删除营业收入结构与质量数据失败:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;