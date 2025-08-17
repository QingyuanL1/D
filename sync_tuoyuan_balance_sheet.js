const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'finance'
};

async function syncTuoyuanBalanceSheetData() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('开始同步拓元公司资产负债表数据...');
    
    // 获取表单提交系统中的资产负债表数据
    const [submissions] = await connection.execute(`
      SELECT period, submission_data
      FROM form_submissions 
      WHERE module_id = 601 
      AND period LIKE '2025%'
      ORDER BY period
    `);
    
    console.log(`找到 ${submissions.length} 条表单提交记录`);
    
    for (const submission of submissions) {
      const period = submission.period;
      const submissionData = JSON.parse(submission.submission_data);
      const balanceSheetData = JSON.parse(submissionData.data);
      
      // 转换数据格式以符合ROE计算需求
      const convertedData = convertBalanceSheetFormat(balanceSheetData);
      
      // 构造期间日期（YYYY-MM-01格式）
      const periodDate = `${period}-01`;
      
      console.log(`处理期间: ${period} -> ${periodDate}`);
      
      // 检查是否已存在数据
      const [existing] = await connection.execute(
        'SELECT id FROM tuoyuan_balance_sheet WHERE period = ?',
        [periodDate]
      );
      
      if (existing.length > 0) {
        // 更新现有数据
        await connection.execute(
          'UPDATE tuoyuan_balance_sheet SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE period = ?',
          [JSON.stringify(convertedData), periodDate]
        );
        console.log(`  - 更新了期间 ${period} 的数据`);
      } else {
        // 插入新数据
        await connection.execute(
          'INSERT INTO tuoyuan_balance_sheet (period, data, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [periodDate, JSON.stringify(convertedData)]
        );
        console.log(`  - 插入了期间 ${period} 的新数据`);
      }
    }
    
    console.log('数据同步完成！');
    
  } catch (error) {
    console.error('数据同步失败:', error);
  } finally {
    await connection.end();
  }
}

function convertBalanceSheetFormat(originalData) {
  // 将原始的资产负债表数据转换为符合ROE计算的格式
  // ROE需要股东权益数据，通过期末所有者权益总计计算
  
  const convertedData = {
    assets: {
      currentTotal: {
        endBalance: originalData.current_assets_total_ending || 0
      },
      nonCurrentTotal: {
        endBalance: originalData.fixed_assets_total_ending || 0
      }
    },
    equity: [
      {
        name: "实收资本",
        endBalance: originalData.paid_in_capital_ending || 0
      },
      {
        name: "资本公积",
        endBalance: originalData.capital_reserve_ending || 0
      },
      {
        name: "盈余公积",
        endBalance: originalData.surplus_reserve_ending || 0
      },
      {
        name: "未分配利润",
        endBalance: originalData.retained_earnings_ending || 0
      }
    ],
    equityTotal: {
      endBalance: originalData.owners_equity_total_ending || 0
    },
    // 保留原始数据用于调试
    _original: originalData
  };
  
  // 如果所有者权益总计为空，尝试计算
  if (!convertedData.equityTotal.endBalance) {
    const calculatedEquity = convertedData.equity.reduce((sum, item) => sum + (item.endBalance || 0), 0);
    if (calculatedEquity > 0) {
      convertedData.equityTotal.endBalance = calculatedEquity;
    }
  }
  
  return convertedData;
}

// 运行同步
syncTuoyuanBalanceSheetData().then(() => {
  console.log('脚本执行完成');
  process.exit(0);
}).catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
}); 