const { pool } = require('../config/database');

async function updateTuoyuanModuleOrder() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    console.log('数据库连接成功');

    // 开始事务
    await connection.beginTransaction();

    // 定义拓源公司模块的新顺序
    const moduleOrder = [
      // 基础财务报表
      { module_key: 'tuoyuan_balance_sheet', display_order: 1, name: '资产负债表' },
      { module_key: 'tuoyuan_cash_flow', display_order: 2, name: '现金流量表' },
      { module_key: 'tuoyuan_income_statement', display_order: 3, name: '利润表' },
      
      // 收入相关
      { module_key: 'main_business_income_breakdown', display_order: 4, name: '主营业务收入分解情况' },
      { module_key: 'tuoyuan_order_to_income', display_order: 5, name: '当年订单转收入' },
      { module_key: 'tuoyuan_stock_order_to_income', display_order: 6, name: '存量订单转收入' },
      
      // 成本相关
      { module_key: 'tuoyuan_cost_estimation', display_order: 7, name: '成本暂估入库计提情况' },
      { module_key: 'tuoyuan_main_business_cost_structure_quality', display_order: 8, name: '主营成本结构' },
      
      // 利润分析
      { module_key: 'tuoyuan_main_business_contribution_rate', display_order: 9, name: '主营业务边际贡献率' },
      { module_key: 'tuoyuan_main_business_profit_margin', display_order: 10, name: '毛利润利率' },
      { module_key: 'tuoyuan_main_business_net_profit_contribution', display_order: 11, name: '净利润贡献情况' },
      
      // 收款相关
      { module_key: 'payment_structure_quality', display_order: 12, name: '收款结构' },
      { module_key: 'tuoyuan_accounts_receivable', display_order: 13, name: '应收帐款' },
      { module_key: 'tuoyuan_overdue_receivables', display_order: 14, name: '逾期' },
      { module_key: 'tuoyuan_bad_debt_provision', display_order: 15, name: '坏账' },
      
      // 营销相关
      { module_key: 'tuoyuan_new_order_structure', display_order: 16, name: '新签订单' },
      { module_key: 'tuoyuan_bidding_status', display_order: 17, name: '招投标' },
      { module_key: 'tuoyuan_inventory_structure', display_order: 18, name: '存量结构与质量' },
      { module_key: 'tuoyuan_bid_fulfillment', display_order: 19, name: '中标未履约' },
      { module_key: 'tuoyuan_inventory_in_progress', display_order: 20, name: '在产情况' },
      
      // 投资相关
      { module_key: 'tuoyuan_major_investment', display_order: 21, name: '重大投资' },
      
      // 其他模块保持原有顺序，但放在后面
      { module_key: 'tuoyuan_cost_center_structure', display_order: 100, name: '成本中心结构与质量' },
      { module_key: 'tuoyuan_non_main_business', display_order: 101, name: '非主营业务情况' },
      { module_key: 'tuoyuan_inventory_status', display_order: 102, name: '库存情况' },
      { module_key: 'tuoyuan_cost_center_profit_loss', display_order: 103, name: '成本中心计入损益情况' },
      { module_key: 'tuoyuan_production_value_self_construction', display_order: 104, name: '拓源主营业务产值--自行施工情况分析' },
      { module_key: 'tuoyuan_construction_execution_status', display_order: 105, name: '拓源施工执行情况' },
      { module_key: 'tuoyuan_construction_plan_execution', display_order: 106, name: '施工计划执行情况' },
      { module_key: 'tuoyuan_project_tracking', display_order: 107, name: '项目跟踪情况' }
    ];

    console.log('开始更新拓源公司模块顺序...');

    // 更新每个模块的display_order
    for (const module of moduleOrder) {
      const [result] = await connection.execute(
        'UPDATE form_modules SET display_order = ? WHERE module_key = ? AND module_category = "拓源公司"',
        [module.display_order, module.module_key]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✓ 更新模块 "${module.name}" (${module.module_key}) 的显示顺序为 ${module.display_order}`);
      } else {
        console.log(`⚠ 未找到模块 "${module.name}" (${module.module_key})`);
      }
    }

    // 提交事务
    await connection.commit();
    console.log('\n✓ 所有模块顺序更新完成');

    // 验证更新结果
    console.log('\n=== 验证更新结果 ===');
    const [verifyRows] = await connection.execute(`
      SELECT module_name, module_key, display_order
      FROM form_modules 
      WHERE module_category = '拓源公司'
      ORDER BY 
        CASE WHEN display_order > 0 THEN display_order ELSE 999 END,
        module_name
    `);

    console.log('拓源公司模块新的显示顺序:');
    verifyRows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.module_name} (${row.module_key}) - 顺序: ${row.display_order}`);
    });

  } catch (error) {
    console.error('更新失败:', error);
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// 执行更新
updateTuoyuanModuleOrder()
  .then(() => {
    console.log('\n🎉 拓源公司模块顺序更新成功！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 更新失败:', error);
    process.exit(1);
  });
