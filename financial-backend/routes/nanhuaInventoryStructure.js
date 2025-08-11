const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { createBudgetMiddleware } = require('../middleware/budgetMiddleware');

// 获取南华存量结构与质量数据
router.get('/:period', createBudgetMiddleware('nanhua_inventory_structure'), async (req, res) => {
    try {
        const { period } = req.params;
        
        // 获取中标未履约当期余额
        const bidFulfillmentQuery = `
            SELECT customer_name, current_amount as bid_current_amount
            FROM nanhua_bid_fulfillment
            WHERE period = ?
        `;
        
        const contractInventoryEvaluationQuery = `
            SELECT customer_name, current_evaluation
            FROM nanhua_contract_inventory_evaluation
            WHERE period = ?
        `;
        
        const [bidFulfillmentRows] = await pool.execute(bidFulfillmentQuery, [period]);
        const [contractEvaluationRows] = await pool.execute(contractInventoryEvaluationQuery, [period]);
        
        // 创建数据映射
        const createDataMap = (rows, customerField, valueField) => {
            const map = {};
            rows.forEach(row => {
                const customerName = row[customerField];
                const value = parseFloat(row[valueField]) || 0;
                map[customerName] = value;
            });
            return map;
        };

        const bidFulfillmentMap = createDataMap(bidFulfillmentRows, 'customer_name', 'bid_current_amount');
        const contractEvaluationMap = createDataMap(contractEvaluationRows, 'customer_name', 'current_evaluation');
        
        // 固定的客户列表和年初金额（用于界面显示）
        const fixedDisplayData = [
            { customerName: '一包项目', initialAmount: 10000.00 },
            { customerName: '二包项目', initialAmount: 4400.00 },
            { customerName: '域内合作项目', initialAmount: 8600.00 },
            { customerName: '域外合作项目', initialAmount: 4900.00 },
            { customerName: '新能源项目', initialAmount: 1900.00 },
            { customerName: '苏州项目', initialAmount: 4200.00 },
            { customerName: '自接项目', initialAmount: 0.00 },
            { customerName: '其他', initialAmount: 0.00 }
        ];
        
        // 计算数据
        const customers = fixedDisplayData.map(item => {
            const customerName = item.customerName;
            const bidAmount = bidFulfillmentMap[customerName] || 0;
            const progressAmount = contractEvaluationMap[customerName] || 0; // 使用合同库存评估作为新订单
            const initialAmount = item.initialAmount;

            // 计算当期金额：中标未履约当期余额 + 合同存量评估当期金额
            const current = bidAmount + progressAmount;
            
            // 计算波动率（基于当期金额）
            const fluctuationRate = initialAmount > 0 ? ((current - initialAmount) / initialAmount * 100) : 0;

            return {
                customerName,
                initialAmount,
                current,
                fluctuationRate: parseFloat(fluctuationRate.toFixed(2))
            };
        });
        
        const data = { customers };
        
        res.json({
            success: true,
            data: data,
            period: period
        });
    } catch (error) {
        console.error('获取南华存量结构与质量数据失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器内部错误' 
        });
    }
});

// 保存南华存量结构与质量数据
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
      'DELETE FROM nanhua_inventory_structure WHERE period = ?',
      [period]
    );

    // 插入新数据
    for (const item of data.customers) {
      if (item.current > 0) {
        const fluctuationRate = item.initialAmount > 0 ? ((item.current - item.initialAmount) / item.initialAmount * 100) : 0;
        
        await connection.execute(
          `INSERT INTO nanhua_inventory_structure 
           (period, customer_name, initial_amount, current_amount, fluctuation_rate, category) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            period,
            item.customerName,
            item.initialAmount || 0,
            item.current || 0,
            fluctuationRate,
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
    console.error('保存南华存量结构与质量数据失败:', error);
    res.status(500).json({
      success: false,
      message: '保存数据失败'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
