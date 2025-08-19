# 拓源毛利率数据表迁移计划

## 📊 当前状况
- **表名**: `tuoyuan_main_business_profit_margin`
- **数据量**: 24条记录 (4个期间)
- **使用状况**: 仅POST路由写入，GET路由已改为实时计算

## 🎯 推荐方案：渐进式废弃 + 可选缓存

### 方案一：立即废弃表 ⚡ (推荐)
**适用于**: 对实时性要求高，不在意计算开销

**步骤**:
1. ✅ **已完成**: GET路由改为实时计算
2. 🔄 **执行**: 废弃POST路由或改为仅记录日志
3. 🗑️ **清理**: 重命名表为`tuoyuan_main_business_profit_margin_backup`
4. 📝 **文档**: 更新API文档说明只支持实时计算

**优点**: 数据最新、逻辑简单、无同步问题
**缺点**: 每次查询需要计算，响应稍慢

### 方案二：智能缓存 🧠
**适用于**: 性能敏感，但需要数据准确性

**步骤**:
1. 保留表作为缓存层
2. GET路由优先返回实时计算结果
3. POST路由改为后台更新缓存
4. 添加缓存过期机制

### 方案三：数据验证后废弃 🔍
**适用于**: 谨慎迁移，确保数据一致性

**步骤**:
1. 运行数据对比验证
2. 确认实时计算结果准确后废弃表
3. 保留历史数据备份

## 📋 具体实施步骤 (推荐方案一)

### 阶段1: 废弃POST路由 (15分钟)
```javascript
// 修改POST路由为仅记录日志
router.post('/', async (req, res) => {
    console.log('⚠️ POST路由已废弃，现在使用实时计算');
    res.status(410).json({
        success: false,
        message: '此接口已废弃，请使用GET /:period获取实时计算结果',
        migration: {
            use: 'GET /tuoyuan-main-business-profit-margin/:period',
            reason: '改为实时计算以确保数据准确性'
        }
    });
});
```

### 阶段2: 备份并清理表 (5分钟)
```sql
-- 备份表
CREATE TABLE tuoyuan_main_business_profit_margin_backup AS 
SELECT * FROM tuoyuan_main_business_profit_margin;

-- 清空或删除原表
DROP TABLE tuoyuan_main_business_profit_margin;
```

### 阶段3: 清理代码 (10分钟)
- 移除POST路由的数据库操作代码
- 更新相关注释和文档
- 移除不必要的数据库依赖

## 🔄 如果选择方案二：智能缓存实现

### 缓存策略
```javascript
// GET路由增加缓存检查
router.get('/:period', async (req, res) => {
    const { period } = req.params;
    
    // 1. 先返回实时计算结果
    const realtimeResult = await calculateRealtime(period);
    
    // 2. 异步更新缓存
    updateCacheAsync(period, realtimeResult);
    
    return res.json(realtimeResult);
});

// 缓存更新函数
async function updateCacheAsync(period, data) {
    try {
        // 删除旧缓存
        await pool.execute(
            'DELETE FROM tuoyuan_main_business_profit_margin WHERE period = ?',
            [period]
        );
        
        // 插入新缓存，添加缓存时间戳
        // ... 插入逻辑
    } catch (error) {
        console.error('缓存更新失败:', error);
    }
}
```

## 🎖️ 推荐决策

**立即执行方案一** 的理由：
1. ✅ **数据准确性**: 实时计算保证最新数据
2. ✅ **维护简单**: 减少数据同步复杂性
3. ✅ **逻辑统一**: 与analytics.js保持一致
4. ✅ **性能影响小**: 计算逻辑已优化，响应时间可接受
5. ✅ **风险低**: 已验证实时计算结果正确

## 📞 需要确认的决策点

1. **性能要求**: 是否能接受实时计算的响应时间？
2. **历史数据**: 是否需要保留表中的历史数据？
3. **回滚计划**: 是否需要保留快速回滚到表查询的能力？

## 🚀 执行时间表

- **方案一**: 30分钟完成全部迁移
- **方案二**: 2小时实现智能缓存
- **方案三**: 1小时数据验证 + 30分钟迁移 