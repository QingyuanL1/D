const mysql = require('mysql2/promise');

const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'finance',
  timezone: '+08:00',
  charset: 'utf8mb4'
};

async function query2025Data() {
  let connection = null;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');

    const [rows] = await connection.execute(`
      SELECT segment_attribute, customer_attribute, annual_plan, 
             current_period, current_cumulative, execution_progress,
             created_at, updated_at
      FROM tuoyuan_main_business_income_breakdown 
      WHERE period = '2025-01'
      ORDER BY id ASC
    `);

    console.log('\n=== 2025年1月拓源主营业务收入分解情况数据 ===\n');
    
    if (rows.length === 0) {
      console.log('暂无2025-01期间的数据');
      console.log('\n默认数据结构应该包含：');
      console.log('板块属性 | 客户属性 | 年度计划 | 当期 | 当期累计 | 执行进度(%)');
      console.log('-------|--------|---------|-----|-------|----------');
      console.log('设备   | 电业项目 | 6017.70 | 0   | 0     | 0');
      console.log('设备   | 用户项目 | 0.00    | 0   | 0     | 0');
      console.log('设备   | 贸易     | 707.96  | 0   | 0     | 0');
      console.log('设备   | 代理设备 | 2654.87 | 0   | 0     | 0');
      console.log('设备   | 代理工程 | 0.00    | 0   | 0     | 0');
      console.log('设备   | 代理设计 | 73.58   | 0   | 0     | 0');
    } else {
      console.log('板块属性 | 客户属性 | 年度计划  | 当期      | 当期累计   | 执行进度(%) | 更新时间');
      console.log('-------|--------|----------|----------|----------|------------|----------');
      
      rows.forEach(row => {
        console.log(`${row.segment_attribute.padEnd(6)} | ${row.customer_attribute.padEnd(8)} | ${String(row.annual_plan).padEnd(8)} | ${String(row.current_period).padEnd(8)} | ${String(row.current_cumulative).padEnd(8)} | ${String(row.execution_progress).padEnd(10)} | ${row.updated_at ? row.updated_at.toISOString().split('T')[0] : 'N/A'}`);
      });
      
      console.log('\n总计信息：');
      const totalAnnualPlan = rows.reduce((sum, row) => sum + parseFloat(row.annual_plan || 0), 0);
      const totalCurrentPeriod = rows.reduce((sum, row) => sum + parseFloat(row.current_period || 0), 0);
      const totalCurrentCumulative = rows.reduce((sum, row) => sum + parseFloat(row.current_cumulative || 0), 0);
      
      console.log(`年度计划总计: ${totalAnnualPlan.toFixed(2)}`);
      console.log(`当期总计: ${totalCurrentPeriod.toFixed(2)}`);
      console.log(`当期累计总计: ${totalCurrentCumulative.toFixed(2)}`);
    }

  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

query2025Data(); 