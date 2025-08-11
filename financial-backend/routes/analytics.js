const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// 获取新签订单数据 - 年度计划 vs 当期累计
router.get('/new-orders/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // 获取该年度所有期间的数据，用于计算每个月的累计值
    const [allPeriodsData] = await pool.execute(`
      SELECT
        n1.period,
        n1.category,
        n1.customer,
        n1.current_period,
        n1.cumulative_total,
        n1.yearly_plan
      FROM new_orders n1
      INNER JOIN (
        SELECT category, customer, period, MAX(id) as max_id
        FROM new_orders
        WHERE YEAR(CONCAT(period, '-01')) = ?
        GROUP BY category, customer, period
      ) n2 ON n1.id = n2.max_id
      ORDER BY n1.period, n1.category, n1.customer
    `, [year]);

    // 获取年度汇总数据 - 取每个类别最新期间的累计值
    const [summaryRows] = await pool.execute(`
      SELECT
        n1.category,
        SUM(n1.yearly_plan) as total_yearly_plan,
        SUM(n1.cumulative_total) as total_current
      FROM new_orders n1
      INNER JOIN (
        SELECT category, customer, MAX(period) as max_period
        FROM new_orders
        WHERE YEAR(CONCAT(period, '-01')) = ?
        GROUP BY category, customer
      ) n2 ON n1.category = n2.category AND n1.customer = n2.customer AND n1.period = n2.max_period
      GROUP BY n1.category
      ORDER BY n1.category
    `, [year]);

    // 获取每个类别的年度计划固定值（使用固定的年度计划值）
    let planRows = [];
    if (year === '2025') {
      planRows = [
        { category: '设备', total_yearly_plan: 62000 },
        { category: '元件', total_yearly_plan: 4000 },
        { category: '工程', total_yearly_plan: 14000 }
      ];
    } else if (year === '2024') {
      planRows = [
        { category: '设备', total_yearly_plan: 43000 },
        { category: '元件', total_yearly_plan: 20000 },
        { category: '工程', total_yearly_plan: 25000 }
      ];
    } else {
      // 对于其他年份，使用数据库查询
      const [dbPlanRows] = await pool.execute(`
        SELECT 
          category,
          SUM(yearly_plan) as total_yearly_plan
        FROM new_orders 
        WHERE YEAR(CONCAT(period, '-01')) = ? AND period = (
          SELECT MAX(period) FROM new_orders 
          WHERE YEAR(CONCAT(period, '-01')) = ?
        )
        GROUP BY category
        ORDER BY category
      `, [year, year]);
      planRows = dbPlanRows;
    }

    // 整理数据结构
    const categories = ['设备', '元件', '工程'];
    const months = [];
    const data = {};

    // 初始化数据结构
    categories.forEach(category => {
      const planData = planRows.find(row => row.category === category);
      data[category] = {
        yearly_plan: planData ? Number(planData.total_yearly_plan) : 0,
        current_total: []
      };
    });

    // 获取所有月份并排序
    const allPeriods = [...new Set(allPeriodsData.map(row => row.period))].sort();

    // 为每个月份使用cumulative_total字段（修复数据不一致问题）
    allPeriods.forEach(period => {
      const monthLabel = period.split('-')[1] + '月';
      if (!months.includes(monthLabel)) {
        months.push(monthLabel);
      }

      categories.forEach(category => {
        // 直接使用该月各客户的累计值之和
        const categoryData = allPeriodsData.filter(row => 
          row.category === category && row.period === period
        );
        
        const monthlyTotal = categoryData.reduce((sum, row) => 
          sum + Number(row.cumulative_total || 0), 0
        );

        data[category].current_total.push(monthlyTotal);
      });
    });

    res.json({
      success: true,
      data: {
        months,
        categories,
        monthlyData: data,
        summary: categories.reduce((acc, category) => {
          const planData = planRows.find(row => row.category === category);
          const summaryData = summaryRows.find(row => row.category === category);
          const yearlyPlan = planData ? Number(planData.total_yearly_plan) : 0;
          const currentTotal = summaryData ? Number(summaryData.total_current) : 0;
          
          acc[category] = {
            yearly_plan: yearlyPlan,
            current_total: currentTotal,
            completion_rate: yearlyPlan > 0 ? 
              Math.round((currentTotal / yearlyPlan) * 100) : 0
          };
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('获取新签订单数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取新签订单数据失败',
      error: error.message
    });
  }
});

// 获取新签订单分项占比数据
router.get('/new-orders-breakdown/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // 获取饼图数据 - 取每个类别最新期间的累计值
    const [rows] = await pool.execute(`
      SELECT
        n1.category,
        SUM(n1.cumulative_total) as total_amount
      FROM new_orders n1
      INNER JOIN (
        SELECT category, customer, MAX(period) as max_period
        FROM new_orders
        WHERE YEAR(CONCAT(period, '-01')) = ?
        GROUP BY category, customer
      ) n2 ON n1.category = n2.category AND n1.customer = n2.customer AND n1.period = n2.max_period
      WHERE n1.cumulative_total > 0
      GROUP BY n1.category
      ORDER BY total_amount DESC
    `, [year]);

    const total = rows.reduce((sum, row) => sum + Number(row.total_amount), 0);
    
    const pieData = rows.map(row => ({
      name: row.category,
      value: Number(row.total_amount),
      percentage: total > 0 ? Number(((row.total_amount / total) * 100).toFixed(1)) : 0
    }));

    res.json({
      success: true,
      data: pieData
    });

  } catch (error) {
    console.error('获取新签订单分项数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取新签订单分项数据失败',
      error: error.message
    });
  }
});

// 获取成本中心原始数据 - 用于调试
router.get('/cost-center-raw/:year', async (req, res) => {
  try {
    const { year } = req.params;

    const [rows] = await pool.execute(`
      SELECT period, data
      FROM cost_center_structure
      WHERE YEAR(CONCAT(period, '-01')) = ?
      ORDER BY period
      LIMIT 1
    `, [year]);

    res.json({
      success: true,
      data: rows.length > 0 ? rows[0] : null
    });

  } catch (error) {
    console.error('获取原始数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取原始数据失败',
      error: error.message
    });
  }
});

// 获取成本中心数据 - 年度分析
router.get('/cost-center/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // 获取该年度所有月份的成本中心数据
    const [rows] = await pool.execute(`
      SELECT period, data 
      FROM cost_center_structure 
      WHERE YEAR(CONCAT(period, '-01')) = ?
      ORDER BY period
    `, [year]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该年度的成本中心数据'
      });
    }

    // 处理数据
    const months = [];
    const monthlyData = {
      equipment: { currentPeriodTotal: [], cumulativeIncome: [] },
      component: { currentPeriodTotal: [], cumulativeIncome: [] },
      engineering: { currentPeriodTotal: [], cumulativeIncome: [] },
      nonMainBusiness: { currentPeriodTotal: [], cumulativeIncome: [] }
    };

    let yearSummary = {
      equipment: { currentPeriodTotal: 0, cumulativeIncome: 0 },
      component: { currentPeriodTotal: 0, cumulativeIncome: 0 },
      engineering: { currentPeriodTotal: 0, cumulativeIncome: 0 },
      nonMainBusiness: { currentPeriodTotal: 0, cumulativeIncome: 0 }
    };

    rows.forEach(row => {
      const monthLabel = row.period.split('-')[1] + '月';
      months.push(monthLabel);
      
      let data;
      try {
        data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      } catch (e) {
        console.error('JSON解析错误:', e, 'data:', row.data);
        return;
      }
      
      // 汇总设备数据
      const equipmentTotal = data.equipmentData.reduce((sum, item) => ({
        currentPeriodTotal: sum.currentPeriodTotal + (item.currentMonthIncome || item.currentPeriodTotal || 0),
        cumulativeIncome: sum.cumulativeIncome + (item.cumulativeIncome || 0)
      }), { currentPeriodTotal: 0, cumulativeIncome: 0 });

      monthlyData.equipment.currentPeriodTotal.push(Number(equipmentTotal.currentPeriodTotal));
      monthlyData.equipment.cumulativeIncome.push(Number(equipmentTotal.cumulativeIncome));
      
      // 汇总元件数据
      const componentTotal = data.componentData.reduce((sum, item) => ({
        currentPeriodTotal: sum.currentPeriodTotal + (item.currentMonthIncome || item.currentPeriodTotal || 0),
        cumulativeIncome: sum.cumulativeIncome + (item.cumulativeIncome || 0)
      }), { currentPeriodTotal: 0, cumulativeIncome: 0 });

      monthlyData.component.currentPeriodTotal.push(Number(componentTotal.currentPeriodTotal));
      monthlyData.component.cumulativeIncome.push(Number(componentTotal.cumulativeIncome));
      
      // 汇总工程数据
      const engineeringTotal = data.engineeringData.reduce((sum, item) => ({
        currentPeriodTotal: sum.currentPeriodTotal + (item.currentMonthIncome || item.currentPeriodTotal || 0),
        cumulativeIncome: sum.cumulativeIncome + (item.cumulativeIncome || 0)
      }), { currentPeriodTotal: 0, cumulativeIncome: 0 });

      monthlyData.engineering.currentPeriodTotal.push(Number(engineeringTotal.currentPeriodTotal));
      monthlyData.engineering.cumulativeIncome.push(Number(engineeringTotal.cumulativeIncome));
      
      // 非主营业务数据
      monthlyData.nonMainBusiness.currentPeriodTotal.push(Number(data.nonMainBusiness.currentMonthIncome || data.nonMainBusiness.currentPeriodTotal || 0));
      monthlyData.nonMainBusiness.cumulativeIncome.push(Number(data.nonMainBusiness.cumulativeIncome || 0));
      
      // 累加年度汇总 - 使用最新月份的累计值，当期值进行累加
      yearSummary.equipment.currentPeriodTotal += equipmentTotal.currentPeriodTotal;
      yearSummary.equipment.cumulativeIncome = Math.max(yearSummary.equipment.cumulativeIncome, equipmentTotal.cumulativeIncome);
      yearSummary.component.currentPeriodTotal += componentTotal.currentPeriodTotal;
      yearSummary.component.cumulativeIncome = Math.max(yearSummary.component.cumulativeIncome, componentTotal.cumulativeIncome);
      yearSummary.engineering.currentPeriodTotal += engineeringTotal.currentPeriodTotal;
      yearSummary.engineering.cumulativeIncome = Math.max(yearSummary.engineering.cumulativeIncome, engineeringTotal.cumulativeIncome);
      yearSummary.nonMainBusiness.currentPeriodTotal += (data.nonMainBusiness.currentMonthIncome || data.nonMainBusiness.currentPeriodTotal || 0);
      yearSummary.nonMainBusiness.cumulativeIncome = Math.max(yearSummary.nonMainBusiness.cumulativeIncome, (data.nonMainBusiness.cumulativeIncome || 0));
    });

    // 添加年度计划信息
    let yearlyPlan = 0;
    if (year === '2025') {
      yearlyPlan = 8343.71; // 2025年固定年度计划
    }

    res.json({
      success: true,
      data: {
        months,
        monthlyData,
        summary: yearSummary,
        yearlyPlan: yearlyPlan
      }
    });

  } catch (error) {
    console.error('获取成本中心分析数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取成本中心分析数据失败',
      error: error.message
    });
  }
});

// 获取成本中心分项占比数据
router.get('/cost-center-breakdown/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // 获取最新一个月的数据用于占比分析
    const [rows] = await pool.execute(`
      SELECT data 
      FROM cost_center_structure 
      WHERE YEAR(CONCAT(period, '-01')) = ?
      ORDER BY period DESC
      LIMIT 1
    `, [year]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该年度的成本中心数据'
      });
    }

    let data;
    try {
      data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
    } catch (e) {
      console.error('JSON解析错误:', e);
      return res.status(500).json({
        success: false,
        message: 'JSON数据解析失败'
      });
    }
    
    // 计算各板块的当期计入损益累计
    const equipmentTotal = data.equipmentData.reduce((sum, item) => sum + item.currentPeriodTotal, 0);
    const componentTotal = data.componentData.reduce((sum, item) => sum + item.currentPeriodTotal, 0);
    const engineeringTotal = data.engineeringData.reduce((sum, item) => sum + item.currentPeriodTotal, 0);
    const nonMainTotal = data.nonMainBusiness.currentPeriodTotal;
    
    const totalAmount = equipmentTotal + componentTotal + engineeringTotal + nonMainTotal;
    
    const pieData = [
      {
        name: '设备',
        value: Number(equipmentTotal.toFixed(2)),
        percentage: totalAmount > 0 ? Number(((equipmentTotal / totalAmount) * 100).toFixed(1)) : 0
      },
      {
        name: '元件',
        value: Number(componentTotal.toFixed(2)),
        percentage: totalAmount > 0 ? Number(((componentTotal / totalAmount) * 100).toFixed(1)) : 0
      },
      {
        name: '工程',
        value: Number(engineeringTotal.toFixed(2)),
        percentage: totalAmount > 0 ? Number(((engineeringTotal / totalAmount) * 100).toFixed(1)) : 0
      },
      {
        name: '非主营业务',
        value: Number(nonMainTotal.toFixed(2)),
        percentage: totalAmount > 0 ? Number(((nonMainTotal / totalAmount) * 100).toFixed(1)) : 0
      }
    ].filter(item => item.value > 0); // 过滤掉为0的项

    res.json({
      success: true,
      data: pieData
    });

  } catch (error) {
    console.error('获取成本中心分项数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取成本中心分项数据失败',
      error: error.message
    });
  }
});

