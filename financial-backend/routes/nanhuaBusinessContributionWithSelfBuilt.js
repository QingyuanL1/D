const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const fetch = require('node-fetch');

// 获取南华主营业务边际贡献率结构与质量数据（含自接项目）
router.get('/:period', async (req, res) => {
  const { period } = req.params;
  
  try {
    // 固定的客户列表和年度计划 (根据实际截图数据，百分比格式)
    const fixedData = {
      customers: [
        { customerName: '一包项目', yearlyPlan: 26.52 },
        { customerName: '二包项目', yearlyPlan: 18.00 },
        { customerName: '域内合作项目', yearlyPlan: 8.00 },
        { customerName: '域外合作项目', yearlyPlan: 5.48 },
        { customerName: '新能源项目', yearlyPlan: 25.00 },
        { customerName: '苏州项目', yearlyPlan: 6.00 },
        { customerName: '自接项目', yearlyPlan: 130.00 },
        { customerName: '其他', yearlyPlan: 0 }
      ]
    };
    
    // 从数据库获取当期数据
    const [currentRows] = await pool.execute(
      'SELECT customer_name, yearly_plan, current_amount, deviation FROM nanhua_business_contribution_with_self_built WHERE period = ?',
      [period]
    );

    // 合并数据
    const result = {
      customers: fixedData.customers.map(item => {
        const currentItem = currentRows.find(row => row.customer_name === item.customerName);
        
        return {
          customerName: item.customerName,
          yearlyPlan: item.yearlyPlan,
          current: currentItem ? parseFloat(currentItem.current_amount) : 0,
          deviation: currentItem ? parseFloat(currentItem.deviation) : 0
        };
      })
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取南华主营业务边际贡献率结构与质量数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// 自动计算南华边际贡献率
router.post('/calculate/:period', async (req, res) => {
    const { period } = req.params;

    // 验证period格式
    if (!/^\d{4}-\d{2}$/.test(period)) {
        return res.status(400).json({ error: '无效的期间格式，应为YYYY-MM' });
    }

    try {
        console.log(`开始自动计算南华${period}期间的边际贡献率`);

        // 1. 获取南华主营业务收入数据
        const incomeResponse = await fetch(`http://47.111.95.19:3000/nanhua-business-income/${period}`);
        
        if (!incomeResponse.ok) {
            return res.status(404).json({
                error: `未找到${period}期间的南华主营业务收入数据，请先录入收入数据`
            });
        }

        const incomeResult = await incomeResponse.json();
        if (!incomeResult.success || !incomeResult.data) {
            return res.status(404).json({
                error: `获取${period}期间的南华主营业务收入数据失败`
            });
        }

        // 2. 获取南华累计主营业务成本数据（从年初到当前月份）
        const year = period.split('-')[0];
        const [costRows] = await pool.execute(`
            SELECT 
                category, 
                customer_type, 
                SUM(cumulative_material_cost) as cumulative_material_cost,
                SUM(cumulative_labor_cost) as cumulative_labor_cost,
                SUM(cumulative_material_cost + cumulative_labor_cost) as total_cumulative_cost
            FROM nanhua_main_business_cost 
            WHERE period <= ? AND SUBSTRING(period, 1, 4) = ?
            GROUP BY category, customer_type
            ORDER BY category, customer_type
        `, [period, year]);

        console.log(`找到南华收入数据，期间格式: ${period}`);
        console.log(`计算南华累计成本数据，从${year}-01到${period}，共${costRows.length}项成本记录`);

        console.log('南华收入数据:', incomeResult.data);
        console.log('南华累计成本数据:', costRows);

        // 3. 计算南华边际贡献率
        const calculatedData = calculateNanhuaContributionRates(incomeResult.data, costRows, period);

        // 4. 保存计算结果
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 删除该期间的旧数据
            await connection.execute(
                'DELETE FROM nanhua_business_contribution_with_self_built WHERE period = ?',
                [period]
            );

            // 插入新的计算结果
            for (const item of calculatedData.customers) {
                if (item.current > 0) {
                    const deviation = (item.current || 0) - (item.yearlyPlan || 0);
                    
                    await connection.execute(
                        `INSERT INTO nanhua_business_contribution_with_self_built 
                         (period, customer_name, yearly_plan, current_amount, deviation, category) 
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            period,
                            item.customerName,
                            item.yearlyPlan || 0,
                            item.current || 0,
                            deviation,
                            '工程'
                        ]
                    );
                }
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        res.json({
            success: true,
            message: '南华边际贡献率计算完成',
            data: calculatedData,
            period
        });

    } catch (error) {
        console.error('自动计算南华边际贡献率失败:', error);
        res.status(500).json({
            error: '自动计算失败',
            details: error.message
        });
    }
});

// 计算南华边际贡献率的核心函数
function calculateNanhuaContributionRates(incomeData, costData, period) {
    console.log(`开始计算南华${period}期间边际贡献率`);

    // 创建客户映射
    const customerMapping = {
        '一包项目': ['一包'],
        '二包项目': ['二包'],
        '域内合作项目': ['域内合作'],
        '域外合作项目': ['域外合作'],
        '新能源项目': ['新能源'],
        '苏州项目': ['苏州'],
        '自接项目': ['自建', '抢修', '运检'],
        '其他': ['其他']
    };

    // 收入数据映射
    const incomeMap = {};
    if (incomeData && incomeData.customers) {
        incomeData.customers.forEach(item => {
            incomeMap[item.customerName] = {
                current: parseFloat(item.current) || 0,
                accumulated: parseFloat(item.accumulated) || 0
            };
        });
    }

    // 成本数据映射（按客户类型分组）
    const costMap = {};
    if (Array.isArray(costData)) {
        costData.forEach(item => {
            const customerType = item.customer_type;
            costMap[customerType] = {
                cost: parseFloat(item.total_cumulative_cost) || 0
            };
        });
    }

    // 计算结果
    const result = {
        customers: []
    };

    // 固定的客户列表和年度计划
    const fixedCustomers = [
        { customerName: '一包项目', yearlyPlan: 26.52 },
        { customerName: '二包项目', yearlyPlan: 18.00 },
        { customerName: '域内合作项目', yearlyPlan: 8.00 },
        { customerName: '域外合作项目', yearlyPlan: 5.48 },
        { customerName: '新能源项目', yearlyPlan: 25.00 },
        { customerName: '苏州项目', yearlyPlan: 6.00 },
        { customerName: '自接项目', yearlyPlan: 130.00 },
        { customerName: '其他', yearlyPlan: 0 }
    ];

    fixedCustomers.forEach(customer => {
        const customerName = customer.customerName;
        const incomeItem = incomeMap[customerName];
        
        // 查找对应的成本数据
        let totalCost = 0;
        const possibleCostKeys = customerMapping[customerName] || [customerName];
        
        possibleCostKeys.forEach(key => {
            if (costMap[key]) {
                totalCost += costMap[key].cost;
            }
        });

        const income = incomeItem?.accumulated || 0;

        // 计算边际贡献率：(收入 - 成本) / 收入 * 100
        let contributionRate = 0;
        if (income > 0) {
            contributionRate = ((income - totalCost) / income) * 100;
        }

        result.customers.push({
            customerName: customerName,
            yearlyPlan: customer.yearlyPlan,
            current: income > 0 ? parseFloat(contributionRate.toFixed(2)) : 0,
            deviation: 0 // 将在保存时计算
        });

        console.log(`${customerName}: 收入=${income}, 成本=${totalCost}, 边际贡献率=${contributionRate.toFixed(2)}%`);
    });

    return result;
}

// 保存南华主营业务边际贡献率结构与质量数据（含自接项目）
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
      'DELETE FROM nanhua_business_contribution_with_self_built WHERE period = ?',
      [period]
    );

    // 插入新数据
    for (const item of data.customers) {
      if (item.current > 0) {
        const deviation = (item.current || 0) - (item.yearlyPlan || 0);
        
        await connection.execute(
          `INSERT INTO nanhua_business_contribution_with_self_built 
           (period, customer_name, yearly_plan, current_amount, deviation, category) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            period,
            item.customerName,
            item.yearlyPlan || 0,
            item.current || 0,
            deviation,
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
    console.error('保存南华主营业务边际贡献率结构与质量数据失败:', error);
    res.status(500).json({
      success: false,
      message: '保存数据失败'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;