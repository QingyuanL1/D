const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '47.111.95.19',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'NewSecurePassword2025!@#',
  database: process.env.DB_NAME || 'finance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+08:00',
  charset: 'utf8mb4'
};

const pool = mysql.createPool(dbConfig);

async function fixCumulativeTotals() {
    try {
        console.log('开始修复累计值...');
        
        // 获取所有不同的客户和类别组合
        const [combinations] = await pool.execute(`
            SELECT DISTINCT category, customer 
            FROM new_orders 
            ORDER BY category, customer
        `);
        
        console.log(`找到 ${combinations.length} 个客户-类别组合`);
        
        for (const combo of combinations) {
            const { category, customer } = combo;
            console.log(`\n处理: ${category} - ${customer}`);
            
            // 获取该客户-类别的所有期间数据，按期间排序
            const [periods] = await pool.execute(`
                SELECT id, period, current_period, cumulative_total
                FROM new_orders 
                WHERE category = ? AND customer = ? 
                ORDER BY period
            `, [category, customer]);
            
            let runningTotal = 0;
            
            for (const periodData of periods) {
                const { id, period, current_period } = periodData;
                const currentPeriodValue = parseFloat(current_period || 0);
                
                // 累加当期值到运行总计
                runningTotal += currentPeriodValue;
                
                console.log(`  期间 ${period}: 当期 ${currentPeriodValue}, 累计 ${runningTotal}`);
                
                // 更新数据库中的累计值
                await pool.execute(`
                    UPDATE new_orders 
                    SET cumulative_total = ? 
                    WHERE id = ?
                `, [runningTotal, id]);
            }
        }
        
        console.log('\n累计值修复完成！');
        
        // 验证修复结果
        console.log('\n验证修复结果（上海项目-设备）:');
        const [verification] = await pool.execute(`
            SELECT period, current_period, cumulative_total 
            FROM new_orders 
            WHERE category = '设备' AND customer = '上海项目' 
            ORDER BY period
        `);
        
        verification.forEach(row => {
            console.log(`  ${row.period}: 当期 ${row.current_period}, 累计 ${row.cumulative_total}`);
        });
        
    } catch (error) {
        console.error('修复累计值失败:', error);
    } finally {
        await pool.end();
    }
}

// 运行修复脚本
fixCumulativeTotals();