// 获取营业收入数据 - 年度分析
router.get('/business-income/:year', async (req, res) => {
  try {
    const { year } = req.params;

    // 获取该年度所有月份的营业收入数据
    const [rows] = await pool.execute(`
      SELECT DATE_FORMAT(period, '%Y-%m') as period, data
      FROM business_income_structure
      WHERE YEAR(period) = ?
      ORDER BY period
    `, [year]);

    // 处理数据 - 混合使用两种数据源
    const months = [];
    const monthlyData = {
      main: { yearlyPlan: 59400, currentTotal: [] },  // 使用固定年度计划
      nonMain: { yearlyPlan: 600, currentTotal: [] }
    };

    let yearSummary = {
      main: { yearlyPlan: 59400, currentTotal: 0, completion_rate: 0 },
      nonMain: { yearlyPlan: 600, currentTotal: 0, completion_rate: 0 }
    };

    // 创建business_income_structure表数据的映射
    const businessIncomeMap = {};
    rows.forEach(row => {
      businessIncomeMap[row.period] = row.data;
    });

    // 累计变量 - 用于跟踪真正的累计值
    let runningMainTotal = 0;
    let runningNonMainTotal = 0;

    // 生成该年度的所有月份，使用真正的累计计算
    for (let month = 1; month <= 12; month++) {
      const period = `${year}-${month.toString().padStart(2, '0')}`;
      const monthLabel = `${month}月`;
      months.push(monthLabel);

      let mainBusinessCurrentMonth = 0;
      let nonMainBusinessCurrentMonth = 0;
      let hasAnyData = false;

      // 获取该月的当期收入
      try {
        // 1. 获取主营业务当月收入
        const mainPeriodDate = `${period}-01`;
        const [mainRows] = await pool.execute(
          'SELECT data FROM main_business_income WHERE period = ?',
          [mainPeriodDate]
        );

        if (mainRows.length > 0) {
          hasAnyData = true;
          const data = typeof mainRows[0].data === 'string' ? JSON.parse(mainRows[0].data) : mainRows[0].data;
          ['equipment', 'components', 'engineering'].forEach(category => {
            if (data[category] && Array.isArray(data[category])) {
              data[category].forEach(item => {
                mainBusinessCurrentMonth += Number(item.currentMonthIncome || 0);
              });
            }
          });
        }

        // 2. 获取非主营业务当月收入
        const [nonMainRows] = await pool.execute(
          'SELECT data FROM non_main_business WHERE period = ?',
          [period]
        );

        if (nonMainRows.length > 0) {
          hasAnyData = true;
          const data = typeof nonMainRows[0].data === 'string' ? JSON.parse(nonMainRows[0].data) : nonMainRows[0].data;
          if (Array.isArray(data)) {
            data.forEach(item => {
              nonMainBusinessCurrentMonth += Number(item.currentPeriod || 0);
            });
          }
        }

      } catch (error) {
        console.error(`获取${period}数据失败:`, error);
      }

      // 计算累计值：累加当月收入到运行总计
      if (hasAnyData) {
        runningMainTotal += mainBusinessCurrentMonth;
        runningNonMainTotal += nonMainBusinessCurrentMonth;
        
        monthlyData.main.currentTotal.push(runningMainTotal);
        monthlyData.nonMain.currentTotal.push(runningNonMainTotal);
        
        // 更新年度汇总
        yearSummary.main.currentTotal = runningMainTotal;
        yearSummary.nonMain.currentTotal = runningNonMainTotal;
      } else {
        // 没有数据的月份推入null
        monthlyData.main.currentTotal.push(null);
        monthlyData.nonMain.currentTotal.push(null);
      }
    }

    // 计算完成率
    yearSummary.main.completion_rate = yearSummary.main.yearlyPlan > 0 ?
      Math.round((yearSummary.main.currentTotal / yearSummary.main.yearlyPlan) * 100) : 0;
    yearSummary.nonMain.completion_rate = yearSummary.nonMain.yearlyPlan > 0 ?
      Math.round((yearSummary.nonMain.currentTotal / yearSummary.nonMain.yearlyPlan) * 100) : 0;

    res.json({
      success: true,
      data: {
        months,
        monthlyData,
        summary: yearSummary
      }
    });

  } catch (error) {
    console.error('获取营业收入分析数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取营业收入分析数据失败',
      error: error.message
    });
  }
});

// 获取营业收入当月数据 - 年度分析
router.get('/business-income-monthly/:year', async (req, res) => {
  try {
    const { year } = req.params;

    // 获取该年度所有月份的营业收入数据，直接从数据库获取当月数据
    const months = [];
    const monthlyData = {
      main: { yearlyPlan: 59400, currentMonth: [] },  // 使用固定年度计划
      nonMain: { yearlyPlan: 600, currentMonth: [] }
    };

    // 生成该年度的所有月份
    for (let month = 1; month <= 12; month++) {
      const period = `${year}-${month.toString().padStart(2, '0')}`;
      const monthLabel = `${month}月`;
      months.push(monthLabel);

      try {
        // 直接从数据库获取当月数据
        const [year_str, month_str] = period.split('-');

        // 1. 计算主营业务当月收入
        let mainBusinessCurrentPeriod = 0;
        let hasMainData = false;

        try {
          const mainPeriodDate = `${period}-01`;
          const [mainCurrentRows] = await pool.execute(
            'SELECT data FROM main_business_income WHERE period = ?',
            [mainPeriodDate]
          );

          if (mainCurrentRows.length > 0) {
            hasMainData = true;
            const data = typeof mainCurrentRows[0].data === 'string' ? JSON.parse(mainCurrentRows[0].data) : mainCurrentRows[0].data;
            ['equipment', 'components', 'engineering'].forEach(category => {
              if (data[category] && Array.isArray(data[category])) {
                data[category].forEach(item => {
                  mainBusinessCurrentPeriod += Number(item.currentMonthIncome || 0);
                });
              }
            });
          }
        } catch (error) {
          console.error('获取主营业务当月数据失败:', error);
        }

        // 2. 计算非主营业务当月收入
        let nonMainBusinessCurrentPeriod = 0;
        let hasNonMainData = false;

        try {
          const [nonMainCurrentRows] = await pool.execute(
            'SELECT data FROM non_main_business WHERE period = ? ORDER BY created_at DESC LIMIT 1',
            [period]
          );

          if (nonMainCurrentRows.length > 0) {
            hasNonMainData = true;
            const data = typeof nonMainCurrentRows[0].data === 'string' ? JSON.parse(nonMainCurrentRows[0].data) : nonMainCurrentRows[0].data;
            if (Array.isArray(data)) {
              data.forEach(item => {
                nonMainBusinessCurrentPeriod += Number(item.currentPeriod || 0);
              });
            }
          }
        } catch (error) {
          console.error('获取非主营业务当月数据失败:', error);
        }

        // 检查是否有实际的当期收入（不仅仅是有数据记录）
        const hasActualIncome = mainBusinessCurrentPeriod > 0 || nonMainBusinessCurrentPeriod > 0;
        monthlyData.main.currentMonth.push(hasActualIncome ? mainBusinessCurrentPeriod : null);
        monthlyData.nonMain.currentMonth.push(hasActualIncome ? nonMainBusinessCurrentPeriod : null);

      } catch (error) {
        console.error(`获取${period}数据失败:`, error);
        // 出错时推入null而不是0
        monthlyData.main.currentMonth.push(null);
        monthlyData.nonMain.currentMonth.push(null);
      }
    }

    // 计算年度汇总
    const yearSummary = {
      main: {
        yearlyPlan: monthlyData.main.yearlyPlan,
        currentMonthTotal: monthlyData.main.currentMonth.reduce((sum, val) => sum + val, 0),
        completion_rate: 0
      },
      nonMain: {
        yearlyPlan: monthlyData.nonMain.yearlyPlan,
        currentMonthTotal: monthlyData.nonMain.currentMonth.reduce((sum, val) => sum + val, 0),
        completion_rate: 0
      }
    };

    yearSummary.main.completion_rate = yearSummary.main.yearlyPlan > 0 ?
      Math.round((yearSummary.main.currentMonthTotal / yearSummary.main.yearlyPlan) * 100) : 0;
    yearSummary.nonMain.completion_rate = yearSummary.nonMain.yearlyPlan > 0 ?
      Math.round((yearSummary.nonMain.currentMonthTotal / yearSummary.nonMain.yearlyPlan) * 100) : 0;

    res.json({
      success: true,
      data: {
        months,
        monthlyData,
        summary: yearSummary
      }
    });

  } catch (error) {
    console.error('获取营业收入当月分析数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取营业收入当月分析数据失败',
      error: error.message
    });
  }
});

// 获取营业收入分项占比数据
router.get('/business-income-breakdown/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // 获取最新一个月的数据用于占比分析
    const [rows] = await pool.execute(`
      SELECT data 
      FROM business_income_structure 
      WHERE YEAR(period) = ?
      ORDER BY period DESC
      LIMIT 1
    `, [year]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该年度的营业收入数据'
      });
    }

    let data;
    try {
      data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
    } catch (e) {
      console.error('JSON解析错误:', e);
      return res.status(500).json({
        success: false,
        message: 'JSON数据解析失败'
      });
    }
    
    // 计算各分项的占比（支持两种字段名）
    const totalAmount = data.reduce((sum, item) => {
      const value = item.currentTotal || item.accumulatedIncome || 0;
      return sum + value;
    }, 0);
    
    const pieData = data
      .filter(item => {
        const value = item.currentTotal || item.accumulatedIncome || 0;
        return value > 0;
      })
      .map(item => {
        const value = item.currentTotal || item.accumulatedIncome || 0;
        return {
          name: item.category,
          value: Number(value.toFixed(2)),
          percentage: totalAmount > 0 ? Number(((value / totalAmount) * 100).toFixed(1)) : 0
        };
      });

    res.json({
      success: true,
      data: pieData
    });

  } catch (error) {
    console.error('获取营业收入分项数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取营业收入分项数据失败',
      error: error.message
    });
  }
});

