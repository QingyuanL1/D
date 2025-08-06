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
    console.log('开始计算上海南华兰陵现金流量表累计值，目标期间:', targetPeriod);
    
    // 解析目标期间
    const targetDate = moment(targetPeriod, 'YYYY-MM');
    const year = targetDate.year();
    
    console.log('目标年份:', year);
    
    // 获取同年度之前所有月份的数据（包括目标月份之前的）
    const startOfYear = `${year}-01`;
    const endOfTargetMonth = targetPeriod;
    
    console.log('查询范围:', startOfYear, '到', endOfTargetMonth);
    
    const [historicalRows] = await pool.query(
      'SELECT period, data FROM shanghai_nanhua_lanling_cash_flow WHERE period >= ? AND period < ? ORDER BY period ASC',
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
    console.log('计算上海南华兰陵现金流量表累计值请求 - 期间:', period);
    
    if (!period || !data) {
      return res.status(400).json({ error: '期间和数据不能为空' });
    }
    
    // 验证期间格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({ error: '期间格式错误，应为 YYYY-MM 格式' });
    }
    
    const result = await calculateCumulativeAmounts(period, data);
    
    if (result.success) {
      res.json({ 
        success: true, 
        data: result.data,
        period: period,
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

/**
 * 获取指定期间的上海南华兰陵实业有限公司现金流量表数据
 */
router.get('/:period', async (req, res) => {
    try {
        const { period } = req.params;
        
        // 验证期间格式 (YYYY-MM)
        if (!/^\d{4}-\d{2}$/.test(period)) {
            return res.status(400).json({
                success: false,
                error: '期间格式错误，应为 YYYY-MM 格式'
            });
        }

        console.log(`获取上海南华兰陵实业有限公司现金流量表数据，期间: ${period}`);

        const query = 'SELECT * FROM shanghai_nanhua_lanling_cash_flow WHERE period = ?';
        const [rows] = await pool.query(query, [period]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '未找到指定期间的数据'
            });
        }

        res.json({
            success: true,
            data: rows[0].data,
            message: '数据获取成功'
        });

    } catch (error) {
        console.error('获取上海南华兰陵实业有限公司现金流量表数据失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

/**
 * 保存上海南华兰陵实业有限公司现金流量表数据
 */
router.post('/', async (req, res) => {
    try {
        const { period, data, autoCalculateCumulative = false } = req.body;
        console.log('保存上海南华兰陵现金流量表请求 - 期间:', period, '自动计算累计:', autoCalculateCumulative);

        // 验证必要字段
        if (!period || !data) {
            return res.status(400).json({
                success: false,
                error: '期间和数据不能为空'
            });
        }

        // 验证期间格式
        if (!/^\d{4}-\d{2}$/.test(period)) {
            return res.status(400).json({
                success: false,
                error: '期间格式错误，应为 YYYY-MM 格式'
            });
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

        console.log(`保存上海南华兰陵实业有限公司现金流量表数据，期间: ${period}`);

        // 将数据转换为JSON字符串（如果还不是的话）
        const jsonData = typeof finalData === 'string' ? finalData : JSON.stringify(finalData);

        // 使用 INSERT ... ON DUPLICATE KEY UPDATE 来实现插入或更新
        const query = `
            INSERT INTO shanghai_nanhua_lanling_cash_flow (period, data) 
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE 
                data = VALUES(data),
                updated_at = CURRENT_TIMESTAMP
        `;

        const [result] = await pool.query(query, [period, jsonData]);

        res.json({
            success: true,
            message: result.insertId ? '数据保存成功' : '数据更新成功',
            data: {
                period: period,
                affected_rows: result.affectedRows
            },
            calculatedData: autoCalculateCumulative ? finalData : undefined
        });

    } catch (error) {
        console.error('保存上海南华兰陵实业有限公司现金流量表数据失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

/**
 * 获取所有期间的数据列表
 */
router.get('/', async (req, res) => {
    try {
        console.log('获取上海南华兰陵实业有限公司现金流量表所有期间数据');

        const query = `
            SELECT period, created_at, updated_at 
            FROM shanghai_nanhua_lanling_cash_flow 
            ORDER BY period DESC
        `;
        
        const [rows] = await pool.query(query);

        res.json({
            success: true,
            data: rows,
            message: '数据获取成功'
        });

    } catch (error) {
        console.error('获取上海南华兰陵实业有限公司现金流量表期间列表失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

/**
 * 删除指定期间的数据
 */
router.delete('/:period', async (req, res) => {
    try {
        const { period } = req.params;

        // 验证期间格式
        if (!/^\d{4}-\d{2}$/.test(period)) {
            return res.status(400).json({
                success: false,
                error: '期间格式错误，应为 YYYY-MM 格式'
            });
        }

        console.log(`删除上海南华兰陵实业有限公司现金流量表数据，期间: ${period}`);

        const query = 'DELETE FROM shanghai_nanhua_lanling_cash_flow WHERE period = ?';
        const [result] = await pool.query(query, [period]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '未找到指定期间的数据'
            });
        }

        res.json({
            success: true,
            message: '数据删除成功'
        });

    } catch (error) {
        console.error('删除上海南华兰陵实业有限公司现金流量表数据失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

module.exports = router; 