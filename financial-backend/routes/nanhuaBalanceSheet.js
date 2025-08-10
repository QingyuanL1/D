const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// 数据库连接池
const pool = mysql.createPool({
  host: '47.111.95.19',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'finance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 保存南华兰陵资产负债表数据
router.post('/', async (req, res) => {
  try {
    const { period, data, remarks, suggestions } = req.body;
    const userId = req.user?.id || 1; // 临时使用用户ID 1
    
    console.log('收到南华兰陵资产负债表保存请求:', { period, userId });
    
    // 验证必填字段
    if (!period || !data) {
      return res.status(400).json({
        success: false,
        error: '期间和数据都是必填项'
      });
    }
    
    // 验证期间格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({
        success: false,
        error: '期间格式错误，应为YYYY-MM格式'
      });
    }
    
    // 从数据中提取各部分
    const extractItems = (items, defaultValue = null) => {
      if (!items || !Array.isArray(items)) return [];
      return items.map(item => ({
        name: item.name || '',
        endBalance: item.endBalance || defaultValue,
        beginBalance: item.beginBalance || defaultValue,
        lineNumber: item.lineNumber || null
      }));
    };
    
    const extractTotal = (category, totalKey) => {
      let currentValue = 0;
      let cumulativeValue = 0;

      if (data.assets && data.assets[category]) {
        // 计算期末余额合计
        currentValue = data.assets[category].reduce((sum, item) => sum + (item.endBalance || 0), 0);

        // 计算期初余额合计
        cumulativeValue = data.assets[category].reduce((sum, item) => sum + (item.beginBalance || 0), 0);
      }

      return { current: currentValue, cumulative: cumulativeValue };
    };
    
    // 准备数据
    const saveData = {
      period,
      company_name: data.companyInfo?.name || '上海南华兰陵实业有限公司',
      unit: data.companyInfo?.unit || '元',
      
      // 流动资产
      current_assets: JSON.stringify(extractItems(data.assets?.current)),
      noncurrent_longterm: JSON.stringify(extractItems(data.assets?.nonCurrentLongTerm)),
      
      // 长期投资
      longterm_investment: JSON.stringify(extractItems(data.assets?.longTermInvestment)),
      
      // 固定资产
      fixed_assets: JSON.stringify(extractItems(data.assets?.fixedAssets)),
      
      // 无形资产
      intangible_assets: JSON.stringify(extractItems(data.assets?.intangibleAssets)),
      
      // 递延税款借项
      deferred_tax_assets: JSON.stringify(extractItems(data.assets?.deferredTaxAssets)),
      
      // 流动负债
      current_liabilities: JSON.stringify(extractItems(data.liabilities?.current)),
      
      // 长期负债
      longterm_liabilities: JSON.stringify(extractItems(data.liabilities?.longTermLiabilities)),
      
      // 递延税款贷项
      deferred_tax_liabilities: JSON.stringify(extractItems(data.liabilities?.deferredTaxLiabilities)),
      
      // 所有者权益
      equity_items: JSON.stringify(extractItems(data.equity?.items)),
      
      // 备注和建议
      remarks: remarks || null,
      suggestions: suggestions || null,
      
      // 审计字段
      created_by: userId,
      updated_by: userId
    };
    
    // 计算各种合计值（期末余额）
    const calculateEndBalanceTotal = (items) => {
      if (!items || !Array.isArray(items)) return 0;
      return items.reduce((sum, item) => sum + (item.endBalance || 0), 0);
    };

    // 计算各种合计值（期初余额）
    const calculateBeginBalanceTotal = (items) => {
      if (!items || !Array.isArray(items)) return 0;
      return items.reduce((sum, item) => sum + (item.beginBalance || 0), 0);
    };
    
    // 流动资产合计
    const currentAssetsEndTotal = calculateEndBalanceTotal(data.assets?.current) +
                                 calculateEndBalanceTotal(data.assets?.nonCurrentLongTerm);
    const currentAssetsBeginTotal = calculateBeginBalanceTotal(data.assets?.current) +
                                   calculateBeginBalanceTotal(data.assets?.nonCurrentLongTerm);
    saveData.current_assets_total_current = currentAssetsEndTotal;
    saveData.current_assets_total_cumulative = currentAssetsBeginTotal;

    // 固定资产合计
    const fixedAssetsEndTotal = calculateEndBalanceTotal(data.assets?.fixedAssets);
    const fixedAssetsBeginTotal = calculateBeginBalanceTotal(data.assets?.fixedAssets);
    saveData.fixed_assets_total_current = fixedAssetsEndTotal;
    saveData.fixed_assets_total_cumulative = fixedAssetsBeginTotal;

    // 无形资产合计
    const intangibleAssetsEndTotal = calculateEndBalanceTotal(data.assets?.intangibleAssets);
    const intangibleAssetsBeginTotal = calculateBeginBalanceTotal(data.assets?.intangibleAssets);
    saveData.intangible_assets_total_current = intangibleAssetsEndTotal;
    saveData.intangible_assets_total_cumulative = intangibleAssetsBeginTotal;

    // 资产总计
    const assetsEndTotal = currentAssetsEndTotal + fixedAssetsEndTotal + intangibleAssetsEndTotal +
                          calculateEndBalanceTotal(data.assets?.longTermInvestment) +
                          calculateEndBalanceTotal(data.assets?.deferredTaxAssets);
    const assetsBeginTotal = currentAssetsBeginTotal + fixedAssetsBeginTotal + intangibleAssetsBeginTotal +
                            calculateBeginBalanceTotal(data.assets?.longTermInvestment) +
                            calculateBeginBalanceTotal(data.assets?.deferredTaxAssets);
    saveData.assets_total_current = assetsEndTotal;
    saveData.assets_total_cumulative = assetsBeginTotal;

    // 流动负债合计
    const currentLiabilitiesEndTotal = calculateEndBalanceTotal(data.liabilities?.current);
    const currentLiabilitiesBeginTotal = calculateBeginBalanceTotal(data.liabilities?.current);
    saveData.current_liabilities_total_current = currentLiabilitiesEndTotal;
    saveData.current_liabilities_total_cumulative = currentLiabilitiesBeginTotal;

    // 长期负债合计
    const longtermLiabilitiesEndTotal = calculateEndBalanceTotal(data.liabilities?.longTermLiabilities);
    const longtermLiabilitiesBeginTotal = calculateBeginBalanceTotal(data.liabilities?.longTermLiabilities);
    saveData.longterm_liabilities_total_current = longtermLiabilitiesEndTotal;
    saveData.longterm_liabilities_total_cumulative = longtermLiabilitiesBeginTotal;

    // 负债合计
    const liabilitiesEndTotal = currentLiabilitiesEndTotal + longtermLiabilitiesEndTotal +
                               calculateEndBalanceTotal(data.liabilities?.deferredTaxLiabilities);
    const liabilitiesBeginTotal = currentLiabilitiesBeginTotal + longtermLiabilitiesBeginTotal +
                                 calculateBeginBalanceTotal(data.liabilities?.deferredTaxLiabilities);
    saveData.liabilities_total_current = liabilitiesEndTotal;
    saveData.liabilities_total_cumulative = liabilitiesBeginTotal;
    
    // 所有者权益合计
    const equityEndTotal = calculateEndBalanceTotal(data.equity?.items);
    const equityBeginTotal = calculateBeginBalanceTotal(data.equity?.items);
    saveData.equity_total_current = equityEndTotal;
    saveData.equity_total_cumulative = equityBeginTotal;

    // 负债和所有者权益总计
    const liabilitiesEquityEndTotal = liabilitiesEndTotal + equityEndTotal;
    const liabilitiesEquityBeginTotal = liabilitiesBeginTotal + equityBeginTotal;
    saveData.liabilities_equity_total_current = liabilitiesEquityEndTotal;
    saveData.liabilities_equity_total_cumulative = liabilitiesEquityBeginTotal;
    
    // 检查是否已存在该期间的记录
    const [existingRecord] = await pool.execute(
      'SELECT id FROM nanhua_balance_sheet WHERE period = ?',
      [period]
    );
    
    if (existingRecord.length > 0) {
      // 更新现有记录
      const updateFields = Object.keys(saveData).filter(key => key !== 'created_by').map(key => `${key} = ?`).join(', ');
      const updateValues = Object.keys(saveData).filter(key => key !== 'created_by').map(key => saveData[key]);
      updateValues.push(period);
      
      await pool.execute(
        `UPDATE nanhua_balance_sheet SET ${updateFields} WHERE period = ?`,
        updateValues
      );
      
      console.log('南华兰陵资产负债表数据更新成功:', period);
    } else {
      // 插入新记录
      const insertFields = Object.keys(saveData).join(', ');
      const insertPlaceholders = Object.keys(saveData).map(() => '?').join(', ');
      const insertValues = Object.values(saveData);
      
      await pool.execute(
        `INSERT INTO nanhua_balance_sheet (${insertFields}) VALUES (${insertPlaceholders})`,
        insertValues
      );
      
      console.log('南华兰陵资产负债表数据保存成功:', period);
    }
    
    res.json({
      success: true,
      message: existingRecord.length > 0 ? '数据更新成功' : '数据保存成功',
      data: {
        period,
        assetsTotal: assetsEndTotal,
        liabilitiesEquityTotal: liabilitiesEquityEndTotal
      }
    });
    
  } catch (error) {
    console.error('保存南华兰陵资产负债表失败:', error);
    res.status(500).json({
      success: false,
      error: '保存失败: ' + error.message
    });
  }
});