// 获取净利润数据
router.get('/net-profit/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const { company = 'main' } = req.query; // 获取公司参数，默认为主公司

    console.log(`Fetching net profit data for year: ${year}, company: ${company}`);

    // 根据公司参数决定数据源
    if (company === 'main') {
      // 电气公司：从main_business_net_profit和non_main_business_net_profit表计算数据
      
      // 获取主营业务净利润数据
      const [mainBusinessRows] = await pool.execute(`
        SELECT period, data
        FROM main_business_net_profit
        WHERE period LIKE ?
        ORDER BY period ASC
      `, [`${year}-%`]);

      // 获取非主营业务净利润数据
      const [nonMainBusinessRows] = await pool.execute(`
        SELECT period, data
        FROM non_main_business_net_profit
        WHERE period LIKE ?
        ORDER BY period ASC
      `, [`${year}-%`]);

      console.log(`Found ${mainBusinessRows.length} main business and ${nonMainBusinessRows.length} non-main business records`);

      // 获取所有有数据的月份
      const allPeriods = new Set();
      mainBusinessRows.forEach(row => allPeriods.add(row.period));
      nonMainBusinessRows.forEach(row => allPeriods.add(row.period));
      
      const sortedPeriods = Array.from(allPeriods).sort();

      if (sortedPeriods.length === 0) {
        // 如果没有数据，返回默认值
        return res.json({
          success: true,
          data: {
            months: [],
            monthlyData: {
              currentTotal: [],
              yearlyPlan: 4000
            },
            summary: {
              yearlyPlan: 4000,
              currentTotal: 0,
              completion_rate: 0,
              previousYearSame: 0,
              growth_amount: 0,
              growth_rate: 0
            }
          }
        });
      }

      // 提取月份和数据
      const months = [];
      const monthlyData = {
        currentTotal: [],
        yearlyPlan: 4000 // 电气公司固定年度计划
      };

      let latestCumulative = 0;

      sortedPeriods.forEach(period => {
        const [, month] = period.split('-');
        months.push(`${parseInt(month)}月`);

        // 计算该期间主营业务净利润累计
        let mainBusinessTotal = 0;
        const mainRow = mainBusinessRows.find(row => row.period === period);
        if (mainRow) {
          try {
            const mainData = typeof mainRow.data === 'string' ? 
              JSON.parse(mainRow.data) : mainRow.data;
            
            // 汇总所有actual字段
            if (Array.isArray(mainData)) {
              mainBusinessTotal = mainData.reduce((sum, item) => {
                const actual = parseFloat(String(item.actual || 0).replace(/,/g, ''));
                return sum + actual;
              }, 0);
            } else {
              console.log(`主营业务数据不是数组格式: ${period}`, mainData);
              mainBusinessTotal = 0;
            }
          } catch (error) {
            console.error(`解析主营业务数据失败: ${period}`, error);
          }
        }

        // 计算该期间非主营业务净利润累计
        let nonMainBusinessTotal = 0;
        const nonMainRow = nonMainBusinessRows.find(row => row.period === period);
        if (nonMainRow) {
          try {
            const nonMainData = typeof nonMainRow.data === 'string' ? 
              JSON.parse(nonMainRow.data) : nonMainRow.data;
            
            // 汇总所有accumulated字段
            if (Array.isArray(nonMainData)) {
              nonMainBusinessTotal = nonMainData.reduce((sum, item) => {
                const accumulated = parseFloat(String(item.accumulated || 0).replace(/,/g, ''));
                return sum + accumulated;
              }, 0);
            } else {
              console.log(`非主营业务数据不是数组格式: ${period}`, nonMainData);
              nonMainBusinessTotal = 0;
            }
          } catch (error) {
            console.error(`解析非主营业务数据失败: ${period}`, error);
          }
        }

        // 计算净利润总计
        const totalNetProfit = mainBusinessTotal + nonMainBusinessTotal;
        monthlyData.currentTotal.push(totalNetProfit);
        latestCumulative = totalNetProfit;

        console.log(`Period: ${period}, Main: ${mainBusinessTotal.toFixed(2)}, NonMain: ${nonMainBusinessTotal.toFixed(2)}, Total: ${totalNetProfit.toFixed(2)}`);
      });

      // 计算完成率
      const completionRate = monthlyData.yearlyPlan > 0 ? 
        parseFloat(((latestCumulative / monthlyData.yearlyPlan) * 100).toFixed(2)) : 0;

      // 返回结果
      res.json({
        success: true,
        data: {
          months,
          monthlyData,
          summary: {
            yearlyPlan: monthlyData.yearlyPlan,
            currentTotal: latestCumulative,
            completion_rate: completionRate,
            previousYearSame: 0, // 暂无去年数据
            growth_amount: 0,
            growth_rate: 0
          }
        }
      });

    } else {
      // 南华公司和拓源公司：继续使用原来的逻辑从利润表获取
      const tableMap = {
        'nanhua': 'nanhua_income_statement',
        'tuoyuan': 'tuoyuan_income_statement'
      };
      const tableName = tableMap[company];

      console.log(`Fetching from income statement table: ${tableName}`);

      // 获取该年度的利润表数据
      const query = `
        SELECT DATE_FORMAT(period, '%Y-%m') as period_ym, data
        FROM ${tableName}
        WHERE (YEAR(period) = ? OR YEAR(period) = ?)
        ORDER BY period ASC
      `;

      const [rows] = await pool.execute(query, [year, parseInt(year)-1]);
      console.log(`Found ${rows.length} income statement records`);

      // 首先确定实际有数据的月份
      const actualMonths = [];
      const currentYearRows = rows.filter(row => {
        const [rowYear] = row.period_ym.split('-');
        return rowYear === year;
      });

      // 提取实际有数据的月份
      currentYearRows.forEach(row => {
        const [, month] = row.period_ym.split('-');
        if (!actualMonths.includes(month)) {
          actualMonths.push(month);
        }
      });

      // 按月份排序
      actualMonths.sort();

      console.log(`Actual months with data: ${actualMonths.join(', ')}`);

      // 根据公司和年份设置年度计划
      let yearlyPlan = 2000; // 默认值
      if (year === '2025') {
        switch(company) {
          case 'nanhua': yearlyPlan = 2000; break;
          case 'tuoyuan': yearlyPlan = 3000; break;
          default: yearlyPlan = 2000;
        }
      } else if (year === '2024') {
        switch(company) {
          case 'nanhua': yearlyPlan = 1800; break;
          case 'tuoyuan': yearlyPlan = 2500; break;
          default: yearlyPlan = 1800;
        }
      }

      if (rows.length === 0 || actualMonths.length === 0) {
        // 如果没有数据，返回默认值
        return res.json({
          success: true,
          data: {
            months: [],
            monthlyData: {
              currentTotal: [],
              previousYear: [],
              yearlyPlan: yearlyPlan
            },
            summary: {
              yearlyPlan: yearlyPlan,
              currentTotal: 0,
              previousYearSame: 0,
              growth_amount: 0,
              growth_rate: 0,
              completion_rate: 0
            }
          }
        });
      }

      console.log(`Year: ${year}, Company: ${company}, Yearly plan: ${yearlyPlan}`);

      const monthlyData = {
        currentTotal: Array(actualMonths.length).fill(0),
        previousYear: Array(actualMonths.length).fill(0),
        yearlyPlan: yearlyPlan
      };
      
      // 提取当前年度和上一年度数据
      for (const row of rows) {
        const [rowYear, rowMonth] = row.period_ym.split('-');
        
        try {
          const parsedData = typeof row.data === 'string' ? 
            JSON.parse(row.data) : row.data;
          
          // 获取净利润数据
          const profitValue = parsedData.net_profit &&
            parsedData.net_profit.current_amount !== null ?
            Number(parsedData.net_profit.current_amount) : 0;

          console.log(`Period: ${row.period_ym}, Raw net profit data:`, parsedData.net_profit);
          console.log(`Period: ${row.period_ym}, Parsed net profit value: ${profitValue}`);
            
          // 根据年份分配数据
          if (rowYear === year) {
            // 查找该月份在actualMonths中的索引
            const actualMonthIndex = actualMonths.indexOf(rowMonth);
            if (actualMonthIndex >= 0) {
              monthlyData.currentTotal[actualMonthIndex] = profitValue;
            }
          } else if (rowYear === (parseInt(year) - 1).toString()) {
            // 查找该月份在actualMonths中的索引
            const actualMonthIndex = actualMonths.indexOf(rowMonth);
            if (actualMonthIndex >= 0) {
              monthlyData.previousYear[actualMonthIndex] = profitValue;
            }
          }
        } catch (error) {
          console.error(`解析数据失败: ${row.period_ym}`, error);
        }
      }
      
      // 计算汇总数据
      const currentTotal = monthlyData.currentTotal.reduce((sum, value) => sum + value, 0);
      const previousYearSame = monthlyData.previousYear.reduce((sum, value) => sum + value, 0);
      const growthAmount = currentTotal - previousYearSame;
      const growthRate = previousYearSame !== 0 ? 
        parseFloat(((growthAmount / Math.abs(previousYearSame)) * 100).toFixed(2)) : 0;
      const completionRate = parseFloat(((currentTotal / monthlyData.yearlyPlan) * 100).toFixed(2));
      
      // 返回结果
      res.json({
        success: true,
        data: {
          months: actualMonths.map(month => `${parseInt(month)}月`),
          monthlyData,
          summary: {
            yearlyPlan: monthlyData.yearlyPlan,
            currentTotal,
            previousYearSame,
            growth_amount: growthAmount,
            growth_rate: growthRate,
            completion_rate: completionRate
          }
        }
      });
    }
    
  } catch (error) {
    console.error('获取净利润数据失败:', error);
    res.status(500).json({ success: false, message: '获取净利润数据失败', error: error.message });
  }
});

// 获取净利润结构占比
router.get('/net-profit-breakdown/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
    const period = `${year}-${currentMonthStr}-01`;
    
    // 查询利润表中的最新数据
    const [rows] = await pool.execute(
      'SELECT data FROM income_statement WHERE period = ?',
      [period]
    );
    
    if (rows.length === 0) {
      // 如果当前期间没有数据，尝试获取最近的一期数据
      const [latestRows] = await pool.execute(
        'SELECT data FROM income_statement WHERE YEAR(period) = ? ORDER BY period DESC LIMIT 1',
        [year]
      );
      
      if (latestRows.length === 0) {
        return res.json({
          success: true,
          data: [
            { name: '营业利润', value: 30000, percentage: 75 },
            { name: '营业外收入', value: 12000, percentage: 30 },
            { name: '营业外支出', value: -2000, percentage: 5 },
            { name: '所得税费用', value: -2000, percentage: 5 }
          ] // 返回示例数据
        });
      }
      
      rows[0] = latestRows[0]; // 使用最近一期数据
    }
    
    // 解析数据
    let rawData;
    try {
      rawData = typeof rows[0].data === 'string' ? 
        JSON.parse(rows[0].data) : rows[0].data;
    } catch (e) {
      console.error('解析利润表数据失败:', e);
      return res.status(500).json({ 
        success: false, 
        message: '解析利润表数据失败' 
      });
    }
    
    // 提取与净利润相关的主要组成部分
    const components = [
      { 
        name: '营业利润', 
        value: rawData.operating_profit && rawData.operating_profit.cumulative_amount ? 
          Number(rawData.operating_profit.cumulative_amount) : 0 
      },
      { 
        name: '营业外收入', 
        value: rawData.non_operating_income && rawData.non_operating_income.cumulative_amount ? 
          Number(rawData.non_operating_income.cumulative_amount) : 0 
      },
      { 
        name: '营业外支出', 
        value: rawData.non_operating_expenses && rawData.non_operating_expenses.cumulative_amount ? 
          -Math.abs(Number(rawData.non_operating_expenses.cumulative_amount)) : 0 
      },
      { 
        name: '所得税费用', 
        value: rawData.income_tax_expense && rawData.income_tax_expense.cumulative_amount ? 
          -Math.abs(Number(rawData.income_tax_expense.cumulative_amount)) : 0 
      }
    ];
    
    // 计算总和和百分比
    const totalAbsValue = components.reduce((sum, item) => sum + Math.abs(item.value), 0);
    const result = components.map(item => ({
      name: item.name,
      value: item.value,
      percentage: totalAbsValue !== 0 ? 
        parseFloat(((Math.abs(item.value) / totalAbsValue) * 100).toFixed(1)) : 0
    }));
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('获取净利润结构占比失败:', error);
    res.status(500).json({ success: false, message: '获取净利润结构占比失败', error: error.message });
  }
});

