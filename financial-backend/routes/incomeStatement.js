const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const moment = require('moment');

// 计算累计值的辅助函数
async function calculateCumulativeAmounts(targetPeriod, currentData) {
  try {
    console.log('开始计算累计值，目标期间:', targetPeriod);
    
    const targetDate = moment(targetPeriod, 'YYYY-MM');
    const year = targetDate.year();
    const month = targetDate.month() + 1;
    
    console.log('目标年份:', year, '目标月份:', month);
    
    const startOfYear = `${year}-01-01`;
    const endOfTargetMonth = targetDate.format('YYYY-MM-DD');
    
    console.log('查询范围:', startOfYear, '到', endOfTargetMonth);
    
    // 查询包含当前月在内的所有数据
    const [historicalRows] = await pool.query(
      'SELECT period, data FROM income_statement WHERE period >= ? AND period <= ? ORDER BY period ASC',
      [startOfYear, endOfTargetMonth]
    );
    
    console.log('找到历史数据记录数:', historicalRows.length);
    
    const parsedCurrentData = typeof currentData === 'string' ? JSON.parse(currentData) : currentData;
    const result = {};
    
    for (const [fieldName, fieldData] of Object.entries(parsedCurrentData)) {
      const currentAmount = fieldData.current_amount || 0;
      let cumulativeAmount = 0;
      
      // 计算所有历史月份的累计值（不包括当前月）
      for (const row of historicalRows) {
        const rowPeriod = moment(row.period).format('YYYY-MM');
        if (rowPeriod < targetPeriod) {
          try {
            const historicalData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
            if (historicalData[fieldName] && historicalData[fieldName].current_amount) {
              cumulativeAmount += historicalData[fieldName].current_amount;
            }
          } catch (error) {
            console.error('解析历史数据时出错:', error);
          }
        }
      }
      
      // 加上当前月的金额
      cumulativeAmount += currentAmount;
      
      result[fieldName] = {
        current_amount: currentAmount,
        cumulative_amount: cumulativeAmount
      };
      
      console.log(`${fieldName}: 当月=${currentAmount}, 累计=${cumulativeAmount}`);
    }
    
    return { success: true, data: result };
    
  } catch (error) {
    console.error('计算累计值时出错:', error);
    return { success: false, error: error.message };
  }
}

// 重新计算指定期间数据的累计值（包括计算字段）
async function recalculateWithComputedFields(period, data) {
  try {
    console.log('开始重新计算累计值，包括计算字段，期间:', period);
    
    // 首先计算累计值
    const cumulativeResult = await calculateCumulativeAmounts(period, data);
    if (!cumulativeResult.success) {
      return cumulativeResult;
    }
    
    const result = cumulativeResult.data;
    
    // 重新计算计算字段的当期金额
    const calculateCurrentAmounts = (data) => {
      // 营业总收入 = 主营业务收入 + 其他业务收入
      if (data.main_business_revenue && data.other_business_revenue) {
        data.total_revenue = {
          current_amount: (data.main_business_revenue.current_amount || 0) + (data.other_business_revenue.current_amount || 0),
          cumulative_amount: 0
        };
      }
      
      // 营业成本 = 主营业务成本 + 其他业务成本
      if (data.main_business_cost && data.other_business_cost) {
        data.operating_cost = {
          current_amount: (data.main_business_cost.current_amount || 0) + (data.other_business_cost.current_amount || 0),
          cumulative_amount: 0
        };
      }
      
      // 营业总成本 = 营业成本 + 税金及附加 + 销售费用 + 管理费用 + 研发费用 + 财务费用
      const costComponents = ['operating_cost', 'taxes_and_surcharges', 'selling_expenses', 'administrative_expenses', 'rd_expenses', 'financial_expenses'];
      let totalCost = 0;
      costComponents.forEach(field => {
        if (data[field]) {
          totalCost += data[field].current_amount || 0;
        }
      });
      data.total_cost = {
        current_amount: totalCost,
        cumulative_amount: 0
      };
      
      // 营业利润计算
      const operatingProfit = (data.total_revenue?.current_amount || 0) - 
                             (data.total_cost?.current_amount || 0) + 
                             (data.other_income?.current_amount || 0) + 
                             (data.investment_income?.current_amount || 0) + 
                             (data.fair_value_change_income?.current_amount || 0) + 
                             (data.credit_impairment_loss?.current_amount || 0) + 
                             (data.asset_impairment_loss?.current_amount || 0) + 
                             (data.asset_disposal_income?.current_amount || 0);
      
      data.operating_profit = {
        current_amount: operatingProfit,
        cumulative_amount: 0
      };
      
      // 利润总额 = 营业利润 + 营业外收入 - 营业外支出
      const totalProfit = operatingProfit + 
                         (data.non_operating_income?.current_amount || 0) - 
                         (data.non_operating_expenses?.current_amount || 0);
      
      data.total_profit = {
        current_amount: totalProfit,
        cumulative_amount: 0
      };
      
      // 净利润 = 利润总额 - 所得税费用
      const netProfit = totalProfit - (data.income_tax_expense?.current_amount || 0);
      data.net_profit = {
        current_amount: netProfit,
        cumulative_amount: 0
      };
      
      // 综合收益总额 = 净利润 + 其他综合收益
      const totalComprehensiveIncome = netProfit + (data.other_comprehensive_income?.current_amount || 0);
      data.total_comprehensive_income = {
        current_amount: totalComprehensiveIncome,
        cumulative_amount: 0
      };
    };
    
    // 重新计算当期金额
    calculateCurrentAmounts(result);
    
    // 重新计算所有字段的累计值
    const finalResult = await calculateCumulativeAmounts(period, result);
    
    return finalResult;
    
  } catch (error) {
    console.error('重新计算累计值时出错:', error);
    return { success: false, error: error.message };
  }
}

