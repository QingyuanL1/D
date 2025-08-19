const fetch = require('node-fetch');

// 测试期间
const testPeriod = '2025-07';
const baseUrl = 'http://47.111.95.19:3000';

async function testProfitMarginRoutes() {
    console.log('🧪 开始测试毛利率实时计算路由...\n');

    // 测试1: 主营业务毛利率
    console.log('1️⃣ 测试主营业务毛利率路由');
    try {
        const response = await fetch(`${baseUrl}/business-profit-margin/${testPeriod}`);
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ 主营业务毛利率路由响应成功');
            console.log(`📊 计算方法: ${result.calculation?.method || '未知'}`);
            console.log(`📝 描述: ${result.calculation?.description || '无描述'}`);
            console.log(`📅 期间: ${result.period}`);
            if (result.data) {
                console.log('📈 数据结构:', Object.keys(result.data));
            }
        } else {
            console.log('❌ 主营业务毛利率路由失败:', result.message || result.error);
        }
    } catch (error) {
        console.log('❌ 主营业务毛利率路由请求失败:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 测试2: 南华毛利率
    console.log('2️⃣ 测试南华毛利率路由');
    try {
        const response = await fetch(`${baseUrl}/nanhua-business-profit-margin-with-self-built/${testPeriod}`);
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ 南华毛利率路由响应成功');
            console.log(`📊 计算方法: ${result.calculation?.method || '未知'}`);
            console.log(`📝 描述: ${result.calculation?.description || '无描述'}`);
            console.log(`📅 期间: ${result.period}`);
            if (result.data) {
                console.log('📈 数据结构:', Object.keys(result.data));
            }
        } else {
            console.log('❌ 南华毛利率路由失败:', result.message || result.error);
        }
    } catch (error) {
        console.log('❌ 南华毛利率路由请求失败:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 测试3: 拓源毛利率（已经是实时计算）
    console.log('3️⃣ 测试拓源毛利率路由（参考）');
    try {
        const response = await fetch(`${baseUrl}/tuoyuan-main-business-profit-margin/${testPeriod}`);
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ 拓源毛利率路由响应成功');
            console.log(`📊 计算公式: ${result.calculation?.formula || '未知'}`);
            console.log(`📝 描述: ${result.calculation?.description || '无描述'}`);
            console.log(`📅 期间: ${result.data?.period}`);
            if (result.data?.items) {
                console.log(`📈 数据项数量: ${result.data.items.length}`);
            }
        } else {
            console.log('❌ 拓源毛利率路由失败:', result.message || result.error);
        }
    } catch (error) {
        console.log('❌ 拓源毛利率路由请求失败:', error.message);
    }

    console.log('\n🎯 测试完成！');
}

// 运行测试
testProfitMarginRoutes().catch(console.error);
