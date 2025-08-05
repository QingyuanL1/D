const { pool } = require('./config/database');

async function findTotals() {
  try {
    console.log('连接数据库，查找资产负债表总计数据...');
    
    // 获取最新的资产负债表数据
    const [rows] = await pool.execute('SELECT period, data FROM balance_sheet ORDER BY period DESC LIMIT 1');
    
    if (rows.length === 0) {
      console.log('没有找到资产负债表数据');
      return;
    }
    
    const row = rows[0];
    console.log('期间:', row.period);
    
    let data;
    try {
      data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
    } catch (e) {
      console.log('数据解析失败:', e.message);
      return;
    }
    
    // 查找资产合计 - 通常在资产部分的合计项
    let totalAssets = null;
    let totalLiabilities = null;
    
    // 深度搜索函数
    const deepSearch = (obj, path = '') => {
      if (typeof obj !== 'object' || obj === null) return;
      
      for (const key in obj) {
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;
        
        // 检查资产合计
        if ((key.includes('资产合计') || key.includes('资产总计') || (key.includes('合计') && currentPath.includes('assets'))) && typeof value === 'object') {
          if (value.endBalance !== undefined) {
            totalAssets = value.endBalance;
            console.log(`找到资产合计: ${totalAssets} (位置: ${currentPath})`);
          }
        }
        
        // 检查负债合计
        if ((key.includes('负债合计') || key.includes('负债总计') || (key.includes('合计') && currentPath.includes('liabilities'))) && typeof value === 'object') {
          if (value.endBalance !== undefined) {
            totalLiabilities = value.endBalance;
            console.log(`找到负债合计: ${totalLiabilities} (位置: ${currentPath})`);
          }
        }
        
        // 递归搜索
        if (typeof value === 'object' && value !== null) {
          deepSearch(value, currentPath);
        }
      }
    };
    
    // 开始搜索
    deepSearch(data);
    
    // 如果没有找到，检查顶层的total字段
    if (data.total && data.total.endBalance) {
      console.log(`顶层总计值: ${data.total.endBalance}`);
      if (!totalAssets) {
        totalAssets = data.total.endBalance;
        console.log('将顶层总计作为资产合计');
      }
    }
    
    // 尝试计算负债合计 - 如果有负债和所有者权益的详细数据
    if (!totalLiabilities && data.liabilities) {
      let calculatedLiabilities = 0;
      
      const calculateTotal = (section) => {
        let total = 0;
        if (Array.isArray(section)) {
          for (const item of section) {
            if (item.endBalance && typeof item.endBalance === 'number') {
              total += item.endBalance;
            }
          }
        }
        return total;
      };
      
      if (data.liabilities.current) {
        calculatedLiabilities += calculateTotal(data.liabilities.current);
      }
      if (data.liabilities.nonCurrent) {
        calculatedLiabilities += calculateTotal(data.liabilities.nonCurrent);
      }
      
      if (calculatedLiabilities > 0) {
        totalLiabilities = calculatedLiabilities;
        console.log(`计算得出负债合计: ${totalLiabilities}`);
      }
    }
    
    // 输出结果
    console.log('\n=== 查找结果 ===');
    console.log(`资产合计: ${totalAssets || '未找到'}`);
    console.log(`负债合计: ${totalLiabilities || '未找到'}`);
    
    if (totalAssets && totalLiabilities) {
      const ratio = (totalLiabilities / totalAssets * 100).toFixed(2);
      console.log(`负债合计/资产合计 = ${ratio}%`);
    }
    
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    process.exit(0);
  }
}

findTotals();