const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const moment = require('moment');

// 验证数据格式的辅助函数
function validateDataFormat(data) {
  try {
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    
    // 检查数据是否为对象
    if (typeof parsedData !== 'object' || parsedData === null) {
      return { valid: false, error: '数据格式无效：必须是对象格式' };
    }
    
    // 检查每个字段的格式
    for (const [fieldName, fieldData] of Object.entries(parsedData)) {
      if (typeof fieldData !== 'object' || fieldData === null) {
        return { valid: false, error: `字段 ${fieldName} 的数据格式无效` };
      }
      
      // 检查必需的字段
      if (!fieldData.hasOwnProperty('current_amount')) {
        return { valid: false, error: `字段 ${fieldName} 缺少必需的属性：current_amount` };
      }
      
      // 检查数据类型
      if (fieldData.current_amount !== null && typeof fieldData.current_amount !== 'number') {
        return { valid: false, error: `字段 ${fieldName} 的 current_amount 必须是数字或null` };
      }
      
      // 检查累计值字段（如果存在）
      if (fieldData.hasOwnProperty('year_amount') || fieldData.hasOwnProperty('cumulative_amount')) {
        const cumulativeField = fieldData.year_amount !== undefined ? 'year_amount' : 'cumulative_amount';
        if (fieldData[cumulativeField] !== null && typeof fieldData[cumulativeField] !== 'number') {
          return { valid: false, error: `字段 ${fieldName} 的 ${cumulativeField} 必须是数字或null` };
        }
      }
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: '数据解析错误：' + error.message };
  }
}

// 计算累计值的辅助函数
async function calculateCumulativeAmounts(targetPeriod, currentData) {
  try {
    console.log('开始计算上海南华兰陵利润表累计值，目标期间:', targetPeriod);
    
    // 解析目标期间
    const targetDate = moment(targetPeriod, 'YYYY-MM');
    const year = targetDate.year();
    
    console.log('目标年份:', year);
    
    // 获取同年度之前所有月份的数据（包括目标月份之前的）
    const startOfYear = `${year}-01-01`;
    const endOfTargetMonth = targetDate.format('YYYY-MM-DD');
    
    console.log('查询范围:', startOfYear, '到', endOfTargetMonth);
    
    const [historicalRows] = await pool.query(
      'SELECT period, data FROM shanghai_nanhua_lanling_income_statement WHERE period >= ? AND period < ? ORDER BY period ASC',
      [startOfYear, endOfTargetMonth]
    );
    
    console.log('找到历史数据记录数:', historicalRows.length);
    
    // 解析当前数据
    const parsedCurrentData = typeof currentData === 'string' ? JSON.parse(currentData) : currentData;
    const result = {};
    
    // 为每个字段计算累计值
    for (const [fieldName, fieldData] of Object.entries(parsedCurrentData)) {
      const currentAmount = fieldData.current_amount || 0;
      let cumulativeAmount = currentAmount;
      
      // 累加历史数据
      for (const row of historicalRows) {
        try {
          const historicalData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          if (historicalData[fieldName] && historicalData[fieldName].current_amount) {
            cumulativeAmount += historicalData[fieldName].current_amount;
          }
        } catch (error) {
          console.error('解析历史数据时出错:', error);
        }
      }
      
      result[fieldName] = {
        current_amount: currentAmount,
        cumulative_amount: cumulativeAmount
      };
      
      console.log(`${fieldName}: 当期=${currentAmount}, 累计=${cumulativeAmount}`);
    }
    
    return { success: true, data: result };
    
  } catch (error) {
    console.error('计算累计值时出错:', error);
    return { success: false, error: error.message };
  }
}