// 获取所有分析模块的完成率汇总
router.get('/completion-rates/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const completionRates = {};
    
    // 1. 获取新签订单完成率
    try {
      // 获取新签订单完成率 - 取每个类别最新期间的累计值
      const [newOrdersRows] = await pool.execute(`
        SELECT
          n1.category,
          SUM(n1.yearly_plan) as total_yearly_plan,
          SUM(n1.cumulative_total) as total_current
        FROM new_orders n1
        INNER JOIN (
          SELECT category, customer, MAX(period) as max_period
          FROM new_orders
          WHERE YEAR(CONCAT(period, '-01')) = ?
          GROUP BY category, customer
        ) n2 ON n1.category = n2.category AND n1.customer = n2.customer AND n1.period = n2.max_period
        GROUP BY n1.category
        ORDER BY n1.category
      `, [year]);

      // 使用固定的年度计划值
      let planRows = [];
      if (year === '2025') {
        planRows = [
          { category: '设备', total_yearly_plan: 62000 },
          { category: '元件', total_yearly_plan: 4000 },
          { category: '工程', total_yearly_plan: 14000 }
        ];
      } else if (year === '2024') {
        planRows = [
          { category: '设备', total_yearly_plan: 43000 },
          { category: '元件', total_yearly_plan: 20000 },
          { category: '工程', total_yearly_plan: 25000 }
        ];
      }

      let totalPlan = 0;
      let totalCurrent = 0;
      
      ['设备', '元件', '工程'].forEach(category => {
        const planData = planRows.find(row => row.category === category);
        const currentData = newOrdersRows.find(row => row.category === category);
        
        totalPlan += planData ? Number(planData.total_yearly_plan) : 0;
        totalCurrent += currentData ? Number(currentData.total_current) : 0;
      });
      
      completionRates.newOrders = totalPlan > 0 ? Math.round((totalCurrent / totalPlan) * 100) : 0;
    } catch (error) {
      console.error('获取新签订单完成率失败:', error);
      completionRates.newOrders = 0;
    }

    // 2. 获取成本中心完成率 - 直接调用现有API逻辑
    try {
      // 获取该年度所有月份的成本中心数据
      const [costCenterRows] = await pool.execute(`
        SELECT period, data 
        FROM cost_center_structure 
        WHERE YEAR(CONCAT(period, '-01')) = ?
        ORDER BY period
      `, [year]);

      if (costCenterRows.length > 0) {
        // 使用与 /cost-center/:year API 相同的逻辑
        let yearSummary = {
          equipment: { cumulativeIncome: 0 },
          component: { cumulativeIncome: 0 },
          engineering: { cumulativeIncome: 0 },
          nonMainBusiness: { cumulativeIncome: 0 }
        };

        costCenterRows.forEach(row => {
          let data;
          try {
            data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          } catch (e) {
            console.error('JSON解析错误:', e);
            return;
          }
          
          // 汇总设备数据
          const equipmentTotal = data.equipmentData.reduce((sum, item) => ({
            cumulativeIncome: sum.cumulativeIncome + item.cumulativeIncome
          }), { cumulativeIncome: 0 });
          
          // 汇总元件数据
          const componentTotal = data.componentData.reduce((sum, item) => ({
            cumulativeIncome: sum.cumulativeIncome + item.cumulativeIncome
          }), { cumulativeIncome: 0 });
          
          // 汇总工程数据
          const engineeringTotal = data.engineeringData.reduce((sum, item) => ({
            cumulativeIncome: sum.cumulativeIncome + item.cumulativeIncome
          }), { cumulativeIncome: 0 });
          
          // 累加年度汇总
          yearSummary.equipment.cumulativeIncome += equipmentTotal.cumulativeIncome;
          yearSummary.component.cumulativeIncome += componentTotal.cumulativeIncome;
          yearSummary.engineering.cumulativeIncome += engineeringTotal.cumulativeIncome;
          yearSummary.nonMainBusiness.cumulativeIncome += data.nonMainBusiness.cumulativeIncome;
        });

        // 计算总累计收入
        const totalCumulativeIncome = 
          yearSummary.equipment.cumulativeIncome +
          yearSummary.component.cumulativeIncome +
          yearSummary.engineering.cumulativeIncome +
          yearSummary.nonMainBusiness.cumulativeIncome;

        // 年度计划
        const yearlyPlan = year === '2025' ? 8343.71 : 8000;
        
        // 计算完成率
        completionRates.costCenter = yearlyPlan > 0 ? 
          Math.round((totalCumulativeIncome / yearlyPlan) * 100) : 0;
      } else {
        completionRates.costCenter = 0;
      }
    } catch (error) {
      console.error('获取成本中心完成率失败:', error);
      completionRates.costCenter = 0;
    }

    // 3. 获取营业收入完成率
    try {
      const [businessIncomeRows] = await pool.execute(`
        SELECT data 
        FROM business_income_structure 
        WHERE YEAR(period) = ?
        ORDER BY period
      `, [year]);

      if (businessIncomeRows.length > 0) {
        // 使用硬编码的年度计划值
        const hardcodedYearlyPlan = 59400; // 主营业务年度计划 59,400 万元
        
        // 计算所有期间的当期累计总和
        let totalCurrentAmount = 0;
        
        businessIncomeRows.forEach(row => {
          const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          const mainBusiness = data.find(item => item.category === '主营业务') || {};
          const currentAmount = mainBusiness.currentTotal || mainBusiness.accumulatedIncome || 0;
          totalCurrentAmount += currentAmount;
        });
        
        completionRates.businessIncome = hardcodedYearlyPlan > 0 ? 
          Math.round((totalCurrentAmount / hardcodedYearlyPlan) * 100) : 0;
      } else {
        completionRates.businessIncome = 0;
      }
    } catch (error) {
      console.error('获取营业收入完成率失败:', error);
      completionRates.businessIncome = 0;
    }

    // 4. 获取净利润完成率（使用混合计算方式）
    try {
      // 获取主营业务净利润数据
      const [mainBusinessRows] = await pool.execute(`
        SELECT period, data
        FROM main_business_net_profit
        WHERE period LIKE ?
        ORDER BY period ASC
      `, [`${year}-%`]);

      // 获取非主营业务净利润数据
      const [nonMainBusinessRows] = await pool.execute(`
        SELECT period, data
        FROM non_main_business_net_profit
        WHERE period LIKE ?
        ORDER BY period ASC
      `, [`${year}-%`]);

      // 获取所有有数据的月份
      const allPeriods = new Set();
      mainBusinessRows.forEach(row => allPeriods.add(row.period));
      nonMainBusinessRows.forEach(row => allPeriods.add(row.period));
      
      const sortedPeriods = Array.from(allPeriods).sort();

      if (sortedPeriods.length > 0) {
        let latestCumulative = 0;

        // 计算最新期间的净利润总计
        const latestPeriod = sortedPeriods[sortedPeriods.length - 1];
        
        // 计算主营业务净利润累计
        let mainBusinessTotal = 0;
        const mainRow = mainBusinessRows.find(row => row.period === latestPeriod);
        if (mainRow) {
          try {
            const mainData = typeof mainRow.data === 'string' ? 
              JSON.parse(mainRow.data) : mainRow.data;
            
            if (Array.isArray(mainData)) {
              mainBusinessTotal = mainData.reduce((sum, item) => {
                const actual = parseFloat(String(item.actual || 0).replace(/,/g, ''));
                return sum + actual;
              }, 0);
            }
          } catch (error) {
            console.error(`解析主营业务数据失败: ${latestPeriod}`, error);
          }
        }

        // 计算非主营业务净利润累计
        let nonMainBusinessTotal = 0;
        const nonMainRow = nonMainBusinessRows.find(row => row.period === latestPeriod);
        if (nonMainRow) {
          try {
            const nonMainData = typeof nonMainRow.data === 'string' ? 
              JSON.parse(nonMainRow.data) : nonMainRow.data;
            
            if (Array.isArray(nonMainData)) {
              nonMainBusinessTotal = nonMainData.reduce((sum, item) => {
                const accumulated = parseFloat(String(item.accumulated || 0).replace(/,/g, ''));
                return sum + accumulated;
              }, 0);
            }
          } catch (error) {
            console.error(`解析非主营业务数据失败: ${latestPeriod}`, error);
          }
        }

        // 计算净利润总计
        latestCumulative = mainBusinessTotal + nonMainBusinessTotal;
        
        const yearlyPlan = 4000; // 电气公司年度计划
        completionRates.netProfit = yearlyPlan > 0 ? Math.round((latestCumulative / yearlyPlan) * 100) : 0;
      } else {
        completionRates.netProfit = 0;
      }
    } catch (error) {
      console.error('获取净利润完成率失败:', error);
      completionRates.netProfit = 0;
    }

    // 5. 获取边际贡献率完成率
    try {
      const [contributionRows] = await pool.execute(`
        SELECT period, data
        FROM business_contribution
        WHERE YEAR(CONCAT(period, '-01')) = ?
        ORDER BY period DESC
        LIMIT 1
      `, [year]);

      if (contributionRows.length > 0) {
        const data = typeof contributionRows[0].data === 'string' ?
          JSON.parse(contributionRows[0].data) : contributionRows[0].data;

        // 辅助函数：解析贡献率值
        const parseContributionRate = (value) => {
          if (!value) return 0;

          if (typeof value === 'string') {
            if (value === '/' || value.includes('无收入')) return 0;
            const match = value.match(/(\d+(?:\.\d+)?)/);
            if (match) {
              const rate = parseFloat(match[1]);
              return (!isNaN(rate) && rate >= 0 && rate <= 200) ? rate : 0;
            }
          }

          if (typeof value === 'number') {
            return (value >= 0 && value <= 200) ? value : 0;
          }

          return 0;
        };

        const currentRate = data.total && data.total.actual ? parseContributionRate(data.total.actual) : 0;
        const targetRate = 21.98; // 固定目标值

        completionRates.contributionRate = targetRate > 0 ? Math.round((currentRate / targetRate) * 100) : 0;
      } else {
        completionRates.contributionRate = 0;
      }
    } catch (error) {
      console.error('获取边际贡献率完成率失败:', error);
      completionRates.contributionRate = 0;
    }

    // 6. 获取毛利率完成率
    try {
      const [profitMarginRows] = await pool.execute(`
        SELECT period, data
        FROM business_profit_margin
        WHERE YEAR(CONCAT(period, '-01')) = ?
        ORDER BY period DESC
        LIMIT 1
      `, [year]);

      if (profitMarginRows.length > 0) {
        const data = typeof profitMarginRows[0].data === 'string' ?
          JSON.parse(profitMarginRows[0].data) : profitMarginRows[0].data;

        // 辅助函数：解析毛利率值
        const parseProfitMarginRate = (value) => {
          if (!value) return 0;

          if (typeof value === 'string') {
            if (value === '/' || value.includes('无收入')) return 0;
            const match = value.match(/(\d+(?:\.\d+)?)/);
            if (match) {
              const rate = parseFloat(match[1]);
              return (!isNaN(rate) && rate >= 0 && rate <= 200) ? rate : 0;
            }
          }

          if (typeof value === 'number') {
            return (value >= 0 && value <= 200) ? value : 0;
          }

          return 0;
        };

        const currentRate = data.total && data.total.actual ? parseProfitMarginRate(data.total.actual) : 0;
        const targetRate = 24.00; // 固定目标值

        completionRates.profitMargin = targetRate > 0 ? Math.round((currentRate / targetRate) * 100) : 0;
      } else {
        completionRates.profitMargin = 0;
      }
    } catch (error) {
      console.error('获取毛利率完成率失败:', error);
      completionRates.profitMargin = 0;
    }

    res.json({
      success: true,
      data: completionRates
    });

  } catch (error) {
    console.error('获取分析模块完成率失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分析模块完成率失败',
      error: error.message
    });
  }
});

// 获取边际贡献率数据 - 年度分析
router.get('/contribution-rate/:year', async (req, res) => {
  try {
    const { year } = req.params;

    // 获取该年度所有月份的边际贡献率数据
    const [rows] = await pool.execute(`
      SELECT period, data
      FROM business_contribution
      WHERE YEAR(CONCAT(period, '-01')) = ?
      ORDER BY period
    `, [year]);

    if (rows.length === 0) {
      // 如果没有数据，返回空数据状态
      return res.json({
        success: true,
        data: {
          months: [],
          monthlyData: [],
          currentRate: 0,
          targetRate: 21.98,
          segmentData: [
            { name: '设备', plan: 25.5, actual: 0, rate: 0 },
            { name: '元件', plan: 15.0, actual: 0, rate: 0 },
            { name: '工程', plan: 22.8, actual: 0, rate: 0 }
          ],
          hasData: false,
          message: '该年份暂无边际贡献率数据'
        }
      });
    }

    // 处理数据
    const months = [];
    const monthlyData = [];
    const segmentData = [
      { name: '设备', plan: 25.5, actual: 0, rate: 0 },
      { name: '元件', plan: 15.0, actual: 0, rate: 0 },
      { name: '工程', plan: 22.8, actual: 0, rate: 0 }
    ];

    // 用于累计各板块的数据
    const segmentAccumulator = {
      equipment: { total: 0, count: 0 },
      components: { total: 0, count: 0 },
      engineering: { total: 0, count: 0 }
    };

    rows.forEach(row => {
      const monthLabel = row.period.split('-')[1] + '月';
      months.push(monthLabel);

      let data;
      try {
        data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      } catch (e) {
        console.error('JSON解析错误:', e, 'data:', row.data);
        monthlyData.push(0);
        return;
      }

      // 辅助函数：解析贡献率值
      const parseContributionRate = (value) => {
        if (!value) return 0;

        // 如果是字符串
        if (typeof value === 'string') {
          // 跳过 '/' 或 '当期无收入' 等无效值
          if (value === '/' || value.includes('无收入')) return 0;

          // 提取数字（包括小数）
          const match = value.match(/(\d+(?:\.\d+)?)/);
          if (match) {
            const rate = parseFloat(match[1]);
            // 过滤异常值（超过200%的可能是错误数据，但允许一些合理的高值）
            return (!isNaN(rate) && rate >= 0 && rate <= 200) ? rate : 0;
          }
        }

        // 如果是数字
        if (typeof value === 'number') {
          // 过滤异常值
          return (value >= 0 && value <= 200) ? value : 0;
        }

        return 0;
      };

      // 设备板块（包括automation数据）
      const equipmentRates = [];
      if (data.equipment) {
        Object.values(data.equipment).forEach(item => {
          const rate = parseContributionRate(item.actual);
          if (rate > 0) equipmentRates.push(rate);
        });
      }
      // 兼容旧数据结构中的automation字段
      if (data.automation) {
        Object.values(data.automation).forEach(item => {
          const rate = parseContributionRate(item.actual);
          if (rate > 0) equipmentRates.push(rate);
        });
      }

      if (equipmentRates.length > 0) {
        const avgRate = equipmentRates.reduce((sum, rate) => sum + rate, 0) / equipmentRates.length;
        segmentAccumulator.equipment.total += avgRate;
        segmentAccumulator.equipment.count += 1;
      }

      // 元件板块
      const componentRates = [];
      if (data.components) {
        Object.values(data.components).forEach(item => {
          const rate = parseContributionRate(item.actual);
          if (rate > 0) componentRates.push(rate);
        });
      }

      if (componentRates.length > 0) {
        const avgRate = componentRates.reduce((sum, rate) => sum + rate, 0) / componentRates.length;
        segmentAccumulator.components.total += avgRate;
        segmentAccumulator.components.count += 1;
      }

      // 工程板块
      const engineeringRates = [];
      if (data.engineering) {
        Object.values(data.engineering).forEach(item => {
          const rate = parseContributionRate(item.actual);
          if (rate > 0) engineeringRates.push(rate);
        });
      }

      if (engineeringRates.length > 0) {
        const avgRate = engineeringRates.reduce((sum, rate) => sum + rate, 0) / engineeringRates.length;
        segmentAccumulator.engineering.total += avgRate;
        segmentAccumulator.engineering.count += 1;
      }

      // 使用数据库中已计算好的total字段作为月度数据
      let monthRate = 0;
      if (data.total && data.total.actual) {
        monthRate = parseContributionRate(data.total.actual);
      }
      monthlyData.push(Number(monthRate.toFixed(2)));
    });

    // 计算各板块的最终平均值
    if (segmentAccumulator.equipment.count > 0) {
      const avgRate = segmentAccumulator.equipment.total / segmentAccumulator.equipment.count;
      segmentData[0].actual = Number(avgRate.toFixed(2));
      segmentData[0].rate = Number(avgRate.toFixed(2));
    }

    if (segmentAccumulator.components.count > 0) {
      const avgRate = segmentAccumulator.components.total / segmentAccumulator.components.count;
      segmentData[1].actual = Number(avgRate.toFixed(2));
      segmentData[1].rate = Number(avgRate.toFixed(2));
    }

    if (segmentAccumulator.engineering.count > 0) {
      const avgRate = segmentAccumulator.engineering.total / segmentAccumulator.engineering.count;
      segmentData[2].actual = Number(avgRate.toFixed(2));
      segmentData[2].rate = Number(avgRate.toFixed(2));
    }

    // 计算当前贡献率（最新月份的数据）
    const currentRate = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : 0;
    const targetRate = 21.98; // 固定目标值

    res.json({
      success: true,
      data: {
        months,
        monthlyData,
        currentRate,
        targetRate,
        segmentData,
        hasData: true
      }
    });

  } catch (error) {
    console.error('获取边际贡献率数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取边际贡献率数据失败',
      error: error.message
    });
  }
});