// 计算累计值的API端点
router.post('/calculate-cumulative', async (req, res) => {
  try {
    const { period, data } = req.body;
    console.log('计算累计值请求 - 期间:', period);
    
    if (!period || !data) {
      return res.status(400).json({ error: '期间和数据不能为空' });
    }
    
    let formattedPeriod;
    if (period.length === 7) {
      formattedPeriod = period;
    } else if (period.length === 10) {
      formattedPeriod = moment(period).format('YYYY-MM');
    } else {
      return res.status(400).json({ error: '无效的期间格式' });
    }
    
    const result = await recalculateWithComputedFields(formattedPeriod, data);
    
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

// 保存利润表数据
router.post('/', async (req, res) => {
  try {
    const { period, data, autoCalculateCumulative = true } = req.body;
    console.log('保存请求 - 期间:', period, '数据类型:', typeof data, '自动计算累计:', autoCalculateCumulative);
    
    if (!period || !data) {
      return res.status(400).json({ error: '期间和数据不能为空' });
    }

    let finalData = data;
    
    if (autoCalculateCumulative) {
      console.log('启用自动计算累计值');
      const calculationResult = await recalculateWithComputedFields(period, data);
      if (calculationResult.success) {
        finalData = calculationResult.data;
        console.log('累计值计算完成');
      } else {
        console.warn('累计值计算失败，使用原始数据:', calculationResult.error);
      }
    }

    let formattedPeriod;
    if (period.length === 7) {
      formattedPeriod = `${period}-01`;
    } else {
      formattedPeriod = moment(period).format('YYYY-MM-DD');
    }
    
    console.log('格式化后的期间:', formattedPeriod);
    
    const dataJson = typeof finalData === 'string' ? finalData : JSON.stringify(finalData);

    const [existing] = await pool.query(
      'SELECT id FROM income_statement WHERE period = ?',
      [formattedPeriod]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE income_statement SET data = ?, updated_at = NOW() WHERE period = ?',
        [dataJson, formattedPeriod]
      );
      console.log('数据更新成功，期间:', formattedPeriod);
      res.json({ success: true, message: '利润表数据更新成功', action: 'updated' });
    } else {
      await pool.query(
        'INSERT INTO income_statement (period, data, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [formattedPeriod, dataJson]
      );
      console.log('数据保存成功，期间:', formattedPeriod);
      res.json({ success: true, message: '利润表数据保存成功', action: 'created' });
    }
  } catch (error) {
    console.error('保存利润表数据时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取指定年份的利润表数据（用于图表显示）- 必须放在/:period之前避免路由冲突
router.get('/annual/:year', async (req, res) => {
  try {
    const year = req.params.year;
    
    if (!/^\d{4}$/.test(year)) {
      return res.status(400).json({ error: '无效的年份格式，请使用 YYYY 格式。' });
    }
    
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const [rows] = await pool.query(
      'SELECT period, data FROM income_statement WHERE period >= ? AND period <= ? ORDER BY period ASC',
      [startDate, endDate]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '指定年份的数据不存在' });
    }

    const annualData = rows.map(row => {
      const period = moment(row.period).format('YYYY-MM');
      let parsedData;
      
      try {
        parsedData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      } catch (error) {
        console.error(`解析${period}的数据时出错:`, error);
        parsedData = {};
      }
      
      const extractedData = {
        main_business_revenue: parsedData.main_business_revenue || { current_amount: null, cumulative_amount: null },
        net_profit: parsedData.net_profit || { current_amount: null, cumulative_amount: null }
      };
      
      return {
        period,
        data: JSON.stringify(extractedData)
      };
    });

    res.json({ year, data: annualData });
  } catch (error) {
    console.error('获取全年利润表数据时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取指定期间的利润表数据
router.get('/:period', async (req, res) => {
  try {
    const period = req.params.period;
    console.log('=== 收到期间查询请求 ===');
    console.log('请求的期间:', period);
    
    let formattedPeriod;
    if (period.length === 7) {
      formattedPeriod = `${period}-01`;
    } else if (period.length === 10) {
      formattedPeriod = period;
    } else {
      return res.status(400).json({ error: '无效的期间格式' });
    }
    
    console.log('格式化后的期间:', formattedPeriod);
    
    if (!pool) {
      console.error('数据库连接池未初始化');
      return res.status(500).json({ error: '数据库连接错误' });
    }
    
    console.log('开始数据库查询...');
    const [rows] = await pool.query(
      'SELECT period, data FROM income_statement WHERE period = ?',
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
      
      // 自动计算累计值
      const targetPeriod = moment(formattedPeriod).format('YYYY-MM');
      const calculationResult = await recalculateWithComputedFields(targetPeriod, parsedData);
      
      if (calculationResult.success) {
        parsedData = calculationResult.data;
        console.log('累计值计算完成');
      } else {
        console.warn('累计值计算失败，返回原始数据:', calculationResult.error);
      }
      
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