// 新增：计算累计值的API端点
router.post('/calculate-cumulative', async (req, res) => {
  try {
    const { period, data } = req.body;
    console.log('计算上海南华兰陵利润表累计值请求 - 期间:', period);
    
    if (!period || !data) {
      return res.status(400).json({ error: '期间和数据不能为空' });
    }
    
    // 处理期间格式
    let formattedPeriod;
    if (period.length === 7) { // YYYY-MM 格式
      formattedPeriod = period;
    } else if (period.length === 10) { // YYYY-MM-DD 格式
      formattedPeriod = moment(period).format('YYYY-MM');
    } else {
      return res.status(400).json({ error: '无效的期间格式' });
    }
    
    const result = await calculateCumulativeAmounts(formattedPeriod, data);
    
    if (result.success) {
      res.json({ 
        success: true, 
        data: result.data,
        period: formattedPeriod,
        message: '累计值计算成功'
      });
    } else {
      res.status(500).json({ error: '计算累计值失败: ' + result.error });
    }
    
  } catch (error) {
    console.error('计算累计值API错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 保存上海南华兰陵实业有限公司利润表数据
router.post('/', async (req, res) => {
  try {
    const { period, data, autoCalculateCumulative = false } = req.body;
    console.log('保存请求 - 期间:', period, '数据类型:', typeof data, '自动计算累计:', autoCalculateCumulative);
    
    if (!period || !data) {
      return res.status(400).json({ error: '期间和数据不能为空' });
    }

    let finalData = data;
    
    // 如果启用了自动计算累计值
    if (autoCalculateCumulative) {
      console.log('启用自动计算累计值');
      const calculationResult = await calculateCumulativeAmounts(period, data);
      if (calculationResult.success) {
        finalData = calculationResult.data;
        console.log('累计值计算完成');
      } else {
        console.warn('累计值计算失败，使用原始数据:', calculationResult.error);
      }
    }

    // 验证数据格式
    const validation = validateDataFormat(finalData);
    if (!validation.valid) {
      console.error('数据格式验证失败:', validation.error);
      return res.status(400).json({ error: '数据格式错误：' + validation.error });
    }

    // 处理期间格式，支持 YYYY-MM 或 YYYY-MM-DD
    let formattedPeriod;
    if (period.length === 7) { // YYYY-MM 格式
      formattedPeriod = `${period}-01`; // 转换为当月第一天
    } else {
      formattedPeriod = moment(period).format('YYYY-MM-DD');
    }
    
    console.log('格式化后的期间:', formattedPeriod);
    
    // 将数据转换为JSON字符串存储
    const dataJson = typeof finalData === 'string' ? finalData : JSON.stringify(finalData);

    // 检查是否已存在该期间的数据
    const [existing] = await pool.query(
      'SELECT id FROM shanghai_nanhua_lanling_income_statement WHERE period = ?',
      [formattedPeriod]
    );

    if (existing.length > 0) {
      // 更新现有数据
      await pool.query(
        'UPDATE shanghai_nanhua_lanling_income_statement SET data = ?, updated_at = NOW() WHERE period = ?',
        [dataJson, formattedPeriod]
      );
      console.log('数据更新成功，期间:', formattedPeriod);
      res.json({ 
        success: true, 
        message: '上海南华兰陵实业利润表数据更新成功', 
        action: 'updated',
        calculatedData: autoCalculateCumulative ? finalData : undefined
      });
    } else {
      // 插入新数据
      await pool.query(
        'INSERT INTO shanghai_nanhua_lanling_income_statement (period, data, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [formattedPeriod, dataJson]
      );
      console.log('数据保存成功，期间:', formattedPeriod);
      res.json({ 
        success: true, 
        message: '上海南华兰陵实业利润表数据保存成功', 
        action: 'created',
        calculatedData: autoCalculateCumulative ? finalData : undefined
      });
    }
  } catch (error) {
    console.error('保存上海南华兰陵实业利润表数据时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取指定年份的上海南华兰陵实业利润表数据（用于图表显示）- 必须放在/:period之前避免路由冲突
router.get('/annual/:year', async (req, res) => {
  try {
    const year = req.params.year;
    
    // 验证年份格式
    if (!/^\d{4}$/.test(year)) {
      return res.status(400).json({ error: '无效的年份格式，请使用 YYYY 格式。' });
    }
    
    // 构造查询日期范围 - 整年
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const [rows] = await pool.query(
      'SELECT period, data FROM shanghai_nanhua_lanling_income_statement WHERE period >= ? AND period <= ? ORDER BY period ASC',
      [startDate, endDate]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '指定年份的数据不存在' });
    }

    // 处理查询结果，提取所需数据
    const annualData = rows.map(row => {
      const period = moment(row.period).format('YYYY-MM');
      let parsedData;
      
      try {
        parsedData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      } catch (error) {
        console.error(`解析${period}的数据时出错:`, error);
        parsedData = {};
      }
      
      // 只提取主营业务收入和净利润
      const extractedData = {
        main_business_revenue: parsedData.main_business_revenue || { current_amount: null, year_amount: null },
        net_profit: parsedData.net_profit || { current_amount: null, year_amount: null }
      };
      
      // 转换为JSON字符串
      return {
        period,
        data: JSON.stringify(extractedData)
      };
    });

    res.json({ year, data: annualData });
  } catch (error) {
    console.error('获取全年上海南华兰陵实业利润表数据时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取指定期间的上海南华兰陵实业利润表数据
router.get('/:period', async (req, res) => {
  try {
    const period = req.params.period;
    console.log('=== 收到期间查询请求 ===');
    console.log('请求的期间:', period);
    
    // 处理期间格式，支持 YYYY-MM 或 YYYY-MM-DD
    let formattedPeriod;
    if (period.length === 7) { // YYYY-MM 格式
      formattedPeriod = `${period}-01`; // 转换为当月第一天
    } else if (period.length === 10) { // YYYY-MM-DD 格式
      formattedPeriod = period;
    } else {
      return res.status(400).json({ error: '无效的期间格式' });
    }
    
    console.log('格式化后的期间:', formattedPeriod);
    
    // 检查数据库连接
    if (!pool) {
      console.error('数据库连接池未初始化');
      return res.status(500).json({ error: '数据库连接错误' });
    }
    
    console.log('开始数据库查询...');
    const [rows] = await pool.query(
      'SELECT period, data FROM shanghai_nanhua_lanling_income_statement WHERE period = ?',
      [formattedPeriod]
    );
    console.log('查询结果行数:', rows.length);

    if (rows.length === 0) {
      console.log('未找到数据，期间:', formattedPeriod);
      return res.status(404).json({ error: '指定期间的数据不存在' });
    }

    const row = rows[0];
    console.log('找到数据，原始数据类型:', typeof row.data);
    let parsedData;
    
    try {
      parsedData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      console.log('数据解析成功');
    } catch (parseError) {
      console.error('解析数据时出错:', parseError);
      parsedData = {};
    }

    console.log('=== 返回成功响应 ===');
    res.json({ 
      success: true, 
      data: parsedData,
      period: formattedPeriod
    });
  } catch (error) {
    console.error('=== 发生未捕获错误 ===');
    console.error('错误详情:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ 
      error: '服务器内部错误', 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 