// 获取南华兰陵资产负债表数据
router.get('/:period', async (req, res) => {
  try {
    const { period } = req.params;
    
    console.log('获取南华兰陵资产负债表数据:', period);
    
    // 验证期间格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({
        success: false,
        error: '期间格式错误，应为YYYY-MM格式'
      });
    }
    
    const [records] = await pool.execute(
      'SELECT * FROM nanhua_balance_sheet WHERE period = ?',
      [period]
    );
    
    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        error: '未找到该期间的数据'
      });
    }
    
    const record = records[0];
    
    // 解析JSON数据
    const parseJSON = (jsonStr) => {
      try {
        if (!jsonStr || jsonStr === null || jsonStr === 'null') {
          return [];
        }
        if (typeof jsonStr === 'string') {
          return JSON.parse(jsonStr);
        }
        if (Array.isArray(jsonStr)) {
          return jsonStr;
        }
        return [];
      } catch (e) {
        console.warn('JSON解析失败:', e, 'input:', jsonStr);
        return [];
      }
    };
    
    // 重构数据格式
    const reconstructedData = {
      companyInfo: {
        name: record.company_name,
        unit: record.unit,
        period: `${period.split('-')[0]}年${period.split('-')[1]}月28日`
      },
      assets: {
        current: parseJSON(record.current_assets),
        nonCurrentLongTerm: parseJSON(record.noncurrent_longterm),
        currentTotal: {
          lineNumber: 31,
          name: "流动资产合计",
          endBalance: record.current_assets_total_current,
          beginBalance: record.current_assets_total_cumulative
        },
        longTermInvestment: parseJSON(record.longterm_investment),
        fixedAssets: parseJSON(record.fixed_assets),
        fixedAssetsTotal: {
          lineNumber: 50,
          name: "固定资产合计",
          endBalance: record.fixed_assets_total_current,
          beginBalance: record.fixed_assets_total_cumulative
        },
        intangibleAssets: parseJSON(record.intangible_assets),
        intangibleAssetsTotal: {
          lineNumber: 60,
          name: "无形资产及其他资产合计",
          endBalance: record.intangible_assets_total_current,
          beginBalance: record.intangible_assets_total_cumulative
        },
        deferredTaxAssets: parseJSON(record.deferred_tax_assets),
        assetsTotal: {
          lineNumber: 67,
          name: "资产总计",
          endBalance: record.assets_total_current,
          beginBalance: record.assets_total_cumulative
        }
      },
      liabilities: {
        current: parseJSON(record.current_liabilities),
        currentLiabilitiesTotal: {
          lineNumber: 100,
          name: "流动负债合计",
          endBalance: record.current_liabilities_total_current,
          beginBalance: record.current_liabilities_total_cumulative
        },
        longTermLiabilities: parseJSON(record.longterm_liabilities),
        longTermLiabilitiesTotal: {
          lineNumber: 110,
          name: "长期负债合计",
          endBalance: record.longterm_liabilities_total_current,
          beginBalance: record.longterm_liabilities_total_cumulative
        },
        deferredTaxLiabilities: parseJSON(record.deferred_tax_liabilities),
        liabilitiesTotal: {
          lineNumber: 113,
          name: "负债合计",
          endBalance: record.liabilities_total_current,
          beginBalance: record.liabilities_total_cumulative
        }
      },
      equity: {
        items: parseJSON(record.equity_items),
        equityTotal: {
          lineNumber: 124,
          name: "所有者权益（或股东权益）合计",
          endBalance: record.equity_total_current,
          beginBalance: record.equity_total_cumulative
        },
        liabilitiesAndEquityTotal: {
          lineNumber: 135,
          name: "负债和所有者权益（或股东权益）总计",
          endBalance: record.liabilities_equity_total_current,
          beginBalance: record.liabilities_equity_total_cumulative
        }
      }
    };
    
    res.json({
      success: true,
      data: reconstructedData,
      remarks: record.remarks,
      suggestions: record.suggestions,
      meta: {
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        createdBy: record.created_by,
        updatedBy: record.updated_by
      }
    });
    
  } catch (error) {
    console.error('获取南华兰陵资产负债表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取数据失败: ' + error.message
    });
  }
});

