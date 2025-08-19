const { pool } = require('../config/database');

async function addTuoyuanCostCenterPermissions() {
  try {
    console.log('开始为拓源成本中心结构添加权限...');
    
    // 模块ID 605 - 拓源成本中心结构与质量
    const moduleId = 605;
    
    // 为超级管理员角色添加权限
    const adminRoles = [1]; // super_admin
    
    for (const roleId of adminRoles) {
      try {
        // 检查权限是否已存在
        const [existing] = await pool.execute(
          'SELECT id FROM role_permissions WHERE role_id = ? AND module_id = ? AND permission_type = ?',
          [roleId, moduleId, 'write']
        );
        
        if (existing.length === 0) {
          // 添加写权限
          await pool.execute(
            'INSERT INTO role_permissions (role_id, module_id, permission_type, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            [roleId, moduleId, 'write']
          );
          console.log(`✓ 为角色 ${roleId} 添加了模块 ${moduleId} 的写权限`);
        } else {
          console.log(`- 角色 ${roleId} 已有模块 ${moduleId} 的写权限`);
        }
        
        // 检查读权限是否已存在
        const [existingRead] = await pool.execute(
          'SELECT id FROM role_permissions WHERE role_id = ? AND module_id = ? AND permission_type = ?',
          [roleId, moduleId, 'read']
        );
        
        if (existingRead.length === 0) {
          // 添加读权限
          await pool.execute(
            'INSERT INTO role_permissions (role_id, module_id, permission_type, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            [roleId, moduleId, 'read']
          );
          console.log(`✓ 为角色 ${roleId} 添加了模块 ${moduleId} 的读权限`);
        } else {
          console.log(`- 角色 ${roleId} 已有模块 ${moduleId} 的读权限`);
        }
        
      } catch (error) {
        console.error(`为角色 ${roleId} 添加权限失败:`, error.message);
      }
    }
    
    // 验证权限配置
    console.log('\n验证权限配置:');
    const [permissions] = await pool.execute(`
      SELECT rp.role_id, ur.role_name, rp.permission_type, fm.module_name
      FROM role_permissions rp
      JOIN user_roles ur ON rp.role_id = ur.id
      JOIN form_modules fm ON rp.module_id = fm.id
      WHERE rp.module_id = ?
      ORDER BY rp.role_id, rp.permission_type
    `, [moduleId]);
    
    console.log('当前权限配置:');
    permissions.forEach(perm => {
      console.log(`- 角色: ${perm.role_name} (ID: ${perm.role_id}), 权限: ${perm.permission_type}, 模块: ${perm.module_name}`);
    });
    
    console.log('\n权限配置完成！');
    
  } catch (error) {
    console.error('添加权限失败:', error);
  } finally {
    process.exit(0);
  }
}

// 运行脚本
addTuoyuanCostCenterPermissions();
