const fetch = require('node-fetch');

async function testContributionRate() {
    const baseUrl = 'http://47.111.95.19:3000';
    const period = '2025-05'; // 测试2025年5月的数据
    
    console.log(`测试${period}期间的边际贡献率计算`);
    console.log('='.repeat(50));
    
    try {
        // 1. 首先调用调试端点查看原始数据
        console.log('1. 获取调试信息...');
        const debugResponse = await fetch(`${baseUrl}/business-contribution/debug/${period}`);
        
        if (debugResponse.ok) {
            const debugResult = await debugResponse.json();
            console.log('调试信息:', JSON.stringify(debugResult.data, null, 2));
            
            if (!debugResult.data.hasIncomeData) {
                console.log('❌ 没有收入数据，无法计算边际贡献率');
                return;
            }
            
            if (!debugResult.data.hasCostData) {
                console.log('❌ 没有成本数据，无法计算边际贡献率');
                return;
            }
        }
        
        console.log('\n2. 触发自动计算...');
        // 2. 调用自动计算端点
        const calculateResponse = await fetch(`${baseUrl}/business-contribution/calculate/${period}`, {
            method: 'POST'
        });
        
        if (calculateResponse.ok) {
            const calculateResult = await calculateResponse.json();
            console.log('计算结果:', JSON.stringify(calculateResult.data, null, 2));
            
            if (calculateResult.data.total && calculateResult.data.total.actual) {
                console.log(`✅ 总体边际贡献率: ${calculateResult.data.total.actual}`);
            } else {
                console.log('❌ 计算结果中缺少total.actual字段');
            }
        } else {
            console.log('❌ 计算失败:', await calculateResponse.text());
        }
        
        console.log('\n3. 获取年度分析数据...');
        // 3. 调用年度分析端点
        const year = period.split('-')[0];
        const analyticsResponse = await fetch(`${baseUrl}/analytics/contribution-rate/${year}`);
        
        if (analyticsResponse.ok) {
            const analyticsResult = await analyticsResponse.json();
            console.log('年度分析结果:');
            console.log('- 月份:', analyticsResult.data.months);
            console.log('- 月度数据:', analyticsResult.data.monthlyData);
            console.log('- 当前贡献率:', analyticsResult.data.currentRate);
            console.log('- 板块数据:', analyticsResult.data.segmentData);
        } else {
            console.log('❌ 获取年度分析失败:', await analyticsResponse.text());
        }
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

// 运行测试
testContributionRate().then(() => {
    console.log('\n测试完成');
}).catch(console.error); 