// 获取南华兰陵资产负债表历史数据（用于累计计算）
router.get('/history/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    console.log('获取南华兰陵资产负债表历史数据:', year);
    
    const [records] = await pool.execute(
      'SELECT period, current_assets, noncurrent_longterm, longterm_investment, fixed_assets, intangible_assets, deferred_tax_assets, current_liabilities, longterm_liabilities, deferred_tax_liabilities, equity_items FROM nanhua_balance_sheet WHERE period LIKE ? ORDER BY period',
      [`${year}-%`]
    );
    
    const parseHistoryJSON = (jsonStr) => {
      try {
        if (!jsonStr || jsonStr === null || jsonStr === 'null') {
          return [];
        }
        if (typeof jsonStr === 'string') {
          return JSON.parse(jsonStr);
        }
        if (Array.isArray(jsonStr)) {
          return jsonStr;
        }
        return [];
      } catch (e) {
        console.warn('历史数据JSON解析失败:', e, 'input:', jsonStr);
        return [];
      }
    };
    
    res.json({
      success: true,
      data: records.map(record => ({
        period: record.period,
        assets: {
          current: parseHistoryJSON(record.current_assets),
          nonCurrentLongTerm: parseHistoryJSON(record.noncurrent_longterm),
          longTermInvestment: parseHistoryJSON(record.longterm_investment),
          fixedAssets: parseHistoryJSON(record.fixed_assets),
          intangibleAssets: parseHistoryJSON(record.intangible_assets),
          deferredTaxAssets: parseHistoryJSON(record.deferred_tax_assets)
        },
        liabilities: {
          current: parseHistoryJSON(record.current_liabilities),
          longTermLiabilities: parseHistoryJSON(record.longterm_liabilities),
          deferredTaxLiabilities: parseHistoryJSON(record.deferred_tax_liabilities)
        },
        equity: {
          items: parseHistoryJSON(record.equity_items)
        }
      }))
    });
    
  } catch (error) {
    console.error('获取南华兰陵资产负债表历史数据失败:', error);
    res.status(500).json({
      success: false,
      error: '获取历史数据失败: ' + error.message
    });
  }
});

// 删除南华兰陵资产负债表数据
router.delete('/:period', async (req, res) => {
  try {
    const { period } = req.params;
    
    console.log('删除南华兰陵资产负债表数据:', period);
    
    const [result] = await pool.execute(
      'DELETE FROM nanhua_balance_sheet WHERE period = ?',
      [period]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: '未找到该期间的数据'
      });
    }
    
    res.json({
      success: true,
      message: '数据删除成功'
    });
    
  } catch (error) {
    console.error('删除南华兰陵资产负债表失败:', error);
    res.status(500).json({
      success: false,
      error: '删除失败: ' + error.message
    });
  }
});

module.exports = router; 