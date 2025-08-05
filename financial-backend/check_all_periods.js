const { pool } = require('./config/database');

async function checkAllPeriods() {
  try {
    console.log('检查所有期间的资产负债表数据...');
    
    const [rows] = await pool.execute('SELECT period, data FROM balance_sheet ORDER BY period DESC');
    
    if (rows.length === 0) {
      console.log('没有找到资产负债表数据');
      return;
    }
    
    console.log(`共找到 ${rows.length} 个期间的数据\n`);
    
    for (const row of rows) {
      console.log('期间:', row.period);
      
      let data;
      try {
        data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      } catch (e) {
        console.log('数据解析失败:', e.message);
        continue;
      }
      
      // 计算各项合计
      const currentAssetsTotal = data.assets?.currentTotal?.endBalance || 0;
      const nonCurrentAssetsTotal = data.assets?.nonCurrentTotal?.endBalance || 0;
      const totalAssets = currentAssetsTotal + nonCurrentAssetsTotal;
      
      const currentLiabilitiesTotal = data.liabilities?.currentTotal?.endBalance || 0;
      const nonCurrentLiabilitiesTotal = data.liabilities?.nonCurrentTotal?.endBalance || 0;
      const totalLiabilities = currentLiabilitiesTotal + nonCurrentLiabilitiesTotal;
      
      const totalEquity = data.equityTotal?.endBalance || 0;
      
      console.log('  资产合计:', totalAssets);
      console.log('  负债合计:', totalLiabilities);
      console.log('  所有者权益合计:', totalEquity);
      
      if (totalAssets !== 0 && totalLiabilities !== 0) {
        const ratio = (totalLiabilities / totalAssets * 100).toFixed(2);
        console.log('  负债合计/资产合计 =', ratio + '%');
        console.log('  **这是最新的有效数据**');
        break; // 找到有效数据就停止
      } else if (totalAssets !== 0 || totalLiabilities !== 0 || totalEquity !== 0) {
        console.log('  **此期间有部分数据，但不完整**');
      } else {
        console.log('  此期间无数据');
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    process.exit(0);
  }
}

checkAllPeriods();