// 获取毛利率数据 - 年度分析
router.get('/profit-margin/:year', async (req, res) => {
  try {
    const { year } = req.params;

    // 获取该年度所有月份的毛利率数据
    const [rows] = await pool.execute(`
      SELECT period, data
      FROM business_profit_margin
      WHERE YEAR(CONCAT(period, '-01')) = ?
      ORDER BY period
    `, [year]);

    if (rows.length === 0) {
      // 如果没有数据，返回空数据状态
      return res.json({
        success: true,
        data: {
          months: [],
          monthlyData: [],
          currentRate: 0,
          targetRate: 24.00,
          segmentData: [
            { name: '设备', plan: 21.99, actual: 0, rate: 0 },
            { name: '元件', plan: 15.0, actual: 0, rate: 0 },
            { name: '工程', plan: 26.0, actual: 0, rate: 0 }
          ],
          hasData: false,
          message: '该年份暂无毛利率数据'
        }
      });
    }

    // 处理数据
    const months = [];
    const monthlyData = [];
    const segmentData = [
      { name: '设备', plan: 21.99, actual: 0, rate: 0 },
      { name: '元件', plan: 15.0, actual: 0, rate: 0 },
      { name: '工程', plan: 26.0, actual: 0, rate: 0 }
    ];

    // 用于累计各板块的数据
    const segmentAccumulator = {
      equipment: { total: 0, count: 0 },
      components: { total: 0, count: 0 },
      engineering: { total: 0, count: 0 }
    };

    rows.forEach(row => {
      const monthLabel = row.period.split('-')[1] + '月';
      months.push(monthLabel);

      let data;
      try {
        data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      } catch (e) {
        console.error('JSON解析错误:', e, 'data:', row.data);
        monthlyData.push(0);
        return;
      }

      // 辅助函数：解析毛利率值
      const parseProfitMarginRate = (value) => {
        if (!value) return 0;

        if (typeof value === 'string') {
          if (value === '/' || value.includes('无收入')) return 0;
          const match = value.match(/(\d+(?:\.\d+)?)/);
          if (match) {
            const rate = parseFloat(match[1]);
            return (!isNaN(rate) && rate >= 0 && rate <= 200) ? rate : 0;
          }
        }

        if (typeof value === 'number') {
          return (value >= 0 && value <= 200) ? value : 0;
        }

        return 0;
      };

      // 使用数据库中已计算好的total字段作为月度数据
      let monthRate = 0;
      if (data.total && data.total.actual) {
        monthRate = parseProfitMarginRate(data.total.actual);
      }
      monthlyData.push(Number(monthRate.toFixed(2)));

      // 累计各板块数据用于最终平均值计算
      // 设备板块
      const equipmentRates = [];
      if (data.equipment) {
        Object.values(data.equipment).forEach(item => {
          const rate = parseProfitMarginRate(item.actual);
          if (rate > 0) equipmentRates.push(rate);
        });
      }

      if (equipmentRates.length > 0) {
        const avgRate = equipmentRates.reduce((sum, rate) => sum + rate, 0) / equipmentRates.length;
        segmentAccumulator.equipment.total += avgRate;
        segmentAccumulator.equipment.count += 1;
      }

      // 元件板块
      const componentRates = [];
      if (data.components) {
        Object.values(data.components).forEach(item => {
          const rate = parseProfitMarginRate(item.actual);
          if (rate > 0) componentRates.push(rate);
        });
      }

      if (componentRates.length > 0) {
        const avgRate = componentRates.reduce((sum, rate) => sum + rate, 0) / componentRates.length;
        segmentAccumulator.components.total += avgRate;
        segmentAccumulator.components.count += 1;
      }

      // 工程板块
      const engineeringRates = [];
      if (data.engineering) {
        Object.values(data.engineering).forEach(item => {
          const rate = parseProfitMarginRate(item.actual);
          if (rate > 0) engineeringRates.push(rate);
        });
      }

      if (engineeringRates.length > 0) {
        const avgRate = engineeringRates.reduce((sum, rate) => sum + rate, 0) / engineeringRates.length;
        segmentAccumulator.engineering.total += avgRate;
        segmentAccumulator.engineering.count += 1;
      }
    });

    // 计算各板块的最终平均值
    if (segmentAccumulator.equipment.count > 0) {
      const avgRate = segmentAccumulator.equipment.total / segmentAccumulator.equipment.count;
      segmentData[0].actual = Number(avgRate.toFixed(2));
      segmentData[0].rate = Number(avgRate.toFixed(2));
    }

    if (segmentAccumulator.components.count > 0) {
      const avgRate = segmentAccumulator.components.total / segmentAccumulator.components.count;
      segmentData[1].actual = Number(avgRate.toFixed(2));
      segmentData[1].rate = Number(avgRate.toFixed(2));
    }

    if (segmentAccumulator.engineering.count > 0) {
      const avgRate = segmentAccumulator.engineering.total / segmentAccumulator.engineering.count;
      segmentData[2].actual = Number(avgRate.toFixed(2));
      segmentData[2].rate = Number(avgRate.toFixed(2));
    }

    // 计算当前毛利率（最新月份的数据）
    const currentRate = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : 0;
    const targetRate = 24.00; // 固定目标值

    res.json({
      success: true,
      data: {
        months,
        monthlyData,
        currentRate,
        targetRate,
        segmentData,
        hasData: true
      }
    });

  } catch (error) {
    console.error('获取毛利率数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取毛利率数据失败',
      error: error.message
    });
  }
});

// 获取南华毛利率数据 - 年度分析
router.get('/nanhua-profit-margin/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const fetch = require('node-fetch');

    // 获取该年度的月份列表（1-12月）
    const months = [];
    const monthlyData = [];
    const customerAccumulator = {
      '一包项目': { total: 0, count: 0, plan: 14.54 },
      '二包项目': { total: 0, count: 0, plan: 15.50 },
      '域内合作项目': { total: 0, count: 0, plan: 8.00 },
      '域外合作项目': { total: 0, count: 0, plan: 5.48 },
      '新能源项目': { total: 0, count: 0, plan: 17.25 },
      '苏州项目': { total: 0, count: 0, plan: 6.00 },
              '自接项目': { total: 0, count: 0, plan: 47.12 },
        '其他': { total: 0, count: 0, plan: 0.00 }
    };

    let hasAnyData = false;

    // 遍历12个月，获取每月的计算数据
    for (let month = 1; month <= 12; month++) {
      const period = `${year}-${month.toString().padStart(2, '0')}`;
      
      try {
        // 调用计算API获取该月数据
        const response = await fetch(`http://47.111.95.19:3000/nanhua-business-profit-margin-with-self-built/calculate/${period}`);
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.data && result.data.customers) {
            const monthLabel = `${month.toString().padStart(2, '0')}月`;
            months.push(monthLabel);
            
                                     // 计算该月的加权平均毛利率（基于收入规模）
            let totalRevenue = 0;
            let totalProfit = 0;
            
            // 首先获取收入数据来计算权重
            try {
              const incomeResponse = await fetch(`http://47.111.95.19:3000/nanhua-business-income/${period}`);
              if (incomeResponse.ok) {
                const incomeResult = await incomeResponse.json();
                if (incomeResult.success && incomeResult.data && incomeResult.data.customers) {
                  result.data.customers.forEach(customer => {
                    const rate = customer.current || 0;
                    
                    // 找到对应的收入数据
                    let customerName = customer.customerName;
                    
                    
                    const incomeCustomer = incomeResult.data.customers.find(item => item.customerName === customerName);
                    const revenue = incomeCustomer ? (incomeCustomer.accumulated || incomeCustomer.current || 0) : 0;
                    
                    if (revenue > 0) {
                      const profit = revenue * (rate / 100);
                      totalRevenue += revenue;
                      totalProfit += profit;
                    }
                    
                    // 累计各客户数据
                    if (customerAccumulator[customer.customerName]) {
                      customerAccumulator[customer.customerName].total += rate;
                      customerAccumulator[customer.customerName].count += 1;
                    }
                  });
                }
              }
            } catch (error) {
              console.error(`获取${period}收入数据失败:`, error);
            }
            
            // 如果无法获取收入数据，使用简单平均
            let monthRate = 0;
            if (totalRevenue > 0) {
              monthRate = (totalProfit / totalRevenue) * 100;
            } else {
              let totalRate = 0;
              let totalCustomers = 0;
              result.data.customers.forEach(customer => {
                const rate = customer.current || 0;
                totalRate += rate;
                totalCustomers++;
              });
              monthRate = totalCustomers > 0 ? totalRate / totalCustomers : 0;
            }
             monthlyData.push(Number(monthRate.toFixed(2)));
             
             if (totalRevenue > 0 || result.data.customers.some(c => c.current > 0)) {
               hasAnyData = true;
             }
          }
        }
      } catch (error) {
        console.error(`获取${period}数据失败:`, error);
        // 月份没有数据时跳过，不添加到months和monthlyData中
      }
    }

    if (!hasAnyData) {
      // 如果没有数据，返回空数据状态
      return res.json({
        success: true,
        data: {
          months: [],
          monthlyData: [],
          currentRate: 0,
          targetRate: 24.00,
          customerData: [
            { name: '一包项目', plan: 14.54, actual: 0, rate: 0 },
            { name: '二包项目', plan: 15.50, actual: 0, rate: 0 },
            { name: '域内合作项目', plan: 8.00, actual: 0, rate: 0 },
            { name: '域外合作项目', plan: 5.48, actual: 0, rate: 0 },
            { name: '新能源项目', plan: 17.25, actual: 0, rate: 0 },
            { name: '苏州项目', plan: 6.00, actual: 0, rate: 0 },
                          { name: '自接项目', plan: 47.12, actual: 0, rate: 0 },
              { name: '其他', plan: 0.00, actual: 0, rate: 0 }
          ],
          hasData: false,
          message: '该年份暂无南华毛利率数据'
        }
      });
    }

    // 生成客户数据
    const customerData = Object.keys(customerAccumulator).map(customerName => {
      const acc = customerAccumulator[customerName];
      const avgRate = acc.count > 0 ? acc.total / acc.count : 0;
      
      return {
        name: customerName,
        plan: acc.plan,
        actual: Number(avgRate.toFixed(2)),
        rate: Number(avgRate.toFixed(2))
      };
    });

    // 计算当前毛利率（最新月份的数据）
    const currentRate = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : 0;
    const targetRate = 24.00; // 固定目标值

    res.json({
      success: true,
      data: {
        months,
        monthlyData,
        currentRate,
        targetRate,
        customerData,
        hasData: true
      }
    });

  } catch (error) {
    console.error('获取南华毛利率数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取南华毛利率数据失败',
      error: error.message
    });
  }
});

// 获取净资产收益率数据
router.get('/roe/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const { company = 'main' } = req.query; // 获取公司参数，默认为主公司
    const currentMonth = new Date().getMonth() + 1;

    // 根据公司参数确定表名
    const tableMap = {
      'main': { income: 'income_statement', balance: 'balance_sheet' },
      'nanhua': { income: 'nanhua_income_statement', balance: 'nanhua_balance_sheet' },
      'tuoyuan': { income: 'tuoyuan_income_statement', balance: 'tuoyuan_balance_sheet' }
    };
    const tables = tableMap[company] || tableMap['main'];

    console.log(`Fetching ROE data for year: ${year}, company: ${company}, tables: ${JSON.stringify(tables)}`);

    // 获取该年份所有月份的利润表数据
    const [incomeRows] = await pool.execute(`
      SELECT period, data
      FROM ${tables.income}
      WHERE YEAR(period) = ?
      ORDER BY period ASC
    `, [year]);

    // 获取该年份所有月份的资产负债表数据
    const [balanceRows] = await pool.execute(`
      SELECT period, data
      FROM ${tables.balance}
      WHERE YEAR(period) = ?
      ORDER BY period ASC
    `, [year]);

    const months = [];
    const roeData = [];
    let latestROE = 0;
    let latestNetProfit = 0;
    let latestShareholderEquity = 0;
    let dataFound = false;

    // 生成月份标签
    for (let month = 1; month <= currentMonth; month++) {
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      const periodDate = `${year}-${monthStr}-01`;
      const monthLabel = `${month}月`;
      months.push(monthLabel);

      // 查找对应月份的数据
      const incomeData = incomeRows.find(row => {
        const rowMonth = row.period.getMonth() + 1;
        return rowMonth === month;
      });
      const balanceData = balanceRows.find(row => {
        const rowMonth = row.period.getMonth() + 1;
        return rowMonth === month;
      });

      let monthROE = 0;

      if (incomeData && balanceData) {
        try {
          const incomeJson = typeof incomeData.data === 'string' ? 
            JSON.parse(incomeData.data) : incomeData.data;
          const balanceJson = typeof balanceData.data === 'string' ? 
            JSON.parse(balanceData.data) : balanceData.data;

          const netProfit = incomeJson.total_profit && incomeJson.total_profit.current_amount ? 
            Number(incomeJson.total_profit.current_amount) : 
            (incomeJson.net_profit && incomeJson.net_profit.current_amount ? 
              Number(incomeJson.net_profit.current_amount) : 0);
          
          // 尝试多种方式获取股东权益
          let shareholderEquity = 0;
          
          // 方式1：直接从equityTotal获取
          if (balanceJson.equityTotal && balanceJson.equityTotal.endBalance) {
            shareholderEquity = Number(balanceJson.equityTotal.endBalance);
          }
          
          // 方式2：如果equityTotal为0，尝试从equity数组中找到股东权益合计
          if (shareholderEquity === 0 && balanceJson.equity && Array.isArray(balanceJson.equity)) {
            const equityTotal = balanceJson.equity.find(item => 
              item.name && (
                item.name.includes('股东权益') || 
                item.name.includes('所有者权益') ||
                item.total === true
              )
            );
            if (equityTotal && equityTotal.endBalance) {
              shareholderEquity = Number(equityTotal.endBalance);
            }
          }
          
          // 方式3：如果还是0，计算所有权益项目的总和（排除少数股东权益）
          if (shareholderEquity === 0 && balanceJson.equity && Array.isArray(balanceJson.equity)) {
            let totalEquity = 0;
            balanceJson.equity.forEach(item => {
              if (item.endBalance && 
                  !item.special && // 排除少数股东权益
                  !item.highlight && // 排除特殊标记项
                  !item.name.includes('少数股东') &&
                  !item.name.includes('#') &&
                  !item.name.includes('△')) {
                totalEquity += Number(item.endBalance) || 0;
              }
            });
            shareholderEquity = totalEquity;
          }
          
          console.log(`月份${month}: 净利润=${netProfit}, 股东权益=${shareholderEquity}`);

          if (shareholderEquity > 0 && netProfit !== 0) {
            monthROE = parseFloat(((netProfit / shareholderEquity) * 100).toFixed(2));
            latestROE = monthROE;
            latestNetProfit = netProfit;
            latestShareholderEquity = shareholderEquity;
            dataFound = true;
          }
        } catch (e) {
          console.error(`解析${month}月数据失败:`, e);
        }
      }

      roeData.push(monthROE);
    }

    // 如果没有找到任何数据，返回空数据
    if (!dataFound) {
      res.json({
        success: false,
        message: '未找到对应期间的财务数据',
        data: {
          months: [],
          monthlyData: {
            roe: []
          },
          summary: {
            currentROE: 0,
            targetROE: 21.18,
            completion_rate: 0,
            netProfit: 0,
            shareholderEquity: 0
          },
          year: parseInt(year),
          lastUpdated: new Date().toISOString(),
          isSimulated: false
        }
      });
      return;
    }

    // 计算完成率
    const completion_rate = latestROE > 0 ? parseFloat((latestROE / 21.18 * 100).toFixed(2)) : 0;

    res.json({
      success: true,
      data: {
        months,
        monthlyData: {
          roe: roeData
        },
        summary: {
          currentROE: latestROE,
          targetROE: 21.18,
          completion_rate,
          netProfit: latestNetProfit,
          shareholderEquity: latestShareholderEquity
        },
        year: parseInt(year),
        lastUpdated: new Date().toISOString(),
        isSimulated: false
      }
    });

  } catch (error) {
    console.error('获取净资产收益率失败:', error);
    res.status(500).json({
      success: false,
      message: '获取净资产收益率失败',
      error: error.message
    });
  }
});

