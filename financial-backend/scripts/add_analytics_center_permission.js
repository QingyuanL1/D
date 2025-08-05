const { pool } = require('../config/database');

async function addAnalyticsCenterPermission() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    console.log('数据库连接成功');

    // 开始事务
    await connection.beginTransaction();

    // 1. 添加数据分析中心模块
    console.log('1. 添加数据分析中心模块...');
    const [insertResult] = await connection.execute(`
      INSERT IGNORE INTO form_modules (module_name, module_key, module_category, route_path, description, display_order) 
      VALUES ('数据分析中心', 'analytics_center', '财务', '/analytics', '财务数据综合分析与可视化展示', 1)
    `);

    if (insertResult.affectedRows > 0) {
      console.log('✓ 数据分析中心模块添加成功');
    } else {
      console.log('✓ 数据分析中心模块已存在');
    }

    // 2. 获取模块ID和领导角色ID
    console.log('2. 获取模块ID和角色ID...');
    const [moduleRows] = await connection.execute(`
      SELECT id FROM form_modules WHERE module_key = 'analytics_center'
    `);
    
    const [roleRows] = await connection.execute(`
      SELECT id FROM user_roles WHERE role_name = 'leader'
    `);

    if (moduleRows.length === 0) {
      throw new Error('未找到数据分析中心模块');
    }
    
    if (roleRows.length === 0) {
      throw new Error('未找到领导角色');
    }

    const analyticsModuleId = moduleRows[0].id;
    const leaderRoleId = roleRows[0].id;
    
    console.log(`✓ 数据分析中心模块ID: ${analyticsModuleId}`);
    console.log(`✓ 领导角色ID: ${leaderRoleId}`);

    // 3. 为领导角色添加数据分析中心的只读权限
    console.log('3. 添加权限配置...');
    const [permissionResult] = await connection.execute(`
      INSERT IGNORE INTO role_permissions (role_id, module_id, permission_type) 
      VALUES (?, ?, 'read')
    `, [leaderRoleId, analyticsModuleId]);

    if (permissionResult.affectedRows > 0) {
      console.log('✓ 领导角色权限添加成功');
    } else {
      console.log('✓ 领导角色权限已存在');
    }

    // 4. 验证配置结果
    console.log('4. 验证配置结果...');
    const [verifyRows] = await connection.execute(`
      SELECT 
        fm.module_name,
        fm.module_key,
        fm.module_category,
        fm.route_path,
        fm.description,
        ur.role_name,
        ur.role_description,
        rp.permission_type
      FROM form_modules fm
      JOIN role_permissions rp ON fm.id = rp.module_id
      JOIN user_roles ur ON rp.role_id = ur.id
      WHERE fm.module_key = 'analytics_center'
      ORDER BY ur.role_name
    `);

    console.log('\n=== 数据分析中心权限配置结果 ===');
    if (verifyRows.length > 0) {
      verifyRows.forEach(row => {
        console.log(`角色: ${row.role_description} (${row.role_name})`);
        console.log(`权限: ${row.permission_type === 'read' ? '只读' : '可编辑'}`);
        console.log(`模块: ${row.module_name}`);
        console.log(`路由: ${row.route_path}`);
        console.log(`描述: ${row.description}`);
        console.log('---');
      });
    } else {
      console.log('未找到权限配置');
    }

    // 5. 显示所有模块列表（验证显示顺序）
    console.log('\n=== 财务模块列表（按显示顺序） ===');
    const [allModules] = await connection.execute(`
      SELECT module_name, module_key, display_order, route_path
      FROM form_modules 
      WHERE module_category = '财务'
      ORDER BY 
        CASE WHEN display_order > 0 THEN display_order ELSE 999 END,
        module_name
    `);

    allModules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.module_name} (${module.module_key}) - 顺序: ${module.display_order || '未设置'} - 路由: ${module.route_path}`);
    });

    // 提交事务
    await connection.commit();
    console.log('\n✅ 数据分析中心模块权限配置完成！');
    console.log('现在只有领导角色可以访问数据分析中心页面');

  } catch (error) {
    // 回滚事务
    if (connection) {
      await connection.rollback();
    }
    console.error('❌ 配置失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// 执行脚本
if (require.main === module) {
  addAnalyticsCenterPermission()
    .then(() => {
      console.log('\n脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { addAnalyticsCenterPermission };
