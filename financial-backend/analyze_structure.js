const { pool } = require('./config/database');

async function analyzeStructure() {
  try {
    console.log('分析资产负债表数据结构...');
    
    // 获取所有期间的数据，找到有数据的期间
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
      
      // 检查这个期间是否有实际数据
      let hasData = false;
      
      const checkForData = (obj, level = 0) => {
        if (level > 3) return; // 防止递归过深
        
        if (typeof obj !== 'object' || obj === null) return;
        
        for (const key in obj) {
          const value = obj[key];
          
          if (typeof value === 'number' && value !== 0) {
            hasData = true;
            return;
          }
          
          if (typeof value === 'object' && value !== null) {
            checkForData(value, level + 1);
          }
        }
      };
      
      checkForData(data);
      
      if (!hasData) {
        console.log('此期间数据为空，跳过...');
        continue;
      }
      
      console.log('此期间包含实际数据，分析结构...');
      
      // 分析数据结构
      const analyzeObject = (obj, path = '', level = 0) => {
        if (level > 2) return; // 只显示前几层
        
        const indent = '  '.repeat(level);
        
        for (const key in obj) {
          const value = obj[key];
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              console.log(`${indent}${key}: [数组,长度=${value.length}]`);
              if (value.length > 0 && typeof value[0] === 'object') {
                console.log(`${indent}  示例项目:`, Object.keys(value[0]).join(', '));
              }
            } else {
              console.log(`${indent}${key}: {对象}`);
              if (value.endBalance !== undefined || value.beginBalance !== undefined) {
                console.log(`${indent}  endBalance: ${value.endBalance}, beginBalance: ${value.beginBalance}`);
              }
              if (level < 2) {
                analyzeObject(value, currentPath, level + 1);
              }
            }
          } else {
            console.log(`${indent}${key}: ${value} (${typeof value})`);
          }
        }
      };
      
      analyzeObject(data);
      
      // 特别查找包含"合计"的键
      const findTotalKeys = (obj, path = '') => {
        const totals = [];
        
        for (const key in obj) {
          const value = obj[key];
          const currentPath = path ? `${path}.${key}` : key;
          
          if (key.includes('合计') || key.includes('总计')) {
            totals.push({
              key: key,
              path: currentPath,
              value: value
            });
          }
          
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            totals.push(...findTotalKeys(value, currentPath));
          }
        }
        
        return totals;
      };
      
      const totalKeys = findTotalKeys(data);
      if (totalKeys.length > 0) {
        console.log('\n找到的合计项:');
        for (const total of totalKeys) {
          console.log(`  ${total.key}: ${JSON.stringify(total.value)} (${total.path})`);
        }
      }
      
      break; // 只分析第一个有数据的期间
    }
    
  } catch (error) {
    console.error('分析失败:', error);
  } finally {
    process.exit(0);
  }
}

analyzeStructure();