// 获取净利率数据 - 年度分析
router.get('/net-profit-margin/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const currentMonth = new Date().getMonth() + 1;
    const availableMonths = months.slice(0, currentMonth);
    
    console.log(`Fetching net profit margin data for year: ${year}`);
    
    // 处理数据
    const monthlyData = [];
    let latestRate = 0;
    
    // 为每个可用月份计算净利率
    for (let i = 0; i < availableMonths.length; i++) {
      const month = availableMonths[i];
      const targetPeriod = `${year}-${month}`;
      
      let netProfitMargin = 0;
      
      try {
                // 计算累计收入：与前端逻辑完全一致（各月当月收入累加，包含同业）
        let totalRevenue = 0;
        let equipmentRevenue = 0;
        let componentsRevenue = 0;
        let engineeringRevenue = 0;
        
        // 按客户分组累计收入（与前端calculateAccumulatedIncome函数逻辑一致）
        const customerRevenues = {};
        
        // 获取从年初到当月的所有月份数据
        for (let m = 1; m <= parseInt(month); m++) {
          const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`;
          const incomeDate = `${year}-${m.toString().padStart(2, '0')}-01`;
          
          try {
            const [monthIncomeRows] = await pool.execute(
              'SELECT data FROM main_business_income WHERE period = ?',
              [incomeDate]
            );
            
            if (monthIncomeRows.length > 0) {
              const monthIncomeData = monthIncomeRows[0].data;
              
              // 处理设备板块
              if (monthIncomeData.equipment && Array.isArray(monthIncomeData.equipment)) {
                monthIncomeData.equipment.forEach(item => {
                  const customer = item.customer;
                  const monthlyRevenue = parseFloat(item.currentMonthIncome) || 0;
                  
                  if (!customerRevenues[`equipment_${customer}`]) {
                    customerRevenues[`equipment_${customer}`] = 0;
                  }
                  customerRevenues[`equipment_${customer}`] += monthlyRevenue;
                });
              }
              
              // 处理元件板块
              if (monthIncomeData.components && Array.isArray(monthIncomeData.components)) {
                monthIncomeData.components.forEach(item => {
                  const customer = item.customer;
                  const monthlyRevenue = parseFloat(item.currentMonthIncome) || 0;
                  
                  if (!customerRevenues[`components_${customer}`]) {
                    customerRevenues[`components_${customer}`] = 0;
                  }
                  customerRevenues[`components_${customer}`] += monthlyRevenue;
                });
              }
              
              // 处理工程板块
              if (monthIncomeData.engineering && Array.isArray(monthIncomeData.engineering)) {
                monthIncomeData.engineering.forEach(item => {
                  const customer = item.customer;
                  const monthlyRevenue = parseFloat(item.currentMonthIncome) || 0;
                  
                  if (!customerRevenues[`engineering_${customer}`]) {
                    customerRevenues[`engineering_${customer}`] = 0;
                  }
                  customerRevenues[`engineering_${customer}`] += monthlyRevenue;
                });
              }
            }
          } catch (monthError) {
            console.log(`跳过月份 ${monthPeriod}:`, monthError.message);
          }
        }
        
        // 计算各板块总收入
        Object.keys(customerRevenues).forEach(key => {
          const revenue = customerRevenues[key];
          totalRevenue += revenue;
          
          if (key.startsWith('equipment_')) {
            equipmentRevenue += revenue;
          } else if (key.startsWith('components_')) {
            componentsRevenue += revenue;
          } else if (key.startsWith('engineering_')) {
            engineeringRevenue += revenue;
          }
        });
        
        // 获取净利润数据
        const [profitRows] = await pool.execute(
          'SELECT data FROM main_business_net_profit WHERE period = ?',
          [targetPeriod]
        );
        
        if (profitRows.length > 0) {
          const profitData = profitRows[0].data;
          
          // 计算累计净利润总额（排除同业，使用actual字段作为累计值）
          let totalNetProfit = 0;
          let equipmentProfit = 0;
          let componentsProfit = 0;
          let engineeringProfit = 0;
          
          if (Array.isArray(profitData)) {
            profitData.forEach(item => {
              // 包含同业客户（与前端口径保持一致）
              // 使用累计净利润（actual字段），需要处理逗号分隔符
              let actualValue = item.actual || '0';
              if (typeof actualValue === 'string') {
                actualValue = actualValue.replace(/,/g, '');
              }
              const profit = parseFloat(actualValue) || 0;
              totalNetProfit += profit;
              
              // 按板块分类
              if (item.segment === '设备') {
                equipmentProfit += profit;
              } else if (item.segment === '元件') {
                componentsProfit += profit;
              } else if (item.segment === '工程') {
                engineeringProfit += profit;
              }
            });
          }
          
          console.log(`=== ${targetPeriod} 累计数据详细计算（与前端完全一致）===`);
          console.log(`累计收入明细(含同业): 设备=${equipmentRevenue}万元, 元件=${componentsRevenue}万元, 工程=${engineeringRevenue}万元, 总计=${totalRevenue}万元`);
          console.log(`累计净利润明细(含同业): 设备=${equipmentProfit}万元, 元件=${componentsProfit}万元, 工程=${engineeringProfit}万元, 总计=${totalNetProfit}万元`);
          console.log(`客户累计收入详情:`, customerRevenues);
          
          // 计算净利率 = 累计净利润 / 累计主营业务收入 * 100
          // 统一单位：收入单位是万元，净利润单位是万元
          if (totalRevenue > 0) {
            netProfitMargin = parseFloat(((totalNetProfit / totalRevenue) * 100).toFixed(2));
            latestRate = netProfitMargin;
          }
          
          console.log(`净利率计算: ${totalNetProfit} / ${totalRevenue} * 100 = ${netProfitMargin}%`);
          console.log(`预期5月数据: 收入约18473.85万元, 净利润约981.16万元, 净利率约5.31%`);
          console.log(`================================================`);
        }
        
      } catch (error) {
        console.error(`计算${month}月净利率失败:`, error);
      }
      
      monthlyData.push(netProfitMargin);
    }
    
    // 检查是否有数据
    const hasData = monthlyData.some(rate => rate > 0);
    
    if (!hasData) {
      return res.json({
        success: true,
        data: {
          months: availableMonths.map(month => `${month}月`),
          monthlyData: [],
          currentRate: 0,
          targetRate: 6.85, // 目标净利率 6.85%
          hasData: false
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        months: availableMonths.map(month => `${month}月`),
        monthlyData,
        currentRate: latestRate,
        targetRate: 6.85, // 目标净利率 6.85%
        hasData: monthlyData.some(rate => rate > 0)
      }
    });
    
  } catch (error) {
    console.error('获取净利率数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取净利率数据失败',
      error: error.message
    });
  }
});

// 获取资产负债率数据 - 年度分析
router.get('/asset-liability-ratio/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const { company = 'main' } = req.query; // 获取公司参数，默认为主公司
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const currentMonth = new Date().getMonth() + 1;
    const availableMonths = months.slice(0, currentMonth);

    // 根据公司参数确定表名
    const tableMap = {
      'main': 'balance_sheet',
      'nanhua': 'nanhua_balance_sheet',
      'tuoyuan': 'tuoyuan_balance_sheet'
    };
    const tableName = tableMap[company] || 'balance_sheet';

    console.log(`Fetching asset liability ratio data for year: ${year}, company: ${company}, table: ${tableName}`);

    // 获取该年份的资产负债表数据
    const [rows] = await pool.execute(`
      SELECT DATE_FORMAT(period, '%Y-%m') as period_ym, data
      FROM ${tableName}
      WHERE YEAR(period) = ?
      ORDER BY period ASC
    `, [year]);
    
    console.log(`Found ${rows.length} balance sheet records`);
    
    if (rows.length === 0) {
      return res.json({
        success: true,
        data: {
          months: availableMonths.map(month => `${month}月`),
          monthlyData: [],
          currentRate: 0,
          targetRate: 74.00, // 目标资产负债率 74%
          hasData: false
        }
      });
    }
    
    // 处理数据
    const monthlyData = [];
    let latestRate = 0;
    
    // 为每个可用月份计算资产负债率
    for (let i = 0; i < availableMonths.length; i++) {
      const month = availableMonths[i];
      const targetPeriod = `${year}-${month}`;
      
      // 查找对应月份的数据
      const monthData = rows.find(row => row.period_ym === targetPeriod);
      
      let assetLiabilityRatio = 0;
      
      if (monthData) {
        try {
          const parsedData = typeof monthData.data === 'string' ? 
            JSON.parse(monthData.data) : monthData.data;
          
          // 计算资产总计 = 流动资产总计 + 非流动资产总计
          const currentAssets = parsedData.assets && parsedData.assets.currentTotal && 
            parsedData.assets.currentTotal.endBalance !== null ? 
            Number(parsedData.assets.currentTotal.endBalance) : 0;
          const nonCurrentAssets = parsedData.assets && parsedData.assets.nonCurrentTotal && 
            parsedData.assets.nonCurrentTotal.endBalance !== null ? 
            Number(parsedData.assets.nonCurrentTotal.endBalance) : 0;
          const totalAssets = currentAssets + nonCurrentAssets;
          
          // 计算所有者权益总计
          let equityTotal = 0;
          if (parsedData.equity && Array.isArray(parsedData.equity)) {
            parsedData.equity.forEach(item => {
              if (item.endBalance && typeof item.endBalance === 'number') {
                equityTotal += item.endBalance;
              }
            });
          }
          
          // 使用会计恒等式计算负债：负债 = 资产 - 所有者权益
          const totalLiabilities = totalAssets - equityTotal;
          
          // 计算资产负债率 = 负债合计 / 资产合计 * 100
          if (totalAssets > 0) {
            assetLiabilityRatio = parseFloat(((totalLiabilities / totalAssets) * 100).toFixed(2));
            latestRate = assetLiabilityRatio;
          }
          
          console.log(`Period: ${targetPeriod}, Current assets: ${currentAssets}元, Non-current assets: ${nonCurrentAssets}元, Total assets: ${totalAssets}元, Equity total: ${equityTotal}元, Total liabilities: ${totalLiabilities}元, Ratio: ${assetLiabilityRatio}%`);
          
        } catch (error) {
          console.error(`解析${month}月数据失败:`, error);
        }
      }
      
      monthlyData.push(assetLiabilityRatio);
    }
    
    res.json({
      success: true,
      data: {
        months: availableMonths.map(month => `${month}月`),
        monthlyData,
        currentRate: latestRate,
        targetRate: 74.00, // 目标资产负债率 74%
        hasData: monthlyData.some(rate => rate > 0)
      }
    });
    
  } catch (error) {
    console.error('获取资产负债率数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取资产负债率数据失败',
      error: error.message
    });
  }
});

// 获取存量指标数据 - 年度分析（预中标+在产+库存）
router.get('/inventory-metrics/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const currentMonth = new Date().getMonth() + 1;
    const availableMonths = months.slice(0, currentMonth);
    
    console.log(`Fetching inventory metrics data for year: ${year}`);
    
    // 处理数据结构
    const monthlyData = [];
    const compositionData = [];
    let hasData = false;
    
    // 为每个可用月份获取存量数据
    for (let i = 0; i < availableMonths.length; i++) {
      const month = availableMonths[i];
      const period = `${year}-${month}`;
      
      try {
        // 1. 获取预中标数据（从招投标情况表，如果当月没有数据则取最近的月份）
        let [biddingRows] = await pool.execute(`
          SELECT win_amount FROM bidding_status 
          WHERE period = ?
        `, [period]);
        
        // 如果当前月份没有招投标数据，尝试获取最近一个月的数据
        if (biddingRows.length === 0) {
          [biddingRows] = await pool.execute(`
            SELECT win_amount FROM bidding_status 
            WHERE period < ? AND YEAR(CONCAT(period, '-01')) = ?
            ORDER BY period DESC 
            LIMIT 1
          `, [period, year]);
        }
        
        // 2. 获取在产数据
        const [inProgressRows] = await pool.execute(`
          SELECT current_amount FROM inventory_in_progress 
          WHERE period = ?
        `, [period]);
        
        // 3. 获取库存数据
        const [inventoryRows] = await pool.execute(`
          SELECT current_amount FROM contract_inventory 
          WHERE period = ?
        `, [period]);
        
        // 计算各项存量
        let preBidAmount = 0;
        let inProgressAmount = 0;
        let inventoryAmount = 0;
        
        // 预中标金额 - 使用中标金额汇总
        if (biddingRows.length > 0) {
          preBidAmount = biddingRows.reduce((sum, row) => 
            sum + Number(row.win_amount || 0), 0);
        }
        
        // 在产金额 - 累计当前金额
        if (inProgressRows.length > 0) {
          inProgressAmount = inProgressRows.reduce((sum, row) => 
            sum + Number(row.current_amount || 0), 0);
        }
        
        // 库存金额 - 累计当前金额
        if (inventoryRows.length > 0) {
          inventoryAmount = inventoryRows.reduce((sum, row) => 
            sum + Number(row.current_amount || 0), 0);
        }
        
        // 计算总存量
        const totalInventory = preBidAmount + inProgressAmount + inventoryAmount;
        
        monthlyData.push({
          month: `${month}月`,
          preBid: preBidAmount,
          inProgress: inProgressAmount,
          inventory: inventoryAmount,
          total: totalInventory
        });
        
        if (totalInventory > 0) {
          hasData = true;
        }
        
        console.log(`Period: ${period}, 预中标: ${preBidAmount}, 在产: ${inProgressAmount}, 库存: ${inventoryAmount}, 总计: ${totalInventory}`);
        
      } catch (error) {
        console.error(`获取${period}存量数据失败:`, error);
        monthlyData.push({
          month: `${month}月`,
          preBid: 0,
          inProgress: 0,
          inventory: 0,
          total: 0
        });
      }
    }
    
    // 计算最新月份的构成分布
    if (monthlyData.length > 0) {
      const latestData = monthlyData[monthlyData.length - 1];
      const total = latestData.total;
      
      if (total > 0) {
        compositionData.push(
          {
            name: '预中标',
            value: latestData.preBid,
            percentage: parseFloat(((latestData.preBid / total) * 100).toFixed(1))
          },
          {
            name: '在产',
            value: latestData.inProgress,
            percentage: parseFloat(((latestData.inProgress / total) * 100).toFixed(1))
          },
          {
            name: '库存',
            value: latestData.inventory,
            percentage: parseFloat(((latestData.inventory / total) * 100).toFixed(1))
          }
        );
      }
    }
    
    res.json({
      success: true,
      data: {
        months: monthlyData.map(item => item.month),
        monthlyData: monthlyData,
        compositionData: compositionData,
        currentTotal: monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].total : 0,
        hasData: hasData
      }
    });
    
  } catch (error) {
    console.error('获取存量指标数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取存量指标数据失败',
      error: error.message
    });
  }
});

// 获取拓源毛利率数据 - 年度分析
router.get('/tuoyuan-profit-margin/:year', async (req, res) => {
  try {
    const { year } = req.params;

    // 获取该年度所有月份的拓源毛利率数据
    const [rows] = await pool.execute(`
      SELECT period, segment_attribute, customer_attribute, yearly_plan, current_actual, deviation
      FROM tuoyuan_main_business_profit_margin
      WHERE YEAR(CONCAT(period, '-01')) = ?
      ORDER BY period, segment_attribute, customer_attribute
    `, [year]);

    if (rows.length === 0) {
      // 如果没有数据，返回空数据状态
      return res.json({
        success: true,
        data: {
          months: [],
          monthlyData: [],
          currentRate: 0,
          targetRate: 24.99,
          segmentData: [
            { name: '设备', plan: 8.25, actual: 0, rate: 0 },
            { name: '其他', plan: 50.00, actual: 0, rate: 0 }
          ],
          hasData: false,
          message: '该年份暂无拓源毛利率数据'
        }
      });
    }

    // 处理数据 - 按月份和板块分组
    const monthlyMap = new Map();
    const segmentAccumulator = {
      '设备': { total: 0, count: 0, plan: 8.25 },
      '其他': { total: 0, count: 0, plan: 50.00 }
    };

    rows.forEach(row => {
      const period = row.period;
      const segmentAttribute = row.segment_attribute;
      const currentActual = parseFloat(row.current_actual) || 0;

      // 按月份分组计算加权平均
      if (!monthlyMap.has(period)) {
        monthlyMap.set(period, { totalValue: 0, totalWeight: 0 });
      }
      
      const monthData = monthlyMap.get(period);
      // 使用yearly_plan作为权重，如果为0则使用1作为基础权重
      const weight = Math.max(parseFloat(row.yearly_plan) || 0, 1);
      monthData.totalValue += currentActual * weight;
      monthData.totalWeight += weight;

      // 累计各板块数据用于最终平均值计算
      if (segmentAccumulator[segmentAttribute] && currentActual > 0) {
        segmentAccumulator[segmentAttribute].total += currentActual;
        segmentAccumulator[segmentAttribute].count += 1;
      }
    });

    // 生成月份和月度数据
    const months = [];
    const monthlyData = [];
    
    const sortedPeriods = Array.from(monthlyMap.keys()).sort();
    sortedPeriods.forEach(period => {
      const monthLabel = period.split('-')[1] + '月';
      months.push(monthLabel);
      
      const monthInfo = monthlyMap.get(period);
      const monthRate = monthInfo.totalWeight > 0 ? 
        monthInfo.totalValue / monthInfo.totalWeight : 0;
      monthlyData.push(Number(monthRate.toFixed(2)));
    });

    // 生成板块数据
    const segmentData = Object.keys(segmentAccumulator).map(segmentName => {
      const acc = segmentAccumulator[segmentName];
      const avgRate = acc.count > 0 ? acc.total / acc.count : 0;
      
      return {
        name: segmentName,
        plan: acc.plan,
        actual: Number(avgRate.toFixed(2)),
        rate: Number(avgRate.toFixed(2))
      };
    });

    // 计算当前毛利率（最新月份的数据）
    const currentRate = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : 0;
    const targetRate = 24.99; // 固定目标值

    res.json({
      success: true,
      data: {
        months,
        monthlyData,
        currentRate,
        targetRate,
        segmentData,
        hasData: true
      }
    });

  } catch (error) {
    console.error('获取拓源毛利率数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取拓源毛利率数据失败',
      error: error.message
    });
  }
});

// 获取南华成本中心月度趋势数据
router.get('/nanhua-cost-center/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    const months = [];
    const monthlyData = {
      engineering: {
        cumulativeIncome: [],
        currentPeriodTotal: []
      },
      nonMainBusiness: {
        cumulativeIncome: [],
        currentPeriodTotal: []
      }
    };
    
    // 获取12个月的数据
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');
      const period = `${year}-${monthStr}`;
      months.push(`${month}月`);
      
      // 获取当月数据
      const [currentRows] = await pool.execute(
        'SELECT customer_name, category, current_income FROM nanhua_cost_center_structure WHERE period = ?',
        [period]
      );
      
      // 计算当月工程项目总计
      const engineeringCurrent = currentRows
        .filter(row => row.category === '工程')
        .reduce((sum, row) => sum + parseFloat(row.current_income || 0), 0);
      
      // 计算当月非主营业务总计  
      const nonMainBusinessCurrent = currentRows
        .filter(row => row.category === '非主营业务')
        .reduce((sum, row) => sum + parseFloat(row.current_income || 0), 0);
      
      monthlyData.engineering.currentPeriodTotal.push(engineeringCurrent);
      monthlyData.nonMainBusiness.currentPeriodTotal.push(nonMainBusinessCurrent);
      
      // 计算累计数据（从年初到当前月）
      const [accumulatedRows] = await pool.execute(
        'SELECT category, SUM(current_income) as total_accumulated FROM nanhua_cost_center_structure WHERE period >= ? AND period <= ? GROUP BY category',
        [`${year}-01`, period]
      );
      
      // 工程项目累计
      const engineeringAccumulated = accumulatedRows
        .filter(row => row.category === '工程')
        .reduce((sum, row) => sum + parseFloat(row.total_accumulated || 0), 0);
      
      // 非主营业务累计
      const nonMainBusinessAccumulated = accumulatedRows
        .filter(row => row.category === '非主营业务')
        .reduce((sum, row) => sum + parseFloat(row.total_accumulated || 0), 0);
      
      monthlyData.engineering.cumulativeIncome.push(engineeringAccumulated);
      monthlyData.nonMainBusiness.cumulativeIncome.push(nonMainBusinessAccumulated);
    }
    
    // 计算汇总数据
    const summary = {
      engineering: {
        cumulativeIncome: monthlyData.engineering.cumulativeIncome[11] || 0,
        currentPeriodTotal: monthlyData.engineering.currentPeriodTotal.reduce((sum, val) => sum + val, 0)
      },
      nonMainBusiness: {
        cumulativeIncome: monthlyData.nonMainBusiness.cumulativeIncome[11] || 0,
        currentPeriodTotal: monthlyData.nonMainBusiness.currentPeriodTotal.reduce((sum, val) => sum + val, 0)
      }
    };
    
    // 年度计划总计（基于固定数据计算）
    const yearlyPlan = 284.22 + 106.53 + 41.41 + 17.07 + 157.09 + 12.88 + 41.77 + 68.06 + 0.47 + 5.91;
    
    res.json({
      success: true,
      data: {
        months,
        monthlyData,
        summary,
        yearlyPlan
      }
    });
  } catch (error) {
    console.error('获取南华成本中心月度趋势数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败',
      error: error.message
    });
  }
});

// 获取南华新签订单趋势分析数据
router.get('/nanhua-new-orders/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // 固定的客户列表和年度计划（基于NewOrderStructure.vue的固定数据）
    const fixedPlanData = [
      { customer: '一包项目', yearlyPlan: 7000.00, category: '工程' },
      { customer: '二包项目', yearlyPlan: 2000.00, category: '工程' },
      { customer: '域内合作项目', yearlyPlan: 6000.00, category: '工程' },
      { customer: '域外合作项目', yearlyPlan: 2000.00, category: '工程' },
      { customer: '新能源项目', yearlyPlan: 4000.00, category: '工程' },
      { customer: '苏州项目', yearlyPlan: 1000.00, category: '工程' },
      { customer: '自接项目', yearlyPlan: 0.00, category: '工程' }
    ];

    // 获取该年度所有期间的数据
    const [allPeriodsData] = await pool.execute(`
      SELECT
        period,
        customer,
        current_amount,
        accumulated,
        category
      FROM nanhua_new_orders
      WHERE YEAR(CONCAT(period, '-01')) = ?
      ORDER BY period, customer
    `, [year]);

    // 生成月份列表
    const months = [];
    for (let i = 1; i <= 12; i++) {
      months.push(`${i}月`);
    }

    // 初始化月度数据结构
    const monthlyData = {};
    const categories = ['工程']; // 南华新签订单只有工程类别

    categories.forEach(category => {
      monthlyData[category] = {
        current_total: new Array(12).fill(0),
        cumulative: new Array(12).fill(0)
      };
    });

    // 按月份整理数据
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const month = String(monthIndex + 1).padStart(2, '0');
      const targetPeriod = `${year}-${month}`;

      // 计算当月各客户的总和
      const monthData = allPeriodsData.filter(row => row.period === targetPeriod);
      let monthTotal = 0;
      let cumulativeTotal = 0;

      monthData.forEach(row => {
        monthTotal += parseFloat(row.current_amount) || 0;
        cumulativeTotal += parseFloat(row.accumulated) || 0;
      });

      // 如果没有累计数据，则从第一个月开始累加当期数据
      if (cumulativeTotal === 0 && monthIndex > 0) {
        cumulativeTotal = (monthlyData['工程'].cumulative[monthIndex - 1] || 0) + monthTotal;
      } else if (cumulativeTotal === 0) {
        cumulativeTotal = monthTotal;
      }

      monthlyData['工程'].current_total[monthIndex] = monthTotal;
      monthlyData['工程'].cumulative[monthIndex] = cumulativeTotal;
    }

    // 计算汇总数据
    const totalYearlyPlan = fixedPlanData.reduce((sum, item) => sum + item.yearlyPlan, 0);
    const totalCumulative = monthlyData['工程'].cumulative[11] || 0;
    const completionRate = totalYearlyPlan > 0 ? Number(((totalCumulative / totalYearlyPlan) * 100).toFixed(2)) : 0;

    const summary = {
      '工程': {
        yearly_plan: totalYearlyPlan,
        current_total: totalCumulative,
        completion_rate: completionRate
      }
    };

    res.json({
      success: true,
      data: {
        months,
        monthlyData,
        summary,
        categories: ['工程']
      }
    });
  } catch (error) {
    console.error('获取南华新签订单趋势数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败',
      error: error.message
    });
  }
});

// 获取南华新签订单占比分析数据
router.get('/nanhua-new-orders-breakdown/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // 获取该年度最新期间的累计数据
    const [latestData] = await pool.execute(`
      SELECT
        customer,
        MAX(accumulated) as total_accumulated
      FROM nanhua_new_orders
      WHERE YEAR(CONCAT(period, '-01')) = ?
      GROUP BY customer
      HAVING MAX(accumulated) > 0
      ORDER BY total_accumulated DESC
    `, [year]);

    // 计算总数和百分比
    const totalAmount = latestData.reduce((sum, item) => sum + parseFloat(item.total_accumulated), 0);
    
    const pieData = latestData.map(item => ({
      name: item.customer,
      value: parseFloat(item.total_accumulated),
      percentage: totalAmount > 0 ? Number(((parseFloat(item.total_accumulated) / totalAmount) * 100).toFixed(2)) : 0
    }));

    res.json({
      success: true,
      data: pieData
    });
  } catch (error) {
    console.error('获取南华新签订单占比数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败',
      error: error.message
    });
  }
});

// 获取拓源新签订单趋势分析数据
router.get('/tuoyuan-new-orders/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // 固定的年度计划数据（基于tuoyuan-new-order-structure.js的默认数据）
    const fixedPlanData = [
      { customer: '电业项目', yearlyPlan: 7800.00, category: '设备' },
      { customer: '用户项目', yearlyPlan: 0.00, category: '设备' },
      { customer: '贸易', yearlyPlan: 800.00, category: '设备' },
      { customer: '代理设备', yearlyPlan: 3000.00, category: '设备' },
      { customer: '代理工程', yearlyPlan: 0.00, category: '设备' },
      { customer: '代理设计', yearlyPlan: 0.00, category: '设备' }
    ];

    // 获取该年度所有期间的数据
    const [allPeriodsData] = await pool.execute(`
      SELECT
        period,
        customer_attribute as customer,
        current_period,
        current_cumulative,
        segment_attribute as category
      FROM tuoyuan_new_order_structure
      WHERE YEAR(CONCAT(period, '-01')) = ?
      ORDER BY period, customer_attribute
    `, [year]);

    // 生成月份列表
    const months = [];
    for (let i = 1; i <= 12; i++) {
      months.push(`${i}月`);
    }

    // 初始化月度数据结构
    const monthlyData = {};
    const categories = ['设备']; // 拓源新签订单主要是设备类别

    categories.forEach(category => {
      monthlyData[category] = {
        current_total: new Array(12).fill(0),
        cumulative: new Array(12).fill(0)
      };
    });

    // 按月份整理数据
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const month = String(monthIndex + 1).padStart(2, '0');
      const targetPeriod = `${year}-${month}`;

      // 计算当月各客户的总和
      const monthData = allPeriodsData.filter(row => row.period === targetPeriod);
      let monthTotal = 0;
      let cumulativeTotal = 0;

      monthData.forEach(row => {
        monthTotal += parseFloat(row.current_period) || 0;
        cumulativeTotal += parseFloat(row.current_cumulative) || 0;
      });

      // 如果没有累计数据，则从第一个月开始累加当期数据
      if (cumulativeTotal === 0 && monthIndex > 0) {
        cumulativeTotal = (monthlyData['设备'].cumulative[monthIndex - 1] || 0) + monthTotal;
      } else if (cumulativeTotal === 0) {
        cumulativeTotal = monthTotal;
      }

      monthlyData['设备'].current_total[monthIndex] = monthTotal;
      monthlyData['设备'].cumulative[monthIndex] = cumulativeTotal;
    }

    // 计算汇总数据
    const totalYearlyPlan = fixedPlanData.reduce((sum, item) => sum + item.yearlyPlan, 0);
    const totalCumulative = monthlyData['设备'].cumulative[11] || 0;
    const completionRate = totalYearlyPlan > 0 ? Number(((totalCumulative / totalYearlyPlan) * 100).toFixed(2)) : 0;

    const summary = {
      '设备': {
        yearly_plan: totalYearlyPlan,
        current_total: totalCumulative,
        completion_rate: completionRate
      }
    };

    res.json({
      success: true,
      data: {
        months,
        monthlyData,
        summary,
        categories: ['设备']
      }
    });
  } catch (error) {
    console.error('获取拓源新签订单趋势数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败',
      error: error.message
    });
  }
});

// 获取拓源新签订单占比分析数据
router.get('/tuoyuan-new-orders-breakdown/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // 获取该年度最新期间的累计数据
    const [latestData] = await pool.execute(`
      SELECT
        customer_attribute as customer,
        MAX(current_cumulative) as total_accumulated
      FROM tuoyuan_new_order_structure
      WHERE YEAR(CONCAT(period, '-01')) = ?
      GROUP BY customer_attribute
      HAVING MAX(current_cumulative) > 0
      ORDER BY total_accumulated DESC
    `, [year]);

    // 计算总数和百分比
    const totalAmount = latestData.reduce((sum, item) => sum + parseFloat(item.total_accumulated), 0);
    
    const pieData = latestData.map(item => ({
      name: item.customer,
      value: parseFloat(item.total_accumulated),
      percentage: totalAmount > 0 ? Number(((parseFloat(item.total_accumulated) / totalAmount) * 100).toFixed(2)) : 0
    }));

    res.json({
      success: true,
      data: pieData
    });
  } catch (error) {
    console.error('获取拓源新签订单占比数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败',
      error: error.message
    });
  }
});

// 获取净利润曲线数据（从标准利润表）
router.get('/net-profit-curve/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // 从标准利润表获取该年度的净利润数据
    const [rows] = await pool.execute(`
      SELECT 
        DATE_FORMAT(period, '%Y-%m') as period_ym,
        JSON_EXTRACT(data, '$.net_profit.cumulative_amount') as cumulative_amount,
        JSON_EXTRACT(data, '$.net_profit.current_amount') as current_amount
      FROM income_statement 
      WHERE YEAR(period) = ?
      ORDER BY period ASC
    `, [year]);

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: {
          months: [],
          monthlyData: [],
          hasData: false
        }
      });
    }

    // 处理数据
    const months = [];
    const monthlyData = [];
    
    rows.forEach(row => {
      const [, month] = row.period_ym.split('-');
      months.push(`${parseInt(month)}月`);
      
      // 使用当期金额
      const currentAmount = row.current_amount !== null && row.current_amount !== undefined ? 
        parseFloat(row.current_amount) : 0;
      monthlyData.push(currentAmount);
    });

    // 计算当前净利润和增长情况
    const currentNetProfit = monthlyData[monthlyData.length - 1] || 0;
    const previousMonthProfit = monthlyData.length > 1 ? 
      monthlyData[monthlyData.length - 2] : 0;
    const monthlyGrowth = previousMonthProfit !== 0 ? 
      parseFloat(((currentNetProfit - previousMonthProfit) / Math.abs(previousMonthProfit) * 100).toFixed(2)) : 0;

    res.json({
      success: true,
      data: {
        months,
        monthlyData,
        hasData: true,
        summary: {
          currentNetProfit,
          monthlyGrowth,
          totalMonths: months.length
        }
      }
    });

  } catch (error) {
    console.error('获取净利润曲线数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取净利润曲线数据失败', 
      error: error.message 
    });
  }
});

// 获取月度质量指标数据 - 用于月度报告第二点
router.get('/monthly-quality-indicators/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const period = `${year}-${month.padStart(2, '0')}`;

    const indicators = {
      marginContribution: { yearlyPlan: 21.98, current: 0 },
      grossMargin: { yearlyPlan: 24.00, current: 0 },
      netMargin: { yearlyPlan: 6.85, current: 0 },
      roe: { yearlyPlan: 21.18, current: 0 },
      assetLiabilityRatio: { yearlyPlan: 74.00, current: 0 }
    };

    // 1. 获取当月边际贡献率数据
    try {
      const [contributionRows] = await pool.execute(`
        SELECT data FROM business_contribution
        WHERE period = ?
        LIMIT 1
      `, [period]);

      if (contributionRows.length > 0) {
        const data = typeof contributionRows[0].data === 'string' ?
          JSON.parse(contributionRows[0].data) : contributionRows[0].data;

        const parseContributionRate = (value) => {
          if (!value) return 0;
          if (typeof value === 'string') {
            if (value === '/' || value.includes('无收入') || value === '0' || value === '0%') return 0;
            // 移除百分号并解析数字
            const cleanValue = value.replace('%', '').trim();
            const match = cleanValue.match(/(\d+(?:\.\d+)?)/);
            if (match) {
              const rate = parseFloat(match[1]);
              return (!isNaN(rate) && rate >= 0 && rate <= 10000) ? rate : 0;
            }
          }
          if (typeof value === 'number') {
            return (value >= 0 && value <= 10000) ? value : 0;
          }
          return 0;
        };

        // 获取总边际贡献率
        const currentRate = data.total && data.total.actual ? 
          parseContributionRate(data.total.actual) : 0;
        const planRate = data.total && data.total.plan ? 
          parseContributionRate(data.total.plan) : 21.98;

        indicators.marginContribution = {
          yearlyPlan: planRate,
          current: currentRate
        };

        console.log(`当月边际贡献率数据 - 计划: ${planRate}%, 实际: ${currentRate}%`);
      }
    } catch (error) {
      console.error('获取当月边际贡献率数据失败:', error);
    }

    // 2. 获取当月毛利率数据
    try {
      const [profitMarginRows] = await pool.execute(`
        SELECT data FROM business_profit_margin
        WHERE period = ?
        LIMIT 1
      `, [period]);

      if (profitMarginRows.length > 0) {
        const data = typeof profitMarginRows[0].data === 'string' ?
          JSON.parse(profitMarginRows[0].data) : profitMarginRows[0].data;

        const parseProfitMarginRate = (value) => {
          if (!value) return 0;
          if (typeof value === 'string') {
            if (value === '/' || value.includes('无收入') || value === '0' || value === '0%') return 0;
            // 移除百分号并解析数字
            const cleanValue = value.replace('%', '').trim();
            const match = cleanValue.match(/(\d+(?:\.\d+)?)/);
            if (match) {
              const rate = parseFloat(match[1]);
              return (!isNaN(rate) && rate >= 0 && rate <= 10000) ? rate : 0;
            }
          }
          if (typeof value === 'number') {
            return (value >= 0 && value <= 10000) ? value : 0;
          }
          return 0;
        };

        // 获取总毛利率
        const currentRate = data.total && data.total.actual ? 
          parseProfitMarginRate(data.total.actual) : 0;
        const planRate = data.total && data.total.plan ? 
          parseProfitMarginRate(data.total.plan) : 24.00;

        indicators.grossMargin = {
          yearlyPlan: planRate,
          current: currentRate
        };

        console.log(`当月毛利率数据 - 计划: ${planRate}%, 实际: ${currentRate}%`);
      }
    } catch (error) {
      console.error('获取当月毛利率数据失败:', error);
    }

    // 3. 获取当月净利率数据
    try {
      const periodWithDay = `${period}-01`;
      const [incomeRows] = await pool.execute(`
        SELECT data FROM income_statement
        WHERE period = ?
        LIMIT 1
      `, [periodWithDay]);

      if (incomeRows.length > 0) {
        const incomeData = typeof incomeRows[0].data === 'string' ?
          JSON.parse(incomeRows[0].data) : incomeRows[0].data;

        const mainRevenue = incomeData.main_business_revenue?.current_amount || 0;
        const netProfit = incomeData.net_profit?.current_amount || 0;

        if (mainRevenue > 0) {
          indicators.netMargin.current = Number(((netProfit / mainRevenue) * 100).toFixed(2));
        }
      }
    } catch (error) {
      console.error('获取当月净利率数据失败:', error);
    }

    // 4. 获取当月ROE数据 (年化)
    try {
      const periodWithDay = `${period}-01`;
      const [incomeRows] = await pool.execute(`
        SELECT data FROM income_statement
        WHERE period = ?
        LIMIT 1
      `, [periodWithDay]);

      const [balanceRows] = await pool.execute(`
        SELECT data FROM balance_sheet
        WHERE period = ?
        LIMIT 1
      `, [periodWithDay]);

      if (incomeRows.length > 0 && balanceRows.length > 0) {
        const incomeData = typeof incomeRows[0].data === 'string' ?
          JSON.parse(incomeRows[0].data) : incomeRows[0].data;
        const balanceData = typeof balanceRows[0].data === 'string' ?
          JSON.parse(balanceRows[0].data) : balanceRows[0].data;

        const netProfit = incomeData.net_profit?.current_amount || 0;
        let shareholderEquity = balanceData.equityTotal?.endBalance || 0;

        // 如果equityTotal为0，尝试从equity数组中获取
        if (shareholderEquity === 0 && balanceData.equity) {
          for (const item of balanceData.equity) {
            if (item.total || item.name?.includes('股东权益') || item.name?.includes('所有者权益')) {
              shareholderEquity = item.endBalance || 0;
              break;
            }
          }
        }

        if (netProfit > 0 && shareholderEquity > 0) {
          // 年化ROE = (当月净利润 * 12) / 股东权益 * 100%
          indicators.roe.current = Number(((netProfit * 12 / shareholderEquity) * 100).toFixed(2));
        }
      }
    } catch (error) {
      console.error('获取当月ROE数据失败:', error);
    }

    // 5. 获取当月资产负债率数据
    try {
      const periodWithDay = `${period}-01`;
      const [balanceRows] = await pool.execute(`
        SELECT data FROM balance_sheet
        WHERE period = ?
        LIMIT 1
      `, [periodWithDay]);

      if (balanceRows.length > 0) {
        const balanceData = typeof balanceRows[0].data === 'string' ?
          JSON.parse(balanceRows[0].data) : balanceRows[0].data;

        const totalAssets = balanceData.assetsTotal?.endBalance || 0;
        const totalLiabilities = balanceData.liabilitiesTotal?.endBalance || 0;

        if (totalAssets > 0) {
          indicators.assetLiabilityRatio.current = Number(((totalLiabilities / totalAssets) * 100).toFixed(2));
        }
      }
    } catch (error) {
      console.error('获取当月资产负债率数据失败:', error);
    }





    res.json({
      success: true,
      data: indicators
    });

  } catch (error) {
    console.error('获取月度质量指标失败:', error);
    res.status(500).json({
      success: false,
      message: '获取月度质量指标失败',
      error: error.message
    });
  }
});

module.exports = router;