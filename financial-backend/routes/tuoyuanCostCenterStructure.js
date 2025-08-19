const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取拓源成本中心结构数据
router.get('/:period', async (req, res) => {
  try {
    const { period } = req.params;
    
    // 获取当期数据
    const [currentRows] = await pool.execute(
      'SELECT customer_name, category, yearly_planned_income, marketing, management, finance, production FROM tuoyuan_cost_center_structure WHERE period = ?',
      [period]
    );

    // 计算累计收入（从年初到当前月份的所有当期收入总和）
    const [year, month] = period.split('-');
    const currentMonth = parseInt(month);
    
    // 构建从年初到当前月份的期间条件
    const periodConditions = [];
    const periodParams = [];
    for (let m = 1; m <= currentMonth; m++) {
      const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;
      periodConditions.push('period = ?');
      periodParams.push(monthPeriod);
    }
    
    const [accumulatedRows] = await pool.execute(
      `SELECT customer_name, category, SUM(marketing) as total_marketing, SUM(management) as total_management, SUM(finance) as total_finance, SUM(production) as total_production FROM tuoyuan_cost_center_structure WHERE (${periodConditions.join(' OR ')}) GROUP BY customer_name, category`,
      periodParams
    );

    // 创建累计数据映射
    const accumulatedMap = {};
    accumulatedRows.forEach(row => {
      const key = `${row.customer_name}_${row.category}`;
      accumulatedMap[key] = {
        marketing: parseFloat(row.total_marketing) || 0,
        management: parseFloat(row.total_management) || 0,
        finance: parseFloat(row.total_finance) || 0,
        production: parseFloat(row.total_production) || 0
      };
    });

    // 定义拓源的客户结构 - 根据新的需求更新
    const tuoyuanCustomers = {
      equipmentData: [
        { name: '电业项目', yearlyPlannedIncome: 0 },
        { name: '用户设备', yearlyPlannedIncome: 0 },
        { name: '贸易', yearlyPlannedIncome: 0 },
        { name: '代理设备', yearlyPlannedIncome: 0 }
      ],
      otherData: [
        { name: '代理工程', yearlyPlannedIncome: 0 },
        { name: '代理设计', yearlyPlannedIncome: 0 }
      ]
    };

    // 创建当期数据映射
    const currentMap = {};
    currentRows.forEach(row => {
      const key = `${row.customer_name}_${row.category}`;
      currentMap[key] = {
        yearlyPlannedIncome: parseFloat(row.yearly_planned_income) || 0,
        marketing: parseFloat(row.marketing) || 0,
        management: parseFloat(row.management) || 0,
        finance: parseFloat(row.finance) || 0,
        production: parseFloat(row.production) || 0
      };
    });

    // 构建响应数据
    const result = {
      equipmentData: [],
      otherData: []
    };

    // 处理设备板块数据
    tuoyuanCustomers.equipmentData.forEach(customer => {
      const key = `${customer.name}_equipmentData`;
      const currentData = currentMap[key] || { yearlyPlannedIncome: customer.yearlyPlannedIncome, marketing: 0, management: 0, finance: 0, production: 0 };
      const accumulatedData = accumulatedMap[key] || { marketing: 0, management: 0, finance: 0, production: 0 };

      const currentIncome = currentData.marketing + currentData.management + currentData.finance + currentData.production;
      const accumulatedIncome = accumulatedData.marketing + accumulatedData.management + accumulatedData.finance + accumulatedData.production;
      const percentage = accumulatedIncome > 0 ? ((currentIncome / accumulatedIncome) * 100) : 0;

      result.equipmentData.push({
        customerType: customer.name,
        cumulativeIncome: accumulatedIncome,
        currentMonthIncome: currentIncome,
        marketing: currentData.marketing,
        management: currentData.management,
        finance: currentData.finance,
        production: currentData.production,
        percentage: parseFloat(percentage.toFixed(2))
      });
    });

    // 处理其他板块数据
    tuoyuanCustomers.otherData.forEach(customer => {
      const key = `${customer.name}_otherData`;
      const currentData = currentMap[key] || { yearlyPlannedIncome: customer.yearlyPlannedIncome, marketing: 0, management: 0, finance: 0, production: 0 };
      const accumulatedData = accumulatedMap[key] || { marketing: 0, management: 0, finance: 0, production: 0 };

      const currentIncome = currentData.marketing + currentData.management + currentData.finance + currentData.production;
      const accumulatedIncome = accumulatedData.marketing + accumulatedData.management + accumulatedData.finance + accumulatedData.production;
      const percentage = accumulatedIncome > 0 ? ((currentIncome / accumulatedIncome) * 100) : 0;

      result.otherData.push({
        customerType: customer.name,
        cumulativeIncome: accumulatedIncome,
        currentMonthIncome: currentIncome,
        marketing: currentData.marketing,
        management: currentData.management,
        finance: currentData.finance,
        production: currentData.production,
        percentage: parseFloat(percentage.toFixed(2))
      });
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('获取拓源成本中心结构数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败',
      error: error.message
    });
  }
});

// 保存拓源成本中心结构数据
router.post('/', async (req, res) => {
  try {
    const { period, data } = req.body;

    if (!period || !data) {
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
      await connection.execute(
        'DELETE FROM tuoyuan_cost_center_structure WHERE period = ?',
        [period]
      );

      // 插入设备板块数据
      if (data.equipmentData && data.equipmentData.length > 0) {
        for (const item of data.equipmentData) {
          await connection.execute(
            'INSERT INTO tuoyuan_cost_center_structure (period, customer_name, category, yearly_planned_income, marketing, management, finance, production) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              period,
              item.customerType,
              'equipmentData',
              0, // yearly_planned_income 暂时设为0，因为新结构中不需要这个字段
              item.marketing || 0,
              item.management || 0,
              item.finance || 0,
              item.production || 0
            ]
          );
        }
      }

      // 插入其他板块数据
      if (data.otherData && data.otherData.length > 0) {
        for (const item of data.otherData) {
          await connection.execute(
            'INSERT INTO tuoyuan_cost_center_structure (period, customer_name, category, yearly_planned_income, marketing, management, finance, production) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              period,
              item.customerType,
              'otherData',
              0, // yearly_planned_income 暂时设为0，因为新结构中不需要这个字段
              item.marketing || 0,
              item.management || 0,
              item.finance || 0,
              item.production || 0
            ]
          );
        }
      }

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: '数据保存成功'
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('保存拓源成本中心结构数据失败:', error);
    res.status(500).json({
      success: false,
      message: '保存数据失败',
      error: error.message
    });
  }
});

module.exports = router;
