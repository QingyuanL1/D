const { pool } = require('./config/database');

async function getFinalTotals() {
  try {
    console.log('获取资产负债表的资产合计和负债合计...');
    
    // 获取所有期间的数据，找到有实际数据的期间
    const [rows] = await pool.execute('SELECT period, data FROM balance_sheet ORDER BY period DESC');
    
    if (rows.length === 0) {
      console.log('没有找到资产负债表数据');
      return;
    }
    
    for (const row of rows) {
      console.log('\n期间:', row.period);
      
      let data;
      try {
        data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      } catch (e) {
        console.log('数据解析失败:', e.message);
        continue;
      }
      
      // 计算资产合计 = 流动资产合计 + 非流动资产合计
      const currentAssetsTotal = data.assets?.currentTotal?.endBalance || 0;
      const nonCurrentAssetsTotal = data.assets?.nonCurrentTotal?.endBalance || 0;
      const totalAssets = currentAssetsTotal + nonCurrentAssetsTotal;
      
      // 计算负债合计 = 流动负债合计 + 非流动负债合计
      const currentLiabilitiesTotal = data.liabilities?.currentTotal?.endBalance || 0;
      const nonCurrentLiabilitiesTotal = data.liabilities?.nonCurrentTotal?.endBalance || 0;
      const totalLiabilities = currentLiabilitiesTotal + nonCurrentLiabilitiesTotal;
      
      // 获取所有者权益合计
      const totalEquity = data.equityTotal?.endBalance || 0;
      
      console.log('=== 详细数据 ===');
      console.log('流动资产合计:', currentAssetsTotal);
      console.log('非流动资产合计:', nonCurrentAssetsTotal); 
      console.log('流动负债合计:', currentLiabilitiesTotal);
      console.log('非流动负债合计:', nonCurrentLiabilitiesTotal);
      console.log('所有者权益合计:', totalEquity);
      
      console.log('\n=== 计算结果 ===');
      console.log('资产合计:', totalAssets);
      console.log('负债合计:', totalLiabilities);
      
      if (totalAssets !== 0) {
        const ratio = (totalLiabilities / totalAssets * 100).toFixed(2);
        console.log('负债合计/资产合计 =', `${totalLiabilities}/${totalAssets}`, '=', ratio + '%');
      } else {
        console.log('资产合计为0，无法计算比率');
      }
      
      // 验证会计等式：资产 = 负债 + 所有者权益
      const leftSide = totalAssets;
      const rightSide = totalLiabilities + totalEquity;
      console.log('\\n=== 会计等式验证 ===');
      console.log('资产:', leftSide);
      console.log('负债 + 所有者权益:', rightSide);
      console.log('差额:', Math.abs(leftSide - rightSide));
      console.log('等式是否平衡:', Math.abs(leftSide - rightSide) < 0.01 ? '是' : '否');
      
      // 如果这个期间有实际数据就结束
      if (totalAssets !== 0 || totalLiabilities !== 0 || totalEquity !== 0) {
        break;
      }
    }
    
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    process.exit(0);
  }
}

getFinalTotals();